/**
 * blockchainService.js
 * Handles all blockchain verification API calls.
 * Swap MOCK_MODE to false and set VITE_API_BASE_URL to use the real backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false';

// ── Types ─────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} VerificationResult
 * @property {boolean} success
 * @property {boolean} verified
 * @property {string}  receiptId
 * @property {string}  [voteId]
 * @property {string}  [timestamp]
 * @property {string}  [election]
 * @property {string}  [blockchainTxId]
 * @property {number}  [blockNumber]
 * @property {string}  [districtId]
 * @property {string}  [terminalId]
 * @property {boolean} [integrityVerified]
 * @property {string}  [error]
 */

// ── Helpers ───────────────────────────────────────────────────────────────
function randomHex(len = 16) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
}

function randomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function mockDelay(ms = 1200) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 400));
}

// ── Mock verification ─────────────────────────────────────────────────────
async function mockVerify(receiptId) {
  await mockDelay();

  // Receipts shorter than 4 chars are treated as "not found" in mock mode
  if (receiptId.length < 4) {
    return { success: false, verified: false, receiptId, error: 'Receipt not found on blockchain.' };
  }

  const ts = new Date(Date.now() - Math.floor(Math.random() * 7200000));

  return {
    success: true,
    verified: true,
    receiptId,
    voteId: randomUUID(),
    timestamp: ts.toISOString(),
    election: 'General Election 2024',
    blockchainTxId: '0x' + randomHex(16),
    blockNumber: 10000 + Math.floor(Math.random() * 5000),
    districtId: 'Mumbai Central',
    terminalId: 'TERM-00001',
    integrityVerified: true,
  };
}

// ── Real API verification ─────────────────────────────────────────────────
async function apiVerify(receiptId) {
  const res = await fetch(`${API_BASE}/api/v1/votes/verify/${encodeURIComponent(receiptId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      success: false,
      verified: false,
      receiptId,
      error: body.message || `Server error (${res.status})`,
    };
  }

  const data = await res.json();
  return {
    success: data.success,
    verified: data.verified,
    receiptId,
    voteId:           data.vote?.voteId,
    timestamp:        data.vote?.timestamp,
    election:         'General Election 2024',
    blockchainTxId:   data.vote?.blockchainTxId,
    blockNumber:      data.vote?.blockNumber,
    districtId:       data.vote?.districtId,
    terminalId:       data.vote?.terminalId,
    integrityVerified: data.vote?.integrityVerified,
    error:            data.error,
  };
}

// ── Public API ────────────────────────────────────────────────────────────
/**
 * Verify a vote receipt against the blockchain.
 * @param {string} receiptId
 * @returns {Promise<VerificationResult>}
 */
export async function verifyReceipt(receiptId) {
  if (!receiptId || !receiptId.trim()) {
    return { success: false, verified: false, receiptId, error: 'Receipt ID is required.' };
  }
  try {
    return MOCK_MODE ? await mockVerify(receiptId.trim().toUpperCase()) : await apiVerify(receiptId.trim().toUpperCase());
  } catch (err) {
    return { success: false, verified: false, receiptId, error: err.message || 'Network error. Please try again.' };
  }
}

/**
 * Format a timestamp ISO string for display.
 * @param {string} iso
 * @returns {string}
 */
export function formatTimestamp(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' });
}
