/**
 * vote.js
 * Vote submission service.
 * Calls POST /api/v1/votes to cast a vote and receive a blockchain receipt.
 */

import { apiFetch, mockDelay, MOCK_MODE } from './api.js'

/**
 * @typedef {Object} VoteReceipt
 * @property {string} receiptId
 * @property {string} timestamp
 * @property {string} blockchainTxId
 * @property {string} terminalId
 * @property {number} blockNumber
 */

function randomHex(n = 16) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('')
}

/**
 * Cast a vote on the blockchain.
 * @param {{ candidateId: string, voterId: string, terminalId: string, electionId: string, district: string, biometricHash: string }} payload
 * @returns {Promise<VoteReceipt>}
 */
export async function castVote({ candidateId, voterId, terminalId = 'TERM-00001', electionId = 'ge-2024', district = 'Mumbai Central', biometricHash = 'mock-hash-123' }) {
  if (MOCK_MODE) {
    await mockDelay(1500)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const receiptId = Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return {
      receiptId,
      timestamp:       new Date().toISOString(),
      blockchainTxId:  '0x' + randomHex(16),
      terminalId,
      blockNumber:     10000 + Math.floor(Math.random() * 5000),
    }
  }

  const data = await apiFetch('/api/v1/votes/cast', {
    method: 'POST',
    body: JSON.stringify({ candidateId, voterId, terminalId, electionId, district, biometricHash }),
  })

  return {
    receiptId:       data.receipt.receiptId,
    timestamp:       data.receipt.timestamp,
    blockchainTxId:  data.receipt.blockchainTxId,
    terminalId:      data.receipt.terminalId,
    blockNumber:     data.receipt.blockNumber,
  }
}
