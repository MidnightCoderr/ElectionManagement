export const MOCK_RESULTS = {
    election: { totalVoters: 4230, totalVotesCast: 2847 },
    blockchainResults: {
        'Arjun Mehta - Progress Alliance': 1234,
        'Priya Sharma - Student United Front': 987,
        'Rahul Verma - Campus Forward': 626,
    },
}

export const SPARKLINE_DATA_UP = [
    { v: 20 }, { v: 35 }, { v: 25 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 70 }, { v: 65 }, { v: 78 },
]
export const SPARKLINE_DATA_DOWN = [
    { v: 70 }, { v: 65 }, { v: 72 }, { v: 55 }, { v: 60 }, { v: 45 }, { v: 50 }, { v: 38 }, { v: 42 }, { v: 30 }, { v: 35 }, { v: 25 },
]
export const SPARKLINE_DATA_FLAT = [
    { v: 40 }, { v: 45 }, { v: 38 }, { v: 50 }, { v: 42 }, { v: 48 }, { v: 44 }, { v: 52 }, { v: 46 }, { v: 50 }, { v: 48 }, { v: 51 },
]
export const SPARKLINE_DATA_VOLATILE = [
    { v: 30 }, { v: 55 }, { v: 25 }, { v: 60 }, { v: 35 }, { v: 70 }, { v: 40 }, { v: 65 }, { v: 30 }, { v: 58 }, { v: 45 }, { v: 72 },
]

export const AUDIT_LOG = [
    { time: '14:32:08', event: 'Vote batch verified', region: 'Computer Science', status: 'success' },
    { time: '14:31:55', event: 'New booth online', region: 'Electrical Eng.', status: 'info' },
    { time: '14:31:12', event: 'Anomaly flagged', region: 'Business School', status: 'warning' },
    { time: '14:30:45', event: 'Blockchain sync complete', region: 'All Departments', status: 'success' },
    { time: '14:29:33', event: 'Vote batch verified', region: 'Mechanical Eng.', status: 'success' },
]

export const CANDIDATE_COLORS = ['#7c5cfc', '#4e8eff', '#22d3ee', '#fb923c', '#34d399']
