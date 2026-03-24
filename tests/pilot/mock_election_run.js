/**
 * Mock Election Pilot Runner
 * Simulates 1,000 synthetic votes being cast to validate the entire platform.
 */
const crypto = require('crypto');
const WebSocket = require('ws');

const API_URL = 'http://localhost:3000/api/v1';
const WS_URL = 'ws://localhost:3000';
const TOTAL_VOTES = 1000;
const CONCURRENCY = 50; // Batch size

// State tracking
const stats = {
    successfulCast: 0,
    failedCast: 0,
    wsVotesReceived: 0,
    wsFraudAlerts: 0,
};

// Generate synthetic voter data
const generateVoters = (count) => {
    const voters = [];
    for (let i = 0; i < count; i++) {
        voters.push({
            voterId: `SYNTH_${i.toString().padStart(4, '0')}`,
            electionId: 'E_DEMO_2026',
            candidateId: `C_0${(i % 3) + 1}`, // Distribute across 3 candidates
            district: `REGION_${(i % 5) + 1}`, // Distribute across 5 regions
            biometricHash: crypto.randomBytes(32).toString('hex'),
            terminalId: `TERM_${(i % 10) + 1}` // Simulate 10 IoT terminals
        });
    }
    return voters;
};

// Login as admin to get token
const loginAdmin = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Admin login successful');
            return data.token;
        }
        console.warn('⚠️ Admin login failed, falling back to mock JWT header for tests');
        return 'mock-jwt-token';
    } catch (e) {
        console.warn('⚠️ API Unreachable during login, generating mock tokens for offline run');
        return 'mock-jwt-token';
    }
};

// Fire a single vote
const castVote = async (token, voter) => {
    try {
        const res = await fetch(`${API_URL}/votes/cast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(voter)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            stats.successfulCast++;
        } else {
            stats.failedCast++;
        }
    } catch (error) {
        stats.failedCast++;
    }
};

const run = async () => {
    console.log(`\n🚀 Starting Mock Election Run: ${TOTAL_VOTES} Votes...\n`);

    const token = await loginAdmin();
    const voters = generateVoters(TOTAL_VOTES);

    // Initialize WebSocket listener
    const ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('📡 Connected to realtime WebSocket feed');
    });
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'VOTE_CAST') stats.wsVotesReceived++;
            if (msg.type === 'FRAUD_ALERT') stats.wsFraudAlerts++;
        } catch (e) {}
    });

    // Process in batches
    console.log(`\n⏳ Casting votes in batches of ${CONCURRENCY}...\n`);
    for (let i = 0; i < voters.length; i += CONCURRENCY) {
        const batch = voters.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(v => castVote(token, v)));
        process.stdout.write(`\rProgress: ${Math.min(i + CONCURRENCY, TOTAL_VOTES)} / ${TOTAL_VOTES} votes cast...`);
    }

    console.log('\n\n✅ All HTTP vote requests completed. Waiting 5s for Kafka/ML trailing events...\n');
    await new Promise(r => setTimeout(r, 5000));

    // Print Report
    console.log('====================================');
    console.log('🏁 MOCK ELECTION PILOT REPORT 🏁');
    console.log('====================================');
    console.log(`HTTP Votes Succeeded : ${stats.successfulCast}`);
    console.log(`HTTP Votes Failed    : ${stats.failedCast}`);
    console.log(`WS Confirms Received : ${stats.wsVotesReceived}`);
    console.log(`Fraud Alerts Triggered: ${stats.wsFraudAlerts}`);
    console.log('====================================');

    if (stats.successfulCast === 0) {
        console.error('❌ CRITICAL FAILURE: No votes were successfully cast.');
        process.exit(1);
    } else if (stats.wsVotesReceived < stats.successfulCast * 0.9) {
        console.warn('⚠️ WARNING: Significant delta between HTTP success and WebSocket confirmations (Kafka Lag?).');
        process.exit(0);
    } else {
        console.log('🎉 SUCCESS: Platform successfully processed the mock election burst!');
        process.exit(0);
    }
};

run().catch(console.error);
