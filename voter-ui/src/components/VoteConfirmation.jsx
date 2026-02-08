import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { voteService } from '../services/vote';

const VoteConfirmation = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { candidate, election } = location.state || {};

    const [confirming, setConfirming] = useState(false);

    const handleConfirm = async () => {
        setConfirming(true);

        try {
            // Cast vote
            const result = await voteService.castVote({
                electionId: election.id,
                candidateId: candidate.candidateId,
                districtId: getDistrictId(),
                terminalId: getTerminalId()
            });

            if (result.success) {
                // Navigate to receipt with vote data
                navigate('/receipt', {
                    state: {
                        receipt: result.receipt,
                        candidate,
                        election
                    }
                });
            }
        } catch (error) {
            console.error('Vote casting error:', error);
            alert(t('confirmation.error'));
            setConfirming(false);
        }
    };

    const handleCancel = () => {
        navigate('/candidates');
    };

    const getDistrictId = () => {
        const voter = JSON.parse(localStorage.getItem('voter') || '{}');
        return voter.districtId;
    };

    const getTerminalId = () => {
        return localStorage.getItem('terminalId') || 'TERM-001';
    };

    if (!candidate || !election) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
                <div className="text-center mb-12">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span className="text-7xl">⚠️</span>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        {t('confirmation.title')}
                    </h1>
                    <p className="text-2xl text-gray-600">
                        {t('confirmation.subtitle')}
                    </p>
                </div>

                {/* Candidate Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-10 mb-10">
                    <div className="flex items-center gap-8">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {candidate.photoUrl ? (
                                <img
                                    src={candidate.photoUrl}
                                    alt={candidate.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-6xl">👤</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">
                                {candidate.name}
                            </h2>
                            <p className="text-2xl text-gray-700 mb-3">
                                {candidate.party}
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-5xl">{candidate.symbol}</span>
                                <span className="text-xl text-gray-600">
                                    ({t('candidates.symbol')})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Text */}
                <div className="bg-blue-50 rounded-2xl p-8 mb-10 text-center">
                    <p className="text-3xl font-semibold text-blue-900">
                        {t('confirmation.question')}
                    </p>
                </div>

                {/* Action Buttons - LARGE for accessibility */}
                <div className="grid grid-cols-2 gap-8">
                    <button
                        onClick={handleCancel}
                        disabled={confirming}
                        className="py-10 bg-red-500 text-white rounded-3xl font-bold text-3xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-6xl">✗</span>
                            <span>{t('confirmation.no')}</span>
                        </div>
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="py-10 bg-green-500 text-white rounded-3xl font-bold text-3xl hover:bg-green-600 transition-colors disabled:opacity-50 relative"
                    >
                        {confirming ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{t('confirmation.processing')}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-6xl">✓</span>
                                <span>{t('confirmation.yes')}</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Warning */}
                <div className="mt-10 text-center">
                    <p className="text-xl text-red-600 font-semibold">
                        ⚠️ {t('confirmation.warning')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoteConfirmation;
