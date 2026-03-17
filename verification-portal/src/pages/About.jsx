import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';

function About() {
    const sections = [
        {
            icon: <Shield size={28} color="#4F46E5" />,
            title: 'Blockchain-Anchored Votes',
            text: 'Every cast vote is submitted as a transaction to a permissioned Hyperledger Fabric network. Once confirmed, the record is cryptographically immutable — no administrator can alter it.'
        },
        {
            icon: <Lock size={28} color="#C9A227" />,
            title: 'Privacy by Design',
            text: 'Votes are encrypted with the election public key before being stored. The encryption key is split using Shamir\'s Secret Sharing across multiple independent parties — no single party can decrypt results alone.'
        },
        {
            icon: <Eye size={28} color="#15803D" />,
            title: 'Public Verifiability',
            text: 'Any citizen can verify their vote was counted by entering their receipt ID or scanning the QR code from their paper receipt. The system confirms existence on the blockchain without revealing who you voted for.'
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                <Link to="/" style={{ color: '#475569', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px', fontSize: '14px', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 style={{ color: '#0B1F3A', fontSize: '36px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>About This System</h1>
                <p style={{ color: '#475569', marginBottom: '40px', fontSize: '16px', lineHeight: 1.6 }}>
                    The Secure Election Management System is a research prototype demonstrating how modern cryptographic
                    and distributed ledger technologies can make elections more transparent and tamper-resistant.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', gap: '20px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                            <div style={{ flexShrink: 0, marginTop: '4px' }}>{s.icon}</div>
                            <div>
                                <h3 style={{ color: '#0F172A', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>{s.title}</h3>
                                <p style={{ color: '#475569', margin: 0, lineHeight: 1.65 }}>{s.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', marginBottom: '32px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                    <h2 style={{ color: '#0B1F3A', marginBottom: '16px', fontWeight: 700 }}>Technology Stack</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {[
                            ['Blockchain', 'Hyperledger Fabric 2.5'],
                            ['Backend', 'Node.js + Express'],
                            ['Databases', 'PostgreSQL + MongoDB'],
                            ['IoT', 'ESP32 + R307 Sensor'],
                            ['ML', 'Python + Scikit-learn'],
                            ['Encryption', 'AES-256-GCM + ZKP'],
                        ].map(([label, value]) => (
                            <div key={label} style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <p style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0', fontWeight: 600 }}>{label}</p>
                                <p style={{ color: '#0F172A', fontWeight: 600, margin: 0, fontSize: '14px' }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)', borderRadius: '12px', padding: '16px 20px' }}>
                    <p style={{ color: '#B91C1C', margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                        <strong>Disclaimer:</strong> This is an academic research prototype and is not intended for direct deployment
                        in real national elections without comprehensive legal, ethical, and security reviews by qualified authorities.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
