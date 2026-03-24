# ML Fraud Detection Service

## Overview

Real-time fraud detection engine for the Election Management System. Uses a **three-model ensemble** (Isolation Forest + XGBoost + LSTM) to analyze voting telemetry streamed via Apache Kafka, and pushes alerts back to the backend via webhooks.

## Architecture

```
Kafka (vote-telemetry) → kafka_consumer.py → fraud_detector.py (Ensemble) → POST /api/v1/audit/alerts
```

### Ensemble Models

| Model | Type | Weight | Purpose |
|-------|------|--------|---------|
| **Isolation Forest** | Unsupervised | 40% | Detects distance-based anomalies in tabular vote features |
| **XGBoost** | Supervised | 40% | Classifies coordinated fraud patterns using gradient boosting |
| **LSTM** | Deep Learning | 20% | Forecasts temporal voting surges using recurrent sequences |

The combined `ensemble_confidence` score (0.0–1.0) flags a vote as fraudulent if it exceeds `0.6` (configurable via `ANOMALY_THRESHOLD`).

## Files

| File | Purpose |
|------|---------|
| `fraud_detector.py` | Core ensemble engine (train, predict, save/load) |
| `kafka_consumer.py` | Kafka stream consumer that feeds votes into the detector |
| `api.py` | Flask REST API (`/api/ml/analyze`, `/api/ml/train`, `/api/ml/batch-analyze`) |
| `alert_service.py` | Email notification service for fraud alerts |
| `monitor.py` | Real-time polling monitor for the backend vote stream |
| `requirements.txt` | Python dependencies |

### Jupyter Notebooks

All `.py` files have been converted to `.ipynb` notebooks for interactive exploration:
- `fraud_detector.ipynb`, `kafka_consumer.ipynb`, `api.ipynb`, `alert_service.ipynb`, `monitor.ipynb`

## Installation

```bash
cd ml-service
pip install -r requirements.txt
```

### Key Dependencies
- `scikit-learn` — Isolation Forest
- `xgboost==2.0.2` — Gradient boosting classifier
- `tensorflow==2.15.0` — Keras LSTM network
- `kafka-python` — Kafka consumer client
- `flask` / `flask-cors` — REST API

## Configuration

Environment variables (set in `.env` or Docker):

```env
ML_SERVICE_PORT=5000
BACKEND_URL=http://localhost:3000
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=vote-telemetry
ML_SERVICE_API_KEY=your-shared-secret
ANOMALY_THRESHOLD=0.6
FRAUD_MODEL_PATH=models/fraud_detector.joblib
```

## Usage

### Start the Flask API

```bash
python api.py
```

### Start the Kafka Consumer (Production)

```bash
python kafka_consumer.py
```

### API Endpoints

**Analyze a single vote:**
```bash
curl -X POST http://localhost:5000/api/ml/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "vote": {
      "voterId": "V001", "terminalId": "T001",
      "districtId": "D001", "timestamp": "2026-03-24T10:30:00"
    },
    "history": []
  }'
```

**Train the ensemble:**
```bash
curl -X POST http://localhost:5000/api/ml/train \
  -H "Content-Type: application/json" \
  -d '{ "votes": [ ... ] }'   # 100+ historical votes required
```

### Example Ensemble Response

```json
{
  "isFraudulent": true,
  "confidence": 0.78,
  "details": {
    "isolationForestScore": 0.82,
    "xgboostScore": 0.91,
    "lstmScore": 0.35
  },
  "reason": "Isolation Forest detected distance anomaly | XGBoost classified tabular heuristic match"
}
```

## Features Extracted (6 dimensions)

1. `vote_time_hour` — Hour of day (0–23)
2. `vote_time_minute` — Minute within hour
3. `votes_from_terminal` — Lifetime votes from this terminal
4. `votes_in_window` — Global votes in last 5 minutes
5. `district_vote_density` — Lifetime district votes
6. `time_since_last_vote` — Seconds since last vote on this terminal

## Docker

The service runs as two containers in `docker-compose.yml`:
- `ml-analytics` — Flask API (port 5000)
- `ml-kafka-consumer` — Kafka stream processor

---

**Version:** 2.0.0  
**Last Updated:** March 2026
