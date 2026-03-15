/**
 * election.js
 * Fetches election metadata and candidate lists.
 * Calls GET /api/v1/elections/:electionId/candidates
 */

import { apiFetch, mockDelay, MOCK_MODE } from './api.js'

/** @typedef {{ id: string, name: string, party: string, symbol: string, color: string, bg: string, photo: string }} Candidate */

/** Mock candidate list */
const MOCK_CANDIDATES = [
  { id: 'cand-a', name: 'Candidate A', party: 'Party X', symbol: '🦅', color: '#FF6B00', bg: '#fff8f0', photo: '👨‍💼' },
  { id: 'cand-b', name: 'Candidate B', party: 'Party Y', symbol: '🌸', color: '#2563EB', bg: '#f0f4ff', photo: '👩‍💼' },
  { id: 'cand-c', name: 'Candidate C', party: 'Party Z', symbol: '⭐', color: '#138808', bg: '#f0fff4', photo: '🧑‍💼' },
]

/**
 * Fetch all candidates for the current election and district.
 * @param {string} districtId
 * @returns {Promise<Candidate[]>}
 */
export async function getCandidates(districtId = 'mumbai-central') {
  if (MOCK_MODE) { await mockDelay(300); return MOCK_CANDIDATES }
  const data = await apiFetch(`/api/v1/elections/current/candidates?district=${encodeURIComponent(districtId)}`)
  return data.candidates
}

/**
 * Fetch current election metadata.
 * @returns {Promise<{ id: string, name: string, date: string, status: string }>}
 */
export async function getElectionInfo() {
  if (MOCK_MODE) {
    await mockDelay(200)
    return { id: 'ge-2024', name: 'General Election 2024', date: '2024-04-19', status: 'active' }
  }
  return apiFetch('/api/v1/elections/current')
}
