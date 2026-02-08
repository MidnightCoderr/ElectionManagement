/**
 * Vote Service
 * Frontend service for vote casting and verification
 */

import axios from 'axios';
import { authService } from './auth';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class VoteService {
    /**
     * Cast a vote
     * @param {Object} voteData - Vote data
     * @returns {Promise<Object>} Vote result with receipt
     */
    async castVote({ electionId, candidateId, districtId, terminalId }) {
        try {
            // Encrypt candidate ID (basic encryption - in production use proper ZKP)
            const encryptedVote = this.encryptCandidateId(candidateId);

            // Generate ZKP commitment (simplified - in production use proper ZKP library)
            const zkpCommitment = this.generateZKPCommitment(candidateId);

            const response = await axios.post(
                `${API_URL}/votes/cast`,
                {
                    electionId,
                    candidateId,
                    districtId,
                    terminalId,
                    encryptedVote,
                    zkpCommitment,
                    timestamp: Date.now()
                },
                {
                    headers: authService.getAuthHeader()
                }
            );

            return response.data;
        } catch (error) {
            console.error('Vote casting error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Check if voter has voted in election
     * @param {String} electionId - Election ID
     * @returns {Promise<Boolean>} Has voted
     */
    async hasVoted(electionId) {
        try {
            const response = await axios.get(
                `${API_URL}/votes/status/${electionId}`,
                {
                    headers: authService.getAuthHeader()
                }
            );

            return response.data.hasVoted;
        } catch (error) {
            console.error('Vote status error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Verify a vote receipt
     * @param {String} receiptId - Receipt ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyReceipt(receiptId) {
        try {
            const response = await axios.get(
                `${API_URL}/votes/verify/${receiptId}`
            );

            return response.data;
        } catch (error) {
            console.error('Receipt verification error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Encrypt candidate ID for blockchain storage
     * @param {String} candidateId - Candidate ID
     * @returns {String} Encrypted value
     */
    encryptCandidateId(candidateId) {
        // In production, use proper encryption with public key cryptography
        const encrypted = CryptoJS.AES.encrypt(
            candidateId,
            process.env.REACT_APP_ENCRYPTION_KEY || 'default-key'
        ).toString();

        return encrypted;
    }

    /**
     * Generate ZKP commitment
     * @param {String} candidateId - Candidate ID
     * @returns {String} Commitment hash
     */
    generateZKPCommitment(candidateId) {
        // Simplified ZKP commitment
        // In production, use proper ZKP library like snarkjs
        const randomness = Math.random().toString();
        const commitment = CryptoJS.SHA256(candidateId + randomness).toString();
        return commitment;
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            return new Error(error.response.data.error || 'Request failed');
        } else if (error.request) {
            return new Error('No response from server');
        } else {
            return new Error(error.message);
        }
    }
}

export const voteService = new VoteService();
