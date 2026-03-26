import { useState, useEffect } from 'react'
import { biometricLogin } from '../api/auth.js'
import { getCurrentElection } from '../api/elections.js'
import { castVote } from '../api/votes.js'

/* ─── Fingerprint SVG ─── */
function FpSVG() {
  return (
    <svg className="fp-svg" viewBox="0 0 80 96" fill="none">
      <path d="M40 6C24 6 11 18.5 11 34c0 7.5 2.8 14.4 7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M40 6C56 6 69 18.5 69 34c0 7.5-2.8 14.4-7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M19 56c-3.8-5.8-6-12.8-6-20C13 21.2 25.3 10 40 10s27 11.2 27 26c0 7.2-2.2 14.2-6 20" stroke="rgba(79,70,229,0.55)" strokeWidth="1.9" strokeLinecap="round"/>
      <path d="M23 63c-3-5.2-4.8-11.2-4.8-17.5C18.2 31 28 21 40 21s21.8 10 21.8 24.5c0 6.3-1.8 12.3-4.8 17.5" stroke="rgba(79,70,229,0.45)" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M27.5 70c-2.2-4.5-3.5-9.6-3.5-15C24 42.5 31.3 34 40 34s16 8.5 16 21c0 5.4-1.3 10.5-3.5 15" stroke="rgba(79,70,229,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 76c-1.5-3.8-2.4-8-2.4-12.5C29.6 54.5 34.3 47 40 47s10.4 7.5 10.4 16.5c0 4.5-.9 8.7-2.4 12.5" stroke="rgba(79,70,229,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M36 82c-.8-3-1.2-6.2-1.2-9.8C34.8 65.8 37 60 40 60s5.2 5.8 5.2 12.2c0 3.6-.4 6.8-1.2 9.8" stroke="rgba(79,70,229,0.22)" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M38.5 88c-.2-1.8-.4-3.8-.4-6C38.1 77 39 73 40 73s1.9 4 1.9 9c0 2.2-.2 4.2-.4 6" stroke="rgba(79,70,229,0.16)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Biometric Scan Step ─── */
function ScanStep({ onNext, loading, error }) {
  return (
    <div className="step">
      <div className="step-tag">Biometric Authentication</div>
      <div className="fp-shell">
        <FpSVG />
        <div className="fp-scan"></div>
        <div className="fp-glow"></div>
      </div>
      {error && <div style={{ color:'var(--error)', fontSize:10, textAlign:'center', marginBottom:6 }}>{error}</div>}
      <div className="scan-lbl">
        <div className="sdot"></div>
        {loading ? 'Authenticating' : 'Scanning'}
        <span className="sell"><span>.</span><span>.</span><span>.</span></span>
      </div>
      <div className="step-hint">Place your finger firmly on the sensor</div>
      <button
        className="start-btn"
        style={{ marginTop:10, opacity: loading ? 0.6 : 1 }}
        onClick={onNext}
        disabled={loading}
      >
        <span>{loading ? 'Verifying…' : 'Simulate Scan →'}</span>
      </button>
    </div>
  )
}

/* ─── Verified Step ─── */
function VerifiedStep({ voter, onNext }) {
  return (
    <div className="step">
      <div className="vbadge">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div className="step-tag">Identity Verified</div>
      <div className="vname">{voter?.fullName || voter?.full_name || 'Voter'}</div>
      <div className="vdist">{voter?.districtId || voter?.district_id || 'District'}</div>
      {voter?.hasVoted && (
        <div style={{ color:'var(--warning)', fontSize:11, marginTop:6 }}>
          ⚠ You have already voted in this election.
        </div>
      )}
      {!voter?.hasVoted && (
        <button className="start-btn" style={{marginTop:6}} onClick={onNext}>
          <span>Begin Voting &rarr;</span>
        </button>
      )}
    </div>
  )
}

/* ─── Candidates Step ─── */
function CandsStep({ candidates, onSelect, onBack, loading }) {
  if (loading) return (
    <div className="step" style={{gap:8}}>
      <div className="step-tag">Loading Candidates…</div>
      <div style={{color:'var(--text3)',fontSize:11}}>Fetching from blockchain…</div>
    </div>
  )
  return (
    <div>
      <div className="cands-hdr">
        <div className="cands-title">Choose Your Candidate</div>
        <div className="cands-pill">1 of 1</div>
      </div>
      <div className="cands-list">
        {candidates.length === 0 && (
          <div style={{color:'var(--text3)',fontSize:11,textAlign:'center',padding:20}}>
            No candidates found for this election.
          </div>
        )}
        {candidates.map((c, i) => (
          <div key={c.candidate_id || i} className="cand-card" onClick={() => onSelect(i)}>
            <div className="cand-av">
              <svg viewBox="0 0 20 20" fill="none" stroke="#9d7dfd"
                strokeWidth="1.6" strokeLinecap="round">
                <circle cx="10" cy="7" r="3.5"/>
                <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
              </svg>
            </div>
            <div>
              <div className="cand-name">{c.candidate_name || c.name}</div>
              <div className="cand-party">{c.party_name || c.party || 'Independent'}</div>
            </div>
            <div className="cand-sel">Select</div>
          </div>
        ))}
      </div>
      <div className="cand-back" onClick={onBack}>
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 2L4 6l4 4"/>
        </svg>
        Back
      </div>
    </div>
  )
}

/* ─── Confirm Step ─── */
function ConfirmStep({ candidate, onConfirm, onChange, loading }) {
  return (
    <div className="step">
      <div className="step-tag">Confirm Your Vote</div>
      <div style={{
        width:72, height:72, borderRadius:14,
        background:'linear-gradient(145deg,rgba(79,70,229,.12),rgba(11,31,58,.08))',
        border:'1px solid rgba(79,70,229,.15)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,.5),0 8px 24px rgba(15,23,42,.08)'
      }}>
        <svg viewBox="0 0 28 28" fill="none" stroke="#4F46E5"
          strokeWidth="1.5" strokeLinecap="round" width="30" height="30">
          <circle cx="14" cy="9" r="4.5"/>
          <path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9"/>
        </svg>
      </div>
      <div className="vname" style={{fontSize:16}}>{candidate?.candidate_name || candidate?.name || 'Candidate'}</div>
      <div className="vdist">{candidate?.party_name || candidate?.party || 'Independent'}</div>
      <div style={{display:'flex', gap:8, width:'100%', marginTop:8}}>
        <button className="start-btn"
          style={{flex:1, borderRadius:9, opacity: loading ? 0.6 : 1}}
          onClick={onConfirm}
          disabled={loading}>
          <span>{loading ? 'Casting…' : 'Confirm Vote'}</span>
        </button>
        <button onClick={onChange}
          style={{
            flex:1, background:'#FFFFFF',
            border:'1px solid #E2E8F0',
            borderRadius:9, padding:12,
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            fontWeight:500, color:'#475569', cursor:'pointer'
          }}>
          Change
        </button>
      </div>
    </div>
  )
}

/* ─── Receipt Step ─── */
function ReceiptStep({ receipt, onReset }) {
  return (
    <div className="step">
      <div className="vbadge" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div className="step-tag">Vote Cast Successfully!</div>
      <div style={{
        background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)',
        borderRadius:10, padding:12, width:'100%', fontSize:10,
        fontFamily:'monospace', color:'var(--text2)', wordBreak:'break-all',
        marginTop:4
      }}>
        <div style={{marginBottom:4}}><strong>Receipt ID:</strong> {receipt?.receipt || receipt?.voteId || '—'}</div>
        <div style={{marginBottom:4}}><strong>TX Hash:</strong> {receipt?.blockchainTxId ? receipt.blockchainTxId.slice(0, 32) + '…' : 'Blockchain pending'}</div>
        <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
      </div>
      <div style={{fontSize:10,color:'var(--text3)',textAlign:'center',marginTop:6}}>
        Keep your receipt ID to verify your vote at any time.
      </div>
      <button className="start-btn" style={{marginTop:8}} onClick={onReset}>
        <span>Done</span>
      </button>
    </div>
  )
}

/* ─── Main VoterUI ─── */
export default function VoterUIPage() {
  const [step, setStep]             = useState('scan')   // scan|verified|cands|confirm|done
  const [voter, setVoter]           = useState(null)
  const [election, setElection]     = useState(null)
  const [candidates, setCands]      = useState([])
  const [selectedIdx, setSelIdx]    = useState(0)
  const [receipt, setReceipt]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const stepNum = { scan:2, verified:3, cands:4, confirm:5, done:6 }
  const vs = stepNum[step] || 2

  /* ── Biometric Auth (demo: fixed template, real API call) ── */
  async function handleScan() {
    setLoading(true)
    setError(null)
    try {
      const res = await biometricLogin({
        biometricTemplate: 'demo-biometric-template-hash',
        terminalId: 'TERM-WEB-001'
      })
      setVoter(res.voter)
      setStep('verified')
    } catch (err) {
      // Demo fallback: show mock voter so UI is explorable without running DB
      setVoter({ fullName: 'Demo Voter', districtId: 'General', hasVoted: false, voterId: 'DEMO-001' })
      setStep('verified')
      setError(`[Demo mode – backend: ${err.message}]`)
    } finally {
      setLoading(false)
    }
  }

  /* ── Fetch election + candidates ── */
  async function handleBeginVoting() {
    setLoading(true)
    try {
      const elec = await getCurrentElection()
      setElection(elec)
      const cands = elec.election?.candidates || elec.candidates || []
      setCands(cands)
      setStep('cands')
    } catch (err) {
      // Demo fallback
      setCands([
        { candidate_name:'Candidate A', party_name:'Party X', candidate_id:'c1' },
        { candidate_name:'Candidate B', party_name:'Party Y', candidate_id:'c2' },
        { candidate_name:'Candidate C', party_name:'Party Z', candidate_id:'c3' },
      ])
      setElection({ id: 'DEMO-ELEC', name: 'Demo Election' })
      setStep('cands')
    } finally {
      setLoading(false)
    }
  }

  /* ── Cast Vote ── */
  async function handleConfirm() {
    setLoading(true)
    const cand = candidates[selectedIdx]
    try {
      const res = await castVote({
        voterId:       voter?.voterId || 'DEMO-001',
        electionId:    election?.id || 'DEMO-ELEC',
        candidateId:   cand?.candidate_id || `cand-${selectedIdx}`,
        district:      voter?.districtId || 'General',
        biometricHash: 'demo-biometric-template-hash',
        terminalId:    'TERM-WEB-001',
      })
      setReceipt(res)
      setStep('done')
    } catch (err) {
      // Demo fallback receipt
      setReceipt({
        receipt: 'DEMO-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
        blockchainTxId: null,
        voteId: 'DEMO-VOTE'
      })
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setStep('scan'); setVoter(null); setElection(null)
    setCands([]); setReceipt(null); setError(null)
  }

  const dots = [2,3,4,5,6,7]

  return (
    <div className="view on" id="v-voter" style={{flex:1,overflow:'hidden'}}>
      <div className="voter-bg">
        <div className="device">
          {/* Device header */}
          <div className="dev-hdr">
            <div className="dev-brand">
              <div className="dev-ico">
                <svg viewBox="0 0 16 16" fill="none" stroke="#fff"
                  strokeWidth="2" strokeLinecap="round">
                  <circle cx="8" cy="8" r="2.5"/>
                  <circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/>
                </svg>
              </div>
              <div>
                <div className="dev-sub">Election Commission</div>
                <div className="dev-name">e-Vote Terminal</div>
              </div>
            </div>
            <div className="lang-row">
              <div className="lpill on">EN</div>
              <div className="lpill">&#2361;&#2367;</div>
              <div className="lpill">&#2980;</div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="prog">
            <div className="pdot d"></div>
            {dots.map(n => (
              <div key={n} id={`pd${n}`}
                className={`pdot${n < vs ? ' d' : n === vs ? ' c' : ''}`}>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div id="vstep">
            {step === 'scan'     && <ScanStep     onNext={handleScan}       loading={loading} error={error} />}
            {step === 'verified' && <VerifiedStep voter={voter}             onNext={handleBeginVoting} />}
            {step === 'cands'    && (
              <CandsStep
                candidates={candidates}
                loading={loading}
                onSelect={(i) => { setSelIdx(i); setStep('confirm') }}
                onBack={() => setStep('scan')}
              />
            )}
            {step === 'confirm'  && (
              <ConfirmStep
                candidate={candidates[selectedIdx]}
                loading={loading}
                onConfirm={handleConfirm}
                onChange={() => setStep('cands')}
              />
            )}
            {step === 'done'     && <ReceiptStep receipt={receipt} onReset={handleReset} />}
          </div>
        </div>
      </div>
    </div>
  )
}
