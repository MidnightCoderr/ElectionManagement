import { useState } from 'react'
import { useVotingStore } from '../store/votingStore'

export default function CandidateSelector({ candidates }) {
    const { selectedCandidate, selectCandidate } = useVotingStore()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCandidates = candidates.filter(candidate =>
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="card">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Your Candidate</h2>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or party..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                />
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((candidate) => (
                    <div
                        key={candidate.candidate_id}
                        onClick={() => selectCandidate(candidate.candidate_id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCandidate === candidate.candidate_id
                                ? 'border-primary-600 bg-primary-50 shadow-lg transform scale-105'
                                : 'border-slate-300 hover:border-primary-300 hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Candidate Photo */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                                    {candidate.candidate_photo ? (
                                        <img
                                            src={candidate.candidate_photo}
                                            alt={candidate.full_name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-600">
                                            {candidate.full_name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800">
                                    {candidate.full_name}
                                </h3>
                                <p className="text-sm text-slate-600 mb-2">
                                    {candidate.party_name}
                                </p>

                                {/* Party Symbol */}
                                {candidate.party_symbol && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>Symbol:</span>
                                        <img
                                            src={candidate.party_symbol}
                                            alt="Party symbol"
                                            className="w-6 h-6"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Selection Indicator */}
                            {selectedCandidate === candidate.candidate_id && (
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredCandidates.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>No candidates found matching your search.</p>
                </div>
            )}
        </div>
    )
}
