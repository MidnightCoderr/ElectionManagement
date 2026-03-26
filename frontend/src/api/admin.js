import { api } from './client.js';

/**
 * Get paginated voter list (admin only).
 */
export function getVoters(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/v1/voters${qs ? '?' + qs : ''}`);
}

/**
 * Get audit logs from MongoDB (admin only).
 */
export function getAuditLogs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/v1/audit${qs ? '?' + qs : ''}`);
}

/**
 * Get detailed results for an election (aggregated tally).
 */
export function getElectionResults(electionId) {
  return api.get(`/api/v1/results/${electionId}`);
}

/**
 * Get dashboard statistics summary.
 */
export function getDashboardStats() {
  return api.get('/api/v1/elections?limit=10&offset=0');
}
