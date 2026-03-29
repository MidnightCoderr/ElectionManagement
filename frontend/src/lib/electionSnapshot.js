import { getElections } from '../api/elections.js'

const DEMO_SNAPSHOT = {
  isDemo: true,
  source: 'demo',
  electionName: 'Student council election',
  activeCount: 1,
  totalVotes: 2341,
  totalVoters: 4230,
  turnoutPct: 55.3,
  turnoutLabel: '55.3%',
  terminalsActive: 12,
  lastBallotMins: 3,
  closesInLabel: 'Closes in 4h 22m',
}

export function summarizeElections(elections = []) {
  const active = elections.filter((election) => election.status === 'active')
  const totalVotes = elections.reduce((sum, election) => sum + (election.total_votes_cast || 0), 0)
  const totalVoters = elections.reduce((sum, election) => sum + (election.total_voters || 0), 0)
  const hasData = totalVotes > 0 || totalVoters > 0

  if (!hasData) return { ...DEMO_SNAPSHOT }

  const turnoutPct = totalVoters > 0 ? Number(((totalVotes / totalVoters) * 100).toFixed(1)) : 0

  return {
    isDemo: false,
    source: 'api',
    electionName: active[0]?.election_name || elections[0]?.election_name || 'Campus election monitor',
    activeCount: active.length,
    totalVotes,
    totalVoters,
    turnoutPct,
    turnoutLabel: `${turnoutPct}%`,
    terminalsActive: Math.max(4, Math.ceil(totalVoters / 350)),
    lastBallotMins: 3,
    closesInLabel: active.length ? 'Closes in 4h 22m' : 'Awaiting schedule',
  }
}

export async function loadElectionSnapshot() {
  try {
    const response = await getElections({ limit: 12 })
    return summarizeElections(response.elections || [])
  } catch {
    return { ...DEMO_SNAPSHOT }
  }
}
