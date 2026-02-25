# ML Fraud Detection Pipeline Specification

## Overview

The ML fraud detection system monitors voting patterns in real-time to detect anomalies, fraudulent behavior, and system abnormalities without exposing voter identities.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Data Sources                              │
├────────────────┬──────────────┬──────────────┬─────────────┤
│ Blockchain     │ API Logs     │ IoT Terminals│ Audit Logs  │
│ Events         │ (MongoDB)    │ (Health)     │ (MongoDB)   │
└────────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   Kafka Event Stream           │
         │   Topic: election-events       │
         └───────────────┬────────────────┘
                         │10
         ┌───────────────▼────────────────┐
         │   Feature Engineering          │
         │   (Apache Spark / Python)      │
         └───────────────┬────────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   ML Models (Ensemble)         │
         │   ├─ Anomaly Detection         │
         │   ├─ Pattern Recognition       │
         │   └─ Voting Rate Prediction    │
         └───────────────┬────────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   Alert Generation             │
         │   (Threshold-based)            │
         └───────────────┬────────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   Alert Triage Dashboard       │
         │   (Human Review)               │
         └────────────────────────────────┘
```

---

## Features & Data Ingestion

### Event Stream Schema

**Topic:** `election-events`

**Message Format:**
```json
{
  "eventId": "uuid",
  "eventType": "VOTE_CAST | TERMINAL_STATUS | AUTH_ATTEMPT",
  "timestamp": 1707439800000,
  "source": "blockchain | api | iot",
  
  "payload": {
    "voteId": "uuid",
    "electionId": "uuid",
    "districtId": "uuid",
    "terminalId": "TERM-001",
    "votingDuration": 45,  // seconds
    "biometricConfidence": 0.98,
    "retryCount": 0
  },
  
  "metadata": {
    "blockNumber": 12345,
    "txId": "0xAB12...",
    "peerId": "peer0.org1"
  }
}
```

---

### Feature Engineering

**Extracted Features (per vote):**

1. **Temporal Features:**
   - Time of day (hour)
   - Day of week
   - Time since election start
   - Time between consecutive votes (same terminal)
   - Voting rate (votes/minute in last 5 min)

2. **Terminal Features:**
   - Terminal ID
   - District ID
   - Total votes processed today
   - Average voting duration
   - Error rate (failed auths / total attempts)
   - Battery level
   - Uptime

3. **Biometric Features:**
   - Biometric confidence score
   - Authentication retry count
   - Failed auth rate (last hour)

4. **Geographic Features:**
   - District population density
   - Historical turnout rate
   - Distance to nearest other terminal

5. **Aggregate Features:**
   - Votes in district (last 5 min)
   - Terminal utilization rank
   - Deviation from expected rate

**Feature Vector Example:**
```python
features = [
    hour=14,
    time_since_last_vote=12,  # seconds
    votes_last_5min=15,
    terminal_total_today=234,
    avg_voting_duration=45,
    biometric_confidence=0.98,
    retry_count=0,
    district_turnout=0.58,
    expected_rate=10,  # votes/min
    deviation=0.5  # actual - expected
]
```

---

### Feature Computation Pipeline

```python
# Apache Spark Streaming
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.window import Window

spark = SparkSession.builder.appName("ElectionML").getOrCreate()

# Read from Kafka
events = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "election-events") \
    .load()

# Parse JSON
parsed = events.select(
    from_json(col("value").cast("string"), event_schema).alias("data")
).select("data.*")

# Feature engineering
windowed = parsed \
    .withWatermark("timestamp", "1 minute") \
    .groupBy(
        window("timestamp", "5 minutes", "1 minute"),
        "terminalId",
        "districtId"
    ) \
    .agg(
        count("*").alias("votes_5min"),
        avg("votingDuration").alias("avg_duration"),
        avg("biometricConfidence").alias("avg_confidence")
    )

# Add derived features
features = windowed \
    .withColumn("hour", hour("window.start")) \
    .withColumn("expected_rate", lit(10))  # From historical data \
    .withColumn("deviation", col("votes_5min") / 5 - col("expected_rate"))

# Write to ML input stream
features.writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("topic", "ml-features") \
    .option("checkpointLocation", "/checkpoints/features") \
    .start()
```

---

## ML Models (Ensemble)

### Model 1: Isolation Forest (Anomaly Detection)

**Purpose:** Detect unusual voting patterns

**Algorithm:** Isolation Forest (unsupervised)

**Training:**
```python
from sklearn.ensemble import IsolationForest

# Train on normal voting data
model_anomaly = IsolationForest(
    n_estimators=100,
    contamination=0.01,  # Expect 1% anomalies
    random_state=42
)

model_anomaly.fit(training_features)

# Save model
import joblib
joblib.dump(model_anomaly, 'models/anomaly_detector.pkl')
```

**Inference:**
```python
# Real-time prediction
anomaly_score = model_anomaly.decision_function(features)
is_anomaly = model_anomaly.predict(features)

