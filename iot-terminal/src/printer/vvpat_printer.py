"""
VVPAT (Voter Verified Paper Audit Trail) Printer
Thermal receipt printer integration for physical vote receipts

Hardware: Epson TM-T20III, TM-T88V, or compatible ESC/POS printers
Connection: USB or Serial
"""

import os
import time
import qrcode
from io import BytesIO
from escpos.printer import Usb, Serial, Network
from escpos import printer
from datetime import datetime
from typing import Dict, Optional


class VVPATPrinter:
    """Thermal printer for paper vote receipts"""
    
    def __init__(self, connection_type: str = 'usb',
                 vendor_id: int = 0x04b8,  # Epson
                 product_id: int = 0x0202,  # TM-T20
                 serial_port: str = '/dev/ttyUSB0',
                 network_host: str = '192.168.1.100'):
        """
        Initialize thermal printer
        
        Args:
            connection_type: 'usb', 'serial', or 'network'
            vendor_id: USB vendor ID (hex)
            product_id: USB product ID (hex)
            serial_port: Serial port path
            network_host: IP address for network printers
        """
        self.connection_type = connection_type
        self.printer = None
        
        if connection_type == 'usb':
            self.printer = Usb(vendor_id, product_id)
        elif connection_type == 'serial':
            self.printer = Serial(serial_port)
        elif connection_type == 'network':
            self.printer = Network(network_host)
        else:
            raise ValueError(f"Unknown connection type: {connection_type}")
        
        print(f"✓ VVPAT Printer initialized ({connection_type})")
    
    def generate_qr_code(self, vote_data: Dict) -> BytesIO:
        """Generate QR code for receipt"""
        # QR data format: vote_id|zkp_commitment|timestamp
        qr_data = f"{vote_data['vote_id']}|{vote_data['zkp_commitment']}|{vote_data['timestamp']}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=6,
            border=2,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return img_bytes
    
    def print_receipt(self, vote_data: Dict) -> bool:
        """
        Print voter receipt
        
        Args:
            vote_data: Vote information dict with:
                - vote_id
                - election_id
                - election_name
                - terminal_id
                - district_id
                - timestamp
                - zkp_commitment
                - tx_hash (blockchain transaction hash)
        """
        try:
            # Set printer to normal mode
            self.printer.set(align='center', text_type='normal')
            
            # Header
            self.printer.set(text_type='B', width=2, height=2)
            self.printer.text("═══════════════════\n")
            self.printer.text(" ELECTION  SYSTEM \n")
            self.printer.text("═══════════════════\n")
            self.printer.set(text_type='normal', width=1, height=1)
            self.printer.text("\n")
            
            self.printer.set(text_type='B')
            self.printer.text("VOTER VERIFIED\n")
            self.printer.text("PAPER AUDIT TRAIL\n")
            self.printer.set(text_type='normal')
            self.printer.text("\n")
            
            # Election Info
            self.printer.text("─────────────────────\n")
            self.printer.set(align='left')
            
            election_name = vote_data.get('election_name', 'Unknown Election')
            self.printer.text(f"Election:\n")
            self.printer.set(text_type='B')
            self.printer.text(f"  {election_name}\n")
            self.printer.set(text_type='normal')
            self.printer.text("\n")
            
            # Date & Time
            timestamp = vote_data.get('timestamp', int(time.time() * 1000))
            dt = datetime.fromtimestamp(timestamp / 1000)
            self.printer.text(f"Date: {dt.strftime('%Y-%m-%d')}\n")
            self.printer.text(f"Time: {dt.strftime('%H:%M:%S')}\n")
            self.printer.text("\n")
            
            # Terminal & District
            terminal_id = vote_data.get('terminal_id', 'N/A')
            district_id = vote_data.get('district_id', 'N/A')[:16]
            
            self.printer.text(f"Terminal: {terminal_id}\n")
            self.printer.text(f"District: {district_id}\n")
            self.printer.text("\n")
            
            self.printer.text("─────────────────────\n")
            self.printer.text("\n")
            
            # Vote ID
            self.printer.text("Vote ID:\n")
            vote_id = vote_data['vote_id']
            self.printer.set(text_type='B', width=1, height=1)
            # Print in chunks for readability
            chunk_size = 21
            for i in range(0, len(vote_id), chunk_size):
                self.printer.text(f"{vote_id[i:i+chunk_size]}\n")
            self.printer.set(text_type='normal')
            self.printer.text("\n")
            
            # Blockchain Transaction
            if 'tx_hash' in vote_data:
                self.printer.text("Blockchain TX:\n")
                tx_hash = vote_data['tx_hash']
                self.printer.set(text_type='B')
                self.printer.text(f"{tx_hash[:21]}\n")
                self.printer.text(f"{tx_hash[21:42]}\n")
                if len(tx_hash) > 42:
                    self.printer.text(f"{tx_hash[42:]}\n")
                self.printer.set(text_type='normal')
                self.printer.text("\n")
            
            # QR Code
            self.printer.set(align='center')
            self.printer.text("Scan to Verify:\n")
            self.printer.text("\n")
            
            qr_image = self.generate_qr_code(vote_data)
            self.printer.image(qr_image)
            self.printer.text("\n")
            
            # Verification URL
            self.printer.set(text_type='normal', width=1, height=1)
            self.printer.text("verify.election.gov\n")
            self.printer.text("\n")
            
            # Security Hash
            self.printer.text("─────────────────────\n")
            self.printer.set(align='left')
            self.printer.text("Security Hash:\n")
            zkp_hash = vote_data.get('zkp_commitment', '')[:32]
            self.printer.set(text_type='B')
            self.printer.text(f"{zkp_hash}...\n")
            self.printer.set(text_type='normal')
            self.printer.text("\n")
            
            # Status
            self.printer.set(align='center')
            self.printer.text("═══════════════════\n")
            self.printer.set(text_type='B', width=2, height=2)
            self.printer.text("✓ VOTE RECORDED\n")
            self.printer.set(text_type='normal', width=1, height=1)
            self.printer.text("═══════════════════\n")
            self.printer.text("\n")
            
            # Footer
            self.printer.set(text_type='normal')
            self.printer.text("This receipt confirms\n")
            self.printer.text("your vote was recorded\n")
            self.printer.text("on the blockchain.\n")
            self.printer.text("\n")
            self.printer.text("Your vote choice\n")
            self.printer.text("remains confidential.\n")
            self.printer.text("\n")
            
            self.printer.text(f"Printed: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            self.printer.text("\n")
            
            # Cut paper
            self.printer.cut()
            
            print(f"✓ Receipt printed for vote: {vote_data['vote_id']}")
            return True
            
        except Exception as e:
            print(f"✗ Print error: {e}")
            return False
    
    def print_test_receipt(self):
        """Print test receipt for diagnostics"""
        try:
            self.printer.set(align='center', text_type='B')
            self.printer.text("═══════════════════\n")
            self.printer.text("  TEST  RECEIPT   \n")
            self.printer.text("═══════════════════\n")
            self.printer.text("\n")
            
            self.printer.set(text_type='normal')
            self.printer.text("VVPAT Printer\n")
            self.printer.text("Status: OK\n")
            self.printer.text(f"Time: {datetime.now().strftime('%H:%M:%S')}\n")
            self.printer.text("\n")
            
            # Test QR code
            test_qr = qrcode.make("TEST_QR_CODE")
            qr_bytes = BytesIO()
            test_qr.save(qr_bytes, format='PNG')
            qr_bytes.seek(0)
            self.printer.image(qr_bytes)
            
            self.printer.text("\n")
            self.printer.text("Connection: OK\n")
            self.printer.text("\n")
            self.printer.cut()
            
            print("✓ Test receipt printed successfully")
            return True
            
        except Exception as e:
            print(f"✗ Test print failed: {e}")
            return False
    
    def check_status(self) -> Dict:
        """Check printer status"""
        try:
            # Note: Status checking varies by printer model
            # This is a simplified version
            return {
                'online': True,
                'paper_present': True,  # Would need specific command
                'errors': []
            }
        except Exception as e:
            return {
                'online': False,
                'paper_present': False,
                'errors': [str(e)]
            }
    
    def disconnect(self):
        """Close printer connection"""
        if self.printer:
            self.printer.close()
            print("✓ Printer disconnected")


def main():
    """Test VVPAT printer"""
    import argparse
    
    parser = argparse.ArgumentParser(description='VVPAT Printer Test')
    parser.add_argument('--connection', choices=['usb', 'serial', 'network'],
                       default='usb', help='Connection type')
    parser.add_argument('--test', action='store_true', help='Print test receipt')
    
    args = parser.parse_args()
    
    try:
        # Initialize printer
        printer = VVPATPrinter(connection_type=args.connection)
        
        if args.test:
            # Print test receipt
            printer.print_test_receipt()
        else:
            # Print sample vote receipt
            sample_vote = {
                'vote_id': 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
                'election_id': 'election-uuid-here',
                'election_name': 'General Election 2024',
                'terminal_id': 'TERM-042',
                'district_id': 'district-central-07',
                'timestamp': int(time.time() * 1000),
                'zkp_commitment': '7f3a9b2c4d8e1f6g5h4i3j2k1l9m8n7o6p5q4r3s2t1u0v',
                'tx_hash': '0xdef4567890abcdef1234567890abcdef1234567890abcd'
            }
            
            printer.print_receipt(sample_vote)
        
        # Check status
        status = printer.check_status()
        print(f"\nPrinter Status: {status}")
        
        # Disconnect
        printer.disconnect()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
