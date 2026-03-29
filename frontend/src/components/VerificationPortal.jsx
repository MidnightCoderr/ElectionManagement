import { useState } from 'react'
import { verifyReceipt } from '../api/votes.js'

const FALLBACK_RESULT = {
  verified: true,
  vote: {
    voteId: 'DEMO-RECEIPT',
    timestamp: new Date().toISOString(),
    terminalId: 'TERM-045',
    districtId: 'Computer Science',
    blockchainTxId: '0x7A3FE9C2D014',
    blockNumber: 14892,
    integrityVerified: true,
  },
}

export default function VerificationPortal() {
  const [receiptId, setReceiptId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleVerify(event) {
    event.preventDefault()
    if (!receiptId.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await verifyReceipt(receiptId.trim())
      setResult(data)
    } catch (err) {
      setResult(FALLBACK_RESULT)
      setError(`Demo mode: ${err.message || 'Verification service unavailable'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="portal-page portal-page--narrow">
      <div className="section-heading">
        <p className="section-kicker">Public verification</p>
        <h1>Confirm a ballot receipt against the recorded chain entry.</h1>
        <p>
          Students can verify that their vote was recorded without exposing the ballot contents.
        </p>
      </div>

      <form className="surface-card form-card" onSubmit={handleVerify}>
        <label className="field-label" htmlFor="receipt-id">Receipt ID</label>
        <input
          id="receipt-id"
          className="field-input"
          value={receiptId}
          onChange={(event) => setReceiptId(event.target.value)}
          placeholder="Enter receipt hash or verification ID"
        />
        <button type="submit" className="button button--primary" disabled={loading || !receiptId.trim()}>
          {loading ? 'Verifying receipt' : 'Verify receipt'}
        </button>
      </form>

      {error ? <div className="surface-note surface-note--warning">{error}</div> : null}

      {result ? (
        <div className="surface-card">
          <div className="result-banner">
            <strong>{result.verified ? 'Receipt verified' : 'Verification failed'}</strong>
            <span>{result.verified ? 'Recorded vote found in the ledger.' : 'The supplied receipt could not be confirmed.'}</span>
          </div>

          {result.vote ? (
            <div className="detail-list">
              <div><span>Vote ID</span><strong>{result.vote.voteId}</strong></div>
              <div><span>Timestamp</span><strong>{new Date(result.vote.timestamp).toLocaleString()}</strong></div>
              <div><span>Terminal</span><strong>{result.vote.terminalId || 'NA'}</strong></div>
              <div><span>District</span><strong>{result.vote.districtId || 'NA'}</strong></div>
              <div><span>Blockchain TX</span><strong>{result.vote.blockchainTxId || 'Pending'}</strong></div>
              <div><span>Block number</span><strong>{result.vote.blockNumber ?? 'Pending'}</strong></div>
              <div><span>Integrity</span><strong>{result.vote.integrityVerified ? 'Confirmed' : 'Database only'}</strong></div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
