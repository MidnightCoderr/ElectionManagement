import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="view on" id="v-create" style={{flex:1,overflow:'auto'}}>
      <div className="create-shell">
        <div className="create-left">
          <div className="cl-o1"></div>
          <div className="cl-o2"></div>
          <div className="cl-art">
            <svg width="155" height="155" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="70" stroke="rgba(124,92,252,0.12)" strokeWidth="1"/>
              <circle cx="100" cy="100" r="50" stroke="rgba(124,92,252,0.1)"  strokeWidth="1"/>
              <circle cx="100" cy="100" r="30" stroke="rgba(124,92,252,0.17)" strokeWidth="1.5"/>
              <circle cx="100" cy="100" r="5"  fill="rgba(124,92,252,0.8)"/>
              <line x1="100" y1="30"  x2="100" y2="70"  stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
              <line x1="100" y1="130" x2="100" y2="170" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
              <line x1="30"  y1="100" x2="70"  y2="100" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
              <line x1="130" y1="100" x2="170" y2="100" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
              <circle cx="100" cy="30"  r="4" fill="rgba(124,92,252,0.48)"/>
              <circle cx="100" cy="170" r="4" fill="rgba(124,92,252,0.48)"/>
              <circle cx="30"  cy="100" r="4" fill="rgba(124,92,252,0.48)"/>
              <circle cx="170" cy="100" r="4" fill="rgba(124,92,252,0.48)"/>
              <circle cx="150" cy="50"  r="3" fill="rgba(74,74,106,0.55)"/>
              <circle cx="50"  cy="150" r="3" fill="rgba(74,74,106,0.55)"/>
              <circle cx="150" cy="150" r="3" fill="rgba(74,74,106,0.55)"/>
              <circle cx="50"  cy="50"  r="3" fill="rgba(74,74,106,0.55)"/>
              <path d="M100 70 A30 30 0 0 1 130 100" stroke="rgba(124,92,252,0.32)" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
              <path d="M100 130 A30 30 0 0 1 70 100" stroke="rgba(74,74,106,0.32)"  strokeWidth="1"   fill="none" strokeDasharray="3 5"/>
            </svg>
          </div>
          <div className="cl-txt">
            <div className="cl-h">Capturing Democracy,<br/>Creating Transparency</div>
            <div className="cl-s">Election Management System &middot; India</div>
            <div className="cl-dots">
              <div className="cldot"></div>
              <div className="cldot"></div>
              <div className="cldot on"></div>
            </div>
          </div>
        </div>

        <div className="create-right">
          <div className="cf">
            <div className="cf-ey">Admin Portal</div>
            <div className="cf-h">Create an account</div>
            <div className="cf-s">
              Already have an account? <a href="#" onClick={e => { e.preventDefault(); navigate('/') }}>Log in</a>
            </div>

            <div className="fr">
              <input className="fi" type="text" placeholder="First name" defaultValue="Arjun"/>
              <input className="fi" type="text" placeholder="Last name"/>
            </div>
            <input className="fi" type="email" placeholder="Email" style={{display:'block',marginBottom:9}}/>

            <div className="pw">
              <input className="fi" type={showPass ? 'text' : 'password'} placeholder="Enter your password"/>
              <div className="pw-eye" onClick={() => setShowPass(v => !v)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#3e3e58" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                  <circle cx="8" cy="8" r="2"/>
                </svg>
              </div>
            </div>

            <div className="tr">
              <div className="chk">
                <svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 5l2 2.5 4-4"/>
                </svg>
              </div>
              <div className="tr-txt">
                I agree to the <a href="#">Terms &amp; Conditions</a>
              </div>
            </div>

            <button className="lbtn"><span>Create account</span></button>

            <div className="or-r">
              <div className="or-l"></div>
              <div className="or-t">Or register with</div>
              <div className="or-l"></div>
            </div>

            <div className="sr">
              <button className="sbtn">
                <svg viewBox="0 0 24 24" style={{width:15,height:15}}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="sbtn">
                <svg viewBox="0 0 24 24" fill="#8e8ea8" style={{width:15,height:15}}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
