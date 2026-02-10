#!/usr/bin/env python3
"""
Election Simulation CLI
Generate synthetic voters and votes for demos, testing, and training

Usage:
  python simulate-election.py --voters 5000 --turnout 65 --election-id <uuid>
"""

import argparse
import json
import random
import hashlib
import uuid
import time
from datetime import datetime, timedelta
from typing import List, Dict
import psycopg2
from faker import Faker
import paho.mqtt.client as mqtt

fake = Faker('en_IN')  # Indian locale for realistic names


class ElectionSimulator:
    """Simulate entire elections with synthetic data"""
    
    def __init__(self, db_config: Dict, mqtt_config: Dict):
        self.db_config = db_config
        self.mqtt_config = mqtt_config
        self.db_conn = None
        self.mqtt_client = None
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        self.db_conn = psycopg2.connect(
            host=self.db_config['host'],
            port=self.db_config['port'],
            database=self.db_config['database'],
            user=self.db_config['user'],
            password=self.db_config['password']
        )
        print(f"✓ Connected to database: {self.db_config['database']}")
    
    def connect_mqtt(self):
        """Connect to MQTT broker"""
        self.mqtt_client = mqtt.Client(client_id="election_simulator")
        self.mqtt_client.connect(
            self.mqtt_config['host'],
            self.mqtt_config['port']
        )
        self.mqtt_client.loop_start()
        print(f"✓ Connected to MQTT broker: {self.mqtt_config['host']}")
    
    def generate_voters(self, count: int, district_ids: List[str]) -> List[Dict]:
        """Generate synthetic voters"""
        print(f"\n📊 Generating {count} synthetic voters...")
        voters = []
        
        for i in range(count):
            # Generate synthetic biometric hash (not real fingerprint)
            biometric_hash = hashlib.sha256(
                f"synthetic_fp_{i}_{random.randint(1000, 9999)}".encode()
            ).hexdigest()
            
            voter = {
                'voter_id': str(uuid.uuid4()),
                'aadhar_number': f"{random.randint(100000000000, 999999999999)}",
                'biometric_hash': biometric_hash,
                'district_id': random.choice(district_ids),
                'first_name': fake.first_name(),
                'last_name': fake.last_name(),
                'date_of_birth': fake.date_of_birth(minimum_age=18, maximum_age=90),
                'gender': random.choice(['M', 'F', 'OTHER']),
                'email': fake.email(),
                'phone_number': f"+91{random.randint(7000000000, 9999999999)}",
                'status': 'ACTIVE',
                'registration_date': fake.date_time_between(start_date='-2y', end_date='now')
            }
            voters.append(voter)
            
            if (i + 1) % 1000 == 0:
                print(f"  Generated {i + 1}/{count} voters...")
        
        print(f"✓ Generated {len(voters)} synthetic voters")
        return voters
    
    def insert_voters(self, voters: List[Dict]):
        """Insert voters into database"""
        print(f"\n💾 Inserting {len(voters)} voters into database...")
        
        cursor = self.db_conn.cursor()
        
        insert_query = """
        INSERT INTO voters (
            voter_id, aadhar_number, biometric_hash, district_id,
            first_name, last_name, date_of_birth, gender,
            email, phone_number, status, registration_date
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) ON CONFLICT (voter_id) DO NOTHING
        """
        
        for i, voter in enumerate(voters):
            cursor.execute(insert_query, (
                voter['voter_id'],
                voter['aadhar_number'],
                voter['biometric_hash'],
                voter['district_id'],
                voter['first_name'],
                voter['last_name'],
                voter['date_of_birth'],
                voter['gender'],
                voter['email'],
                voter['phone_number'],
                voter['status'],
                voter['registration_date']
            ))
            
            if (i + 1) % 1000 == 0:
                self.db_conn.commit()
                print(f"  Inserted {i + 1}/{len(voters)} voters...")
        
        self.db_conn.commit()
        cursor.close()
        print(f"✓ Inserted {len(voters)} voters")
    
    def generate_votes(self, voters: List[Dict], candidates: List[Dict],
                       turnout_percentage: int, election_id: str,
                       realistic_timing: bool = True) -> List[Dict]:
        """Generate synthetic votes with realistic patterns"""
        total_voters = len(voters)
        num_votes = int(total_voters * turnout_percentage / 100)
        
        print(f"\n🗳️  Simulating {turnout_percentage}% turnout ({num_votes} votes)...")
        
        # Select random voters who will vote
        voting_voters = random.sample(voters, num_votes)
        
        votes = []
        election_start = datetime.now().replace(hour=7, minute=0, second=0)
        election_end = datetime.now().replace(hour=18, minute=0, second=0)
        
        for i, voter in enumerate(voting_voters):
            # Realistic voting distribution (more votes in morning/evening)
            if realistic_timing:
                hour_distribution = [
                    7, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11,  # Morning rush
                    12, 13,  # Lunch dip
                    14, 14, 15, 15, 16, 16, 17, 17, 17  # Evening rush
                ]
                vote_hour = random.choice(hour_distribution)
                vote_time = election_start.replace(
                    hour=vote_hour,
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59)
                )
            else:
                # Random distribution
                vote_time = fake.date_time_between(
                    start_date=election_start,
                    end_date=election_end
                )
            
            # Random candidate selection (can be weighted)
            candidate = random.choice(candidates)
            
            # Generate encrypted vote
            vote_data = f"{candidate['candidate_id']}_{voter['voter_id']}"
            encrypted_vote = hashlib.sha256(vote_data.encode()).hexdigest()
            
            # Generate ZKP commitment
            zkp_commitment = hashlib.sha256(
                f"{encrypted_vote}_{voter['biometric_hash']}".encode()
            ).hexdigest()
            
            vote = {
                'vote_id': str(uuid.uuid4()),
                'election_id': election_id,
                'voter_id': voter['voter_id'],
                'candidate_id': candidate['candidate_id'],  # For simulation only
                'encrypted_vote': encrypted_vote,
                'district_id': voter['district_id'],
                'biometric_hash': voter['biometric_hash'],
                'zkp_commitment': zkp_commitment,
                'terminal_id': f"TERM-SIM-{random.randint(1, 50):03d}",
                'timestamp': int(vote_time.timestamp() * 1000)
            }
            votes.append(vote)
            
            if (i + 1) % 1000 == 0:
                print(f"  Generated {i + 1}/{num_votes} votes...")
        
        # Sort votes by timestamp for realistic playback
        votes.sort(key=lambda v: v['timestamp'])
        
        print(f"✓ Generated {len(votes)} votes")
        return votes
    
    def submit_votes_mqtt(self, votes: List[Dict], batch_size: int = 100,
                          delay_ms: int = 100):
        """Submit votes via MQTT (simulating real terminals)"""
        print(f"\n📡 Submitting {len(votes)} votes via MQTT...")
        
        total_batches = (len(votes) + batch_size - 1) // batch_size
        
        for batch_idx in range(0, len(votes), batch_size):
            batch = votes[batch_idx:batch_idx + batch_size]
            
            for vote in batch:
                payload = json.dumps({
                    'vote_id': vote['vote_id'],
                    'election_id': vote['election_id'],
                    'candidate_id': vote['encrypted_vote'],  # Encrypted
                    'district_id': vote['district_id'],
                    'biometric_hash': vote['biometric_hash'],
                    'zkp_commitment': vote['zkp_commitment'],
                    'terminal_id': vote['terminal_id'],
                    'timestamp': vote['timestamp']
                })
                
                self.mqtt_client.publish('election/vote/submit', payload, qos=2)
            
            current_batch = batch_idx // batch_size + 1
            print(f"  Batch {current_batch}/{total_batches} submitted...")
            
            # Delay between batches to avoid overwhelming backend
            time.sleep(delay_ms / 1000)
        
        print(f"✓ Submitted {len(votes)} votes")
    
    def generate_scenario(self, scenario_name: str, election_id: str,
                          district_ids: List[str], candidates: List[Dict]):
        """Run predefined simulation scenario"""
        scenarios = {
            'small': {
                'voters': 1000,
                'turnout': 70,
                'description': 'Small demo election'
            },
            'medium': {
                'voters': 10000,
                'turnout': 65,
                'description': 'Realistic election'
            },
            'large': {
                'voters': 50000,
                'turnout': 68,
                'description': 'Large district election'
            },
            'stress': {
                'voters': 100000,
                'turnout': 80,
                'description': 'Stress test scenario'
            }
        }
        
        if scenario_name not in scenarios:
            raise ValueError(f"Unknown scenario: {scenario_name}. Choose from: {list(scenarios.keys())}")
        
        scenario = scenarios[scenario_name]
        print(f"\n🎬 Running scenario: {scenario['description']}")
        print(f"   Voters: {scenario['voters']}")
        print(f"   Turnout: {scenario['turnout']}%")
        
        # Generate and insert voters
        voters = self.generate_voters(scenario['voters'], district_ids)
        self.insert_voters(voters)
        
        # Generate votes
        votes = self.generate_votes(
            voters,
            candidates,
            scenario['turnout'],
            election_id,
            realistic_timing=True
        )
        
        # Submit votes via MQTT
        self.submit_votes_mqtt(votes, batch_size=100, delay_ms=50)
        
        print(f"\n✅ Scenario '{scenario_name}' completed successfully!")
        print(f"   Total voters: {len(voters)}")
        print(f"   Total votes: {len(votes)}")
        print(f"   Turnout: {len(votes)/len(voters)*100:.1f}%")


