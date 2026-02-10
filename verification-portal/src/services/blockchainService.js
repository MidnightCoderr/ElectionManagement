import axios from 'axios';

/**
 * Blockchain service for read-only verification
 * Connects directly to blockchain RPC (no backend)
 */
class BlockchainService {
    constructor() {
        this.rpcUrl = '/api/blockchain'; // Proxied to blockchain RPC
    }

    /**
     * Verify a vote exists on blockchain and check integrity
     */
    async verifyVote(voteId) {
        try {
            // Query blockchain for vote
            const response = await axios.post(this.rpcUrl + '/query', {
                fcn: 'ReadVote',
                args: [voteId]
            });

            if (response.data.success && response.data.vote) {
                const vote = response.data.vote;

                // Verify integrity (check hash hasn't been tampered)
                const integrityCheck = await this.verifyIntegrity(vote);

                return {
                    verified: true,
                    voteId: vote.voteId,
                    electionName: vote.electionName || 'Unknown Election',
                    timestamp: vote.timestamp,
                    blockNumber: vote.blockNumber || 0,
                    txHash: vote.txHash || 'N/A',
                    districtId: vote.districtId,
                    integrityPassed: integrityCheck
                };
            } else {
                return {
                    verified: false,
                    voteId
                };
            }
        } catch (error) {
            console.error('Blockchain query error:', error);
            throw new Error('Unable to connect to blockchain. Please try again.');
        }
    }

    /**
     * Verify vote integrity (Merkle proof validation)
     */
    async verifyIntegrity(vote) {
        try {
            // Get Merkle proof from blockchain
            const response = await axios.post(this.rpcUrl + '/query', {
                fcn: 'GetMerkleProof',
                args: [vote.voteId]
            });

            if (response.data.success) {
                const proof = response.data.proof;

                // Validate Merkle proof locally
                const isValid = this.validateMerkleProof(
                    vote.voteId,
                    vote.zkpCommitment,
                    proof
                );

                return isValid;
            }

            return false;
        } catch (error) {
            console.error('Integrity check error:', error);
            return false;
        }
    }

    /**
     * Validate Merkle proof
     */
    validateMerkleProof(voteId, commitment, proof) {
        // Simplified Merkle proof validation
        // In production, implement full Merkle tree validation

        if (!proof || proof.length === 0) {
            return false;
        }

        let hash = this.sha256(voteId + commitment);

        for (const sibling of proof) {
            if (sibling.position === 'left') {
                hash = this.sha256(sibling.hash + hash);
            } else {
                hash = this.sha256(hash + sibling.hash);
            }
        }

        // Hash should match Merkle root
        return hash === proof[proof.length - 1].root;
    }

    /**
     * Simple SHA-256 hash (browser crypto API)
     */
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get public election results
     */
    async getElectionResults(electionId) {
        try {
            const response = await axios.post(this.rpcUrl + '/query', {
                fcn: 'GetResults',
                args: [electionId]
            });

            if (response.data.success) {
                return response.data.results;
            }

            return null;
        } catch (error) {
            console.error('Results query error:', error);
            throw new Error('Unable to fetch results from blockchain');
        }
    }

    /**
     * Get list of active elections
     */
    async getActiveElections() {
        try {
            const response = await axios.post(this.rpcUrl + '/query', {
                fcn: 'GetActiveElections',
                args: []
            });

            return response.data.elections || [];
        } catch (error) {
            console.error('Elections query error:', error);
            return [];
        }
    }
}

export default new BlockchainService();
