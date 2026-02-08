#!/usr/bin/env python3
"""
IoT Voting Terminal Main Application
Integrates R307 fingerprint sensor with MQTT communication

Flow:
1. Initialize hardware (fingerprint sensor, display, buttons)
2. Connect to MQTT broker
3. Wait for election activation command
4. Authenticate voter via fingerprint
5. Display candidates
6. Record vote
7. Submit to backend via MQTT
8. Display receipt/confirmation
"""

import os
import sys
import json
import time
import logging
import hashlib
import uuid
from typing import Optional, Dict
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from sensor.r307_driver import R307Driver
from mqtt_client import IoTMQTTClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/voting_terminal.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class VotingTerminal:
    """Main IoT voting terminal application"""
    
    def __init__(self, config_path: str = 'config.json'):
        """Initialize voting terminal"""
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Terminal info
        self.terminal_id = self.config.get('terminal_id', 'TERM-001')
        self.district_id = self.config.get('district_id')
        self.polling_station = self.config.get('polling_station', 'Unknown')
        
        # State
        self.current_election = None
        self.is_active = False
        self.votes_processed = 0
        self.tamper_detected = False
        
        # Initialize hardware
        self.fingerprint_sensor = None
        self.mqtt_client = None
        
        logger.info(f"Voting Terminal {self.terminal_id} initialized")
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_path} not found, using defaults")
            return {
                'terminal_id': os.getenv('TERMINAL_ID', 'TERM-001'),
                'district_id': os.getenv('DISTRICT_ID'),
                'mqtt_broker': os.getenv('MQTT_BROKER', 'localhost'),
                'mqtt_port': int(os.getenv('MQTT_PORT', '1883')),
                'sensor_port': os.getenv('SENSOR_PORT', '/dev/ttyUSB0'),
                'sensor_baud': int(os.getenv('SENSOR_BAUD', '57600'))
            }
    
    def initialize_hardware(self) -> bool:
        """Initialize fingerprint sensor and other hardware"""
        logger.info("Initializing hardware...")
        
        # Initialize R307 fingerprint sensor
        self.fingerprint_sensor = R307Driver(
            port=self.config.get('sensor_port', '/dev/ttyUSB0'),
            baud=self.config.get('sensor_baud', 57600)
        )
        
        if not self.fingerprint_sensor.connect():
            logger.error("Failed to connect to fingerprint sensor")
            return False
        
        logger.info("✓ Fingerprint sensor initialized")
        
        # TODO: Initialize display, buttons, etc.
        
        return True
    
    def initialize_mqtt(self) -> bool:
        """Initialize MQTT connection"""
        logger.info("Initializing MQTT connection...")
        
        self.mqtt_client = IoTMQTTClient(
            broker_host=self.config.get('mqtt_broker', 'localhost'),
            broker_port=self.config.get('mqtt_port', 1883),
            terminal_id=self.terminal_id,
            username=self.config.get('mqtt_username'),
            password=self.config.get('mqtt_password')
        )
        
        # Set up command handler
        self.mqtt_client.set_command_handler(self._handle_command)
        self.mqtt_client.set_vote_ack_handler(self._handle_vote_ack)
        
        if not self.mqtt_client.connect():
            logger.error("Failed to connect to MQTT broker")
            return False
        
        logger.info("✓ MQTT connection established")
        
        # Publish initial status
        self._publish_status()
        
        return True
    
    def _handle_command(self, payload: Dict):
        """Handle commands from backend"""
        command = payload.get('command')
        logger.info(f"Received command: {command}")
        
        if command == 'ACTIVATE_ELECTION':
            self._activate_election(payload)
        elif command == 'DEACTIVATE_ELECTION':
            self._deactivate_election()
        elif command == 'SHUTDOWN':
            self._shutdown()
        elif command == 'HEALTH_CHECK':
            self._publish_status()
        else:
            logger.warning(f"Unknown command: {command}")
    
    def _handle_vote_ack(self, payload: Dict):
        """Handle vote acknowledgment from backend"""
        vote_id = payload.get('vote_id')
        status = payload.get('status')
        
        logger.info(f"Vote {vote_id} acknowledged: {status}")
        
        if status == 'SUCCESS':
            self.votes_processed += 1
            # TODO: Display confirmation to voter
        else:
            logger.error(f"Vote failed: {payload.get('error')}")
            # TODO: Display error to voter
    
    def _activate_election(self, payload: Dict):
        """Activate election on this terminal"""
        self.current_election = {
            'election_id': payload.get('electionId'),
            'election_name': payload.get('electionName'),
            'start_time': payload.get('startTime'),
            'end_time': payload.get('endTime')
        }
        self.is_active = True
        
        logger.info(f"✓ Election activated: {self.current_election['election_name']}")
        
        # TODO: Update display to show election is active
    
    def _deactivate_election(self):
        """Deactivate election on this terminal"""
        self.is_active = False
        logger.info(f"Election deactivated. Votes processed: {self.votes_processed}")
        
        # Reset state
        self.current_election = None
        self.votes_processed = 0
        
        # TODO: Update display
    
    def _publish_status(self):
        """Publish terminal status"""
        if not self.mqtt_client:
            return
        
        # TODO: Read actual battery level, check tamper seal
        status_data = {
            'status': 'ONLINE' if self.is_active else 'INACTIVE',
            'battery_level': 100,  # TODO: Read from hardware
            'tamper_seal_intact': not self.tamper_detected,
            'votes_processed': self.votes_processed,
            'election_active': self.is_active,
            'current_election_id': self.current_election['election_id'] if self.current_election else None
        }
        
        self.mqtt_client.publish_status(status_data)
    
    def authenticate_voter(self) -> Optional[Dict]:
        """Authenticate voter using fingerprint"""
        if not self.is_active:
            logger.error("Cannot authenticate: No active election")
            return None
        
        logger.info("Waiting for voter fingerprint...")
        
        # TODO: Display message on screen
        
        # Scan fingerprint
        auth_result = self.fingerprint_sensor.scan_and_authenticate(timeout=30.0)
        
        if not auth_result or not auth_result.get('matched'):
            logger.warning("Fingerprint not recognized")
            # TODO: Display error on screen
            return None
        
        logger.info(f"✓ Voter authenticated (confidence: {auth_result['confidence']:.2%})")
        
        return {
            'biometric_hash': auth_result['biometric_hash'],
            'confidence': auth_result['confidence'],
            'timestamp': auth_result['timestamp']
        }
    
    def display_candidates(self, candidates: list):
        """Display candidates on screen"""
        # TODO: Implement actual display logic
        logger.info("Displaying candidates:")
        for idx, candidate in enumerate(candidates, 1):
            logger.info(f"  {idx}. {candidate['name']} ({candidate['party']})")
    
    def record_vote(self, voter_auth: Dict, candidate_id: str) -> bool:
        """Record and submit vote"""
        if not self.is_active or not self.current_election:
            logger.error("Cannot record vote: No active election")
            return False
        
        # Generate vote ID
        vote_id = str(uuid.uuid4())
        
        # Encrypt candidate ID (in production, use proper encryption)
        encrypted_candidate = hashlib.sha256(
            f"{candidate_id}_{vote_id}".encode()
        ).hexdigest()
        
        # Generate ZKP commitment (simplified)
        zkp_commitment = hashlib.sha256(
            f"{encrypted_candidate}_{voter_auth['biometric_hash']}".encode()
        ).hexdigest()
        
        # Prepare vote data
        vote_data = {
            'vote_id': vote_id,
            'election_id': self.current_election['election_id'],
            'candidate_id': encrypted_candidate,  # Encrypted
            'district_id': self.district_id,
            'biometric_hash': voter_auth['biometric_hash'],
            'zkp_commitment': zkp_commitment,
            'terminal_id': self.terminal_id,
            'timestamp': int(time.time() * 1000)
        }
        
        # Submit via MQTT
        logger.info(f"Submitting vote {vote_id}...")
        success = self.mqtt_client.submit_vote(vote_data)
        
        if success:
            logger.info("✓ Vote submitted successfully")
            # TODO: Generate and display receipt
            return True
        else:
            logger.error("✗ Failed to submit vote")
            return False
    
    def run_voting_cycle(self):
        """Run single voting cycle"""
        if not self.is_active:
            logger.debug("Terminal inactive, waiting for election...")
            time.sleep(5)
            return
        
        logger.info("\n=== Starting voting cycle ===")
        
        # Step 1: Authenticate voter
        voter_auth = self.authenticate_voter()
        if not voter_auth:
            logger.warning("Authentication failed")
            return
        
        # Step 2: TODO: Fetch candidates from backend (for now, hardcoded)
        candidates = [
            {'id': 'cand-1', 'name': 'Candidate A', 'party': 'Party X'},
            {'id': 'cand-2', 'name': 'Candidate B', 'party': 'Party Y'},
            {'id': 'cand-3', 'name': 'Candidate C', 'party': 'Party Z'}
        ]
        
        # Step 3: Display candidates
        self.display_candidates(candidates)
        
        # Step 4: TODO: Get voter selection (for now, auto-select first)
        selected_candidate = candidates[0]['id']
        logger.info(f"Voter selected: {selected_candidate}")
        
        # Step 5: Record and submit vote
        success = self.record_vote(voter_auth, selected_candidate)
        
        if success:
            logger.info("✅ Voting cycle completed successfully\n")
        else:
            logger.error("❌ Voting cycle failed\n")
    
    def run(self):
        """Main run loop"""
        logger.info(f"Starting Voting Terminal {self.terminal_id}")
        
        # Initialize
        if not self.initialize_hardware():
            logger.error("Hardware initialization failed")
            return 1
        
        if not self.initialize_mqtt():
            logger.error("MQTT initialization failed")
            return 1
        
        logger.info("✓ Terminal ready")
        logger.info("Waiting for election activation...")
        
        try:
            # Main loop
            while True:
                self.run_voting_cycle()
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("\nShutting down...")
        finally:
            self._shutdown()
        
        return 0
    
    def _shutdown(self):
        """Clean shutdown"""
        logger.info("Shutting down terminal...")
        
        if self.mqtt_client:
            self.mqtt_client.publish_status({'status': 'OFFLINE'})
            self.mqtt_client.disconnect()
        
        if self.fingerprint_sensor:
            self.fingerprint_sensor.disconnect()
        
        logger.info("Shutdown complete")


def main():
    """Entry point"""
    terminal = VotingTerminal()
    sys.exit(terminal.run())


if __name__ == '__main__':
    main()
