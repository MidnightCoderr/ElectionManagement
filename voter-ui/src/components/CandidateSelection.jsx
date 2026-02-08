import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { electionService } from '../services/election';

const CandidateSelection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [election, setElection] = useState(null);

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        try {
            // Get current election from context/storage
            const electionId = localStorage.getItem('currentElectionId');

            const [electionData, candidatesData] = await Promise.all([
                electionService.getElection(electionId),
                electionService.getCandidates(electionId)
            ]);

            setElection(electionData);
            setCandidates(candidatesData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading candidates:', error);
            setLoading(false);
        }
    };

    const handleSelect = (candidate) => {
        setSelected(candidate);

        // Auto-advance to confirmation after 1 second
        setTimeout(() => {
            navigate('/confirm', {
                state: { candidate, election }
            });
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 border-8 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-3xl font-semibold text-gray-700">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-2">
                        {t('candidates.title')}
                    </h1>
                    <p className="text-3xl text-gray-600">
                        {election?.name}
                    </p>
                </div>
            </div>

            {/* Candidate Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {candidates.map((candidate) => (
                    <button
                        key={candidate.candidateId}
                        onClick={() => handleSelect(candidate)}
                        className={`
              relative overflow-hidden
              bg-white rounded-3xl p-10 
              border-6 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${selected?.candidateId === candidate.candidateId
                                ? 'border-green-500 shadow-2xl ring-8 ring-green-200'
                                : 'border-gray-200 hover:border-purple-300'
                            }
            `}
                    >
                        {/* Candidate Photo */}
                        <div className="flex items-start gap-8 mb-6">
                            <div className="flex-shrink-0">
                                {candidate.photoUrl ? (
                                    <img
                                        src={candidate.photoUrl}
                                        alt={candidate.name}
                                        className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-6xl">👤</span>
                                    </div>
                                )}
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1 text-left">
                                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                                    {candidate.name}
                                </h3>
                                <p className="text-2xl text-gray-600 mb-4">
                                    {candidate.party}
                                </p>
                            </div>
                        </div>

                        {/* Party Symbol (Large) */}
                        <div className="text-center mb-6">
                            <div className="inline-block bg-gray-50 rounded-3xl p-8">
                                <span className="text-9xl">{candidate.symbol}</span>
                            </div>
                            <p className="text-2xl font-semibold text-gray-700 mt-4">
                                {t('candidates.symbol')}: {candidate.symbol}
                            </p>
                        </div>

                        {/* Selection Indicator */}
                        {selected?.candidateId === candidate.candidateId && (
                            <div className="absolute top-6 right-6">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                    <span className="text-white text-4xl">✓</span>
                                </div>
                            </div>
                        )}

                        {/* Touch Target (invisible, improves accessibility) */}
                        <div className="absolute inset-0" aria-label={`Vote for ${candidate.name}`} />
                    </button>
                ))}
            </div>

            {/* Help Section */}
            <div className="max-w-7xl mx-auto mt-12 text-center">
                <button className="px-12 py-6 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                    <span className="text-3xl mr-3">🆘</span>
                    <span className="text-2xl font-semibold text-gray-700">
                        {t('common.needHelp')}
                    </span>
                </button>

                {/* Voice Instructions */}
                <div className="mt-8">
                    <button className="px-10 py-5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                        <span className="text-3xl mr-3">🔊</span>
                        <span className="text-2xl font-semibold">
                            {t('common.listenInstructions')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateSelection;
