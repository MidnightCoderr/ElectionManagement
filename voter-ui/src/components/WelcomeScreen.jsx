import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [selectedLang, setSelectedLang] = useState('en');

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
    ];

    const handleLanguageSelect = (langCode) => {
        setSelectedLang(langCode);
        i18n.changeLanguage(langCode);

        // Auto-advance after brief delay
        setTimeout(() => {
            navigate('/biometric');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-8">
            {/* Header with Election Logo */}
            <div className="text-center mb-12">
                <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-6xl">🗳️</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                    {t('welcome.title')}
                </h1>
                <p className="text-2xl text-gray-600">
                    {t('welcome.subtitle')}
                </p>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl w-full">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
                    {t('welcome.selectLanguage')}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={`
                relative overflow-hidden
                p-8 rounded-2xl border-4 transition-all duration-300
                hover:scale-105 hover:shadow-xl
                ${selectedLang === lang.code
                                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-orange-300'
                                }
              `}
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-3">{lang.flag}</div>
                                <div className="text-2xl font-semibold text-gray-800">
                                    {lang.name}
                                </div>
                            </div>

                            {/* Selection indicator */}
                            {selectedLang === lang.code && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">✓</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Help Button */}
            <button className="mt-8 px-8 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-2xl mr-2">🆘</span>
                <span className="text-xl font-semibold text-gray-700">
                    {t('welcome.needHelp')}
                </span>
            </button>
        </div>
    );
};

export default WelcomeScreen;
