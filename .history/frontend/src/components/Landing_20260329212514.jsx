import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="view on" id="v-land" style={{flex:1,overflow:'hidden'}}>
      <div className="landing">
        <div className="hero-orb"></div>
        <div className="hero-orb2"></div>
        <div className="hlines">
          <div className="hline" style={{top:'21%'}}></div>
          <div className="hline" style={{top:'47%'}}></div>
          <div className="hline" style={{top:'72%'}}></div>
        </div>

        {/* Glowing ring animation — Dribbble inspired */}
        <div className="glow-ring-wrapper">
          <div className="glow-ring">
            <div className="glow-ring-trail"></div>
          </div>
          <div className="glow-ring-inner"></div>
          <div className="glow-ring-pulse"></div>
        </div>

        <div className="hero-announce">
          <div className="announce-dot"></div>
          Blockchain-verified student elections &mdash; Learn how it works &nbsp;&rarr;
        </div>

        {/* Floating nodes — animated entry */}
        <div className="fnode-l1 fnode-anim" style={{animationDelay:'0.1s'}}>
          <div className="fnode-ico fnode-float">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" width="10" height="10">
              <polygon points="5,1 9,8 1,8" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Computer Science</div>
          <div className="fnode-val">1,456 votes</div>
        </div>

        <div className="fnode-l2 fnode-anim" style={{animationDelay:'0.3s'}}>
          <div className="fnode-ico fnode-float" style={{animationDelay:'1s'}}>
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" width="10" height="10">
              <circle cx="5" cy="5" r="2" fill="none"/>
              <circle cx="5" cy="5" r="4" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Electrical Eng.</div>
          <div className="fnode-val">1,234 votes</div>
        </div>

        <div className="fnode-r1 fnode-anim" style={{animationDelay:'0.2s'}}>
          <div className="fnode-ico fnode-float" style={{marginLeft:'auto',animationDelay:'0.5s'}}>
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" width="10" height="10">
              <path d="M2 8l3-6 3 6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Mechanical Eng.</div>
          <div className="fnode-val">1,102 votes</div>
        </div>

        <div className="fnode-r2 fnode-anim" style={{animationDelay:'0.4s'}}>
          <div className="fnode-ico fnode-float" style={{marginLeft:'auto',animationDelay:'1.5s'}}>
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" width="10" height="10">
              <path d="M2 6l2-3 2 2 2-4" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Business School</div>
          <div className="fnode-val">890 votes</div>
        </div>

        {/* Connecting SVG curves */}
        <svg className="svg-lines" viewBox="0 0 800 654" preserveAspectRatio="none">
          <path d="M92 210 Q200 280 400 327"  stroke="rgba(11,31,58,0.06)" strokeWidth="1" fill="none"/>
          <path d="M92 380 Q200 376 400 327"  stroke="rgba(11,31,58,0.04)" strokeWidth="1" fill="none"/>
          <path d="M708 210 Q600 275 400 327" stroke="rgba(11,31,58,0.06)" strokeWidth="1" fill="none"/>
          <path d="M708 420 Q620 378 400 327" stroke="rgba(11,31,58,0.04)" strokeWidth="1" fill="none"/>
        </svg>

        {/* Hero text with glow */}
        <div className="hero-text">
          <span className="hero-line1 hero-glow-text">Your vote.</span>
          <span className="hero-line2 hero-glow-text" style={{animationDelay:'0.2s'}}>Protected.</span>
          <span className="hero-line3 hero-glow-text" style={{animationDelay:'0.4s'}}>Counted.</span>
          <div className="hero-sub">
            Where blockchain technology meets campus democracy &mdash; secure, transparent, verifiable.
          </div>
        </div>



        {/* Scroll indicator */}
        <div className="scroll-ind">
          <div className="scroll-circle">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 2v5M2.5 5.5L5 8l2.5-2.5"/>
            </svg>
          </div>
          01/05 &middot; Scroll down
        </div>

        {/* Bottom-left portal links */}
        <div className="portal-links">
          <button className="portal-link" title="Voter Terminal" onClick={() => navigate('/voter')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="3" width="12" height="9" rx="1.5"/>
              <path d="M5 15h6M8 12v3"/>
            </svg>
          </button>
          <button className="portal-link" title="Observer Dashboard" onClick={() => navigate('/observer')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
              <circle cx="8" cy="8" r="2"/>
            </svg>
          </button>
          <button className="portal-link" title="Admin Portal" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="3"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
            </svg>
          </button>
        </div>

        {/* Election Horizons */}
        <div className="defi-label">
          <div className="defi-label-t">Campus Elections</div>
          <div className="defi-under"></div>
        </div>
      </div>
    </div>
  )
}
