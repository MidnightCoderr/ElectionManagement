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

          {/* Fingerprint Scanner Animation */}
          <div className="fp-scanner-wrap">
            <div className="fp-scanner-box">
              <svg viewBox="0 0 80 96" fill="none">
                <path d="M40 6C24 6 11 18.5 11 34c0 7.5 2.8 14.4 7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M40 6C56 6 69 18.5 69 34c0 7.5-2.8 14.4-7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M19 56c-3.8-5.8-6-12.8-6-20C13 21.2 25.3 10 40 10s27 11.2 27 26c0 7.2-2.2 14.2-6 20" stroke="rgba(79,70,229,0.55)" strokeWidth="1.9" strokeLinecap="round"/>
                <path d="M23 63c-3-5.2-4.8-11.2-4.8-17.5C18.2 31 28 21 40 21s21.8 10 21.8 24.5c0 6.3-1.8 12.3-4.8 17.5" stroke="rgba(79,70,229,0.45)" strokeWidth="1.7" strokeLinecap="round"/>
                <path d="M27.5 70c-2.2-4.5-3.5-9.6-3.5-15C24 42.5 31.3 34 40 34s16 8.5 16 21c0 5.4-1.3 10.5-3.5 15" stroke="rgba(79,70,229,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M32 76c-1.5-3.8-2.4-8-2.4-12.5C29.6 54.5 34.3 47 40 47s10.4 7.5 10.4 16.5c0 4.5-.9 8.7-2.4 12.5" stroke="rgba(79,70,229,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M36 82c-.8-3-1.2-6.2-1.2-9.8C34.8 65.8 37 60 40 60s5.2 5.8 5.2 12.2c0 3.6-.4 6.8-1.2 9.8" stroke="rgba(79,70,229,0.22)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M38.5 88c-.2-1.8-.4-3.8-.4-6C38.1 77 39 73 40 73s1.9 4 1.9 9c0 2.2-.2 4.2-.4 6" stroke="rgba(79,70,229,0.16)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <div className="fp-scan-line"></div>
              <div className="fp-scan-glow"></div>
            </div>
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
                <svg viewBox="0 0 16 16" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
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
                <svg viewBox="0 0 24 24" fill="#94A3B8" style={{width:15,height:15}}>
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
