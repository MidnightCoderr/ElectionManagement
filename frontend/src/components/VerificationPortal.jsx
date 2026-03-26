import { useState } from 'react'
import { verifyReceipt } from '../api/votes.js'

export default function VerificationPortal() {
  const [receiptId, setReceiptId] = useState('')
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  async function handleVerify(e) {
    e.preventDefault()
    if (!receiptId.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await verifyReceipt(receiptId.trim())
      setResult(data)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="view on" id="v-verify" style={{flex:1,overflow:'auto',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'32px 16px'}}>
      <div style={{width:'100%',maxWidth:480}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{
            width:52,height:52,borderRadius:14,
            background:'linear-gradient(135deg,#4F46E5,#1B3B6F)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 12px'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" width="26" height="26">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={{fontFamily:"var(--serif)",fontSize:20,color:'var(--text)',fontWeight:600}}>Vote Verification</div>
          <div style={{fontSize:11,color:'var(--text3)',marginTop:4}}>Enter your receipt ID to verify your vote on the blockchain</div>
        </div>

        {/* Input form */}
        <form onSubmit={handleVerify} style={{
          background:'var(--card,#fff)',border:'1px solid var(--border,#E2E8F0)',
          borderRadius:14,padding:20,boxShadow:'0 4px 24px rgba(15,23,42,0.06)',marginBottom:16
        }}>
          <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:6}}>
            Receipt ID / Verification Hash
          </label>
          <input
            type="text"
            value={receiptId}
            onChange={e => setReceiptId(e.target.value)}
            placeholder="e.g. DEMO-ABC12345 or full hash"
            style={{
              width:'100%',padding:'10px 12px',borderRadius:8,
              border:'1px solid var(--border,#E2E8F0)',fontSize:12,
              fontFamily:'monospace',color:'var(--text)',background:'var(--g1,#F8FAFC)',
              outline:'none',boxSizing:'border-box',marginBottom:12
            }}
          />
          <button
            type="submit"
            disabled={loading || !receiptId.trim()}
            className="start-btn"
            style={{width:'100%',opacity:loading?0.7:1,cursor:!receiptId.trim()?'not-allowed':'pointer'}}
          >
            <span>{loading ? 'Verifying on blockchain…' : 'Verify Vote'}</span>
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            background:'rgba(185,28,28,0.06)',border:'1px solid rgba(185,28,28,0.15)',
            borderRadius:10,padding:14,fontSize:11,color:'var(--error,#b91c1c)',marginBottom:12
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background:'var(--card,#fff)',border:'1px solid var(--border,#E2E8F0)',
            borderRadius:14,padding:20,boxShadow:'0 4px 24px rgba(15,23,42,0.06)'
          }}>
            {/* Status badge */}
            <div style={{
              display:'flex',alignItems:'center',gap:8,marginBottom:16,
              padding:'8px 12px',borderRadius:8,
              background: result.verified ? 'rgba(21,128,61,0.06)' : 'rgba(185,28,28,0.06)',
              border: result.verified ? '1px solid rgba(21,128,61,0.2)' : '1px solid rgba(185,28,28,0.2)',
            }}>
              <svg viewBox="0 0 20 20" fill="none" stroke={result.verified ? '#166534' : '#991b1b'} strokeWidth="2" strokeLinecap="round" width="16" height="16">
                {result.verified
                  ? <path d="M4 10l4 4 8-8"/>
                  : <><path d="M6 6l8 8"/><path d="M14 6l-8 8"/></>
                }
              </svg>
              <span style={{fontSize:12,fontWeight:700,color: result.verified ? 'var(--success,#166534)' : 'var(--error,#991b1b)'}}>
                {result.verified ? 'Vote Verified on Blockchain' : 'Verification Failed'}
              </span>
            </div>

            {/* Details */}
            {result.vote && (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[
                  ['Vote ID',          result.vote.voteId],
                  ['Cast At',         result.vote.timestamp ? new Date(result.vote.timestamp).toLocaleString() : '—'],
                  ['Terminal',         result.vote.terminalId || '—'],
                  ['District',         result.vote.districtId || '—'],
                  ['Blockchain TX',    result.vote.blockchainTxId || 'N/A'],
                  ['Block Number',     result.vote.blockNumber ?? '—'],
                  ['Integrity',        result.vote.integrityVerified ? '✅ Verified' : '⚠ DB only'],
                ].map(([label, val]) => (
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <span style={{fontSize:10,color:'var(--text3)',fontWeight:600,flexShrink:0}}>{label}</span>
                    <span style={{
                      fontSize:10,fontFamily:'monospace',color:'var(--text2)',
                      textAlign:'right',wordBreak:'break-all',maxWidth:280
                    }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
