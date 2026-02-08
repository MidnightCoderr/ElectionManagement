/**
 * Vote Casting Service
 * Handles vote submission, blockchain integration, and offline reconciliation
 */

const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const VotingRecord = require('../models/VotingRecord');
const fabricService = require('./fabricService');
const zkpService = require('./zkpService');
const logger = require('../utils/logger');
const crypto = require('crypto');

class VoteService {
    /**
     * Cast a vote
     * @param {Object} voteData - Vote information
     * @returns {Promise<Object>} Vote receipt
     */
    async castVote(voteData) {
        const {
            voterId,
            electionId,
            candidateId,
            districtId,
            terminalId,
            timestamp,
            encryptedVote,
            zkpCommitment
        } = voteData;

        try {
            // 1. Verify election is active
            const election = await Election.findByPk(electionId);

            if (!election) {
                throw new Error('Election not found');
            }

            if (election.status !== 'ACTIVE') {
                throw new Error(`Election is ${election.status}, not accepting votes`);
            }

            // Verify within voting hours
            const now = new Date();
            if (now < election.start_date || now > election.end_date) {
                throw new Error('Voting is not open at this time');
            }

            // 2. Check if voter has already voted
            const existingVote = await VotingRecord.findOne({
                where: {
                    voter_id: voterId,
                    election_id: electionId
                }
            });

            if (existingVote && existingVote.has_voted) {
                throw new Error('Voter has already voted in this election');
            }

            // 3. Verify candidate exists
            const candidate = await Candidate.findOne({
                where: {
                    candidate_id: candidateId,
                    election_id: electionId
                }
            });

            if (!candidate) {
                throw new Error('Invalid candidate for this election');
            }

            // 4. Verify ZKP commitment
            const zkpValid = await zkpService.verifyCommitment(
                zkpCommitment,
                encryptedVote
            );

            if (!zkpValid) {
                throw new Error('Invalid ZKP commitment');
            }

            // 5. Submit to blockchain
            const voteId = crypto.randomUUID();

            const blockchainTx = await fabricService.submitVote({
                voteId,
                electionId,
                candidateId: encryptedVote, // Encrypted, not plaintext
                districtId,
                terminalId,
                zkpCommitment,
                timestamp: timestamp || Date.now()
            });

            if (!blockchainTx || !blockchainTx.txId) {
                throw new Error('Failed to record vote on blockchain');
            }

            // 6. Record in database
            await VotingRecord.create({
                voter_id: voterId,
                election_id: electionId,
                has_voted: true,
                voted_at: new Date(timestamp || Date.now()),
                terminal_id: terminalId,
                blockchain_tx_hash: blockchainTx.txId
            });

            // 7. Generate receipt
            const receipt = this.generateReceipt({
                voteId,
                electionId,
                timestamp: timestamp || Date.now(),
                blockchainTxId: blockchainTx.txId,
                zkpCommitment
            });

            // 8. Log audit event
            await logger.auditLog({
                event_type: 'VOTE_CAST',
                user_id: voterId,
                metadata: {
                    vote_id: voteId,
                    election_id: electionId,
                    terminal_id: terminalId,
                    blockchain_tx: blockchainTx.txId
                }
            });

            return {
                success: true,
                voteId,
                receipt,
                blockchainTxId: blockchainTx.txId
            };

        } catch (error) {
            logger.error('Error casting vote:', error);

            // Log failed attempt
            await logger.auditLog({
                event_type: 'VOTE_CAST_FAILED',
                user_id: voterId,
                severity: 'HIGH',
                metadata: {
                    election_id: electionId,
                    terminal_id: terminalId,
                    error: error.message
                }
            });

            throw error;
        }
    }

