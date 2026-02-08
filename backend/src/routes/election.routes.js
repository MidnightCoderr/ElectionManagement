import express from 'express';
import { Election, Candidate } from '../models/index.js';
import fabricService from '../services/fabricService.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/v1/elections
 * Get all elections
 */
router.get('/', async (req, res) => {
    try {
        const { status, type } = req.query;

        const where = {};
        if (status) where.status = status;
        if (type) where.election_type = type;

        const elections = await Election.findAll({
            where,
            order: [['start_date', 'DESC']],
        });

        res.json({
            elections,
            count: elections.length,
        });

    } catch (error) {
        console.error('Get elections error:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve elections',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/elections/:id
 * Get election by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const election = await Election.findByPk(req.params.id, {
            include: [{
                model: Candidate,
                as: 'candidates',
            }],
        });

        if (!election) {
            return res.status(404).json({
                error: 'Election not found',
            });
        }

        res.json(election);

    } catch (error) {
        console.error('Get election error:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve election',
            message: error.message,
        });
    }
});

/**
 * POST /api/v1/elections
 * Create a new election (Admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const {
            electionName,
            electionType,
            startDate,
            endDate,
        } = req.body;

        // Validate required fields
        if (!electionName || !electionType || !startDate || !endDate) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['electionName', 'electionType', 'startDate', 'endDate'],
            });
        }

        // Create election in database
        const election = await Election.create({
            election_name: electionName,
            election_type: electionType,
            start_date: new Date(startDate),
            end_date: new Date(endDate),
            status: 'upcoming',
        });

        // Create election on blockchain
        try {
            await fabricService.createElection(
                election.election_id,
                electionName,
                new Date(startDate).toISOString(),
                new Date(endDate).toISOString(),
                req.user.username || 'admin'
            );
        } catch (blockchainError) {
            console.error('Blockchain creation error:', blockchainError.message);
            // Election created in DB but not on blockchain - log for manual resolution
        }

        res.status(201).json({
            success: true,
            message: 'Election created successfully',
            election,
        });

    } catch (error) {
        console.error('Create election error:', error.message);
        res.status(500).json({
            error: 'Failed to create election',
            message: error.message,
        });
    }
});

/**
 * PUT /api/v1/elections/:id/status
 * Update election status (Admin only)
 */
router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses: ['upcoming', 'active', 'completed', 'cancelled'],
            });
        }

        const election = await Election.findByPk(req.params.id);

        if (!election) {
            return res.status(404).json({
                error: 'Election not found',
            });
        }

        await election.update({ status });

        res.json({
            success: true,
            message: 'Election status updated',
            election,
        });

    } catch (error) {
        console.error('Update election status error:', error.message);
        res.status(500).json({
            error: 'Failed to update status',
            message: error.message,
        });
    }
});

export default router;