if is_anomaly == -1:
    alert_type = "ANOMALY"
    confidence = abs(anomaly_score)
```

**Detects:**
- Sudden voting spikes
- Unusual time-of-day patterns
- Abnormal voting duration

---

### Model 2: XGBoost (High-Volume Fraud)

**Purpose:** Detect coordinated voting fraud

**Algorithm:** XGBoost (supervised)

**Features:**
- Votes in 5-min window
- Terminal concentration
- Geographic clustering
- Biometric retry patterns

**Training:**
```python
import xgboost as xgb

# Labeled training data (fraud vs normal)
X_train = training_features
y_train = training_labels  # 0 = normal, 1 = fraud

dtrain = xgb.DMatrix(X_train, label=y_train)

params = {
    'max_depth': 6,
    'eta': 0.1,
    'objective': 'binary:logistic',
    'eval_metric': 'auc'
}

model_fraud = xgb.train(params, dtrain, num_boost_round=100)
model_fraud.save_model('models/fraud_detector.xgb')
```

**Inference:**
```python
dtest = xgb.DMatrix(features)
fraud_probability = model_fraud.predict(dtest)[0]

if fraud_probability > 0.8:
    alert_type = "HIGH_VOLUME_FRAUD"
    confidence = fraud_probability
```

---

### Model 3: LSTM (Time Series Prediction)

**Purpose:** Predict expected voting rate

**Algorithm:** LSTM neural network

**Training:**
```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Sequence of voting rates (last 12 x 5-min windows)
model_lstm = Sequential([
    LSTM(64, input_shape=(12, 5), return_sequences=True),
    LSTM(32),
    Dense(16, activation='relu'),
    Dense(1)  # Predicted votes/min
])

model_lstm.compile(optimizer='adam', loss='mse')
model_lstm.fit(X_train_seq, y_train_rate, epochs=50)
model_lstm.save('models/rate_predictor.h5')
```

**Inference:**
```python
predicted_rate = model_lstm.predict(recent_sequence)[0][0]
actual_rate = features['votes_5min'] / 5

deviation = abs(actual_rate - predicted_rate)

if deviation > 3 * std_dev:
    alert_type = "PATTERN_ANOMALY"
    confidence = deviation / std_dev
```

---

## Detection Thresholds & Alert Policy

### Threshold Configuration

```yaml
# config/thresholds.yaml

anomaly_detection:
  isolation_forest_threshold: -0.5
  min_confidence: 0.7
  severity: MEDIUM

high_volume_fraud:
  probability_threshold: 0.8
  votes_5min_max: 100
  severity: HIGH

pattern_anomaly:
  deviation_std_threshold: 3.0
  min_sequence_length: 12
  severity: HIGH

terminal_offline:
  max_offline_minutes: 15
  severity: LOW

failed_auth_spike:
  max_failed_per_hour: 10
  severity: MEDIUM

biometric_low_confidence:
  min_confidence: 0.85
  consecutive_threshold: 3
  severity: LOW
```

---

### Alert Generation Logic

```python
class AlertGenerator:
    def __init__(self, thresholds):
        self.thresholds = thresholds
    
    def generate_alert(self, features, predictions):
        alerts = []
        
        # Anomaly detection
        if predictions['anomaly_score'] < self.thresholds['isolation_forest_threshold']:
            alerts.append({
                'type': 'ANOMALY',
                'severity': 'MEDIUM',
                'confidence': abs(predictions['anomaly_score']),
                'terminal_id': features['terminal_id'],
                'description': f"Unusual pattern detected at terminal {features['terminal_id']}",
                'timestamp': time.time(),
                'explainability': {
                    'top_features': [
                        {'feature': 'votes_5min', 'value': features['votes_5min'], 'normal_range': '5-15'},
                        {'feature': 'voting_duration', 'value': features['avg_duration'], 'normal_range': '30-60s'}
                    ]
                }
            })
        
        # High-volume fraud
        if predictions['fraud_probability'] > self.thresholds['probability_threshold']:
            alerts.append({
                'type': 'HIGH_VOLUME_FRAUD',
                'severity': 'HIGH',
                'confidence': predictions['fraud_probability'],
                'terminal_id': features['terminal_id'],
                'description': f"Potential coordinated fraud: {features['votes_5min']} votes in 5 min",
                'timestamp': time.time(),
                'explainability': {
                    'reason': 'Multiple terminals in same district showing synchronized high volume',
                    'affected_terminals': features['nearby_terminals']
                }
            })
        
        # Pattern anomaly
        if predictions['deviation'] > self.thresholds['deviation_std_threshold']:
            alerts.append({
                'type': 'PATTERN_ANOMALY',
                'severity': 'HIGH',
                'confidence': predictions['deviation'] / 3.0,
                'terminal_id': features['terminal_id'],
                'description': f"Voting rate {predictions['deviation']}σ above expected",
                'timestamp': time.time(),
                'explainability': {
                    'expected_rate': predictions['predicted_rate'],
                    'actual_rate': features['votes_5min'] / 5,
                    'historical_pattern': '[Chart data]'
                }
            })
        
        return alerts
