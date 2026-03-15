/**
 * auth.js
 * Biometric authentication service.
 * Calls POST /api/v1/auth/biometric with fingerprint scan data.
 * In mock mode, returns a hardcoded voter after a simulated delay.
 */

import { apiFetch, mockDelay, MOCK_MODE } from './api.js'

/**
 * Authenticate a voter via fingerprint scan.
 * @param {string} fingerprintData  — base64-encoded scan payload from terminal hardware
 * @param {string} terminalId       — terminal identifier (e.g. 'TERM-00001')
 * @returns {Promise<{ name: string, district: string, voterId: string }>}
 */
export async function authenticateVoter(fingerprintData, terminalId = 'TERM-00001') {
  if (MOCK_MODE) {
    await mockDelay(1200)
    // Mock: always returns a successful voter
    return { name: 'Ramesh Kumar', district: 'Mumbai Central', voterId: 'VOTER-MH-001234' }
  }

  const data = await apiFetch('/api/v1/auth/biometric', {
    method: 'POST',
    body: JSON.stringify({ fingerprintData, terminalId }),
  })

  // Store terminal session token if provided
  if (data.token) sessionStorage.setItem('terminal_token', data.token)

  return { name: data.voter.name, district: data.voter.district, voterId: data.voter.id }
}

/**
 * Check if a voter has already voted (double-vote prevention).
 * @param {string} voterId
 * @returns {Promise<boolean>}
 */
export async function checkAlreadyVoted(voterId) {
  if (MOCK_MODE) { await mockDelay(200); return false }
  const data = await apiFetch(`/api/v1/auth/check/${voterId}`)
  return data.alreadyVoted
}
