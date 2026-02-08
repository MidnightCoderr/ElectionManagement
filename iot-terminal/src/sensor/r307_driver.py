"""
R307 Fingerprint Sensor Driver
Communicates with R307 optical fingerprint scanner via UART

Hardware: R307 Optical Fingerprint Reader Module
Connection: UART (TX/RX) at 57600 baud
Protocol: Documented in R307 datasheet
"""

import serial
import time
import hashlib
from typing import Optional, Tuple, Dict
import logging

logger = logging.getLogger(__name__)


class R307Driver:
    """Driver for R307 optical fingerprint sensor"""
    
    # Command packets
    COMMAND_HEADER = 0xEF01
    
    # Package identifiers
    COMMAND_PACKET = 0x01
    DATA_PACKET = 0x02
    ACK_PACKET = 0x07
    END_DATA_PACKET = 0x08
    
    # Commands
    CMD_GEN_IMAGE = 0x01       # Capture fingerprint image
    CMD_IMAGE_2_TZ = 0x02      # Generate character file from image
    CMD_MATCH = 0x03           # Match two character buffers
    CMD_SEARCH = 0x04          # Search fingerprint in library
    CMD_REG_MODEL = 0x05       # Combine character buffers into template
    CMD_STORE = 0x06           # Store template
    CMD_LOAD = 0x07            # Load template
    CMD_UPLOAD_CHAR = 0x08     # Upload character buffer
    CMD_DOWNLOAD_CHAR = 0x09   # Download character buffer
    CMD_DELETE = 0x0C          # Delete templates
    CMD_EMPTY = 0x0D           # Empty library
    CMD_SET_PASSWORD = 0x12    # Set device password
    CMD_VERIFY_PASSWORD = 0x13 # Verify password
    CMD_READ_PARAMS = 0x0F     # Read system parameters
    
    # Confirmation codes
    OK = 0x00
    ERROR_RECEIVE = 0x01
    ERROR_NO_FINGER = 0x02
    ERROR_ENROLL_FAIL = 0x03
    ERROR_GENERATE_FAIL = 0x06
    ERROR_SMALL_FEATURE = 0x07
    ERROR_NOT_MATCH = 0x08
    ERROR_NOT_FOUND = 0x09
    ERROR_COMBINE_FAIL = 0x0A
    ERROR_BAD_LOCATION = 0x0B
    ERROR_DB_RANGE = 0x0D
    ERROR_UPLOAD_FAIL = 0x0E
    ERROR_DELETE_FAIL = 0x10
    ERROR_CLEAR_FAIL = 0x11
    ERROR_PASSWORD_FAIL = 0x13
    ERROR_IMAGE_FAIL = 0x15
    ERROR_FLASH_ERROR = 0x18
    
    def __init__(self, port: str = '/dev/ttyUSB0', baud: int = 57600, 
                 password: int = 0x00000000, address: int = 0xFFFFFFFF):
        """
        Initialize R307 sensor
        
        Args:
            port: Serial port (e.g., '/dev/ttyUSB0' on Linux, 'COM3' on Windows)
            baud: Baud rate (default 57600)
            password: Device password (default 0x00000000)
            address: Device address (default 0xFFFFFFFF)
        """
        self.port = port
        self.baud = baud
        self.password = password
        self.address = address
        self.serial = None
        
    def connect(self) -> bool:
        """Connect to R307 sensor"""
        try:
            self.serial = serial.Serial(
                port=self.port,
                baudrate=self.baud,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=2
            )
            logger.info(f"Connected to R307 on {self.port} at {self.baud} baud")
            
            # Verify connection by reading system parameters
            params = self.read_system_params()
            if params:
                logger.info(f"R307 system params: {params}")
                return True
            return False
            
        except serial.SerialException as e:
            logger.error(f"Failed to connect to R307: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from sensor"""
        if self.serial and self.serial.is_open:
            self.serial.close()
            logger.info("Disconnected from R307")
    
    def _write_packet(self, packet_type: int, data: bytes) -> bool:
        """Write packet to sensor"""
        if not self.serial or not self.serial.is_open:
            logger.error("Serial port not open")
            return False
        
        # Build packet: HEADER + ADDRESS + PACKET_TYPE + LENGTH + DATA + CHECKSUM
        length = len(data) + 2  # Length includes checksum
        
        # Convert integers to bytes
        packet = bytearray()
        packet.extend(self.COMMAND_HEADER.to_bytes(2, 'big'))
        packet.extend(self.address.to_bytes(4, 'big'))
        packet.append(packet_type)
        packet.extend(length.to_bytes(2, 'big'))
        packet.extend(data)
        
        # Calculate checksum
        checksum = sum(packet[6:]) & 0xFFFF
        packet.extend(checksum.to_bytes(2, 'big'))
        
        try:
            self.serial.write(packet)
            self.serial.flush()
            return True
        except serial.SerialException as e:
            logger.error(f"Failed to write packet: {e}")
            return False
    
    def _read_packet(self, timeout: float = 2.0) -> Optional[Tuple[int, bytes]]:
        """Read packet from sensor"""
        if not self.serial or not self.serial.is_open:
            return None
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Read header
            if self.serial.in_waiting < 2:
                time.sleep(0.01)
                continue
            
            header = int.from_bytes(self.serial.read(2), 'big')
            if header != self.COMMAND_HEADER:
                continue
            
            # Read address (should match our address)
            address = int.from_bytes(self.serial.read(4), 'big')
            if address != self.address:
                logger.warning(f"Address mismatch: {hex(address)} != {hex(self.address)}")
                continue
            
            # Read packet type
            packet_type = self.serial.read(1)[0]
            
            # Read length
            length = int.from_bytes(self.serial.read(2), 'big')
            
            # Read data + checksum
            data_with_checksum = self.serial.read(length)
            data = data_with_checksum[:-2]
            checksum = int.from_bytes(data_with_checksum[-2:], 'big')
            
            # Verify checksum
            calculated_checksum = (packet_type + length + sum(data)) & 0xFFFF
            if calculated_checksum != checksum:
                logger.error("Checksum mismatch")
                continue
            
            return packet_type, data
        
        logger.warning("Read timeout")
        return None
    
    def _send_command(self, command: int, params: bytes = b'') -> Optional[Tuple[int, bytes]]:
        """Send command and read response"""
        data = bytes([command]) + params
        if not self._write_packet(self.COMMAND_PACKET, data):
            return None
        return self._read_packet()
    
    def read_system_params(self) -> Optional[Dict]:
        """Read R307 system parameters"""
        result = self._send_command(self.CMD_READ_PARAMS)
        if not result:
            return None
        
        packet_type, data = result
        if data[0] != self.OK:
            logger.error(f"Read params failed: {hex(data[0])}")
            return None
        
        # Parse system parameters (16 bytes)
        params = {
            'status_register': int.from_bytes(data[1:3], 'big'),
            'system_id': int.from_bytes(data[3:5], 'big'),
            'finger_library_size': int.from_bytes(data[5:7], 'big'),
            'security_level': int.from_bytes(data[7:9], 'big'),
            'device_address': int.from_bytes(data[9:13], 'big'),
            'packet_size': int.from_bytes(data[13:15], 'big'),
            'baud_rate': int.from_bytes(data[15:17], 'big') * 9600
        }
        return params
    
    def capture_image(self) -> bool:
        """Capture fingerprint image (finger must be on sensor)"""
        result = self._send_command(self.CMD_GEN_IMAGE)
        if not result:
            return False
        
        packet_type, data = result
        if data[0] == self.OK:
            logger.info("Fingerprint image captured")
            return True
        elif data[0] == self.ERROR_NO_FINGER:
            logger.debug("No finger detected")
            return False
        else:
            logger.error(f"Image capture failed: {hex(data[0])}")
            return False
    
    def image_to_char_buffer(self, buffer_id: int = 1) -> bool:
        """
        Convert image to character file in buffer
        
        Args:
            buffer_id: Buffer number (1 or 2)
        """
        result = self._send_command(self.CMD_IMAGE_2_TZ, bytes([buffer_id]))
        if not result:
            return False
        
        packet_type, data = result
        if data[0] == self.OK:
            logger.info(f"Image converted to char buffer {buffer_id}")
            return True
        else:
            logger.error(f"Image to char failed: {hex(data[0])}")
            return False
    
    def search_fingerprint(self, buffer_id: int = 1, start_page: int = 0, 
                          page_count: int = 1000) -> Optional[Tuple[int, int]]:
        """
        Search fingerprint library
        
        Args:
            buffer_id: Buffer to search (1 or 2)
            start_page: Start page in library
            page_count: Number of pages to search
            
        Returns:
            Tuple of (page_id, match_score) if found, None otherwise
        """
        params = bytes([buffer_id]) + start_page.to_bytes(2, 'big') + page_count.to_bytes(2, 'big')
        result = self._send_command(self.CMD_SEARCH, params)
        
        if not result:
            return None
        
        packet_type, data = result
        if data[0] == self.OK:
            page_id = int.from_bytes(data[1:3], 'big')
            match_score = int.from_bytes(data[3:5], 'big')
            logger.info(f"Match found: Page {page_id}, Score {match_score}")
            return (page_id, match_score)
        elif data[0] == self.ERROR_NOT_FOUND:
            logger.info("No match found")
            return None
        else:
            logger.error(f"Search failed: {hex(data[0])}")
            return None
    
    def scan_and_authenticate(self, timeout: float = 10.0) -> Optional[Dict]:
        """
        Complete authentication flow: scan finger and search database
        
        Args:
            timeout: How long to wait for finger (seconds)
            
        Returns:
            Dict with fingerprint info if found, None otherwise
        """
        logger.info("Waiting for fingerprint...")
        start_time = time.time()
        
        # Wait for finger
        while time.time() - start_time < timeout:
            if self.capture_image():
                break
            time.sleep(0.1)
        else:
            logger.warning("Timeout waiting for fingerprint")
            return None
        
        # Convert image to character file
        if not self.image_to_char_buffer(buffer_id=1):
            return None
        
        # Search database
        result = self.search_fingerprint(buffer_id=1)
        if not result:
            return None
        
        page_id, match_score = result
        
        # Generate hash from page_id (simulating biometric hash)
        # In production, retrieve actual template and hash it
        biometric_hash = hashlib.sha256(f"fp_{page_id}".encode()).hexdigest()
        
        return {
            'matched': True,
            'page_id': page_id,
            'match_score': match_score,
            'confidence': min(match_score / 200.0, 1.0),  # Normalize to 0-1
            'biometric_hash': biometric_hash,
            'timestamp': int(time.time() * 1000)
        }
    
    def get_template_count(self) -> Optional[int]:
        """Get number of stored fingerprint templates"""
        params = self.read_system_params()
        if params:
            return params.get('finger_library_size', 0)
        return None
    
    def delete_all_templates(self) -> bool:
        """Delete all fingerprint templates (use with caution!)"""
        result = self._send_command(self.CMD_EMPTY)
        if not result:
            return False
        
        packet_type, data = result
        if data[0] == self.OK:
            logger.info("All templates deleted")
            return True
        else:
            logger.error(f"Clear database failed: {hex(data[0])}")
            return False


def main():
    """Test the R307 driver"""
    import sys
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize sensor
    sensor = R307Driver(port='/dev/ttyUSB0')  # Change to COM3 on Windows
    
    if not sensor.connect():
        logger.error("Failed to connect to sensor")
        sys.exit(1)
    
    try:
        print("\n=== R307 Fingerprint Sensor Test ===\n")
        
        # Read system parameters
        params = sensor.read_system_params()
        if params:
            print(f"Library size: {params['finger_library_size']} templates")
            print(f"Security level: {params['security_level']}")
            print(f"Baud rate: {params['baud_rate']}")
        
        print("\n--- Authentication Test ---")
        print("Place finger on sensor...")
        
        result = sensor.scan_and_authenticate(timeout=15.0)
        if result:
            print(f"✅ Match found!")
            print(f"   Page ID: {result['page_id']}")
            print(f"   Match score: {result['match_score']}")
            print(f"   Confidence: {result['confidence']:.2%}")
            print(f"   Biometric hash: {result['biometric_hash'][:16]}...")
        else:
            print("❌ No match found")
    
    finally:
        sensor.disconnect()


if __name__ == '__main__':
    main()
