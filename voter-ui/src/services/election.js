/**
 * Election Service
 * Frontend service for election and candidate operations
 */

import axios from 'axios';
import { authService } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class ElectionService {
    /**
     * Get election by ID
     * @param {String} electionId - Election ID
     * @returns {Promise<Object>} Election data
     */
    async getElection(electionId) {
        try {
            const response = await axios.get(
                `${API_URL}/elections/${electionId}`,
                {
                    headers: authService.getAuthHeader()
                }
            );

            return response.data.election;
        } catch (error) {
            console.error('Get election error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all elections
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} Elections array
     */
    async getElections(filters = {}) {
        try {
            const response = await axios.get(
                `${API_URL}/elections`,
                {
                    params: filters,
                    headers: authService.getAuthHeader()
                }
            );

            return response.data.elections;
        } catch (error) {
            console.error('Get elections error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get candidates for an election
     * @param {String} electionId - Election ID
     * @returns {Promise<Array>} Candidates array
     */
    async getCandidates(electionId) {
        try {
            const response = await axios.get(
                `${API_URL}/elections/${electionId}/candidates`,
                {
                    headers: authService.getAuthHeader()
                }
            );

            return response.data.candidates;
        } catch (error) {
            console.error('Get candidates error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get election results
     * @param {String} electionId - Election ID
     * @returns {Promise<Object>} Results data
     */
    async getResults(electionId) {
        try {
            const response = await axios.get(
                `${API_URL}/results/${electionId}`,
                {
                    headers: authService.getAuthHeader()
                }
            );

            return response.data;
        } catch (error) {
            console.error('Get results error:', error);
            throw this.handleError(error);
        }
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

export const electionService = new ElectionService();
