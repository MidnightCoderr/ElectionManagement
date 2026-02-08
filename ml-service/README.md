# ML Fraud Detection Service

## Overview

Machine learning service for detecting fraudulent voting patterns in real-time using Isolation Forest algorithm.

## Features

- 🤖 **Anomaly Detection** - Isolation Forest ML algorithm
- 📊 **Feature Engineering** - 6 key voting pattern features
- 🚨 **Real-time Alerts** - Email notifications for fraud detection
- 📈 **Batch Analysis** - Analyze multiple votes simultaneously
- 💾 **Model Persistence** - Save/load trained models
- 🔄 **Continuous Monitoring** - Real-time vote stream analysis

## Installation

```bash
cd ml-service
pip install -r requirements.txt
```

## Configuration

Create `.env` file:

```env
# Service
ML_SERVICE_PORT=5000
BACKEND_URL=http://localhost:3000

# Monitoring
POLL_INTERVAL=5  # seconds

# Alerts
ALERT_EMAIL_ENABLED=false
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
ALERT_RECIPIENTS=admin@example.com,security@example.com

# Model
FRAUD_MODEL_PATH=models/fraud_detector.joblib
```

## Usage

### 1. Start API Server

```bash
python api.py
```

Server runs on `http://localhost:5000`

### 2. Start Real-time Monitor

```bash
python monitor.py
```

### 3. API Endpoints

**Analyze Single Vote:**
```bash
curl -X POST http://localhost:5000/api/ml/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "vote": {
      "voterId": "VOTER_001",
      "terminalId": "TERMINAL_001",
      "districtId": "DISTRICT_001",
      "timestamp": "2024-01-01T14:30:00"
    },
    "history": []
  }'
```

**Train Model:**
```bash
curl -X POST http://localhost:5000/api/ml/train \
  -H "Content-Type: application/json" \
  -d '{
    "votes": [ ... ]  // 100+ historical votes
  }'
```

**Batch Analysis:**
```bash
curl -X POST http://localhost:5000/api/ml/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "votes": [ ... ],
    "history": [ ... ]
  }'
```

## Features Extracted

The model analyzes these patterns:

1. **vote_time_hour** - Hour of day (0-23)
2. **vote_time_minute** - Minute within hour
3. **votes_from_terminal** - Total votes from terminal
4. **votes_in_window** - Votes in last 5 minutes
5. **district_vote_density** - Total district votes
6. **time_since_last_vote** - Seconds since last terminal vote

## Fraud Detection Logic

**Isolation Forest Algorithm:**
- Contamination rate: 1% (expected anomaly rate)
- 100 decision trees
- Anomaly score threshold: < -0.3

**Fraud Indicators:**
- Votes too close together (< 2 seconds)
- Excessive terminal usage (> 100 votes)
- High vote rate in window (> 50 votes/5min)
- Voting outside normal hours (before 6 AM or after 8 PM)
- Unusual patterns compared to training data

## Alert Severity Levels

- **CRITICAL** - Confidence > 90%
- **HIGH** - Confidence 70-90%
- **MEDIUM** - Confidence 50-70%
- **LOW** - Confidence < 50%

## Example Response

```json
{
  "success": true,
  "analysis": {
    "isFraudulent": true,
    "confidence": 0.87,
    "anomalyScore": -0.65,
    "reason": "Unusually high voting rate in time window",
    "timestamp": "2024-01-01T14:35:22"
  }
}
```

## Integration with Backend

Backend should call ML service after vote cast:

```javascript
// backend/src/routes/vote.routes.js
const axios = require('axios');

// After blockchain submission
const mlResult = await axios.post('http://localhost:5000/api/ml/analyze', {
  vote: voteData,
  history: recentVotes,
});

if (mlResult.data.analysis.isFraudulent) {
// Flag for review, send alert
  logger.warn(`Potential fraud detected: ${mlResult.data.analysis.reason}`);
}
```

## Model Training

Train on historical data:

```python
from fraud_detector import FraudDetector

# Load historical votes
votes = [...]  # 100+ votes

# Train
detector = FraudDetector()
detector.train(votes)

# Save
detector.save_model('models/fraud_detector.joblib')
```

## Tech Stack

- **Framework**: Flask
- **ML Library**: scikit-learn
- **Algorithm**: Isolation Forest
- **Async**: asyncio, aiohttp
- **Serialization**: joblib

---

**Version:** 1.0.0
