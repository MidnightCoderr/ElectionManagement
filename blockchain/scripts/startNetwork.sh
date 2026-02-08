#!/bin/bash

# ===================================
# Hyperledger Fabric Network Startup Script
# ===================================

set -e

CHANNEL_NAME="election-channel"
CHAINCODE_NAME="voting"
NETWORK_DIR="$(cd "$(dirname "$0")/.." && pwd)/network"
CHAINCODE_DIR="$(cd "$(dirname "$0")/.." && pwd)/chaincode/voting"

echo "========================================="
echo "Starting Hyperledger Fabric Network"
echo "========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

cd "$NETWORK_DIR"

# Step 1: Generate crypto material
echo ""
echo "Step 1: Generating crypto material..."
if [ ! -d "crypto-config" ]; then
    cryptogen generate --config=./crypto-config.yaml --output=crypto-config
    echo "✓ Crypto material generated"
else
    echo "✓ Crypto material already exists"
fi

# Step 2: Generate genesis block
echo ""
echo "Step 2: Generating genesis block..."
if [ ! -d "channel-artifacts" ]; then
    mkdir -p channel-artifacts
fi

configtxgen -profile ThreeOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
echo "✓ Genesis block generated"

# Step 3: Generate channel configuration transaction
echo ""
echo "Step 3: Generating channel configuration..."
configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID ${CHANNEL_NAME}
echo "✓ Channel configuration generated"

# Step 4: Generate anchor peer updates
echo ""
echo "Step 4: Generating anchor peer updates..."
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ElectionCommissionMSPanchors.tx -channelID ${CHANNEL_NAME} -asOrg ElectionCommissionMSP
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/JudiciaryMSPanchors.tx -channelID ${CHANNEL_NAME} -asOrg JudiciaryMSP
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ObserversMSPanchors.tx -channelID ${CHANNEL_NAME} -asOrg ObserversMSP
echo "✓ Anchor peer updates generated"

# Step 5: Start the network
echo ""
echo "Step 5: Starting Docker containers..."
cd ../..
docker-compose -f docker-compose.yml up -d orderer.election.com peer0.electioncommission.election.com
echo "✓ Network containers started"

# Wait for containers to be ready
echo ""
echo "Waiting for network to be ready..."
sleep 10

# Step 6: Create channel
echo ""
echo "Step 6: Creating channel..."
docker exec peer0.electioncommission.election.com peer channel create \
    -o orderer.election.com:7050 \
    -c ${CHANNEL_NAME} \
    -f /channel-artifacts/${CHANNEL_NAME}.tx \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt \
    --outputBlock /channel-artifacts/${CHANNEL_NAME}.block
echo "✓ Channel created"

# Step 7: Join channel
echo ""
echo "Step 7: Joining channel..."
docker exec peer0.electioncommission.election.com peer channel join \
    -b /channel-artifacts/${CHANNEL_NAME}.block
echo "✓ Peer joined channel"

# Step 8: Update anchor peers
echo ""
echo "Step 8: Updating anchor peers..."
docker exec peer0.electioncommission.election.com peer channel update \
    -o orderer.election.com:7050 \
    -c ${CHANNEL_NAME} \
    -f /channel-artifacts/ElectionCommissionMSPanchors.tx \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt
echo "✓ Anchor peers updated"

echo ""
echo "========================================="
echo "✓ Fabric Network Started Successfully!"
echo "========================================="
echo ""
echo "Network Status:"
echo "- Channel: ${CHANNEL_NAME}"
echo "- Orderer: orderer.election.com:7050"
echo "- Peer: peer0.electioncommission.election.com:7051"
echo ""
echo "Next steps:"
echo "1. Run './scripts/deployChaincode.sh' to deploy the voting chaincode"
echo "2. Use the Fabric SDK to interact with the network"
echo ""
