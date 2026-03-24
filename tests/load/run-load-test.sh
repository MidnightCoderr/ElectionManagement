#!/bin/bash
set -e

echo "=================================================="
echo " Election Management System - Load Testing Script"
echo "=================================================="

# Check if Artillery is installed
if ! command -v npx >/dev/null 2>&1; then
    echo "Error: Node.js/npx not found. Please install Node.js first."
    exit 1
fi

echo "[1/3] Ensuring Docker services are up..."
cd ../../
docker-compose up -d postgres mongodb redis mqtt-broker zookeeper kafka backend
echo "Waiting 20 seconds for services to healthy..."
sleep 20

echo "[2/3] Executing Artillery Load Test..."
cd tests/load

# Fallback no-op JS helper if none exists
if [ ! -f "artillery-helpers.js" ]; then
    echo "module.exports = { };" > artillery-helpers.js
fi

mkdir -p reports
REPORT_FILE="reports/artillery-report-$(date +%s).json"
HTML_REPORT="reports/artillery-report-$(date +%s).html"

npx artillery run artillery-config.yml -o "$REPORT_FILE"

echo "[3/3] Generating HTML Report..."
npx artillery report "$REPORT_FILE" -o "$HTML_REPORT"

echo "=================================================="
echo " Load testing completed."
echo " JSON Report: $REPORT_FILE"
echo " HTML Report: $HTML_REPORT"
echo "=================================================="
