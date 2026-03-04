const express = require('express');
const router = express.Router();

/**
 * Mock blockchain service for demo purposes
 * Handles POST /api/blockchain/query requests
 */
router.post('/query', (req, res) => {
    const { fcn, args } = req.body;

    if (fcn === 'ReadVote') {
        const voteId = args[0];
        // Mock a successful vote verification
        return res.json({
            success: true,
            vote: {
                voteId: voteId,
                electionName: 'Presidential Election 2026',
                timestamp: new Date().toISOString(),
                blockNumber: Math.floor(Math.random() * 10000) + 1000,
                txHash: '0x' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
                districtId: 'D-01',
                zkpCommitment: 'mock_commitment_' + voteId
            }
        });
    }

    if (fcn === 'GetMerkleProof') {
        return res.json({
            success: true,
            proof: [
                { position: 'left', hash: 'mock_hash_1' },
                { position: 'right', hash: 'mock_hash_2' },
                { root: 'mock_root' } // The UI simplified validation expects the last item to be the root
            ]
        });
    }

    if (fcn === 'GetResults') {
        return res.json({
            success: true,
            results: {
                candidates: [
                    { id: 'c1', name: 'Alice Smith', votes: 15420 },
                    { id: 'c2', name: 'Bob Jones', votes: 14210 }
                ],
                totalVotes: 29630
            }
        });
    }

    if (fcn === 'GetActiveElections') {
        return res.json({
            success: true,
            elections: [
                { id: 'e1', name: 'Presidential Election 2026', status: 'active' },
                { id: 'e2', name: 'Local Council', status: 'active' }
            ]
        });
    }

    return res.status(400).json({ success: false, error: 'Unknown function' });
});

module.exports = router;
