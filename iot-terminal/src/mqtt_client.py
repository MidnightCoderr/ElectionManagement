"""
MQTT Client for IoT Terminal
Handles communication between IoT terminal and backend server

Topics:
- election/vote/submit: Submit vote to backend
- election/command: Receive commands from backend
- election/terminal/{terminal_id}/status: Terminal health/status
- election/terminal/{terminal_id}/tamper: Tamper alerts
"""

import json
import time
import logging
from typing import Callable, Optional, Dict
import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)


class IoTMQTTClient:
    """MQTT client for IoT voting terminal"""
    
    def __init__(self, broker_host: str, broker_port: int = 1883,
                 terminal_id: str = "TERM-001", 
                 username: Optional[str] = None,
                 password: Optional[str] = None):
        """
        Initialize MQTT client
        
        Args:
            broker_host: MQTT broker hostname/IP
            broker_port: MQTT broker port (default 1883)
            terminal_id: Unique terminal identifier
            username: MQTT username (optional)
            password: MQTT password (optional)
        """
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.terminal_id = terminal_id
        
        # Message handlers
        self.on_command_handler: Optional[Callable] = None
        self.on_vote_ack_handler: Optional[Callable] = None
        
        # Initialize MQTT client
        self.client = mqtt.Client(client_id=f"iot_terminal_{terminal_id}")
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
        if username and password:
            self.client.username_pw_set(username, password)
        
        self.connected = False
    
    def connect(self) -> bool:
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to MQTT broker at {self.broker_host}:{self.broker_port}")
            self.client.connect(self.broker_host, self.broker_port, keepalive=60)
            self.client.loop_start()
            
            # Wait for connection
            timeout = 5.0
            start = time.time()
            while not self.connected and (time.time() - start) < timeout:
                time.sleep(0.1)
            
            if self.connected:
                logger.info("Connected to MQTT broker")
                return True
            else:
                logger.error("Connection timeout")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Disconnected from MQTT broker")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected to broker"""
        if rc == 0:
            self.connected = True
            logger.info("MQTT connected successfully")
            
            # Subscribe to relevant topics
            self.client.subscribe("election/command", qos=1)
            self.client.subscribe(f"election/terminal/{self.terminal_id}/command", qos=1)
            self.client.subscribe(f"election/vote/ack/{self.terminal_id}", qos=1)
            
            logger.info("Subscribed to command and acknowledgment topics")
            
            # Publish online status
            self.publish_status({
                'status': 'ONLINE',
                'terminal_id': self.terminal_id,
                'timestamp': int(time.time() * 1000)
            })
        else:
            logger.error(f"MQTT connection failed with code {rc}")
            self.connected = False
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection (code {rc})")
        else:
            logger.info("MQTT disconnected")
    
    def _on_message(self, client, userdata, msg):
        """Callback when message received"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            logger.debug(f"Received message on {topic}: {payload}")
            
            if 'election/command' in topic:
                self._handle_command(payload)
            elif 'election/vote/ack' in topic:
                self._handle_vote_ack(payload)
            
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in message: {msg.payload}")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
    
    def _handle_command(self, payload: Dict):
        """Handle command from backend"""
        command = payload.get('command')
        logger.info(f"Received command: {command}")
        
        if self.on_command_handler:
            self.on_command_handler(payload)
        else:
            logger.warning("No command handler registered")
    
    def _handle_vote_ack(self, payload: Dict):
        """Handle vote acknowledgment from backend"""
        logger.info(f"Vote acknowledgment: {payload}")
        
        if self.on_vote_ack_handler:
            self.on_vote_ack_handler(payload)
    
    def submit_vote(self, vote_data: Dict) -> bool:
        """
        Submit vote to backend via MQTT
        
        Args:
            vote_data: Vote information including:
                - voter_id
                - election_id
                - candidate_id (encrypted)
                - district_id
                - biometric_hash
                - zkp_commitment
                - terminal_id
                - timestamp
        """
        topic = "election/vote/submit"
        
        # Ensure terminal_id is included
        vote_data['terminal_id'] = self.terminal_id
        vote_data['timestamp'] = vote_data.get('timestamp', int(time.time() * 1000))
        
        try:
            payload = json.dumps(vote_data)
            result = self.client.publish(topic, payload, qos=2)  # QoS 2 for exactly-once delivery
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Vote submitted successfully: {vote_data.get('vote_id', 'N/A')}")
                return True
            else:
                logger.error(f"Failed to publish vote: {result.rc}")
                return False
                
        except Exception as e:
            logger.error(f"Error submitting vote: {e}")
            return False
    
    def publish_status(self, status_data: Dict) -> bool:
        """
        Publish terminal status
        
        Args:
            status_data: Status information including:
                - status (ONLINE/OFFLINE/MAINTENANCE/COMPROMISED)
                - battery_level
                - tamper_seal_intact
                - votes_processed
                - timestamp
        """
        topic = f"election/terminal/{self.terminal_id}/status"
        
        # Ensure terminal_id is included
        status_data['terminal_id'] = self.terminal_id
        status_data['timestamp'] = status_data.get('timestamp', int(time.time() * 1000))
        
        try:
            payload = json.dumps(status_data)
            result = self.client.publish(topic, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(f"Status published: {status_data.get('status')}")
                return True
            else:
                logger.error(f"Failed to publish status: {result.rc}")
                return False
                
        except Exception as e:
            logger.error(f"Error publishing status: {e}")
            return False
    
    def publish_tamper_alert(self, alert_data: Dict) -> bool:
        """
        Publish tamper detection alert
        
        Args:
            alert_data: Tamper alert information
        """
        topic = f"election/terminal/{self.terminal_id}/tamper"
        
        alert_data['terminal_id'] = self.terminal_id
        alert_data['timestamp'] = alert_data.get('timestamp', int(time.time() * 1000))
        alert_data['severity'] = 'CRITICAL'
        
        try:
            payload = json.dumps(alert_data)
            result = self.client.publish(topic, payload, qos=2)  # Critical message
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.critical(f"TAMPER ALERT published: {alert_data}")
                return True
            else:
                logger.error(f"Failed to publish tamper alert: {result.rc}")
                return False
                
        except Exception as e:
            logger.error(f"Error publishing tamper alert: {e}")
            return False
    
    def set_command_handler(self, handler: Callable[[Dict], None]):
        """Register callback for election commands"""
        self.on_command_handler = handler
    
    def set_vote_ack_handler(self, handler: Callable[[Dict], None]):
        """Register callback for vote acknowledgments"""
        self.on_vote_ack_handler = handler


def main():
    """Test MQTT client"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize client
    mqtt_client = IoTMQTTClient(
        broker_host='localhost',  # Change to your MQTT broker
        terminal_id='TERM-TEST-001'
    )
    
    # Command handler
    def handle_command(payload):
        command = payload.get('command')
        print(f"\n📨 Command received: {command}")
        print(f"   Data: {payload}")
    
    # Vote acknowledgment handler
    def handle_vote_ack(payload):
        print(f"\n✅ Vote acknowledged: {payload.get('vote_id')}")
        print(f"   Status: {payload.get('status')}")
    
    mqtt_client.set_command_handler(handle_command)
    mqtt_client.set_vote_ack_handler(handle_vote_ack)
    
    # Connect
    if not mqtt_client.connect():
        print("Failed to connect to MQTT broker")
        return
    
    try:
        print("\n=== MQTT Client Test ===")
        print("Terminal ID:", mqtt_client.terminal_id)
        print("Connected to broker")
        
        # Publish status
        mqtt_client.publish_status({
            'status': 'ONLINE',
            'battery_level': 85,
            'tamper_seal_intact': True,
            'votes_processed': 0
        })
        
        # Simulate vote submission
        print("\nSimulating vote submission...")
        vote_data = {
            'vote_id': 'test-vote-12345',
            'election_id': 'election-uuid',
            'voter_id': 'voter-uuid',
            'candidate_id': 'encrypted_candidate_data',
            'district_id': 'district-uuid',
            'biometric_hash': 'sha256hash',
            'zkp_commitment': 'commitment_hash'
        }
        mqtt_client.submit_vote(vote_data)
        
        # Keep running
        print("\nListening for commands... (Ctrl+C to exit)")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        mqtt_client.disconnect()


if __name__ == '__main__':
    main()
