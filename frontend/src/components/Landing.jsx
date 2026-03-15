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
        <div className="vbars">
          <div className="vbar" style={{height:'52%'}}></div>
          <div className="vbar" style={{height:'70%'}}></div>
          <div className="vbar" style={{height:'86%'}}></div>
          <div className="vbar" style={{height:'66%'}}></div>
          <div className="vbar" style={{height:'44%'}}></div>
        </div>

        <div className="hero-play">
          <svg viewBox="0 0 12 12" fill="none">
            <polygon points="4,2 10,6 4,10" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>

        <div className="hero-announce">
          <div className="announce-dot"></div>
          Blockchain-verified elections &mdash; Learn how it works &nbsp;&rarr;
        </div>

        {/* Floating nodes  left */}
        <div className="fnode-l1">
          <div className="fnode-ico">
            <svg viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" width="10" height="10">
              <polygon points="5,1 9,8 1,8" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Maharashtra</div>
          <div className="fnode-val">72,456 votes</div>
        </div>

        <div className="fnode-l2">
          <div className="fnode-ico">
            <svg viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" width="10" height="10">
              <circle cx="5" cy="5" r="2" fill="none"/>
              <circle cx="5" cy="5" r="4" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Delhi NCR</div>
          <div className="fnode-val">58,234 votes</div>
        </div>

        {/* Floating nodes  right */}
        <div className="fnode-r1">
          <div className="fnode-ico" style={{marginLeft:'auto'}}>
            <svg viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" width="10" height="10">
              <path d="M2 8l3-6 3 6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Karnataka</div>
          <div className="fnode-val">65,102 votes</div>
        </div>

        <div className="fnode-r2">
          <div className="fnode-ico" style={{marginLeft:'auto'}}>
            <svg viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" width="10" height="10">
              <path d="M2 6l2-3 2 2 2-4" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="fnode-name">&bull; Chennai</div>
          <div className="fnode-val">44,890 votes</div>
        </div>

        {/* Connecting SVG curves */}
        <svg className="svg-lines" viewBox="0 0 800 654" preserveAspectRatio="none">
          <path d="M92 210 Q200 280 400 327"  stroke="rgba(255,255,255,0.055)" strokeWidth="1" fill="none"/>
          <path d="M92 380 Q200 376 400 327"  stroke="rgba(255,255,255,0.045)" strokeWidth="1" fill="none"/>
          <path d="M708 210 Q600 275 400 327" stroke="rgba(255,255,255,0.055)" strokeWidth="1" fill="none"/>
          <path d="M708 420 Q620 378 400 327" stroke="rgba(255,255,255,0.045)" strokeWidth="1" fill="none"/>
        </svg>

        {/* Hero text */}
        <div className="hero-text">
          <span className="hero-line1">Your vote.</span>
          <span className="hero-line2">Protected.</span>
          <span className="hero-line3">Counted.</span>
          <div className="hero-sub">
            Where blockchain technology meets democratic integrity &mdash; secure, transparent, verifiable.
          </div>
        </div>

        {/* CTA buttons */}
        <div className="hero-btns">
          <button className="hbtn-open" onClick={() => navigate('/voter')}>
            Open App
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 5h6M5 2l3 3-3 3"/>
            </svg>
          </button>
          <button className="hbtn-discover" onClick={() => navigate('/observer')}>
            Discover More
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-ind">
          <div className="scroll-circle">
            <svg viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 2v5M2.5 5.5L5 8l2.5-2.5"/>
            </svg>
          </div>
          01/05 &middot; Scroll down
        </div>

        {/* Election Horizons */}
        <div className="defi-label">
          <div className="defi-label-t">Election Horizons</div>
          <div className="defi-under"></div>
        </div>
      </div>
    </div>
  )
}
