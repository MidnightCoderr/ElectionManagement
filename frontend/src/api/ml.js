import { api } from './client.js';

/**
 * Analyze a single vote for fraud via the backend ML proxy.
 * @param {object} vote  - vote object with voterId, candidateId, terminalId etc.
 * @param {Array}  history - recent votes for context
 */
export function analyzeVote(vote, history = []) {
  return api.post('/api/ml/analyze', { vote, history });
}

/**
 * Batch-analyze multiple votes.
 */
export function batchAnalyze(votes, history = []) {
  return api.post('/api/ml/batch-analyze', { votes, history });
}

/**
 * Get ML service health status.
 */
export function getMlHealth() {
  return api.get('/api/ml/health');
}
