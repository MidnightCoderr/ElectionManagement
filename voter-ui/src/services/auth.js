/**
 * Authentication Service
 * Frontend service for biometric authentication
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class AuthService {
    /**
     * Authenticate using biometric hash
     * @param {Object} data - Auth data
     * @param {String} data.biometricHash - SHA-256 hash of fingerprint
     * @param {String} data.terminalId - Terminal ID
     * @returns {Promise<Object>} Auth result with token
     */
    async biometricAuth({ biometricHash, terminalId }) {
        try {
            const response = await axios.post(`${API_URL}/auth/biometric`, {
                biometricHash,
                terminalId
            });

            return response.data;
        } catch (error) {
            console.error('Biometric auth error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get authentication header for API requests
     * @returns {Object} Header object
     */
    getAuthHeader() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Not authenticated');
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Check if user is authenticated
     * @returns {Boolean} Is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const voter = localStorage.getItem('voter');
        return !!(token && voter);
    }

    /**
     * Get current voter info
     * @returns {Object|null} Voter object
     */
    getCurrentVoter() {
        const voter = localStorage.getItem('voter');
        return voter ? JSON.parse(voter) : null;
    }

    /**
     * Logout
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('voter');
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

export const authService = new AuthService();
