import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Search, CheckCircle, XCircle, ArrowLeft, Camera } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import blockchainService from '../services/blockchainService';
import './VerifyReceipt.css';

function VerifyReceipt() {
    const [mode, setMode] = useState('choose'); // choose, scan, manual
    const [voteId, setVoteId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleQRScan = async (data) => {
        if (data) {
            try {
                // Parse QR code data (format: vote_id|zkp_commitment|timestamp)
                const parts = data.split('|');
                const scannedVoteId = parts[0];

                await verifyVote(scannedVoteId);
            } catch (err) {
                setError('Invalid QR code format');
            }
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (voteId.trim()) {
            await verifyVote(voteId.trim());
        }
    };

    const verifyVote = async (id) => {
        setLoading(true);
        setError('');
        setVerificationResult(null);

        try {
            // Query blockchain for vote
            const result = await blockchainService.verifyVote(id);

            setVerificationResult(result);

            // Scroll to result
            setTimeout(() => {
                document.getElementById('result-section')?.scrollIntoView({
                    behavior: 'smooth'
                });
            }, 100);
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Failed to verify vote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetVerification = () => {
        setMode('choose');
        setVoteId('');
        setVerificationResult(null);
        setError('');
    };

    return (
        <div className="verify-container">
            <header className="verify-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>
                <h1>Verify Your Vote</h1>
                <p>Choose how you want to verify your vote:</p>
            </header>

            {mode === 'choose' && (
                <div className="mode-selection">
                    <button className="mode-button" onClick={() => setMode('scan')}>
                        <Camera size={48} />
                        <h3>Scan QR Code</h3>
                        <p>Use your camera to scan the receipt</p>
                    </button>

                    <button className="mode-button" onClick={() => setMode('manual')}>
                        <Search size={48} />
                        <h3>Enter Vote ID</h3>
                        <p>Manually type your vote ID</p>
                    </button>
                </div>
            )}

            {mode === 'scan' && (
                <div className="scan-section">
                    <button className="change-mode-btn" onClick={resetVerification}>
                        ← Change Method
                    </button>

                    <div className="scanner-container">
                        <h3>Position QR Code in Frame</h3>
                        <QRScanner onScan={handleQRScan} />
                    </div>
                </div>
            )}

            {mode === 'manual' && (
                <div className="manual-section">
                    <button className="change-mode-btn" onClick={resetVerification}>
                        ← Change Method
                    </button>

                    <form onSubmit={handleManualSubmit} className="manual-form">
                        <label htmlFor="vote-id">Enter Your Vote ID:</label>
                        <input
                            id="vote-id"
                            type="text"
                            value={voteId}
                            onChange={(e) => setVoteId(e.target.value)}
                            placeholder="e.g., a1b2c3d4-e5f6-7890-abcd-1234567890ab"
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Vote'}
                        </button>
                    </form>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <XCircle size={20} />
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Verifying on blockchain...</p>
                </div>
            )}

            {verificationResult && (
                <div id="result-section" className="result-section">
                    {verificationResult.verified ? (
                        <div className="result-card success">
                            <div className="result-icon">
                                <CheckCircle size={64} />
                            </div>
                            <h2>✅ Vote Verified!</h2>
                            <p className="result-message">
                                Your vote was successfully recorded on the blockchain
                            </p>

                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="label">Vote ID:</span>
                                    <span className="value">{verificationResult.voteId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Election:</span>
                                    <span className="value">{verificationResult.electionName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Timestamp:</span>
                                    <span className="value">
                                        {new Date(verificationResult.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Block Number:</span>
                                    <span className="value">#{verificationResult.blockNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Transaction Hash:</span>
                                    <span className="value monospace">
                                        {verificationResult.txHash}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Integrity Check:</span>
                                    <span className="value success-text">✓ Passed</span>
                                </div>
                            </div>

                            <div className="privacy-notice">
                                🔒 Your vote choice remains confidential and encrypted
                            </div>
                        </div>
                    ) : (
                        <div className="result-card error">
                            <div className="result-icon">
                                <XCircle size={64} />
                            </div>
                            <h2>❌ Vote Not Found</h2>
                            <p className="result-message">
                                This vote ID was not found on the blockchain
                            </p>
                            <p>Please check your Vote ID and try again.</p>
                        </div>
                    )}

                    <button className="verify-another-btn" onClick={resetVerification}>
                        Verify Another Vote
                    </button>
                </div>
            )}
        </div>
    );
}

export default VerifyReceipt;
