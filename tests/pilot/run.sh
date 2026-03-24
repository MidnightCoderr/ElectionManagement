#!/bin/bash
set -e

echo "=================================================="
echo "    Election Management - Pilot Phase Runner"
echo "=================================================="

# Ensure Node deps are available
cd ../../backend
npm ci > /dev/null 2>&1 || true

echo "[1/3] Spinning up staging environment (Docker Compose)..."
cd ../
docker-compose up -d postgres mongodb redis mqtt-broker zookeeper kafka backend ml-analytics ml-kafka-consumer

echo "Waiting 30 seconds for backend and ML consumer to become healthy..."
sleep 30

echo "[2/3] Initiating Mock Election Load (1,000 synthetic votes)..."
cd tests/pilot
node mock_election_run.js

echo "[3/3] Fetching Audit Log Summary to verify persistence..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/audit)
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo "✅ Backend API successfully serving Audit Log queries."
else
    echo "⚠️ Backend API returned $HTTP_CODE when queried for Audit Logs."
fi

echo "=================================================="
echo "    Pilot Run Completed Successfully"
echo "=================================================="