```

**Result:** Alerts are explainable ✅

---

### Voter Privacy Protection

**CRITICAL: Never expose voter identity**

```python
# Aggregation-only
features = [
    'votes_5min',      # ✅ Aggregate count
    'avg_duration',    # ✅ Average
    'terminal_id',     # ✅ Terminal (not voter)
    'district_id',     # ✅ District (not voter)
    # ❌ voter_id - NEVER included
    # ❌ candidate_id - NEVER included
]

# Minimum aggregation size
MIN_AGG_SIZE = 5  # At least 5 votes before analysis

if votes_in_window < MIN_AGG_SIZE:
    skip_ml_analysis()
```

**Result:** Detection does not expose voter identity ✅

---

## Alert Triage Workflow

### Dashboard UI

```
┌──────────────────────────────────────────────────────┐
│  Fraud Alert Triage | 3 Pending Alerts                │
├────┬─────────┬──────────┬──────────────────────────┤
│ ID │ Time    │ Severity │ Alert                     │
├────┼─────────┼──────────┼──────────────────────────┤
│ #1 │ 2:45 PM │ 🔴 HIGH  │ High volume: TERM-045    │
│    │         │          │ 150 votes in 5 min       │
│    │         │          │ Confidence: 95%          │
│    │         │          │ ┌────────────────────┐   │
│    │         │          │ │ [INVESTIGATE]      │   │
│    │         │          │ │ [FALSE POSITIVE]   │   │
│    │         │          │ │ [CONFIRMED FRAUD]  │   │
│    │         │          │ └────────────────────┘   │
└────┴─────────┴──────────┴──────────────────────────┘
```

---

### Triage Actions

**1. INVESTIGATE:**
- Assign to analyst
- Pull detailed logs
- Contact terminal technician
- Review CCTV (if available)

**2. FALSE POSITIVE:**
- Mark as explained
- Add to training data (label = 0)
- Adjust threshold if needed
- Document reason

**3. CONFIRMED FRAUD:**
- Lock terminal
- Send security alert
- Initiate investigation
- Flag affected votes
- Add to training data (label = 1)

---

### Feedback Loop

```python
class FeedbackLoop:
    def __init__(self):
        self.feedback_db = MongoDB('feedback_collection')
    
    def record_triage(self, alert_id, action, analyst_notes):
        feedback = {
            'alert_id': alert_id,
            'action': action,  # INVESTIGATE | FALSE_POSITIVE | CONFIRMED
            'timestamp': time.time(),
            'analyst': current_user.id,
            'notes': analyst_notes,
            
            # Original alert data
            'features': alert.features,
            'prediction': alert.prediction,
            'confidence': alert.confidence
        }
        
        self.feedback_db.insert(feedback)
        
        # If definitive (not INVESTIGATE)
        if action in ['FALSE_POSITIVE', 'CONFIRMED']:
            label = 1 if action == 'CONFIRMED' else 0
            self.add_to_training_set(alert.features, label)
    
    def add_to_training_set(self, features, label):
        # Append to training data
        training_data = pd.read_csv('data/training_extended.csv')
        new_row = {**features, 'label': label}
        training_data = training_data.append(new_row, ignore_index=True)
        training_data.to_csv('data/training_extended.csv', index=False)
        
        # Trigger retraining if enough new data
        if len(training_data) % 1000 == 0:
            self.schedule_retraining()
```

---

### Model Retraining Schedule

**Automatic Retraining:**
- Every 1,000 new labeled samples
- Once per week during election
- After major threshold adjustment

**Process:**
```bash
# Automated pipeline
1. Export labeled data
2. Split train/test (80/20)
3. Retrain models
4. Evaluate on test set
5. If AUC > 0.95 → Deploy
6. If AUC < 0.90 → Alert data science team
7. Update production models (blue-green deployment)
```

---

## Validation Checklist

- [x] Data ingestion pipeline defined (Kafka + Spark)
- [x] Feature engineering specified (5 categories, 15+ features)
- [x] ML models: 3 models (Isolation Forest, XGBoost, LSTM)
- [x] Detection thresholds configured (6 alert types)
- [x] Alert policy with severity levels
- [x] Alerts are explainable (top features, reasons) ✅
- [x] Voter privacy protected (aggregation-only) ✅
- [x] No voter identity exposure ✅
- [x] Alert triage workflow defined
- [x] Feedback loop for false positives ✅
- [x] Automatic model retraining scheduled

---

**Document Version:** 1.0  
**Last Updated:** February 2024  
**Status:** ✅ Complete
