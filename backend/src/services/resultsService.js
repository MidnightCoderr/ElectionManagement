/**
 * Results Aggregation Service
 * Handles vote tallying, results calculation, and reporting
 */

const { Election, Candidate, VotingRecord } = require('../models/index.js');
const fabricService = require('./fabricService');
const logger = require('../utils/logger');

class ResultsService {
    /**
     * Trigger result tallying for an election
     * Called automatically when polls close
     * @param {String} electionId - Election ID
     * @returns {Promise<Object>} Tally job info
     */
    async triggerTally(electionId) {
        try {
            const election = await Election.findByPk(electionId);

            if (!election) {
                throw new Error('Election not found');
            }

            if (election.status !== 'CLOSED') {
                throw new Error('Can only tally closed elections');
            }

            // Create tally job
            const jobId = `tally-${election.election_id || electionId}-${Date.now()}`;

      // Log start
      await logger.auditLog({
        event_type: 'RESULT_TALLY_STARTED',
        severity: 'CRITICAL',
        metadata: {
          election_id: electionId,
          job_id: jobId,
          triggered_at: new Date()
        }
      });

      // Execute tally in background
      this.executeTally(electionId, jobId).catch(error => {
        logger.error(`Tally job ${ jobId } failed: `, error);
      });

      return {
        success: true,
        jobId,
        status: 'INITIATED',
        message: 'Tally process started'
      };

    } catch (error) {
      logger.error('Error triggering tally:', error);
      throw error;
    }
  }

  /**
   * Execute the actual tallying process
   * @param {String} electionId - Election ID
   * @param {String} jobId - Job ID for tracking
   */
  async executeTally(electionId, jobId) {
    try {
      await logger.auditLog({
        event_type: 'RESULT_TALLY_PROGRESS',
        metadata: {
          election_id: electionId,
          job_id: jobId,
          phase: 'BLOCKCHAIN_QUERY'
        }
      });

      // 1. Query all votes from blockchain
      const blockchainVotes = await fabricService.getVotesByElection(electionId);

      await logger.auditLog({
        event_type: 'RESULT_TALLY_PROGRESS',
        metadata: {
          election_id: electionId,
          job_id: jobId,
          phase: 'AGGREGATION',
          total_votes: blockchainVotes.length
        }
      });

      // 2. Aggregate votes by candidate
      const voteCounts = {};
      
      for (const vote of blockchainVotes) {
        // Decrypt candidate ID (in real implementation)
        // For now, assuming vote contains candidateId
        const candidateId = vote.candidateId;
        
        if (!voteCounts[candidateId]) {
          voteCounts[candidateId] = 0;
        }
        voteCounts[candidateId]++;
      }

      // 3. Get candidate details
      const candidates = await Candidate.findAll({
        where: { election_id: electionId }
      });

      // 4. Format results
      const results = candidates.map(candidate => ({
        candidateId: candidate.candidate_id,
        name: candidate.name,
        party: candidate.party,
        symbol: candidate.symbol,
        voteCount: voteCounts[candidate.candidate_id] || 0
      }));

      // Sort by vote count
      results.sort((a, b) => b.voteCount - a.voteCount);

      // 5. Calculate total votes
      const totalVotes = blockchainVotes.length;
      
      // Add percentages
      results.forEach(result => {
        result.percentage = totalVotes > 0
          ? ((result.voteCount / totalVotes) * 100).toFixed(2)
          : '0.00';
      });

      // 6. Store results
      await this.storeResults(electionId, results);

      // 7. Update election status
      const election = await Election.findByPk(electionId);
      await election.update({ status: 'COMPLETED' });

      // 8. Log completion
      await logger.auditLog({
        event_type: 'RESULT_TALLY_COMPLETED',
        severity: 'CRITICAL',
        metadata: {
          election_id: electionId,
          job_id: jobId,
          total_votes: totalVotes,
          candidates: results.length,
          winner: results[0]?.name,
          completed_at: new Date()
        }
      });

      return {
        success: true,
        results
      };

    } catch (error) {
      await logger.auditLog({
        event_type: 'RESULT_TALLY_FAILED',
        severity: 'CRITICAL',
        metadata: {
          election_id: electionId,
          job_id: jobId,
          error: error.message
        }
      });

      throw error;
    }
  }

