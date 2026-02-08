import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';

const VoteReceipt = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { receipt, candidate, election } = location.state || {};
    const [showSuccess, setShowSuccess] = useState(true);

    useEffect(() => {
        // Show success animation for 3 seconds
        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 3000);

        // Auto-exit after 30 seconds
        const exitTimer = setTimeout(() => {
            handleExit();
        }, 30000);

        return () => {
            clearTimeout(timer);
            clearTimeout(exitTimer);
        };
    }, []);

    const handleExit = () => {
        // Clear session
        localStorage.removeItem('authToken');
        localStorage.removeItem('voter');

        // Return to welcome screen
        navigate('/');
    };

    const handlePrint = () => {
        window.print();
    };

    if (!receipt) {
        navigate('/');
        return null;
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-48 h-48 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center animate-bounce">
                        <span className="text-9xl">✓</span>
                    </div>
                    <h1 className="text-6xl font-bold text-green-600 mb-4">
                        {t('receipt.success')}
                    </h1>
                    <p className="text-3xl text-gray-700">
                        {t('receipt.successMessage')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Receipt Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 print:shadow-none">
                    {/* Header */}
                    <div className="text-center mb-10 border-b-4 border-gray-200 pb-8">
                        <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-6xl">🗳️</span>
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-2">
                            {t('receipt.title')}
                        </h1>
                        <p className="text-2xl text-gray-600">
                            {election.name}
                        </p>
                    </div>

                    {/* Receipt Details */}
                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center py-4 border-b border-gray-200">
                            <span className="text-2xl font-semibold text-gray-700">
                                {t('receipt.receiptId')}:
                            </span>
                            <span className="text-2xl font-mono font-bold text-blue-600">
                                {receipt.receiptId}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b border-gray-200">
                            <span className="text-2xl font-semibold text-gray-700">
                                {t('receipt.timestamp')}:
                            </span>
                            <span className="text-2xl text-gray-900">
                                {new Date(receipt.timestamp).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b border-gray-200">
                            <span className="text-2xl font-semibold text-gray-700">
                                {t('receipt.voteId')}:
                            </span>
                            <span className="text-xl font-mono text-gray-600">
                                {receipt.voteId.substring(0, 16)}...
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b border-gray-200">
                            <span className="text-2xl font-semibold text-gray-700">
                                {t('receipt.blockchainTx')}:
                            </span>
                            <span className="text-xl font-mono text-gray-600">
                                {receipt.blockchainTxId.substring(0, 16)}...
                            </span>
                        </div>
                    </div>

                    {/* Candidate Info (NO identification of choice) */}
                    <div className="bg-green-50 rounded-2xl p-8 mb-10 text-center">
                        <div className="text-7xl mb-4 animate-pulse">✓</div>
                        <p className="text-3xl font-bold text-green-800">
                            {t('receipt.voteRecorded')}
                        </p>
                        <p className="text-xl text-gray-600 mt-3">
                            {t('receipt.secretBallot')}
                        </p>
                    </div>

                    {/* QR Code for Verification */}
                    <div className="text-center mb-10">
                        <p className="text-2xl font-semibold text-gray-800 mb-6">
                            {t('receipt.qrCodeTitle')}
                        </p>
                        <div className="inline-block bg-white p-8 rounded-2xl shadow-lg">
                            <QRCode
                                value={receipt.qrCode}
                                size={300}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-xl text-gray-600 mt-6">
                            {t('receipt.qrCodeInstructions')}
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center gap-3">
                            <span className="text-4xl">ℹ️</span>
                            {t('receipt.importantTitle')}
                        </h3>
                        <ul className="space-y-3 text-xl text-yellow-900">
                            <li>• {t('receipt.keepSafe')}</li>
                            <li>• {t('receipt.verifyLater')}</li>
                            <li>• {t('receipt.noRevote')}</li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-8 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="py-8 bg-blue-500 text-white rounded-2xl font-bold text-3xl hover:bg-blue-600 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-5xl">🖨️</span>
                            <span>{t('receipt.print')}</span>
                        </div>
                    </button>

                    <button
                        onClick={handleExit}
                        className="py-8 bg-green-500 text-white rounded-2xl font-bold text-3xl hover:bg-green-600 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-5xl">→</span>
                            <span>{t('receipt.done')}</span>
                        </div>
                    </button>
                </div>

                {/* Auto-exit countdown */}
                <p className="text-center text-xl text-gray-600 mt-6 print:hidden">
                    {t('receipt.autoExit')}
                </p>
            </div>
        </div>
    );
};

export default VoteReceipt;