def main():
    parser = argparse.ArgumentParser(description='Election Simulation Tool')
    parser.add_argument('--scenario', type=str, choices=['small', 'medium', 'large', 'stress'],
                       help='Predefined scenario')
    parser.add_argument('--voters', type=int, help='Number of voters to generate')
    parser.add_argument('--turnout', type=int, help='Turnout percentage (0-100)')
    parser.add_argument('--election-id', type=str, required=True, help='Election UUID')
    parser.add_argument('--config', type=str, default='simulation-config.json',
                       help='Configuration file path')
    
    args = parser.parse_args()
    
    # Load configuration
    with open(args.config, 'r') as f:
        config = json.load(f)
    
    # Initialize simulator
    simulator = ElectionSimulator(
        db_config=config['database'],
        mqtt_config=config['mqtt']
    )
    
    # Connect to services
    simulator.connect_db()
    simulator.connect_mqtt()
    
    # Get districts and candidates from database
    cursor = simulator.db_conn.cursor()
    
    cursor.execute("SELECT district_id FROM districts LIMIT 5")
    district_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT candidate_id, candidate_name FROM candidates WHERE election_id = %s",
                  (args.election_id,))
    candidates = [{'candidate_id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    
    cursor.close()
    
    if not district_ids:
       print("⚠️  No districts found in database. Creating sample districts...")
        district_ids = [str(uuid.uuid4()) for _ in range(5)]
    
    if not candidates:
        print("⚠️  No candidates found for this election. Please add candidates first.")
        return
    
    print(f"\n📍 Using {len(district_ids)} districts")
    print(f"👥 Found {len(candidates)} candidates")
    
    # Run simulation
    if args.scenario:
        simulator.generate_scenario(args.scenario, args.election_id, district_ids, candidates)
    elif args.voters and args.turnout:
        voters = simulator.generate_voters(args.voters, district_ids)
        simulator.insert_voters(voters)
        votes = simulator.generate_votes(voters, candidates, args.turnout, args.election_id)
        simulator.submit_votes_mqtt(votes)
    else:
        parser.error("Either --scenario or both --voters and --turnout must be specified")
    
    # Cleanup
    simulator.db_conn.close()
    simulator.mqtt_client.loop_stop()
    simulator.mqtt_client.disconnect()


if __name__ == '__main__':
    main()
