import { useState } from 'react'
import { useVotingStore } from '../store/votingStore'
import { authenticateBiometric } from '../services/api'

export default function BiometricAuth({ onSuccess }) {
    const [scanning, setScanning] = useState(false)
    const [error, setError] = useState(null)
    const { setVoter, setError: setStoreError } = useVotingStore()

    const handleScan = async () => {
        setScanning(true)
        setError(null)

        try {
            // In production, this would communicate with the IoT terminal
            // For demo, simulating biometric capture
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Simulate biometric hash (in production, comes from terminal)
            const simulatedHash = crypto.randomUUID().replace(/-/g, '')
            const terminalId = 'TERMINAL_001'

            const response = await authenticateBiometric(simulatedHash, terminalId)

            if (response.success) {
                localStorage.setItem('voterToken', response.token)
                setVoter(response.voter)
                onSuccess(response.voter)
            } else {
                throw new Error('Authentication failed')
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Biometric authentication failed'
            setError(errorMsg)
            setStoreError(errorMsg)
        } finally {
            setScanning(false)
        }
    }

    return (
        <div className="card max-w-md mx-auto text-center">
            <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Biometric Authentication
                </h2>
                <p className="text-slate-600">
                    Place your finger on the sensor to authenticate
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-error-50 border-l-4 border-error-500 rounded">
                    <p className="text-error-700 font-medium">{error}</p>
                </div>
            )}

            <button
                onClick={handleScan}
                disabled={scanning}
                className={`btn-primary w-full ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {scanning ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scanning...
                    </span>
                ) : (
                    'Scan Fingerprint'
                )}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center text-sm text-slate-500">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Your biometric data is encrypted and never stored</span>
                </div>
            </div>
        </div>
    )
}
