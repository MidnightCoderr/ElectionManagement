# %%
"""
Real-time Monitoring Service
Connects to backend and monitors votes in real-time
"""

# %%
import asyncio
import aiohttp
import logging
from typing import Optional
import os
from fraud_detector import analyze_vote, get_detector
from alert_service import get_alert_service

# %%
logger = logging.getLogger(__name__)


# %%
class VoteMonitor:
    """
    Real-time vote monitoring service
    """
    
    def __init__(self):
        """Initialize monitor"""
        self.backend_url = os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.poll_interval = int(os.getenv('POLL_INTERVAL', 5))  # seconds
        self.running = False
        self.last_processed_id = None
        self.vote_history = []
        self.max_history = 1000  # Keep last 1000 votes
        
    async def start(self):
        """Start monitoring"""
        self.running = True
        logger.info("Starting vote monitor...")
        
        detector = get_detector()
        alert_service = get_alert_service()
        
        while self.running:
            try:
                # Fetch recent votes from backend
                async with aiohttp.ClientSession() as session:
                    url = f"{self.backend_url}/api/v1/votes/recent"
                    if  self.last_processed_id:
                        url += f"?after={self.last_processed_id}"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            votes = data.get('votes', [])
                            
                            # Process each new vote
                            for vote in votes:
                                await self._process_vote(vote, detector, alert_service)
                                self.last_processed_id = vote.get('voteId')
                        
                        elif response.status != 404:
                            logger.error(f"Failed to fetch votes: {response.status}")
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
            
            # Wait before next poll
            await asyncio.sleep(self.poll_interval)
    
    async def _process_vote(self, vote, detector, alert_service):
        """Process a single vote"""
        try:
            # Analyze vote
            analysis = detector.predict(vote, self.vote_history)
            
            logger.info(f"Analyzed vote {vote.get('voteId')}: "
                       f"Fraudulent={analysis['isFraudulent']}, "
                       f"Confidence={analysis['confidence']:.2%}")
            
            # Send alert if fraud detected
            if analysis['isFraudulent']:
                alert_service.send_fraud_alert(analysis, vote)
            
            # Add to history
            self.vote_history.append(vote)
            
            # Trim history if too large
            if len(self.vote_history) > self.max_history:
                self.vote_history = self.vote_history[-self.max_history:]
            
        except Exception as e:
            logger.error(f"Error processing vote: {e}")
    
    def stop(self):
        """Stop monitoring"""
        self.running = False
        logger.info("Stopping vote monitor...")


# %%
async def main():
    """Main entry point"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    monitor = VoteMonitor()
    
    try:
        await monitor.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
        monitor.stop()


# %%
if __name__ == '__main__':
    asyncio.run(main())
