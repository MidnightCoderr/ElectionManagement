import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, BarChart3, Info } from 'lucide-react';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <header className="hero-section">
                <div className="hero-content">
                    <h1>🗳️ Election Verification Portal</h1>
                    <p className="tagline">Independent, Transparent, Verifiable</p>
                    <p className="description">
                        Verify your vote was recorded correctly on the blockchain.<br />
                        No login required. Complete transparency.
                    </p>

                    <div className="cta-buttons">
                        <Link to="/verify" className="btn btn-primary">
                            <Search size={20} />
                            Verify My Vote
                        </Link>
                        <Link to="/results" className="btn btn-secondary">
                            <BarChart3 size={20} />
                            View Results
                        </Link>
                    </div>
                </div>
            </header>

            <section className="features-section">
                <h2>How It Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Shield size={32} />
                        </div>
                        <h3>Blockchain Verified</h3>
                        <p>
                            Every vote is recorded on an immutable blockchain ledger.
                            Once recorded, it cannot be altered or deleted.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Search size={32} />
                        </div>
                        <h3>Scan Your Receipt</h3>
                        <p>
                            Use your phone camera to scan the QR code from your voting receipt.
                            Instantly verify your vote was counted.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <BarChart3 size={32} />
                        </div>
                        <h3>Public Results</h3>
                        <p>
                            View real-time election results. All data comes directly from
                            the blockchain - no intermediaries.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Info size={32} />
                        </div>
                        <h3>Complete Privacy</h3>
                        <p>
                            Your vote choice remains encrypted. Verification only confirms
                            your vote was recorded, not who you voted for.
                        </p>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <div className="stat-item">
                    <h3>100%</h3>
                    <p>Blockchain Verified</p>
                </div>
                <div className="stat-item">
                    <h3>0</h3>
                    <p>Tampered Votes</p>
                </div>
                <div className="stat-item">
                    <h3>Public</h3>
                    <p>Audit Trail</p>
                </div>
                <div className="stat-item">
                    <h3>Instant</h3>
                    <p>Verification</p>
                </div>
            </section>

            <footer className="home-footer">
                <p>
                    This is an independent verification portal. No login required.<br />
                    Powered by blockchain technology for complete transparency.
                </p>
                <Link to="/about">About This System</Link>
            </footer>
        </div>
    );
}

export default Home;