  /**
   * Store tally results
   * @param {String} electionId - Election ID
   * @param {Array} results - Results array
   */
  async storeResults(electionId, results) {
    // Store in a results table or cache
    // For now, using MongoDB audit logs as storage
    await logger.auditLog({
      event_type: 'ELECTION_RESULTS',
      metadata: {
        election_id: electionId,
        results,
        generatedAt: new Date()
      }
    });
  }

  /**
   * Get election results
   * @param {String} electionId - Election ID
   * @returns {Promise<Object>} Results
   */
  async getResults(electionId) {
    try {
      const election = await Election.findByPk(electionId);

      if (!election) {
        throw new Error('Election not found');
      }

      // Only return results if election is closed or completed
      if (!['CLOSED', 'COMPLETED', 'CERTIFIED'].includes(election.status)) {
        return {
          success: false,
          error: 'Results not available yet',
          status: election.status
        };
      }

      // Fetch stored results from audit logs
      const resultLog = await logger.findAuditLog({
        event_type: 'ELECTION_RESULTS',
        'metadata.election_id': electionId
      });

      if (!resultLog || resultLog.length === 0) {
        // Results not tallied yet, trigger tally
        return {
          success: false,
          error: 'Results not tallied yet',
          message: 'Tally in progress'
        };
      }

      const latestResult = resultLog[resultLog.length - 1];
      const results = latestResult.metadata.results;

      // Get total voter count
      const totalVoters = await VotingRecord.count({
        where: { election_id: electionId }
      });

      const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

      return {
        success: true,
        election: {
          id: election.election_id,
          name: election.name,
          status: election.status
        },
        results,
        statistics: {
          totalVotes,
          totalVoters,
          turnout: totalVoters > 0
            ? ((totalVotes / totalVoters) * 100).toFixed(2)
            : '0.00',
          generatedAt: latestResult.timestamp
        }
      };

    } catch (error) {
      logger.error('Error fetching results:', error);
      throw error;
    }
  }

  /**
   * Get district-wise results
   * @param {String} electionId - Election ID
   * @param {String} districtId - District ID
   * @returns {Promise<Object>} District results
   */
  async getDistrictResults(electionId, districtId) {
    try {
      // Query blockchain for district-specific votes
      const districtVotes = await fabricService.getVotesByDistrict(electionId, districtId);

      // Aggregate
      const voteCounts = {};
      districtVotes.forEach(vote => {
        const candidateId = vote.candidateId;
        if (!voteCounts[candidateId]) {
          voteCounts[candidateId] = 0;
        }
        voteCounts[candidateId]++;
      });

      // Get candidates
      const candidates = await Candidate.findAll({
        where: { election_id: electionId }
      });

      const results = candidates.map(candidate => ({
        candidateId: candidate.candidate_id,
        name: candidate.name,
        party: candidate.party,
        voteCount: voteCounts[candidate.candidate_id] || 0
      }));

      results.sort((a, b) => b.voteCount - a.voteCount);

      return {
        success: true,
        districtId,
        results
      };

    } catch (error) {
      logger.error('Error fetching district results:', error);
      throw error;
    }
  }

  /**
   * Check if recount is needed
   * @param {String} electionId - Election ID
   * @returns {Promise<Object>} Recount recommendation
   */
  async checkRecountNeeded(electionId) {
    try {
      const results = await this.getResults(electionId);

      if (!results.success) {
        return {
          needed: false,
          reason: 'Results not available'
        };
      }

      const sortedResults = results.results;
      
      if (sortedResults.length < 2) {
        return {
          needed: false,
          reason: 'Single candidate election'
        };
      }

      const first = sortedResults[0];
      const second = sortedResults[1];
      
      const margin = first.voteCount - second.voteCount;
      const totalVotes = results.statistics.totalVotes;
      const marginPercentage = (margin / totalVotes) * 100;

      // Trigger recount if margin < 0.5%
      if (marginPercentage < 0.5) {
        return {
          needed: true,
          reason: 'CLOSE_MARGIN',
          margin: marginPercentage.toFixed(4),
          firstPlace: first.name,
          secondPlace: second.name
        };
      }

      return {
        needed: false,
        margin: marginPercentage.toFixed(4)
      };

    } catch (error) {
      logger.error('Error checking recount:', error);
      throw error;
    }
  }
}

module.exports = new ResultsService();
