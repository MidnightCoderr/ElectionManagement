#!/bin/bash

# ===================================
# Hyperledger Fabric Chaincode Deployment Script
# ===================================

set -e

CHANNEL_NAME="election-channel"
CHAINCODE_NAME="voting"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"
CHAINCODE_DIR="$(cd "$(dirname "$0")/.." && pwd)/chaincode/voting"
CC_SRC_PATH="github.com/navyaaasingh/ElectionManagement/blockchain/chaincode/voting"

echo "========================================="
echo "Deploying Voting Chaincode"
echo "========================================="

# Step 1: Package chaincode
echo ""
echo "Step 1: Packaging chaincode..."
cd "$CHAINCODE_DIR"

# Build chaincode
echo "Building Go chaincode..."
GO111MODULE=on go mod vendor
echo "✓ Chaincode dependencies resolved"

# Package chaincode
cd ../../..
docker exec peer0.electioncommission.election.com peer lifecycle chaincode package \
    ${CHAINCODE_NAME}.tar.gz \
    --path /chaincode/voting \
    --lang golang \
    --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

echo "✓ Chaincode packaged"

# Step 2: Install chaincode
echo ""
echo "Step 2: Installing chaincode on peer..."
docker exec peer0.electioncommission.election.com peer lifecycle chaincode install \
    ${CHAINCODE_NAME}.tar.gz

echo "✓ Chaincode installed"

# Get package ID
echo ""
echo "Step 3: Querying installed chaincode..."
PACKAGE_ID=$(docker exec peer0.electioncommission.election.com peer lifecycle chaincode queryinstalled | grep ${CHAINCODE_NAME}_${CHAINCODE_VERSION} | awk -F'[, ]' '{print $3}')
echo "Package ID: ${PACKAGE_ID}"

# Step 4: Approve chaincode
echo ""
echo "Step 4: Approving chaincode for organization..."
docker exec peer0.electioncommission.election.com peer lifecycle chaincode approveformyorg \
    -o orderer.election.com:7050 \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --package-id ${PACKAGE_ID} \
    --sequence ${CHAINCODE_SEQUENCE} \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt

echo "✓ Chaincode approved"

# Step 5: Check commit readiness
echo ""
echo "Step 5: Checking commit readiness..."
docker exec peer0.electioncommission.election.com peer lifecycle chaincode checkcommitreadiness \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --sequence ${CHAINCODE_SEQUENCE} \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt \
    --output json

# Step 6: Commit chaincode
echo ""
echo "Step 6: Committing chaincode to channel..."
docker exec peer0.electioncommission.election.com peer lifecycle chaincode commit \
    -o orderer.election.com:7050 \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version ${CHAINCODE_VERSION} \
    --sequence ${CHAINCODE_SEQUENCE} \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt \
    --peerAddresses peer0.electioncommission.election.com:7051 \
    --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt

echo "✓ Chaincode committed"

# Step 7: Verify deployment
echo ""
echo "Step 7: Verifying chaincode deployment..."
docker exec peer0.electioncommission.election.com peer lifecycle chaincode querycommitted \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME}

# Step 8: Initialize ledger
echo ""
echo "Step 8: Initializing ledger..."
docker exec peer0.electioncommission.election.com peer chaincode invoke \
    -o orderer.election.com:7050 \
    --tls \
    --cafile /var/hyperledger/orderer/tls/ca.crt \
    -C ${CHANNEL_NAME} \
    -n ${CHAINCODE_NAME} \
    --peerAddresses peer0.electioncommission.election.com:7051 \
    --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt \
    -c '{"function":"InitLedger","Args":[]}'

sleep 5

echo "✓ Ledger initialized"

echo ""
echo "========================================="
echo "✓ Chaincode Deployed Successfully!"
echo "========================================="
echo ""
echo "Chaincode Details:"
echo "- Name: ${CHAINCODE_NAME}"
echo "- Version: ${CHAINCODE_VERSION}"
echo "- Sequence: ${CHAINCODE_SEQUENCE}"
echo "- Channel: ${CHANNEL_NAME}"
echo ""
echo "Available Functions:"
echo "- InitLedger"
echo "- RegisterVoter"
echo "- CastVote"
echo "- CheckVoterStatus"
echo "- GetResults"
echo "- CreateElection"
echo "- RegisterCandidate"
echo "- GetVoteByID"
echo ""
echo "Test the deployment with:"
echo "docker exec peer0.electioncommission.election.com peer chaincode query -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} -c '{\"function\":\"CheckVoterStatus\",\"Args\":[\"VOTER_001\",\"ELECTION_2024_001\"]}'"
echo ""
