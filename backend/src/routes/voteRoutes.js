/**
 * Vote API Routes
 * Handles HTTP routing for voting operations
 */

const express = require('express');
const router = express.Router();
const voteService = require('../services/voteService');
const biometricAuthService = require('../services/biometricAuthService');
const resultsService = require('../services/resultsService');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Biometric authentication endpoint
 * POST /api/v1/auth/biometric
 */
router.post(
    '/auth/biometric',
    [
        body('biometricHash').matches(/^[a-f0-9]{64}$/i).withMessage('Invalid biometric hash'),
        body('terminalId').notEmpty().withMessage('Terminal ID required')
    ],
    async (req, res) => {
        try {
            const { biometricHash, terminalId } = req.body;

            const result = await biometricAuthService.authenticate(biometricHash, terminalId);

            if (!result.success) {
                return res.status(401).json(result);
            }

            res.json(result);

        } catch (error) {
            logger.error('Biometric auth error:', error);
            res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }
);

/**
 * Cast vote endpoint
 * POST /api/v1/votes/cast
 */
router.post(
    '/votes/cast',
    auth, // Requires valid JWT from biometric auth
    [
        body('electionId').isUUID().withMessage('Valid election ID required'),
        body('candidateId').isUUID().withMessage('Valid candidate ID required'),
        body('districtId').isUUID().withMessage('Valid district ID required'),
        body('terminalId').notEmpty().withMessage('Terminal ID required'),
        body('encryptedVote').notEmpty().withMessage('Encrypted vote required'),
        body('zkpCommitment').notEmpty().withMessage('ZKP commitment required')
    ],
    async (req, res) => {
        try {
            const {
                electionId,
                candidateId,
                districtId,
                terminalId,
                encryptedVote,
                zkpCommitment,
                timestamp
            } = req.body;

            const voterId = req.user.id;

            const result = await voteService.castVote({
                voterId,
                electionId,
                candidateId,
                districtId,
                terminalId,
                encryptedVote,
                zkpCommitment,
                timestamp
            });

            res.json(result);

        } catch (error) {
            logger.error('Vote casting error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

/**
 * Reconcile offline votes
 * POST /api/v1/votes/reconcile
 */
router.post(
    '/votes/reconcile',
    auth,
    [
        body('votes').isArray().withMessage('Votes must be an array'),
        body('terminalId').notEmpty().withMessage('Terminal ID required')
    ],
    async (req, res) => {
        try {
            const { votes, terminalId } = req.body;

            const result = await voteService.reconcileOfflineVotes(votes);

            // Log reconciliation
            await logger.auditLog({
                event_type: 'OFFLINE_RECONCILIATION',
                metadata: {
                    terminal_id: terminalId,
                    total: votes.length,
                    success: result.success.length,
                    failed: result.failed.length
                }
            });

            res.json({
                success: true,
                result
            });

        } catch (error) {
            logger.error('Reconciliation error:', error);
            res.status(500).json({
                success: false,
                error: 'Reconciliation failed'
            });
        }
    }
);

/**
 * Verify vote receipt
 * GET /api/v1/votes/verify/:receiptId
 */
router.get(
    '/votes/verify/:receiptId',
    async (req, res) => {
        try {
            const { receiptId } = req.params;

            const result = await voteService.verifyReceipt(receiptId);

            res.json(result);

        } catch (error) {
            logger.error('Receipt verification error:', error);
            res.status(500).json({
                verified: false,
                error: 'Verification failed'
            });
        }
    }
);

/**
 * Check if voter has voted
 * GET /api/v1/votes/status/:electionId
 */
router.get(
    '/votes/status/:electionId',
    auth,
    param('electionId').isUUID(),
    async (req, res) => {
        try {
            const { electionId } = req.params;
            const voterId = req.user.id;

            const hasVoted = await biometricAuthService.hasVoted(voterId, electionId);

            res.json({
                success: true,
                hasVoted
            });

        } catch (error) {
            logger.error('Vote status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check status'
            });
        }
    }
);

/**
 * Get election results
 * GET /api/v1/results/:electionId
 */
router.get(
    '/results/:electionId',
    auth,
    param('electionId').isUUID(),
    async (req, res) => {
        try {
            const { electionId } = req.params;

            const results = await resultsService.getResults(electionId);

            res.json(results);

        } catch (error) {
            logger.error('Results fetch error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch results'
            });
        }
    }
);

/**
 * Get district results
 * GET /api/v1/results/:electionId/district/:districtId
 */
router.get(
    '/results/:electionId/district/:districtId',
    auth,
    [
        param('electionId').isUUID(),
        param('districtId').isUUID()
    ],
    async (req, res) => {
        try {
            const { electionId, districtId } = req.params;

            const results = await resultsService.getDistrictResults(electionId, districtId);

            res.json(results);

        } catch (error) {
            logger.error('District results error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch district results'
            });
        }
    }
);

module.exports = router;
