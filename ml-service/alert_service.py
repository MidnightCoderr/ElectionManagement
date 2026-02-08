"""
Alert Service for Fraud Detection
Sends notifications when fraud is detected
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List
import os
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class AlertService:
    """
    Handles alerting for fraud detection
    """
    
    def __init__(self):
        """Initialize alert service"""
        self.email_enabled = os.getenv('ALERT_EMAIL_ENABLED', 'false').lower() == 'true'
        self.smtp_server = os.getenv('SMTP_SERVER', 'localhost')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.alert_recipients = os.getenv('ALERT_RECIPIENTS', '').split(',')
        
        # Alert history (in-memory for demo, should use database)
        self.alert_history = []
        
    def send_fraud_alert(self, analysis_result: Dict, vote_data: Dict):
        """
        Send alert for detected fraud
        
        Args:
            analysis_result: Fraud analysis result
            vote_data: Vote that triggered the alert
        """
        if not analysis_result.get('isFraudulent'):
            return
        
        alert = {
            'timestamp': datetime.now().isoformat(),
            'alertType': 'FRAUD_DETECTED',
            'severity': self._get_severity(analysis_result['confidence']),
            'voteData': vote_data,
            'analysis': analysis_result,
        }
        
        # Log alert
        logger.warning(f"FRAUD ALERT: {json.dumps(alert)}")
        
        # Store alert
        self.alert_history.append(alert)
        
        # Send email if enabled
        if self.email_enabled:
            self._send_email_alert(alert)
        
        return alert
    
    def _get_severity(self, confidence: float) -> str:
        """Determine  alert severity based on confidence"""
        if confidence > 0.9:
            return 'CRITICAL'
        elif confidence > 0.7:
            return 'HIGH'
        elif confidence > 0.5:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _send_email_alert(self, alert: Dict):
        """Send email notification"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = ', '.join(self.alert_recipients)
            msg['Subject'] = f"[{alert['severity']}] Fraud Detection Alert"
            
            # Email body
            body = f"""
            Fraud Detection Alert
            
            Severity: {alert['severity']}
            Timestamp: {alert['timestamp']}
            
            Vote Information:
            - Voter ID: {alert['voteData'].get('voterId')}
            - Terminal ID: {alert['voteData'].get('terminalId')}
            - District ID: {alert['voteData'].get('districtId')}
            
            Analysis:
            - Confidence: {alert['analysis']['confidence']:.2%}
            - Anomaly Score: {alert['analysis']['anomalyScore']:.4f}
            - Reason: {alert['analysis']['reason']}
            
            Please investigate immediately.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email alert sent to {self.alert_recipients}")
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
    
    def get_alerts(self, limit: int = 100) -> List[Dict]:
        """Get recent alerts"""
        return self.alert_history[-limit:]
    
    def get_alert_summary(self) -> Dict:
        """Get summary of recent alerts"""
        total = len(self.alert_history)
        
        if total == 0:
            return {
                'total': 0,
                'bySeverity': {},
                'recent': [],
            }
        
        # Count by severity
        severity_counts = {}
        for alert in self.alert_history:
            severity = alert['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            'total': total,
            'bySeverity': severity_counts,
            'recent': self.alert_history[-10:],  # Last 10 alerts
        }


# Singleton instance
_alert_service = None


def get_alert_service() -> AlertService:
    """Get or create alert service instance"""
    global _alert_service
    if _alert_service is None:
        _alert_service = AlertService()
    return _alert_service


if __name__ == '__main__':
    # Example usage
    service = AlertService()
    
    sample_analysis = {
        'isFraudulent': True,
        'confidence': 0.95,
        'anomalyScore': -0.8,
        'reason': 'Unusually high voting rate',
    }
    
    sample_vote = {
        'voterId': 'VOTER_001',
        'terminalId': 'TERMINAL_001',
        'districtId': 'DISTRICT_001',
    }
    
    alert = service.send_fraud_alert(sample_analysis, sample_vote)
    print("\nAlert sent:")
    print(json.dumps(alert, indent=2))
