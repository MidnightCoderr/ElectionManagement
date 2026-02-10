#!/usr/bin/env python3
"""
Firmware SBOM (Software Bill of Materials) Generator
Creates SPDX-format SBOM for IoT terminal firmware with GPG signing

SPDX Format: https://spdx.dev/
"""

import os
import json
import hashlib
import subprocess
from datetime import datetime
from typing import List, Dict, Optional
import importlib.metadata as metadata


class FirmwareSBOM:
    """Generate and sign firmware SBOM"""
    
    def __init__(self, firmware_version: str, firmware_path: str):
        """
        Initialize SBOM generator
        
        Args:
            firmware_version: Firmware version (e.g., "1.0.0")
            firmware_path: Path to firmware directory
        """
       self.firmware_version = firmware_version
        self.firmware_path = firmware_path
        self.sbom_data = {
            'spdxVersion': 'SPDX-2.3',
            'dataLicense': 'CC0-1.0',
            'SPDXID': 'SPDXRef-DOCUMENT',
            'name': f'IoT-Terminal-Firmware-{firmware_version}',
            'documentNamespace': f'https://election.gov/sbom/firmware-{firmware_version}',
            'creationInfo': {},
            'packages': [],
            'files': [],
            'relationships': []
        }
    
    def scan_python_dependencies(self) -> List[Dict]:
        """Scan Python dependencies from requirements.txt"""
        dependencies = []
        requirements_file = os.path.join(self.firmware_path, 'requirements.txt')
        
        if not os.path.exists(requirements_file):
            print(f"⚠️  requirements.txt not found at {requirements_file}")
            return dependencies
        
        with open(requirements_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Parse package==version
                    if '==' in line:
                        name, version = line.split('==')
                        dependencies.append({
                            'name': name.strip(),
                            'version': version.strip(),
                            'type': 'python-package'
                        })
        
        print(f"✓ Found {len(dependencies)} Python dependencies")
        return dependencies
    
    def scan_source_files(self) -> List[Dict]:
        """Scan source code files and generate hashes"""
        source_files = []
        
        for root, dirs, files in os.walk(self.firmware_path):
            # Skip __pycache__ and other cache dirs
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
            
            for file in files:
                if file.endswith(('.py', '.c', '.h', '.cpp')):
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, self.firmware_path)
                    
                    # Calculate SHA-256 hash
                    with open(filepath, 'rb') as f:
                        file_hash = hashlib.sha256(f.read()).hexdigest()
                    
                    source_files.append({
                        'path': rel_path,
                        'sha256': file_hash,
                        'size': os.path.getsize(filepath)
                    })
        
        print(f"✓ Scanned {len(source_files)} source files")
        return source_files
    
    def get_licenses(self, dependencies: List[Dict]) -> Dict[str, str]:
        """Get license information for dependencies"""
        licenses = {}
        
        for dep in dependencies:
            try:
                pkg_metadata = metadata.metadata(dep['name'])
                license_info = pkg_metadata.get('License', 'Unknown')
                licenses[dep['name']] = license_info
            except Exception:
                licenses[dep['name']] = 'Unknown'
        
        return licenses
    
    def generate_spdx(self, dependencies: List[Dict], source_files: List[Dict]) -> Dict:
        """Generate SPDX document"""
        
        # Creation info
        self.sbom_data['creationInfo'] = {
            'created': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'creators': [
                'Tool: Firmware-SBOM-Generator-1.0',
                'Organization: Election Commission'
            ],
            'licenseListVersion': '3.20'
        }
        
        # Main firmware package
        firmware_package = {
            'SPDXID': 'SPDXRef-Firmware',
            'name': f'IoT-Terminal-Firmware',
            'versionInfo': self.firmware_version,
            'supplier': 'Organization: Election Commission',
            'downloadLocation': 'NOASSERTION',
            'filesAnalyzed': True,
            'licenseConcluded': 'MIT',
            'licenseDeclared': 'MIT',
            'copyrightText': f'Copyright (c) {datetime.now().year} Election Commission'
        }
        self.sbom_data['packages'].append(firmware_package)
        
        # Add dependencies as packages
        licenses = self.get_licenses(dependencies)
        
        for idx, dep in enumerate(dependencies):
            pkg = {
                'SPDXID': f'SPDXRef-Package-{idx}',
                'name': dep['name'],
                'versionInfo': dep['version'],
                'downloadLocation': f'https://pypi.org/project/{dep["name"]}/{dep["version"]}',
                'filesAnalyzed': False,
                'licenseConcluded': licenses.get(dep['name'], 'NOASSERTION'),
                'copyrightText': 'NOASSERTION'
            }
            self.sbom_data['packages'].append(pkg)
            
            # Add relationship
            self.sbom_data['relationships'].append({
                'spdxElementId': 'SPDXRef-Firmware',
                'relationshipType': 'DEPENDS_ON',
                'relatedSpdxElement': f'SPDXRef-Package-{idx}'
            })
        
        # Add source files
        for idx, file_info in enumerate(source_files):
            file_entry = {
                'SPDXID': f'SPDXRef-File-{idx}',
                'fileName': file_info['path'],
                'checksums': [
                    {
                        'algorithm': 'SHA256',
                        'checksumValue': file_info['sha256']
                    }
                ],
                'licenseConcluded': 'MIT',
                'copyrightText': f'Copyright (c) {datetime.now().year} Election Commission'
            }
            self.sbom_data['files'].append(file_entry)
            
            # Add file relationship
            self.sbom_data['relationships'].append({
                'spdxElementId': 'SPDXRef-Firmware',
                'relationshipType': 'CONTAINS',
                'relatedSpdxElement': f'SPDXRef-File-{idx}'
            })
        
        return self.sbom_data
    
    def export_json(self, output_path: str):
        """Export SBOM as JSON"""
        with open(output_path, 'w') as f:
            json.dump(self.sbom_data, f, indent=2)
        
        print(f"✓ SBOM exported to {output_path}")
        return output_path
    
    def sign_with_gpg(self, sbom_file: str, gpg_key_id: str) -> str:
        """
        Sign SBOM with GPG
        
        Args:
            sbom_file: Path to SBOM file
            gpg_key_id: GPG key identifier
            
        Returns:
            Path to signature file
        """
        signature_file = f"{sbom_file}.sig"
        
        try:
            # Sign with GPG
            cmd = [
                'gpg',
                '--detach-sign',
                '--armor',
                '--local-user', gpg_key_id,
                '--output', signature_file,
                sbom_file
            ]
            
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✓ SBOM signed with GPG key: {gpg_key_id}")
            print(f"✓ Signature: {signature_file}")
            
            return signature_file
            
        except subprocess.CalledProcessError as e:
            print(f"✗ GPG signing failed: {e.stderr.decode()}")
            raise
    
    def verify_signature(self, sbom_file: str, signature_file: str) -> bool:
        """Verify GPG signature"""
        try:
            cmd = ['gpg', '--verify', signature_file, sbom_file]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✓ Signature verified successfully")
                return True
            else:
                print(f"✗ Signature verification failed")
                print(result.stderr)
                return False
                
        except Exception as e:
            print(f"✗ Verification error: {e}")
            return False
    
    def generate_build_provenance(self) -> Dict:
        """Generate build provenance metadata"""
        provenance = {
            'version': self.firmware_version,
            'build_timestamp': datetime.utcnow().isoformat(),
            'build_host': os.uname().nodename,
            'build_user': os.getenv('USER', 'unknown'),
            'git_commit': self._get_git_commit(),
            'git_branch': self._get_git_branch(),
            'build_environment': {
                'python_version': self._get_python_version(),
                'os': f"{os.uname().sysname} {os.uname().release}"
            }
        }
        
        return provenance
    
    def _get_git_commit(self) -> str:
        """Get current git commit hash"""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                capture_output=True,
                text=True,
                cwd=self.firmware_path
            )
            return result.stdout.strip() if result.returncode == 0 else 'unknown'
        except:
            return 'unknown'
    
    def _get_git_branch(self) -> str:
        """Get current git branch"""
        try:
            result = subprocess.run(
                ['git', 'branch', '--show-current'],
                capture_output=True,
                text=True,
                cwd=self.firmware_path
            )
            return result.stdout.strip() if result.returncode == 0 else 'unknown'
        except:
            return 'unknown'
    
    def _get_python_version(self) -> str:
        """Get Python version"""
        import sys
        return f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"


