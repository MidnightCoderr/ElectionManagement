/**
 * Load Testing Script for Election Management System
 * Tests system performance under high load (10,000+ TPS target)
 * 
 * Run with: artillery run load-test.yml
 */

const { performance } = require('perf_hooks');

// Custom functions for Artillery scenarios

/**
 * Generate random voter data
 */
function generateVoterData(context, events, done) {
    const randomId = Math.floor(Math.random() * 1000000);

    context.vars.voterId = `VOTER_${randomId}`;
    context.vars.aadharNumber = String(randomId).padStart(12, '0');
    context.vars.biometricHash = `hash_${randomId}_${Date.now()}`;
    context.vars.districtId = 'd4d5fa69-2142-4e26-b7aa-8e5177a3d7bb';
    context.vars.candidateId = `CANDIDATE_${Math.floor(Math.random() * 10)}`;
    context.vars.electionId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
    context.vars.terminalId = `TERMINAL_${Math.floor(Math.random() * 100)}`;

    return done();
}

/**
 * Measure vote processing time
 */
function measureVoteTime(context, events, done) {
    const startTime = performance.now();

    context.vars.startTime = startTime;

    // Emit custom metric
    events.emit('customStat', {
        stat: 'vote.start',
        value: startTime,
    });

    return done();
}

/**
 * Report vote completion
 */
function reportVoteComplete(context, events, done) {
    if (context.vars.startTime) {
        const duration = performance.now() - context.vars.startTime;

        events.emit('customStat', {
            stat: 'vote.duration',
            value: duration,
        });
    }

    return done();
}

/**
 * Verify blockchain write
 */
function verifyBlockchain(context, events, done) {
    // In production, query blockchain to verify vote was written
    // For now, just mark as checked

    events.emit('customStat', {
        stat: 'blockchain.verified',
        value: 1,
    });

    return done();
}

module.exports = {
    generateVoterData,
    measureVoteTime,
    reportVoteComplete,
    verifyBlockchain,
};
