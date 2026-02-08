import { useState, useEffect } from 'react'
import { useVotingStore } from './store/votingStore'
import BiometricAuth from './components/BiometricAuth'
import CandidateSelector from './components/CandidateSelector'
import { getCandidates, castVote, checkVoterStatus } from './services/api'

function App() {
    const {
        voter,
        isAuthenticated,
        currentElection,
        candidates,
        selectedCandidate,
        hasVoted,
        voteReceipt,
        loading,
        error,
        setCandidates,
        setVoteReceipt,
        setLoading,
        setError,
        reset,
    } = useVotingStore()

    const [step, setStep] = useState('auth') // auth, select, confirm, success

    useEffect(() => {
        if (isAuthenticated && voter) {
            loadCandidates()
            checkIfAlreadyVoted()
        }
    }, [isAuthenticated, voter])

    const loadCandidates = async () => {
        try {
            setLoading(true)
            // For demo, using hardcoded election and district
            const electionId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
            const districtId = voter?.district_id || 'd4d5fa69-2142-4e26-b7aa-8e5177a3d7bb'

            const response = await getCandidates(electionId, districtId)
            setCandidates(response.candidates || [])
            setStep('select')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load candidates')
        } finally {
            setLoading(false)
        }
    }

    const checkIfAlreadyVoted = async () => {
        try {
            const electionId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
            const status = await checkVoterStatus(voter.voterId, electionId)

            if (status.hasVoted) {
                setVoteReceipt(status.votingRecord)
                setStep('success')
            }
        } catch (err) {
            console.error('Failed to check vote status:', err)
        }
    }

    const handleAuthSuccess = (authenticatedVoter) => {
        console.log('Voter authenticated:', authenticatedVoter)
    }

    const handleContinue = () => {
        if (!selectedCandidate) {
            setError('Please select a candidate')
            return
        }
        setStep('confirm')
    }

    const handleConfirmVote = async () => {
        try {
            setLoading(true)
            setError(null)

            const voteData = {
                voterId: voter.voterId,
                electionId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                candidateId: selectedCandidate,
                district: voter.districtId,
                biometricHash: crypto.randomUUID().replace(/-/g, ''), // Simulated
                terminalId: 'TERMINAL_001',
            }

            const response = await castVote(voteData)

            setVoteReceipt(response)
            setStep('success')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cast vote')
        } finally {
            setLoading(false)
        }
    }

    const handleNewSession = () => {
        reset()
        setStep('auth')
    }

    return (
        <div className="min-h-screen py-12 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                        🗳️ Secure Election System
                    </h1>
                    <p className="text-slate-600">
                        Blockchain-Powered Voting Platform
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                {isAuthenticated && !hasVoted && (
                    <div className="mb-8 card">
                        <div className="flex items-center justify-between">
                            {['Authenticate', 'Select Candidate', 'Confirm', 'Complete'].map((stepName, index) => {
                                const stepKeys = ['auth', 'select', 'confirm', 'success']
                                const currentIndex = stepKeys.indexOf(step)
                                const isActive = index === currentIndex
                                const isComplete = index < currentIndex

                                return (
                                    <div key={stepName} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${isComplete ? 'bg-success-500 text-white' :
                                                    isActive ? 'bg-primary-600 text-white' :
                                                        'bg-slate-300 text-slate-600'
                                                }`}>
                                                {isComplete ? '✓' : index + 1}
                                            </div>
                                            <span className="text-xs mt-2 text-slate-600">{stepName}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className={`flex-1 h-1 -mt-8 ${isComplete ? 'bg-success-500' : 'bg-slate-300'
                                                }`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-error-500 bg-opacity-10 border-l-4 border-error-500 rounded">
                        <p className="text-error-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Step Content */}
                {step === 'auth' && (
                    <BiometricAuth onSuccess={handleAuthSuccess} />
                )}

                {step === 'select' && (
                    <>
                        <div className="mb-6 card bg-primary-50">
                            <h3 className="font-semibold text-primary-900">Welcome, {voter?.fullName}!</h3>
                            <p className="text-sm text-primary-700">District: {voter?.districtId}</p>
                        </div>

                        <CandidateSelector candidates={candidates} />

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleContinue}
                                disabled={!selectedCandidate || loading}
                                className="btn-primary"
                            >
                                Continue to Review
                            </button>
                        </div>
                    </>
                )}

                {step === 'confirm' && (
                    <div className="card max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                            Confirm Your Vote
                        </h2>

                        <div className="p-6 bg-slate-50 rounded-lg mb-6">
                            <p className="text-sm text-slate-600 mb-2">You are voting for:</p>
                            {candidates.filter(c => c.candidate_id === selectedCandidate).map(candidate => (
                                <div key={candidate.candidate_id} className="mt-2">
                                    <h3 className="text-xl font-bold text-slate-800">{candidate.full_name}</h3>
                                    <p className="text-slate-600">{candidate.party_name}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded mb-6">
                            <p className="text-sm text-yellow-800">
                                ⚠️ <strong>Warning:</strong> Once submitted, your vote cannot be changed. Are you sure?
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('select')}
                                className="btn-secondary flex-1"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirmVote}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Submitting...' : 'Confirm & Submit'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="card max-w-md mx-auto text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-success-500 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            Vote Cast Successfully!
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Your vote has been recorded on the blockchain
                        </p>

                        {voteReceipt && (
                            <div className="p-4 bg-slate-50 rounded-lg mb-6 text-left">
                                <h3 className="font-semibold mb-2">Vote Receipt</h3>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>Vote ID: <span className="font-mono">{voteReceipt.voteId || 'Processing...'}</span></p>
                                    <p>Timestamp: {voteReceipt.timestamp || new Date().toISOString()}</p>
                                    <p>Status: <span className="text-success-600 font-semibold">✓ Verified</span></p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleNewSession}
                            className="btn-secondary"
                        >
                            Start New Session
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-4xl mx-auto mt-12 text-center text-sm text-slate-500">
                <p>Powered by Hyperledger Fabric Blockchain</p>
                <p className="mt-1">Your vote is anonymous and secure</p>
            </div>
        </div>
    )
}

export default App