    /**
     * Reconcile offline votes
     * @param {Array} offlineVotes - Array of cached votes
     * @returns {Promise<Object>} Reconciliation results
     */
    async reconcileOfflineVotes(offlineVotes) {
        const results = {
            success: [],
            failed: [],
            duplicates: []
        };

        for (const vote of offlineVotes) {
            try {
                // Check if already processed
                const existing = await VotingRecord.findOne({
                    where: {
                        voter_id: vote.voterId,
                        election_id: vote.electionId
                    }
                });

                if (existing && existing.has_voted) {
                    // Check if it's the same vote (idempotency)
                    const blockchainVote = await fabricService.getVoteDetails(vote.voteId);

                    if (blockchainVote &&
                        blockchainVote.timestamp === vote.timestamp &&
                        blockchainVote.zkpCommitment === vote.zkpCommitment) {
                        // Same vote, already processed - idempotent success
                        results.duplicates.push({
                            voteId: vote.voteId,
                            reason: 'Vote already processed',
                            originalTx: existing.blockchain_tx_hash
                        });
                        continue;
                    } else {
                        // Different vote attempt
                        results.failed.push({
                            voteId: vote.voteId,
                            reason: 'Voter already voted with different ballot'
                        });
                        continue;
                    }
                }

                // Process offline vote
                const result = await this.castVote(vote);

                results.success.push({
                    voteId: vote.voteId,
                    blockchainTxId: result.blockchainTxId
                });

            } catch (error) {
                results.failed.push({
                    voteId: vote.voteId,
                    reason: error.message
                });
            }
        }

        // Log reconciliation
        await logger.auditLog({
            event_type: 'OFFLINE_VOTES_RECONCILED',
            metadata: {
                total: offlineVotes.length,
                success: results.success.length,
                failed: results.failed.length,
                duplicates: results.duplicates.length
            }
        });

        return results;
    }

    /**
     * Generate vote receipt
     * @param {Object} voteInfo - Vote information
     * @returns {Object} Receipt data
     */
    generateReceipt(voteInfo) {
        const { voteId, electionId, timestamp, blockchainTxId, zkpCommitment } = voteInfo;

        // Generate unique receipt ID
        const receiptId = crypto.createHash('sha256')
            .update(voteId + timestamp.toString())
            .digest('hex')
            .substring(0, 12)
            .toUpperCase();

        // Create receipt data
        const receipt = {
            receiptId,
            voteId,
            electionId,
            timestamp,
            blockchainTxId,
            zkpCommitment,
            qrCode: this.generateQRCodeData({
                receiptId,
                voteId,
                electionId,
                timestamp,
                blockchainTxId
            })
        };

        return receipt;
    }

    /**
     * Generate QR code data for receipt
     * @param {Object} data - Receipt data
     * @returns {String} QR code string
     */
    generateQRCodeData(data) {
        // Format: RECEIPT|ID|VOTEID|ELECTIONID|TIMESTAMP|TXID
        return `RECEIPT|${data.receiptId}|${data.voteId}|${data.electionId}|${data.timestamp}|${data.blockchainTxId}`;
    }

    /**
     * Verify a vote receipt
     * @param {String} receiptId - Receipt ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyReceipt(receiptId) {
        try {
            // Search audit logs for this receipt
            const auditLog = await logger.findAuditLog({
                event_type: 'VOTE_CAST',
                'metadata.vote_id': { $regex: receiptId }
            });

            if (!auditLog || auditLog.length === 0) {
                return {
                    verified: false,
                    error: 'Receipt not found'
                };
            }

            const log = auditLog[0];
            const blockchainTxId = log.metadata.blockchain_tx;

            // Verify on blockchain
            const blockchainVote = await fabricService.getVoteDetails(blockchainTxId);

            if (!blockchainVote) {
                return {
                    verified: false,
                    error: 'Vote not found on blockchain'
                };
            }

            // Verify integrity
            const integrityValid = await fabricService.verifyVoteIntegrity(blockchainTxId);

            return {
                verified: true,
                vote: {
                    voteId: log.metadata.vote_id,
                    electionId: log.metadata.election_id,
                    timestamp: log.timestamp,
                    blockchainTxId,
                    blockNumber: blockchainVote.blockNumber,
                    integrityVerified: integrityValid
                }
            };

        } catch (error) {
            logger.error('Error verifying receipt:', error);
            return {
                verified: false,
                error: error.message
            };
        }
    }
}

module.exports = new VoteService();
