"""
Key Ceremony Service
Implements Shamir Secret Sharing for master encryption key management

Protocol:
- Generate master AES-256 key
- Split into 7 shares (5 required to reconstruct)
- Distribute to key custodians (election officials)
- Audit every action with timestamps and signatures
"""

import secrets
import hashlib
import json
import time
from typing import List, Tuple, Dict, Optional
from datetime import datetime
from shamirs import split_secret, reconstruct_secret
import logging

logger = logging.getLogger(__name__)


class KeyCeremonyService:
    """Manages key generation ceremonies with Shamir Secret Sharing"""
    
    def __init__(self, threshold: int = 5, total_shares: int = 7):
        """
        Initialize key ceremony service
        
        Args:
            threshold: Minimum shares needed to reconstruct key
            total_shares: Total number of shares to generate
        """
        self.threshold = threshold
        self.total_shares = total_shares
        self.audit_log = []
        
        logger.info(f"Key Ceremony initialized: {threshold}-of-{total_shares} scheme")
    
    def generate_master_key(self) -> bytes:
        """Generate cryptographically secure master key (AES-256)"""
        master_key = secrets.token_bytes(32)  # 256 bits
        
        self._audit("MASTER_KEY_GENERATED", {
            'key_length': len(master_key) * 8,
            'algorithm': 'AES-256',
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info("Master key generated (256-bit)")
        return master_key
    
    def split_key_into_shares(self, master_key: bytes) -> List[Tuple[int, bytes]]:
        """
        Split master key using Shamir Secret Sharing
        
        Returns:
            List of (share_id, share_data) tuples
        """
        # Convert key to integer for Shamir
        key_int = int.from_bytes(master_key, 'big')
        
        # Generate shares
        shares = split_secret(key_int, self.threshold, self.total_shares)
        
        # Convert shares to bytes format
        share_tuples = []
        for share_id, share_value in enumerate(shares, 1):
            share_bytes = share_value.to_bytes(32, 'big')
            share_tuples.append((share_id, share_bytes))
        
        self._audit("KEY_SPLIT", {
            'threshold': self.threshold,
            'total_shares': self.total_shares,
            'shares_generated': len(share_tuples),
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"Key split into {len(share_tuples)} shares")
        return share_tuples
    
    def reconstruct_key(self, shares: List[Tuple[int, bytes]]) -> Optional[bytes]:
        """
        Reconstruct master key from shares
        
        Args:
            shares: List of (share_id, share_data) tuples
            
        Returns:
            Reconstructed master key or None if insufficient shares
        """
        if len(shares) < self.threshold:
            logger.error(f"Insufficient shares: {len(shares)} < {self.threshold}")
            self._audit("RECONSTRUCTION_FAILED", {
                'reason': 'insufficient_shares',
                'provided': len(shares),
                'required': self.threshold,
                'timestamp': datetime.now().isoformat()
            })
            return None
        
        # Convert shares to integers
        share_ints = [(sid, int.from_bytes(sdata, 'big')) for sid, sdata in shares]
        
        # Reconstruct using Shamir
        try:
            reconstructed_int = reconstruct_secret(share_ints, self.threshold)
            master_key = reconstructed_int.to_bytes(32, 'big')
            
            self._audit("KEY_RECONSTRUCTED", {
                'shares_used': len(shares),
                'share_ids': [sid for sid, _ in shares],
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info(f"Key reconstructed from {len(shares)} shares")
            return master_key
            
        except Exception as e:
            logger.error(f"Reconstruction failed: {e}")
            self._audit("RECONSTRUCTION_ERROR", {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
            return None
    
    def distribute_shares_to_custodians(self, shares: List[Tuple[int, bytes]],
                                       custodians: List[Dict]) -> List[Dict]:
        """
        Distribute shares to key custodians
        
        Args:
            shares: List of (share_id, share_data) tuples
            custodians: List of custodian info dicts
            
        Returns:
            List of distribution records
        """
        if len(custodians) != len(shares):
            raise ValueError("Number of custodians must match number of shares")
        
        distributions = []
        
        for (share_id, share_data), custodian in zip(shares, custodians):
            # Hash share for verification (without revealing share)
            share_hash = hashlib.sha256(share_data).hexdigest()
            
            distribution = {
                'custodian_id': custodian['id'],
                'custodian_name': custodian['name'],
                'custodian_role': custodian['role'],
                'share_id': share_id,
                'share_hash': share_hash,
                'distributed_at': datetime.now().isoformat(),
                'acknowledgment_required': True,
                'acknowledged': False
            }
            
            distributions.append(distribution)
            
            self._audit("SHARE_DISTRIBUTED", {
                'custodian_id': custodian['id'],
                'share_id': share_id,
                'share_hash': share_hash,
                'timestamp': datetime.now().isoformat()
            })
        
        logger.info(f"Distributed {len(distributions)} shares to custodians")
        return distributions
    
    def acknowledge_share_receipt(self, custodian_id: str, share_id: int,
                                  signature: str) -> bool:
        """
        Record custodian acknowledgment of share receipt
        
        Args:
            custodian_id: Custodian identifier
            share_id: Share identifier
            signature: Custodian's digital signature
        """
        self._audit("SHARE_ACKNOWLEDGED", {
            'custodian_id': custodian_id,
            'share_id': share_id,
            'signature': signature,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"Custodian {custodian_id} acknowledged share {share_id}")
        return True
    
    def conduct_ceremony(self, custodians: List[Dict], ceremony_name: str) -> Dict:
        """
        Conduct complete key ceremony
        
        Args:
            custodians: List of custodian information
            ceremony_name: Name/ID of ceremony
            
        Returns:
            Ceremony report
        """
        ceremony_start = datetime.now()
        
        logger.info(f"Starting key ceremony: {ceremony_name}")
        
        # 1. Generate master key
        master_key = self.generate_master_key()
        master_key_hash = hashlib.sha256(master_key).hexdigest()
        
        # 2. Split into shares
        shares = self.split_key_into_shares(master_key)
        
        # 3. Distribute to custodians
        distributions = self.distribute_shares_to_custodians(shares, custodians)
        
        # 4. Generate ceremony report
        ceremony_end = datetime.now()
        duration = (ceremony_end - ceremony_start).total_seconds()
        
        report = {
            'ceremony_id': hashlib.sha256(ceremony_name.encode()).hexdigest()[:16],
            'ceremony_name': ceremony_name,
            'started_at': ceremony_start.isoformat(),
            'completed_at': ceremony_end.isoformat(),
            'duration_seconds': duration,
            'master_key_hash': master_key_hash,
            'threshold': self.threshold,
            'total_shares': self.total_shares,
            'custodians': [
                {
                    'id': c['id'],
                    'name': c['name'],
                    'role': c['role']
                } for c in custodians
            ],
            'distributions': distributions,
            'audit_log': self.audit_log.copy()
        }
        
        self._audit("CEREMONY_COMPLETED", {
            'ceremony_id': report['ceremony_id'],
            'duration': duration,
            'timestamp': ceremony_end.isoformat()
        })
        
        logger.info(f"Ceremony completed: {ceremony_name} (duration: {duration:.2f}s)")
        
        return report
    
    def verify_share(self, share_id: int, share_data: bytes,
                    expected_hash: str) -> bool:
        """
        Verify a share against its expected hash
        
        Args:
            share_id: Share identifier
            share_data: Share bytes
            expected_hash: Expected SHA-256 hash
            
        Returns:
            True if share is valid
        """
        actual_hash = hashlib.sha256(share_data).hexdigest()
        is_valid = actual_hash == expected_hash
        
        self._audit("SHARE_VERIFIED", {
            'share_id': share_id,
            'valid': is_valid,
            'timestamp': datetime.now().isoformat()
        })
        
        return is_valid
    
    def _audit(self, event_type: str, data: Dict):
        """Add event to audit log"""
        audit_entry = {
            'event_type': event_type,
            'data': data,
            'timestamp': time.time()
        }
        self.audit_log.append(audit_entry)
    
    def export_audit_log(self, filepath: str):
        """Export audit log to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(self.audit_log, f, indent=2)
        
        logger.info(f"Audit log exported to {filepath}")
    
    def get_ceremony_report_pdf(self, report: Dict, output_path: str):
        """
        Generate PDF ceremony report (requires reportlab)
        
        Args:
            report: Ceremony report dict
            output_path: Output PDF file path
        """
        # Simplified - in production use reportlab
        import json
        text_report = json.dumps(report, indent=2)
        
        # Write text version (PDF generation requires reportlab library)
        txt_path = output_path.replace('.pdf', '.txt')
        with open(txt_path, 'w') as f:
            f.write("KEY CEREMONY REPORT\n")
            f.write("=" * 50 + "\n\n")
            f.write(text_report)
        
        logger.info(f"Ceremony report saved to {txt_path}")


def main():
    """Test key ceremony"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Key Ceremony Tool')
    parser.add_argument('--ceremony-name', required=True, help='Ceremony name')
    parser.add_argument('--threshold', type=int, default=5, help='Threshold (default: 5)')
    parser.add_argument('--shares', type=int, default=7, help='Total shares (default: 7)')
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Define custodians (election officials)
    custodians = [
        {'id': 'C001', 'name': 'Chief Election Officer', 'role': 'CEO'},
        {'id': 'C002', 'name': 'Deputy CEO', 'role': 'DCEO'},
        {'id': 'C003', 'name': 'District Magistrate 1', 'role': 'DM'},
        {'id': 'C004', 'name': 'District Magistrate 2', 'role': 'DM'},
        {'id': 'C005', 'name': 'Returning Officer 1', 'role': 'RO'},
        {'id': 'C006', 'name': 'Returning Officer 2', 'role': 'RO'},
        {'id': 'C007', 'name': 'Security Officer', 'role': 'SO'}
    ]
    
    # Initialize ceremony
    ceremony = KeyCeremonyService(
        threshold=args.threshold,
        total_shares=args.shares
    )
    
    print(f"\n{'='*60}")
    print(f"KEY CEREMONY: {args.ceremony_name}")
    print(f"{'='*60}\n")
    
    print(f"Configuration:")
    print(f"  Threshold: {args.threshold}")
    print(f"  Total Shares: {args.shares}")
    print(f"  Custodians: {len(custodians)}")
    print()
    
    # Conduct ceremony
    report = ceremony.conduct_ceremony(custodians, args.ceremony_name)
    
    print(f"\n{'='*60}")
    print(f"CEREMONY COMPLETED")
    print(f"{'='*60}\n")
    
    print(f"Ceremony ID: {report['ceremony_id']}")
    print(f"Duration: {report['duration_seconds']:.2f} seconds")
    print(f"Master Key Hash: {report['master_key_hash'][:32]}...")
    print()
    
    print(f"Share Distribution:")
    for dist in report['distributions']:
        print(f"  Share #{dist['share_id']} → {dist['custodian_name']} ({dist['custodian_role']})")
        print(f"    Hash: {dist['share_hash'][:32]}...")
    
    print()
    
    # Export audit log
    ceremony.export_audit_log(f"ceremony_{report['ceremony_id']}_audit.json")
    
    print(f"\n✅ Key ceremony completed successfully")
    print(f"   Audit log: ceremony_{report['ceremony_id']}_audit.json")
    print(f"\n⚠️  IMPORTANT: Securely distribute shares to custodians")
    print(f"   Each custodian must acknowledge receipt with signature")


if __name__ == '__main__':
    main()
