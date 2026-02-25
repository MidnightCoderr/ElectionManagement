const express = require('express');
const crypto = require('crypto');
const fabricService = require('../services/fabricService.js');
const { Voter, VotingRecord, Election  } = require('../models/index.js');
const { voteLimiter  } = require('../middleware/rateLimit.middleware.js');
const { authenticate  } = require('../middleware/auth.middleware.js');

const router = express.Router();

/**
 * POST /api/v1/votes/cast
 * Cast a vote
 */
router.post('/cast', voteLimiter, async (req, res) => {
    logger.info('VOTE_CAST', {
        voterId: req.body.voterId,
        candidateId: req.body.candidateId,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    try {
        const {
            voterId,
            electionId,
            candidateId,
            district,
            biometricHash,
            terminalId,
        } = req.body;

        // Validate required fields
        if (!voterId || !electionId || !candidateId || !district || !biometricHash || !terminalId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['voterId', 'electionId', 'candidateId', 'district', 'biometricHash', 'terminalId'],
            });
        }

        // 1. Check voter exists and hasn't voted yet (database check)
        const voter = await Voter.findByPk(voterId);
        if (!voter) {
            return res.status(404).json({
                error: 'Voter not found',
                message: 'Voter is not registered',
            });
        }

        // 2. Check election status
        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({
                error: 'Election not found',
            });
        }

        if (election.status !== 'active') {
            return res.status(400).json({
                error: 'Election not active',
                message: `Election status: ${election.status}`,
            });
        }

        // 3. Check if already voted in database
        const existingVote = await VotingRecord.findOne({
            where: { voter_id: voterId, election_id: electionId },
        });

        if (existingVote) {
            return res.status(409).json({
                error: 'Already voted',
                message: 'You have already cast your vote in this election',
            });
        }

        // 4. Create verification hash (biometric + timestamp)
        const timestamp = new Date().toISOString();
        const verificationHash = crypto
            .createHash('sha256')
            .update(biometricHash + timestamp)
            .digest('hex');

        // 5. Submit vote to blockchain
        const voteId = await fabricService.castVote(
            voterId,
            electionId,
            candidateId,
            district,
            verificationHash,
            terminalId
        );

        // 6. Record vote in PostgreSQL database
        const votingRecord = await VotingRecord.create({
            voter_id: voterId,
            election_id: electionId,
            terminal_id: terminalId,
            vote_timestamp: new Date(),
            blockchain_tx_id: voteId,
            verification_hash: verificationHash,
        });

        // 7. Update voter status
        await voter.update({ has_voted: true });

        // 8. Update election vote count
        await election.increment('total_votes_cast');

        res.status(201).json({
            success: true,
            message: 'Vote cast successfully',
            voteId,
            timestamp,
        });

    } catch (error) {
        console.error('Vote casting error:', error.message);

        // Handle double-voting attempt from blockchain
        if (error.message.includes('DOUBLE_VOTE_ATTEMPT')) {
            return res.status(409).json({
                error: 'Double voting prevented',
                message: 'Blockchain verification shows you have already voted',
            });
        }

        res.status(500).json({
            error: 'Vote casting failed',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/votes/status/:voterId/:electionId
 * Check voter status
 */
router.get('/status/:voterId/:electionId', async (req, res) => {
    try {
        const { voterId, electionId } = req.params;

        // Check database
        const voter = await Voter.findByPk(voterId);
        if (!voter) {
            return res.status(404).json({
                error: 'Voter not found',
            });
        }

        const votingRecord = await VotingRecord.findOne({
            where: { voter_id: voterId, election_id: electionId },
        });

        // Check blockchain
        let blockchainStatus;
        try {
            blockchainStatus = await fabricService.checkVoterStatus(voterId, electionId);
        } catch (error) {
            // Voter might not be registered on blockchain yet
            blockchainStatus = null;
        }

        res.json({
            voterId,
            electionId,
            hasVoted: voter.has_voted,
            votingRecord: votingRecord ? {
                voteTimestamp: votingRecord.vote_timestamp,
                blockchainTxId: votingRecord.blockchain_tx_id,
            } : null,
            blockchainStatus,
        });

    } catch (error) {
        console.error('Status check error:', error.message);
        res.status(500).json({
            error: 'Failed to check status',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/votes/results/:electionId
 * Get election results
 */
router.get('/results/:electionId', async (req, res) => {
    try {
        const { electionId } = req.params;

        // Get results from blockchain (source of truth)
        const results = await fabricService.getResults(electionId);

        // Get election details from database
        const election = await Election.findByPk(electionId);

        res.json({
            election: election ? {
                id: election.election_id,
                name: election.election_name,
                type: election.election_type,
                status: election.status,
                totalVotesCast: election.total_votes_cast,
            } : null,
            blockchainResults: results,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Results retrieval error:', error.message);
        res.status(500).json({
            error: 'Failed to get results',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/votes/:voteId
 * Get specific vote details (for verification)
 */
router.get('/:voteId', authenticate, async (req, res) => {
    try {
        const { voteId } = req.params;

        const vote = await fabricService.getVoteById(voteId);

        res.json({
            vote,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Vote retrieval error:', error.message);
        res.status(404).json({
            error: 'Vote not found',
            message: error.message,
        });
    }
});

module.exports = router;
