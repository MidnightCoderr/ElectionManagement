import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    en: {
        translation: {
            welcome: {
                title: 'Welcome to Voting',
                subtitle: 'Your Voice Matters',
                selectLanguage: 'Select Your Language',
                needHelp: 'Need Help?'
            },
            biometric: {
                ready: 'Place Your Finger',
                placeFingerInstructions: 'Place your finger on the scanner',
                scanning: 'Scanning...',
                pleaseWait: 'Please hold still',
                success: 'Verified!',
                verified: 'Identity confirmed',
                failed: 'Verification Failed',
                notRecognized: 'Fingerprint not recognized',
                tryAgain: 'Try Again',
                remaining: 'attempts remaining',
                tooManyAttempts: 'Too many failed attempts. Please call for help.'
            },
            candidates: {
                title: 'Select Your Candidate',
                symbol: 'Symbol'
            },
            confirmation: {
                title: 'Confirm Your Vote',
                subtitle: 'Please review carefully',
                question: 'Are you sure you want to vote for this candidate?',
                yes: 'Yes, Confirm',
                no: 'No, Go Back',
                processing: 'Processing...',
                warning: 'You cannot change your vote after confirmation',
                error: 'Failed to cast vote. Please try again.'
            },
            receipt: {
                success: 'Vote Cast Successfully!',
                successMessage: 'Your vote has been recorded',
                title: 'Vote Receipt',
                receiptId: 'Receipt ID',
                timestamp: 'Time',
                voteId: 'Vote ID',
                blockchainTx: 'Blockchain TX',
                voteRecorded: 'Your Vote Was Recorded',
                secretBallot: 'Your choice is secret and encrypted',
                qrCodeTitle: 'Scan to Verify Your Vote',
                qrCodeInstructions: 'Use this QR code to verify your vote later',
                importantTitle: 'Important Information',
                keepSafe: 'Keep this receipt safe',
                verifyLater: 'You can verify your vote using the QR code',
                noRevote: 'You cannot vote again in this election',
                print: 'Print Receipt',
                done: 'Done',
                autoExit: 'Screen will reset in 30 seconds'
            },
            common: {
                loading: 'Loading...',
                needHelp: 'Need Help?',
                listenInstructions: 'Listen to Instructions'
            }
        }
    },
    hi: {
        translation: {
            welcome: {
                title: 'मतदान में आपका स्वागत है',
                subtitle: 'आपकी आवाज़ मायने रखती है',
                selectLanguage: 'अपनी भाषा चुनें',
                needHelp: 'मदद चाहिए?'
            },
            biometric: {
                ready: 'अपनी उंगली रखें',
                placeFingerInstructions: 'स्कैनर पर अपनी उंगली रखें',
                scanning: 'स्कैन हो रहा है...',
                pleaseWait: 'कृपया प्रतीक्षा करें',
                success: 'सत्यापित!',
                verified: 'पहचान की पुष्टि',
                failed: 'सत्यापन विफल',
                notRecognized: 'फिंगरप्रिंट पहचाना नहीं गया',
                tryAgain: 'पुनः प्रयास करें',
                remaining: 'प्रयास शेष',
                tooManyAttempts: 'बहुत सारे असफल प्रयास। कृपया मदद के लिए कॉल करें।'
            },
            candidates: {
                title: 'अपना उम्मीदवार चुनें',
                symbol: 'चिन्ह'
            },
            confirmation: {
                title: 'अपने वोट की पुष्टि करें',
                subtitle: 'कृपया ध्यान से समीक्षा करें',
                question: 'क्या आप निश्चित हैं कि आप इस उम्मीदवार को वोट देना चाहते हैं?',
                yes: 'हाँ, पुष्टि करें',
                no: 'नहीं, वापस जाएं',
                processing: 'प्रसंस्करण...',
                warning: 'पुष्टि के बाद आप अपना वोट नहीं बदल सकते',
                error: 'वोट डालने में विफल। कृपया पुनः प्रयास करें।'
            },
            receipt: {
                success: 'वोट सफलतापूर्वक डाला गया!',
                successMessage: 'आपका वोट दर्ज किया गया है',
                title: 'वोट रसीद',
                receiptId: 'रसीद आईडी',
                timestamp: 'समय',
                voteId: 'वोट आईडी',
                blockchainTx: 'ब्लॉकचेन TX',
                voteRecorded: 'आपका वोट दर्ज किया गया',
                secretBallot: 'आपकी पसंद गुप्त और एन्क्रिप्टेड है',
                qrCodeTitle: 'अपना वोट सत्यापित करने के लिए स्कैन करें',
                qrCodeInstructions: 'बाद में अपने वोट को सत्यापित करने के लिए इस QR कोड का उपयोग करें',
                importantTitle: 'महत्वपूर्ण जानकारी',
                keepSafe: 'इस रसीद को सुरक्षित रखें',
                verifyLater: 'आप QR कोड का उपयोग करके अपने वोट को सत्यापित कर सकते हैं',
                noRevote: 'आप इस चुनाव में फिर से वोट नहीं दे सकते',
                print: 'रसीद प्रिंट करें',
                done: 'पूर्ण',
                autoExit: 'स्क्रीन 30 सेकंड में रीसेट हो जाएगी'
            },
            common: {
                loading: 'लोड हो रहा है...',
                needHelp: 'मदद चाहिए?',
                listenInstructions: 'निर्देश सुनें'
            }
        }
    },
    // Add more languages: ta, te, bn, mr (abbreviated for brevity)
    ta: {
        translation: {
            welcome: {
                title: 'வாக்களிப்பதற்கு வரவேற்கிறோம்',
                subtitle: 'உங்கள் குரல் முக்கியம்',
                selectLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
                needHelp: 'உதவி தேவையா?'
            }
            // Add full translations...
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
