import { useState, useEffect, useRef } from 'react'

const voters = ['Ramesh Kumar', 'Priya Singh', 'Arun Mehta']
const dists  = ['Mumbai Central', 'Delhi North', 'Chennai South']

function FpSVG() {
  return (
    <svg className="fp-svg" viewBox="0 0 80 96" fill="none">
      <path d="M40 6C24 6 11 18.5 11 34c0 7.5 2.8 14.4 7.4 19.8" stroke="rgba(157,125,253,0.8)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M40 6C56 6 69 18.5 69 34c0 7.5-2.8 14.4-7.4 19.8" stroke="rgba(157,125,253,0.8)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M19 56c-3.8-5.8-6-12.8-6-20C13 21.2 25.3 10 40 10s27 11.2 27 26c0 7.2-2.2 14.2-6 20" stroke="rgba(157,125,253,0.68)" strokeWidth="1.9" strokeLinecap="round"/>
      <path d="M23 63c-3-5.2-4.8-11.2-4.8-17.5C18.2 31 28 21 40 21s21.8 10 21.8 24.5c0 6.3-1.8 12.3-4.8 17.5" stroke="rgba(157,125,253,0.58)" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M27.5 70c-2.2-4.5-3.5-9.6-3.5-15C24 42.5 31.3 34 40 34s16 8.5 16 21c0 5.4-1.3 10.5-3.5 15" stroke="rgba(157,125,253,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 76c-1.5-3.8-2.4-8-2.4-12.5C29.6 54.5 34.3 47 40 47s10.4 7.5 10.4 16.5c0 4.5-.9 8.7-2.4 12.5" stroke="rgba(157,125,253,0.42)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M36 82c-.8-3-1.2-6.2-1.2-9.8C34.8 65.8 37 60 40 60s5.2 5.8 5.2 12.2c0 3.6-.4 6.8-1.2 9.8" stroke="rgba(157,125,253,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M38.5 88c-.2-1.8-.4-3.8-.4-6C38.1 77 39 73 40 73s1.9 4 1.9 9c0 2.2-.2 4.2-.4 6" stroke="rgba(157,125,253,0.28)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M21 44 Q26 72 40 84 Q54 72 59 44" stroke="rgba(157,125,253,0.18)" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M14.5 40 Q18 80 40 92 Q62 80 65.5 40" stroke="rgba(157,125,253,0.12)" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  )
}

function ScanStep({ onNext }) {
  return (
    <div className="step">
      <div className="step-tag">Biometric Authentication</div>
      <div className="fp-shell">
        <FpSVG />
        <div className="fp-scan"></div>
        <div className="fp-glow"></div>
      </div>
      <div className="scan-lbl">
        <div className="sdot"></div>
        Scanning
        <span className="sell"><span>.</span><span>.</span><span>.</span></span>
      </div>
      <div className="step-hint">Place your finger firmly on the sensor</div>
    </div>
  )
}

function VerifiedStep({ vi, onNext }) {
  return (
    <div className="step">
      <div className="vbadge">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div className="step-tag">Identity Verified</div>
      <div className="vname">{voters[vi]}</div>
      <div className="vdist">{dists[vi]}</div>
      <button className="start-btn" style={{marginTop:6}} onClick={onNext}>
        <span>Begin Voting &rarr;</span>
      </button>
    </div>
  )
}

const CANDS = [
  { n: 'Candidate A', p: 'Party X' },
  { n: 'Candidate B', p: 'Party Y' },
  { n: 'Candidate C', p: 'Party Z' },
]

function CandsStep({ onSelect, onBack }) {
  return (
    <div>
      <div className="cands-hdr">
        <div className="cands-title">Choose Your Candidate</div>
        <div className="cands-pill">1 of 1</div>
      </div>
      <div className="cands-list">
        {CANDS.map((c, i) => (
          <div key={i} className="cand-card" onClick={() => onSelect(i)}>
            <div className="cand-av">
              <svg viewBox="0 0 20 20" fill="none" stroke="#9d7dfd"
                strokeWidth="1.6" strokeLinecap="round">
                <circle cx="10" cy="7" r="3.5"/>
                <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
              </svg>
            </div>
            <div>
              <div className="cand-name">{c.n}</div>
              <div className="cand-party">{c.p}</div>
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

function ConfirmStep({ vi, onConfirm, onChange }) {
  const letters = ['A','B','C']
  const parties = ['X','Y','Z']
  return (
    <div className="step">
      <div className="step-tag">Confirm Your Vote</div>
      <div style={{
        width:72, height:72, borderRadius:14,
        background:'linear-gradient(145deg,rgba(91,63,212,.17),rgba(20,20,36,.28))',
        border:'1px solid rgba(160,140,255,.1)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,.07),0 8px 24px rgba(0,0,0,.5)'
      }}>
        <svg viewBox="0 0 28 28" fill="none" stroke="#9d7dfd"
          strokeWidth="1.5" strokeLinecap="round" width="30" height="30">
          <circle cx="14" cy="9" r="4.5"/>
          <path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9"/>
        </svg>
      </div>
      <div className="vname" style={{fontSize:16}}>Candidate {letters[vi]}</div>
      <div className="vdist">Party {parties[vi]}</div>
      <div style={{display:'flex', gap:8, width:'100%', marginTop:8}}>
        <button className="start-btn"
          style={{flex:1, borderRadius:9}}
          onClick={onConfirm}>
          <span>Confirm Vote</span>
        </button>
        <button onClick={onChange}
          style={{
            flex:1, background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:9, padding:12,
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            fontWeight:500, color:'#5a5a78', cursor:'pointer'
          }}>
          Change
        </button>
      </div>
    </div>
  )
}

export default function VoterUIPage() {
  const [vs, setVs] = useState(2)   // step: 2=scan 3=verified 4=cands 5=confirm
  const [vi, setVi] = useState(0)   // voter/candidate index

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
            {vs === 2 && <ScanStep onNext={() => setVs(3)} />}
            {vs === 3 && <VerifiedStep vi={vi} onNext={() => setVs(4)} />}
            {vs === 4 && (
              <CandsStep
                onSelect={(i) => { setVi(i); setVs(5) }}
                onBack={() => setVs(2)}
              />
            )}
            {vs === 5 && (
              <ConfirmStep
                vi={vi}
                onConfirm={() => { setVi((vi + 1) % 3); setVs(2) }}
                onChange={() => setVs(4)}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
