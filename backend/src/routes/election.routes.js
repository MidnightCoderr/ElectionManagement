const express = require('express');
const { Election, Candidate  } = require('../models/index.js');
const fabricService = require('../services/fabricService.js');
const { authenticate, authorize  } = require('../middleware/auth.middleware.js');

const router = express.Router();

/**
 * GET /api/v1/elections
 * Get all elections with pagination and filtering
 */
router.get('/', async (req, res) => {
    try {
        const { status, type, limit = 50, offset = 0 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (type) where.election_type = type;

        const elections = await Election.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{
                model: Candidate,
                as: 'candidates',
            }],
            order: [['start_date', 'DESC']],
        });

        res.json({
            success: true,
            elections: elections.rows,
            total: elections.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

    } catch (error) {
        console.error('Get elections error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve elections',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/elections/:id
 * Get election by ID with statistics
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
                success: false,
                error: 'Election not found',
            });
        }

        // Calculate turnout percentage
        const turnout = election.total_voters > 0
            ? ((election.total_votes_cast / election.total_voters) * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            election,
            statistics: {
                totalVotes: election.total_votes_cast,
                totalVoters: election.total_voters,
                turnout: `${turnout}%`,
            },
        });

    } catch (error) {
        console.error('Get election error:', error.message);
        res.status(500).json({
            success: false,
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
            description,
        } = req.body;

        // Validate required fields
        if (!electionName || !electionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['electionName', 'electionType', 'startDate', 'endDate'],
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({
                success: false,
                error: 'Start date must be before end date',
            });
        }

        if (start < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Start date cannot be in the past',
            });
        }

        // Create election in database
        const election = await Election.create({
            election_name: electionName,
            election_type: electionType,
            start_date: start,
            end_date: end,
            status: 'upcoming',
            total_voters: 0,
            total_votes_cast: 0,
        });

        // Create election on blockchain
        try {
            await fabricService.createElection(
                election.election_id,
                electionName,
                start.toISOString(),
                end.toISOString(),
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
            success: false,
            error: 'Failed to create election',
            message: error.message,
        });
    }
});

/**
 * PUT /api/v1/elections/:id
 * Update election details (Admin only, before activation)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { electionName, startDate, endDate, description } = req.body;

        const election = await Election.findByPk(id);

        if (!election) {
            return res.status(404).json({
                success: false,
                error: 'Election not found',
            });
        }

        // Prevent updates to active/completed elections
        if (['active', 'completed', 'cancelled'].includes(election.status)) {
            return res.status(403).json({
                success: false,
                error: `Cannot update election in ${election.status} status`,
            });
        }

        // Update allowed fields
        const updateData = {};
        if (electionName) updateData.election_name = electionName;
        if (startDate) {
            const start = new Date(startDate);
            if (start < new Date()) {
                return res.status(400).json({
                    success: false,
                    error: 'Start date cannot be in the past',
                });
            }
            updateData.start_date = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (end <= (updateData.start_date || election.start_date)) {
                return res.status(400).json({
                    success: false,
                    error: 'End date must be after start date',
                });
            }
            updateData.end_date = end;
        }

        await election.update(updateData);

        res.json({
            success: true,
            message: 'Election updated successfully',
            election,
        });

    } catch (error) {
        console.error('Update election error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update election',
            message: error.message,
        });
    }
});

/**
 * DELETE /api/v1/elections/:id
 * Delete election (Admin only, only if no votes cast)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const election = await Election.findByPk(id);

        if (!election) {
            return res.status(404).json({
                success: false,
                error: 'Election not found',
            });
        }

        // Only allow deletion of upcoming elections
        if (election.status !== 'upcoming') {
            return res.status(403).json({
                success: false,
                error: 'Can only delete upcoming elections. Use cancel for active elections.',
            });
        }

        // Check if any votes have been cast
        if (election.total_votes_cast > 0) {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete election with existing votes',
            });
        }

        // Delete associated candidates first
        await Candidate.destroy({
            where: { election_id: id },
        });

        await election.destroy();

        res.json({
            success: true,
            message: 'Election deleted successfully',
        });

    } catch (error) {
        console.error('Delete election error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete election',
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
                success: false,
                error: 'Invalid status',
                validStatuses: ['upcoming', 'active', 'completed', 'cancelled'],
            });
        }

        const election = await Election.findByPk(req.params.id);

        if (!election) {
            return res.status(404).json({
                success: false,
                error: 'Election not found',
            });
        }

        // Validate status transitions
        const validTransitions = {
            upcoming: ['active', 'cancelled'],
            active: ['completed', 'cancelled'],
            completed: [],
            cancelled: [],
        };

        if (!validTransitions[election.status].includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from ${election.status} to ${status}`,
                validTransitions: validTransitions[election.status],
            });
        }

        await election.update({ status });

        // If activating, broadcast to IoT terminals
        if (status === 'active') {
            try {
                const iotService = await import('../services/iotService.js');
                await iotService.default.broadcastActivation(election.election_id);
            } catch (err) {
                console.error('Error broadcasting activation:', err.message);
            }
        }

        // If completing, trigger result tallying
        if (status === 'completed') {
            try {
                const resultsService = await import('../services/resultsService.js');
                await resultsService.default.triggerTally(election.election_id);
            } catch (err) {
                console.error('Error triggering tally:', err.message);
            }
        }

        res.json({
            success: true,
            message: `Election status updated to ${status}`,
            election,
        });

    } catch (error) {
        console.error('Update election status error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update status',
            message: error.message,
        });
    }
});

module.exports = router;
