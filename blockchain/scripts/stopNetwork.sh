#!/bin/bash

# ===================================
# Hyperledger Fabric Network Shutdown Script
# ===================================

set -e

echo "========================================="
echo "Stopping Hyperledger Fabric Network"
echo "========================================="

# Stop all containers
echo ""
echo "Stopping Docker containers..."
cd "$(dirname "$0")/../.."
docker-compose down

echo "✓ Containers stopped"

# Optional: Remove generated artifacts
read -p "Do you want to remove all generated artifacts? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "Removing generated artifacts..."
    
    NETWORK_DIR="$(cd "$(dirname "$0")/.." && pwd)/network"
    cd "$NETWORK_DIR"
    
    rm -rf crypto-config
    rm -rf channel-artifacts
    rm -f *.tar.gz
    
    echo "✓ Artifacts removed"
fi

echo ""
echo "========================================="
echo "✓ Network Stopped Successfully!"
echo "========================================="
echo ""
