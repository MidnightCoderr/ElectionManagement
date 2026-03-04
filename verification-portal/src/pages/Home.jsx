import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, BarChart3, Lock, CheckCircle, ChevronRight, Zap, Eye } from 'lucide-react';
import './Home.css';

function Home() {
    const heroRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 20;
            const y = (clientY / innerHeight - 0.5) * 20;
            heroRef.current.style.setProperty('--tx', `${x}px`);
            heroRef.current.style.setProperty('--ty', `${y}px`);
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    const features = [
        {
            icon: <Shield size={28} />,
            color: '#3b82f6',
            title: 'Blockchain Immutability',
            desc: 'Every vote is anchored to a Hyperledger Fabric ledger. Once recorded, it cannot be altered or deleted by anyone.',
        },
        {
            icon: <Search size={28} />,
            color: '#8b5cf6',
            title: 'Instant Verification',
            desc: 'Scan the QR code on your paper receipt or enter your Vote ID to confirm your vote exists on the chain.',
        },
        {
            icon: <Lock size={28} />,
            color: '#10b981',
            title: 'Privacy Preserved',
            desc: 'Verification confirms your vote was recorded — not who you voted for. Your ballot stays encrypted always.',
        },
        {
            icon: <BarChart3 size={28} />,
            color: '#f59e0b',
            title: 'Public Results',
            desc: 'Live tallies sourced directly from blockchain data. No intermediaries. No hidden manipulation.',
        },
    ];

    const steps = [
        { num: '01', title: 'Get Your Receipt', desc: 'After voting, you receive a paper slip and a digital QR code as your cryptographic proof.' },
        { num: '02', title: 'Scan or Enter ID', desc: 'Use your camera to scan the QR code, or manually type the Vote ID printed on your receipt.' },
        { num: '03', title: 'Blockchain Confirmed', desc: 'Our system queries the Hyperledger Fabric ledger directly and returns your verification result in seconds.' },
    ];

    return (
        <div className="home-root">
            {/* Nav */}
            <nav className="home-nav">
                <div className="nav-brand">
                    <span className="nav-icon">🗳️</span>
                    <span>Election Verification Portal</span>
                </div>
                <div className="nav-links">
                    <Link to="/results">Results</Link>
                    <Link to="/about">About</Link>
                    <Link to="/verify" className="nav-cta">Verify Vote</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero" ref={heroRef}>
                <div className="hero-glow glow-1" />
                <div className="hero-glow glow-2" />
                <div className="hero-inner">
                    <div className="hero-badge">
                        <Zap size={14} />
                        <span>Powered by Hyperledger Fabric Blockchain</span>
                    </div>
                    <h1 className="hero-title">
                        Your Vote.<br />
                        <span className="gradient-text">Permanently Verified.</span>
                    </h1>
                    <p className="hero-sub">
                        An independent, publicly auditable portal to confirm your vote was recorded on the blockchain — no login, no trust required.
                    </p>
                    <div className="hero-actions">
                        <Link to="/verify" className="btn-primary">
                            <Search size={18} />
                            Verify My Vote
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/results" className="btn-ghost">
                            <BarChart3 size={18} />
                            View Live Results
                        </Link>
                    </div>
                    <div className="hero-trust">
                        <span><CheckCircle size={14} /> No sign-up needed</span>
                        <span><CheckCircle size={14} /> Open source</span>
                        <span><CheckCircle size={14} /> Cryptographically verified</span>
                    </div>
                </div>

                {/* floating card */}
                <div className="hero-card">
                    <div className="card-header">
                        <div className="card-dot green" />
                        <span>Vote Confirmed</span>
                    </div>
                    <div className="card-row">
                        <span>Vote ID</span>
                        <span className="card-mono">a1b2c3d4…ef90</span>
                    </div>
                    <div className="card-row">
                        <span>Block</span>
                        <span className="card-value">#4,821</span>
                    </div>
                    <div className="card-row">
                        <span>Integrity</span>
                        <span className="card-success">✓ Passed</span>
                    </div>
                    <div className="card-row">
                        <span>Privacy</span>
                        <span className="card-muted">🔒 Encrypted</span>
                    </div>
                    <div className="card-badge">⛓️ On-Chain · Hyperledger Fabric</div>
                </div>
            </section>

            {/* Stats strip */}
            <section className="stats-strip">
                {[['100%', 'Blockchain Verified'], ['0', 'Tampered Votes'], ['< 2s', 'Verification Time'], ['Public', 'Audit Trail']].map(([v, l]) => (
                    <div key={l} className="stat-item">
                        <h3>{v}</h3>
                        <p>{l}</p>
                    </div>
                ))}
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="section-label">Why trust this?</div>
                <h2 className="section-title">Built on cryptographic guarantees</h2>
                <div className="features-grid">
                    {features.map((f) => (
                        <div key={f.title} className="feature-card" style={{ '--accent': f.color }}>
                            <div className="feature-icon" style={{ background: `${f.color}20`, color: f.color }}>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="how-section">
                <div className="section-label">Simple process</div>
                <h2 className="section-title">Verify in 3 steps</h2>
                <div className="steps-grid">
                    {steps.map((s) => (
                        <div key={s.num} className="step-card">
                            <span className="step-num">{s.num}</span>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="how-cta">
                    <Link to="/verify" className="btn-primary">
                        <Search size={18} />
                        Start Verification
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-brand">
                    <span>🗳️</span>
                    <span>Election Verification Portal</span>
                </div>
                <div className="footer-links">
                    <Link to="/verify">Verify Vote</Link>
                    <Link to="/results">Results</Link>
                    <Link to="/about">About</Link>
                </div>
                <p className="footer-disclaimer">
                    Academic research prototype · Not for live elections · No data stored on this portal
                </p>
            </footer>
        </div>
    );
}

export default Home;
