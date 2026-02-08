"""
ML Fraud Detection Service
Analyzes voting patterns and detects anomalies in real-time
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FraudDetector:
    """
    Fraud detection engine using Isolation Forest algorithm
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize fraud detector
        
        Args:
            model_path: Path to pre-trained model (optional)
        """
        self.model = None
        self.scaler = StandardScaler()
        self.features = [
            'vote_time_hour',
            'vote_time_minute',
            'votes_from_terminal',
            'votes_in_window',
            'district_vote_density',
            'time_since_last_vote',
        ]
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            # Initialize with default parameters
            self.model = IsolationForest(
                contamination=0.01,  # 1% expected anomaly rate
                random_state=42,
                n_estimators=100,
            )
            logger.info("Initialized new Isolation Forest model")
    
    def extract_features(self, vote_data: Dict, historical_data: List[Dict]) -> np.ndarray:
        """
        Extract features from vote data for anomaly detection
        
        Args:
            vote_data: Current vote information
            historical_data: Recent voting history
            
        Returns:
            Feature vector
        """
        features = []
        
        # Time-based features
        vote_time = datetime.fromisoformat(vote_data.get('timestamp', datetime.now().isoformat()))
        features.append(vote_time.hour)
        features.append(vote_time.minute)
        
        # Terminal-based features
        terminal_id = vote_data.get('terminalId', '')
        terminal_votes = sum(1 for v in historical_data if v.get('terminalId') == terminal_id)
        features.append(terminal_votes)
        
        # Time window features (votes in last 5 minutes)
        five_min_ago = vote_time.timestamp() - 300
        recent_votes = sum(
            1 for v in historical_data
            if datetime.fromisoformat(v.get('timestamp', '2000-01-01')).timestamp() > five_min_ago
        )
        features.append(recent_votes)
        
        # District-based features
        district_id = vote_data.get('districtId', '')
        district_votes = sum(1 for v in historical_data if v.get('districtId') == district_id)
        features.append(district_votes)
        
        # Time since last vote from this terminal
        terminal_history = [
            v for v in historical_data
            if v.get('terminalId') == terminal_id
        ]
        if terminal_history:
            last_vote_time = max(
                datetime.fromisoformat(v.get('timestamp', '2000-01-01'))
                for v in terminal_history
            )
            time_diff = (vote_time - last_vote_time).total_seconds()
        else:
            time_diff = 9999  # Large value for first vote
        features.append(time_diff)
        
        return np.array(features).reshape(1, -1)
    
    def train(self, historical_votes: List[Dict]):
        """
        Train the fraud detection model on historical data
        
        Args:
            historical_votes: List of historical vote records
        """
        if len(historical_votes) < 100:
            logger.warning(f"Insufficient training data: {len(historical_votes)} votes")
            return
        
        logger.info(f"Training model on {len(historical_votes)} historical votes")
        
        # Extract features for all votes
        feature_vectors = []
        for i, vote in enumerate(historical_votes):
            # Use votes before current one as history
            history = historical_votes[:i]
            features = self.extract_features(vote, history)
            feature_vectors.append(features[0])
        
        X = np.array(feature_vectors)
        
        # Fit scaler and transform
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        
        logger.info("Model training complete")
    
    def predict(self, vote_data: Dict, historical_data: List[Dict]) -> Dict:
        """
        Predict if a vote is fraudulent
        
        Args:
            vote_data: Current vote to analyze
            historical_data: Recent voting history
            
        Returns:
            Prediction result with score and details
        """
        if self.model is None:
            logger.error("Model not trained or loaded")
            return {
                'isFraudulent': False,
                'confidence': 0.0,
                'reason': 'Model not initialized',
            }
        
        # Extract and scale features
        features = self.extract_features(vote_data, historical_data)
        features_scaled = self.scaler.transform(features)
        
        # Predict (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(features_scaled)[0]
        
        # Get anomaly score (lower = more anomalous)
        score = self.model.score_samples(features_scaled)[0]
        
        # Convert score to confidence (0-1 range)
        # Typical scores range from -0.5 to 0.5
        confidence = max(0, min(1, 1 - (score + 0.5)))
        
        is_fraudulent = prediction == -1
        
        # Determine reason
        reason = self._get_fraud_reason(features[0], is_fraudulent)
        
        result = {
            'isFraudulent': bool(is_fraudulent),
            'confidence': float(confidence),
            'anomalyScore': float(score),
            'reason': reason,
            'timestamp': datetime.now().isoformat(),
        }
        
        if is_fraudulent:
            logger.warning(f"Potential fraud detected: {result}")
        
        return result
    
    def _get_fraud_reason(self, features: np.ndarray, is_fraudulent: bool) -> str:
        """
        Determine the most likely reason for fraud detection
        
        Args:
            features: Feature vector
            is_fraudulent: Whether fraud was detected
            
        Returns:
            Human-readable reason
        """
        if not is_fraudulent:
            return "Normal voting pattern"
        
        # Analyze features to determine reason
        vote_hour = features[0]
        votes_from_terminal = features[2]
        votes_in_window = features[3]
        time_since_last = features[5]
        
        if votes_in_window > 50:
            return "Unusually high voting rate in time window"
        elif votes_from_terminal > 100:
            return "Excessive votes from single terminal"
        elif time_since_last < 2:
            return "Votes too close together from same terminal"
        elif vote_hour < 6 or vote_hour > 20:
            return "Voting outside normal hours"
        else:
            return "Anomalous voting pattern detected"
    
    def save_model(self, path: str):
        """
        Save trained model to disk
        
        Args:
            path: File path to save model
        """
        if self.model is None:
            logger.error("No model to save")
            return
        
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
        }, path)
        
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """
        Load trained model from disk
        
        Args:
            path: File path to load model from
        """
        if not os.path.exists(path):
            logger.error(f"Model file not found: {path}")
            return
        
        data = joblib.dump(path)
        self.model = data['model']
        self.scaler = data['scaler']
        
        logger.info(f"Model loaded from {path}")


# Singleton instance
_detector = None


def get_detector() -> FraudDetector:
    """Get or create fraud detector instance"""
    global _detector
    if _detector is None:
        model_path = os.getenv('FRAUD_MODEL_PATH', 'models/fraud_detector.joblib')
        _detector = FraudDetector(model_path)
    return _detector


def analyze_vote(vote_data: Dict, historical_data: List[Dict]) -> Dict:
    """
    Analyze a vote for potential fraud
    
    Args:
        vote_data: Vote to analyze
        historical_data: Recent voting history
        
    Returns:
        Analysis result
    """
    detector = get_detector()
    return detector.predict(vote_data, historical_data)


if __name__ == '__main__':
    # Example usage
    logger.info("Fraud Detection Service - Example Usage")
    
    # Sample vote
    sample_vote = {
        'voterId': 'VOTER_001',
        'candidateId': 'CANDIDATE_042',
        'terminalId': 'TERMINAL_001',
        'districtId': 'DISTRICT_001',
        'timestamp': datetime.now().isoformat(),
    }
    
    # Sample history
    sample_history = []
    
    detector = FraudDetector()
    result = detector.predict(sample_vote, sample_history)
    
    print("\nFraud Detection Result:")
    print(json.dumps(result, indent=2))
