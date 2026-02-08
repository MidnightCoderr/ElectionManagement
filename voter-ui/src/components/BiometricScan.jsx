import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const BiometricScan = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState('ready'); // ready, scanning, success, error
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Automatically start scanning after 2 seconds
        const timer = setTimeout(() => {
            startScan();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const startScan = async () => {
        setScanning(true);
        setStatus('scanning');
        setError('');

        try {
            // Simulate biometric scan (in production, this would interface with fingerprint sensor)
            await simulateBiometricScan();

            // Authenticate with backend
            const result = await authService.biometricAuth({
                biometricHash: generateMockBiometricHash(),
                terminalId: getTerminalId()
            });

            if (result.success) {
                setStatus('success');

                // Store auth token
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('voter', JSON.stringify(result.voter));

                // Navigate to candidate selection after brief success display
                setTimeout(() => {
                    navigate('/candidates');
                }, 1500);
            } else {
                handleError(result.error);
            }

        } catch (err) {
            handleError(err.message || 'Authentication failed');
        }
    };

    const handleError = (errorMsg) => {
        setStatus('error');
        setError(errorMsg);
        setRetryCount(prev => prev + 1);
        setScanning(false);

        // Show error for 3 seconds, then allow retry
        setTimeout(() => {
            if (retryCount < 3) {
                setStatus('ready');
            } else {
                // Too many failed attempts
                setError(t('biometric.tooManyAttempts'));
            }
        }, 3000);
    };

    const simulateBiometricScan = () => {
        return new Promise(resolve => {
            setTimeout(resolve, 3000); // 3 second scan
        });
    };

    const generateMockBiometricHash = () => {
        // In production, this comes from actual fingerprint sensor
        return 'a'.repeat(64); // Mock SHA-256 hash
    };

    const getTerminalId = () => {
        return localStorage.getItem('terminalId') || 'TERM-001';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">
                {/* Status Indicator */}
                <div className="text-center mb-12">
                    {status === 'ready' && (
                        <>
                            <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <span className="text-7xl">👆</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                {t('biometric.ready')}
                            </h2>
                            <p className="text-2xl text-gray-600">
                                {t('biometric.placeFingerInstructions')}
                            </p>
                        </>
                    )}

                    {status === 'scanning' && (
                        <>
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                                <span className="text-7xl">🔍</span>
                            </div>
                            <h2 className="text-4xl font-bold text-blue-600 mb-4">
                                {t('biometric.scanning')}
                            </h2>
                            <p className="text-2xl text-gray-600">
                                {t('biometric.pleaseWait')}
                            </p>

                            {/* Progress Animation */}
                            <div className="mt-8">
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full animate-progress"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <span className="text-7xl">✓</span>
                            </div>
                            <h2 className="text-4xl font-bold text-green-600 mb-4">
                                {t('biometric.success')}
                            </h2>
                            <p className="text-2xl text-gray-600">
                                {t('biometric.verified')}
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-32 h-32 bg-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <span className="text-7xl">✗</span>
                            </div>
                            <h2 className="text-4xl font-bold text-red-600 mb-4">
                                {t('biometric.failed')}
                            </h2>
                            <p className="text-2xl text-red-500 mb-6">
                                {error || t('biometric.notRecognized')}
                            </p>

                            {retryCount < 3 && (
                                <button
                                    onClick={startScan}
                                    className="px-12 py-6 bg-blue-500 text-white text-2xl font-semibold rounded-2xl hover:bg-blue-600 transition-colors"
                                >
                                    {t('biometric.tryAgain')} ({3 - retryCount} {t('biometric.remaining')})
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Help Button */}
                <div className="text-center">
                    <button className="px-8 py-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <span className="text-2xl mr-2">🆘</span>
                        <span className="text-xl font-semibold text-gray-700">
                            {t('common.needHelp')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BiometricScan;
