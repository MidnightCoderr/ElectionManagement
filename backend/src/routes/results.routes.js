import express from 'express';
import { Election, Candidate } from '../models/index.js';
import fabricService from '../services/fabricService.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/v1/results/:electionId
 * Get election results
 * Public endpoint (no auth required for completed elections)
 */
router.get('/:electionId', async (req, res) => {
    try {
        const { electionId } = req.params;

        // Verify election exists
        const election = await Election.findByPk(electionId, {
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

        // Only show results for completed elections
        if (election.status === 'upcoming') {
            return res.status(403).json({
                success: false,
                error: 'Results not available for upcoming elections',
            });
        }

        // Fetch results from blockchain
        let results = [];
        try {
            results = await fabricService.getResults(electionId);
        } catch (blockchainError) {
            console.error('Blockchain results error:', blockchainError.message);
            // Fallback to database if blockchain unavailable
            // Results are calculated from vote records
        }

        // Merge vote counts with candidate data
        const candidatesWithVotes = election.candidates.map(candidate => {
            const result = results.find(r => r.candidateId === candidate.candidate_id);
            return {
                candidate_id: candidate.candidate_id,
                full_name: candidate.full_name,
                party_name: candidate.party_name,
                party_symbol: candidate.party_symbol,
                candidate_photo: candidate.candidate_photo,
                voteCount: result ? result.voteCount : 0,
            };
        });

        // Sort by vote count descending
        candidatesWithVotes.sort((a, b) => b.voteCount - a.voteCount);

        // Calculate winner (if election completed)
        let winner = null;
        if (election.status === 'completed' && candidatesWithVotes.length > 0) {
            winner = candidatesWithVotes[0];
        }

        res.json({
            success: true,
            election: {
                election_id: election.election_id,
                election_name: election.election_name,
                election_type: election.election_type,
                status: election.status,
                start_date: election.start_date,
                end_date: election.end_date,
            },
            results: candidatesWithVotes,
            summary: {
                totalVoters: election.total_voters,
                totalVotesCast: election.total_votes_cast,
                turnoutPercentage: election.total_voters > 0
                    ? ((election.total_votes_cast / election.total_voters) * 100).toFixed(2)
                    : '0.00',
                winner: winner ? {
                    name: winner.full_name,
                    party: winner.party_name,
                    votes: winner.voteCount,
                } : null,
            },
        });

    } catch (error) {
        console.error('Get results error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve results',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/results/:electionId/district/:districtId
 * Get election results by district
 */
router.get('/:electionId/district/:districtId', async (req, res) => {
    try {
        const { electionId, districtId } = req.params;

        // Verify election exists
        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                error: 'Election not found',
            });
        }

        // Get candidates for this district
        const candidates = await Candidate.findAll({
            where: {
                election_id: electionId,
                district_id: districtId,
            },
        });

        // Fetch district results from blockchain
        let results = [];
        try {
            results = await fabricService.getResultsByDistrict(electionId, districtId);
        } catch (blockchainError) {
            console.error('Blockchain district results error:', blockchainError.message);
        }

        // Merge vote counts
        const candidatesWithVotes = candidates.map(candidate => {
            const result = results.find(r => r.candidateId === candidate.candidate_id);
            return {
                candidate_id: candidate.candidate_id,
                full_name: candidate.full_name,
                party_name: candidate.party_name,
                voteCount: result ? result.voteCount : 0,
            };
        });

        candidatesWithVotes.sort((a, b) => b.voteCount - a.voteCount);

        res.json({
            success: true,
            district_id: districtId,
            election_id: electionId,
            results: candidatesWithVotes,
        });

    } catch (error) {
        console.error('Get district results error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve district results',
            message: error.message,
        });
    }
});

/**
 * GET /api/v1/results/:electionId/export
 * Export election results as CSV (authenticated)
 */
router.get('/:electionId/export', authenticate, async (req, res) => {
    try {
        const { electionId } = req.params;

        const election = await Election.findByPk(electionId, {
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

        // Fetch results
        let results = [];
        try {
            results = await fabricService.getResults(electionId);
        } catch (blockchainError) {
            console.error('Blockchain results error:', blockchainError.message);
        }

        // Generate CSV
        const csvHeader = 'Candidate ID,Candidate Name,Party,Party Symbol,Vote Count\n';
        const csvRows = election.candidates.map(candidate => {
            const result = results.find(r => r.candidateId === candidate.candidate_id);
            const voteCount = result ? result.voteCount : 0;
            return `${candidate.candidate_id},"${candidate.full_name}","${candidate.party_name}","${candidate.party_symbol}",${voteCount}`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${election.election_name}_results_${Date.now()}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error('Export results error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to export results',
            message: error.message,
        });
    }
});

export default router;
