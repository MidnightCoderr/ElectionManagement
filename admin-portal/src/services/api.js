/**
 * api.js — Admin Portal API service layer
 * Connects to the backend API with auth token support and mock fallback.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

function getToken() {
  return sessionStorage.getItem('admin_token')
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `API error ${res.status}`)
  }
  return res.json()
}

// ── Elections ────────────────────────────────────────────────────────────────

const MOCK_ELECTIONS = [
  { election_id: '1', election_name: 'Student Council President 2026', election_type: 'council', start_date: '2026-04-01', end_date: '2026-04-01', status: 'active', total_votes_cast: 2847, total_voters: 4230 },
  { election_id: '2', election_name: 'CS Department CR Election', election_type: 'class_rep', start_date: '2026-04-10', end_date: '2026-04-10', status: 'upcoming', total_votes_cast: 0, total_voters: 320 },
  { election_id: '3', election_name: 'EE Department CR Election', election_type: 'class_rep', start_date: '2026-03-01', end_date: '2026-03-01', status: 'completed', total_votes_cast: 456, total_voters: 580 },
]

export async function fetchElections(params = {}) {
  if (MOCK_MODE) return { elections: MOCK_ELECTIONS, total: MOCK_ELECTIONS.length }
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/elections${qs ? '?' + qs : ''}`)
}

export async function fetchElection(id) {
  if (MOCK_MODE) return { election: MOCK_ELECTIONS.find(e => e.election_id === id) || MOCK_ELECTIONS[0] }
  return apiFetch(`/api/v1/elections/${id}`)
}

export async function createElection(data) {
  return apiFetch('/api/v1/elections', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateElection(id, data) {
  return apiFetch(`/api/v1/elections/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function updateElectionStatus(id, status) {
  return apiFetch(`/api/v1/elections/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}

// ── Candidates ───────────────────────────────────────────────────────────────

const MOCK_CANDIDATES = [
  { candidate_id: '1', full_name: 'Arjun Mehta', party_name: 'Progress Alliance', district_id: 'cs', status: 'active', votes_received: 1234 },
  { candidate_id: '2', full_name: 'Priya Sharma', party_name: 'Student United Front', district_id: 'cs', status: 'active', votes_received: 987 },
  { candidate_id: '3', full_name: 'Rahul Verma', party_name: 'Campus Forward', district_id: 'ee', status: 'active', votes_received: 626 },
]

export async function fetchCandidates(params = {}) {
  if (MOCK_MODE) return { candidates: MOCK_CANDIDATES }
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/candidates${qs ? '?' + qs : ''}`)
}

export async function createCandidate(data) {
  return apiFetch('/api/v1/candidates', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateCandidate(id, data) {
  return apiFetch(`/api/v1/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteCandidate(id) {
  return apiFetch(`/api/v1/candidates/${id}`, { method: 'DELETE' })
}

// ── Voters ───────────────────────────────────────────────────────────────────

export async function fetchVoters(params = {}) {
  if (MOCK_MODE) {
    return {
      voters: [
        { voter_id: '1', aadhar_number: '2024CS1042', full_name: 'Neha Kumar', district_id: 'cs', status: 'active', has_voted: true },
        { voter_id: '2', aadhar_number: '2024EE2035', full_name: 'Vikram Singh', district_id: 'ee', status: 'active', has_voted: false },
      ],
      pagination: { total: 2, limit: 50, offset: 0 },
    }
  }
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/voters${qs ? '?' + qs : ''}`)
}

export async function fetchVoterStats() {
  if (MOCK_MODE) {
    return { stats: { total: 4230, active: 4180, blocked: 50, byDistrict: [] } }
  }
  return apiFetch('/api/v1/voters/stats/summary')
}

// ── Audit Logs ───────────────────────────────────────────────────────────────

export async function fetchAuditLogs(params = {}) {
  if (MOCK_MODE) {
    return {
      logs: [
        { event_id: '1', event_type: 'vote_cast', action: 'Vote cast successfully', timestamp: new Date().toISOString(), status: 'success' },
        { event_id: '2', event_type: 'admin_login', action: 'Admin login', timestamp: new Date().toISOString(), status: 'success' },
      ],
      pagination: { total: 2, limit: 100, skip: 0, hasMore: false },
    }
  }
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/audit${qs ? '?' + qs : ''}`)
}

export async function fetchAuditStats() {
  if (MOCK_MODE) {
    return { stats: [{ eventType: 'vote_cast', count: 1234567, successCount: 1234500, failureCount: 67 }] }
  }
  return apiFetch('/api/v1/audit/stats')
}

// ── Results ──────────────────────────────────────────────────────────────────

export async function fetchResults(electionId) {
  if (MOCK_MODE) {
    return {
      results: {
        election: MOCK_ELECTIONS[0],
        candidates: MOCK_CANDIDATES.map(c => ({ ...c, percentage: ((c.votes_received / 1236567) * 100).toFixed(1) })),
        winner: MOCK_CANDIDATES[0],
      },
    }
  }
  return apiFetch(`/api/v1/results/${electionId}`)
}

// ── Health Check ─────────────────────────────────────────────────────────────

export async function checkHealth() {
  if (MOCK_MODE) return { status: 'healthy', timestamp: new Date().toISOString() }
  return apiFetch('/health')
}
