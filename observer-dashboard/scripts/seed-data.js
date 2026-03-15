/**
 * seed-data.js
 * Utility script to generate mock election data for development/testing.
 * Run with: node scripts/seed-data.js
 */

const DISTRICTS = ['Mumbai Central', 'Delhi North', 'Chennai South', 'Kolkata East', 'Bangalore West'];
const TERMINALS = Array.from({ length: 48000 }, (_, i) => `TERM-${String(i + 1).padStart(5, '0')}`);

function randomVote() {
  return {
    voteId: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    terminalId: TERMINALS[Math.floor(Math.random() * TERMINALS.length)],
    districtId: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
    blockchainTxId: '0x' + Math.random().toString(16).slice(2, 18).toUpperCase(),
    blockNumber: Math.floor(10000 + Math.random() * 5000),
    integrityVerified: Math.random() > 0.01,
  };
}

function generateSeedData(count = 100) {
  return {
    votes: Array.from({ length: count }, randomVote),
    generatedAt: new Date().toISOString(),
    totalVotes: 1234567,
    turnout: 58.3,
    activeTerminals: 45234,
    alerts: [
      { id: 1, level: 'HIGH',   terminalId: 'TERM-00045', message: 'Unusual voting spike', time: '14:45:00' },
      { id: 2, level: 'MEDIUM', terminalId: 'TERM-00012', message: 'Terminal offline',     time: '13:30:00' },
      { id: 3, level: 'HIGH',   terminalId: 'TERM-00089', message: 'Multiple failed auth', time: '12:15:00' },
    ],
  };
}

const data = generateSeedData(100);
console.log(JSON.stringify(data, null, 2));
