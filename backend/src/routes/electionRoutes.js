/**
 * Election API Routes
 * Handles HTTP routing for election-related endpoints
 */

const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const candidateController = require('../controllers/candidateController');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation middleware
const validateElectionCreate = [
    body('name').trim().notEmpty().withMessage('Election name is required'),
    body('type').isIn(['GENERAL', 'STATE', 'LOCAL']).withMessage('Invalid election type'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
    body('districtIds').isArray().withMessage('District IDs must be an array'),
    body('candidates').optional().isArray()
];

const validateElectionUpdate = [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
];

const validateCandidateCreate = [
    body('electionId').isUUID().withMessage('Valid election ID required'),
    body('name').trim().notEmpty().withMessage('Candidate name required'),
    body('party').trim().notEmpty().withMessage('Party name required'),
    body('symbol').trim().notEmpty().withMessage('Symbol required')
];

// Election CRUD routes
router.post(
    '/elections',
    auth,
    roleCheck(['OFFICER', 'COMMISSIONER']),
    validateElectionCreate,
    electionController.createElection
);

router.get(
    '/elections',
    auth,
    electionController.getAllElections
);

router.get(
    '/elections/:id',
    auth,
    param('id').isUUID(),
    electionController.getElectionById
);

router.put(
    '/elections/:id',
    auth,
    roleCheck(['OFFICER', 'COMMISSIONER']),
    param('id').isUUID(),
    validateElectionUpdate,
    electionController.updateElection
);

router.delete(
    '/elections/:id',
    auth,
    roleCheck(['COMMISSIONER']),
    param('id').isUUID(),
    electionController.deleteElection
);

// Poll control routes (Commissioner only)
router.post(
    '/elections/:id/open',
    auth,
    roleCheck(['COMMISSIONER']),
    param('id').isUUID(),
    body('signature').notEmpty(),
    electionController.openPolls
);

router.post(
    '/elections/:id/close',
    auth,
    roleCheck(['COMMISSIONER']),
    param('id').isUUID(),
    body('signature').notEmpty(),
    electionController.closePolls
);

// Candidate routes
router.post(
    '/candidates',
    auth,
    roleCheck(['OFFICER', 'COMMISSIONER']),
    validateCandidateCreate,
    candidateController.addCandidate
);

router.get(
    '/elections/:electionId/candidates',
    auth,
    param('electionId').isUUID(),
    candidateController.getCandidates
);

router.put(
    '/candidates/:id',
    auth,
    roleCheck(['OFFICER', 'COMMISSIONER']),
    param('id').isUUID(),
    candidateController.updateCandidate
);

router.delete(
    '/candidates/:id',
    auth,
    roleCheck(['OFFICER', 'COMMISSIONER']),
    param('id').isUUID(),
    candidateController.deleteCandidate
);

module.exports = router;