def main():
    """Generate firmware SBOM"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Firmware SBOM Generator')
    parser.add_argument('--version', required=True, help='Firmware version')
    parser.add_argument('--firmware-path', default='../../iot-terminal', 
                       help='Path to firmware directory')
    parser.add_argument('--output', default='sbom/firmware.spdx.json',
                       help='Output SBOM file path')
    parser.add_argument('--sign', action='store_true', help='Sign SBOM with GPG')
    parser.add_argument('--gpg-key', help='GPG key ID for signing')
    parser.add_argument('--verify', action='store_true', help='Verify existing signature')
    
    args = parser.parse_args()
    
    print(f"\n{'='*60}")
    print(f"FIRMWARE SBOM GENERATOR")
    print(f"{'='*60}\n")
    
    print(f"Firmware Version: {args.version}")
    print(f"Firmware Path: {args.firmware_path}")
    print()
    
    # Initialize SBOM generator
    sbom = FirmwareSBOM(args.version, args.firmware_path)
    
    # Scan dependencies and source files
    print("Scanning firmware components...")
    dependencies = sbom.scan_python_dependencies()
    source_files = sbom.scan_source_files()
    
    # Generate SPDX document
    print("\nGenerating SPDX document...")
    spdx_doc = sbom.generate_spdx(dependencies, source_files)
    
    # Export to JSON
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    sbom_file = sbom.export_json(args.output)
    
    # Generate build provenance
    provenance = sbom.generate_build_provenance()
    provenance_file = args.output.replace('.spdx.json', '.provenance.json')
    with open(provenance_file, 'w') as f:
        json.dump(provenance, f, indent=2)
    print(f"✓ Build provenance: {provenance_file}")
    
    # Sign with GPG
    signature_file = None
    if args.sign:
        if not args.gpg_key:
            print("✗ --gpg-key required for signing")
            return 1
        
        print(f"\nSigning SBOM with GPG...")
        signature_file = sbom.sign_with_gpg(sbom_file, args.gpg_key)
    
    # Verify signature
    if args.verify and signature_file:
        print(f"\nVerifying signature...")
        sbom.verify_signature(sbom_file, signature_file)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SBOM GENERATION COMPLETE")
    print(f"{'='*60}\n")
    
    print(f"SBOM File: {sbom_file}")
    if signature_file:
        print(f"Signature: {signature_file}")
    print(f"Provenance: {provenance_file}")
    print()
    
    print(f"Components:")
    print(f"  Python Dependencies: {len(dependencies)}")
    print(f"  Source Files: {len(source_files)}")
    print(f"  Total Packages: {len(spdx_doc['packages'])}")
    print()
    
    print(f"✅ Firmware SBOM ready for distribution")
    print(f"   Publish to: https://election.gov/sbom/firmware-{args.version}/")


if __name__ == '__main__':
    import sys
    sys.exit(main() or 0)
