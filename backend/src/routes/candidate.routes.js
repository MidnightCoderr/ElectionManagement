import express from 'express';
import { Candidate, Election } from '../models/index.js';
import fabricService from '../services/fabricService.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/v1/candidates
 * Get all candidates (optionally filtered by election)
 */
router.get('/', async (req, res) => {
    try {
        const { electionId, districtId } = req.query;

        const where = {};
        if (electionId) where.election_id = electionId;
        if (districtId) where.district_id = districtId;

        const candidates = await Candidate.findAll({
            where,
            include: [{
                model: Election,
                as: 'election',
                attributes: ['election_name', 'election_type', 'status'],
            }],
            order: [['full_name', 'ASC']],
        });

        res.json({
            candidates,
            count: candidates.length,
        });

    } catch (error) {
        console.error('Get candidates error:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve candidates',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/candidates/:id
 * Get candidate by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id, {
            include: [{
                model: Election,
                as: 'election',
            }],
        });

        if (!candidate) {
            return res.status(404).json({
                error: 'Candidate not found',
            });
        }

        res.json(candidate);

    } catch (error) {
        console.error('Get candidate error:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve candidate',
            message: error.message,
        });
    }
});

/**
 * POST /api/v1/candidates
 * Register a new candidate (Admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const {
            electionId,
            fullName,
            partyName,
            partySymbol,
            districtId,
            candidatePhoto,
        } = req.body;

        // Validate required fields
        if (!electionId || !fullName || !partyName || !districtId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['electionId', 'fullName', 'partyName', 'districtId'],
            });
        }

        // Verify election exists
        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({
                error: 'Election not found',
            });
        }

        // Create candidate in database
        const candidate = await Candidate.create({
            election_id: electionId,
            full_name: fullName,
            party_name: partyName,
            party_symbol: partySymbol,
            district_id: districtId,
            candidate_photo: candidatePhoto,
            status: 'active',
        });

        // Register candidate on blockchain
        try {
            await fabricService.registerCandidate(
                candidate.candidate_id,
                electionId,
                fullName,
                partyName,
                districtId
            );
        } catch (blockchainError) {
            console.error('Blockchain registration error:', blockchainError.message);
            // Candidate created in DB but not on blockchain - log for manual resolution
        }

        res.status(201).json({
            success: true,
            message: 'Candidate registered successfully',
            candidate,
        });

    } catch (error) {
        console.error('Register candidate error:', error.message);
        res.status(500).json({
            error: 'Failed to register candidate',
            message: error.message,
        });
    }
});

/**
 * PUT /api/v1/candidates/:id
 * Update candidate details (Admin only)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                error: 'Candidate not found',
            });
        }

        const updateData = {};
        if (req.body.fullName) updateData.full_name = req.body.fullName;
        if (req.body.partyName) updateData.party_name = req.body.partyName;
        if (req.body.partySymbol) updateData.party_symbol = req.body.partySymbol;
        if (req.body.candidatePhoto) updateData.candidate_photo = req.body.candidatePhoto;
        if (req.body.status) updateData.status = req.body.status;

        await candidate.update(updateData);

        res.json({
            success: true,
            message: 'Candidate updated successfully',
            candidate,
        });

    } catch (error) {
        console.error('Update candidate error:', error.message);
        res.status(500).json({
            error: 'Failed to update candidate',
            message: error.message,
        });
    }
});

export default router;
