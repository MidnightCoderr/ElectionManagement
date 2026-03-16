/**
 * i18n.js — all UI string translations for the voter terminal.
 * Supported: en-IN, hi-IN, ta-IN, te-IN, bn-IN, mr-IN
 */

export const LOCALES = [
  { code: 'en', lang: 'en-IN', label: 'EN',  name: 'English' },
  { code: 'hi', lang: 'hi-IN', label: 'हि',  name: 'हिन्दी' },
  { code: 'ta', lang: 'ta-IN', label: 'த',   name: 'தமிழ்' },
  { code: 'te', lang: 'te-IN', label: 'తె',  name: 'తెలుగు' },
  { code: 'bn', lang: 'bn-IN', label: 'বাং', name: 'বাংলা' },
  { code: 'mr', lang: 'mr-IN', label: 'म',   name: 'मराठी' },
]

export const TRANSLATIONS = {
  en: { welcome:'Welcome', place_finger:'Place Finger to Start', scanning:'Scanning Fingerprint…', please_wait:'Please Wait', verified:'Verified', start_voting:'Start Voting', select:'Choose Your Candidate', progress:'Progress', of:'of', back:'Back', confirm:'Confirm Your Vote?', confirm_btn:'Confirm', change:'Change', vote_recorded:'Vote Recorded!', processing:'Processing…', thank_you:'Thank You for Voting!', your_receipt:'Your Vote Receipt', scan_to_verify:'Scan to verify later', print_receipt:'Print Receipt', auto_close:'Auto-close in 30s', new_voter:'New Voter', district:'District', tap_to_select:'TAP' },
  hi: { welcome:'स्वागत है', place_finger:'उंगली रखें', scanning:'स्कैन हो रहा है…', please_wait:'कृपया प्रतीक्षा करें', verified:'सत्यापित', start_voting:'मतदान शुरू करें', select:'उम्मीदवार चुनें', progress:'प्रगति', of:'का', back:'वापस', confirm:'वोट पुष्टि करें?', confirm_btn:'पुष्टि करें', change:'बदलें', vote_recorded:'वोट दर्ज!', processing:'प्रक्रिया हो रही है…', thank_you:'धन्यवाद!', your_receipt:'आपकी रसीद', scan_to_verify:'बाद में सत्यापित करें', print_receipt:'रसीद प्रिंट करें', auto_close:'30 सेकंड में बंद', new_voter:'नया मतदाता', district:'जिला', tap_to_select:'चुनें' },
  ta: { welcome:'வரவேற்கிறோம்', place_finger:'விரலை வையுங்கள்', scanning:'ஸ்கேன் ஆகிறது…', please_wait:'தயவுசெய்து காத்திருங்கள்', verified:'சரிபார்க்கப்பட்டது', start_voting:'வாக்களிக்கத் தொடங்கு', select:'வேட்பாளரை தேர்ந்தெடுங்கள்', progress:'முன்னேற்றம்', of:'இல்', back:'திரும்பு', confirm:'உறுதிப்படுத்தவும்?', confirm_btn:'உறுதி', change:'மாற்று', vote_recorded:'வாக்கு பதிவாகிவிட்டது!', processing:'செயலாக்கம்…', thank_you:'வாக்களித்ததற்கு நன்றி!', your_receipt:'உங்கள் ரசீது', scan_to_verify:'பின்னர் ஸ்கேன் செய்யுங்கள்', print_receipt:'ரசீது அச்சிடு', auto_close:'30 வினாடியில் மூடும்', new_voter:'புதிய வாக்காளர்', district:'மாவட்டம்', tap_to_select:'தேர்' },
  te: { welcome:'స్వాగతం', place_finger:'వేలు పెట్టండి', scanning:'స్కాన్ అవుతోంది…', please_wait:'దయచేసి వేచి ఉండండి', verified:'ధృవీకరించబడింది', start_voting:'ఓటింగ్ ప్రారంభించు', select:'అభ్యర్థిని ఎంచుకోండి', progress:'పురోగతి', of:'లో', back:'వెనక్కి', confirm:'ఓటు నిర్ధారించాలా?', confirm_btn:'నిర్ధారించు', change:'మార్చు', vote_recorded:'ఓటు నమోదైంది!', processing:'ప్రాసెస్ అవుతోంది…', thank_you:'ధన్యవాదాలు!', your_receipt:'మీ రసీదు', scan_to_verify:'తర్వాత స్కాన్ చేయండి', print_receipt:'రసీదు ముద్రించు', auto_close:'30 సెకన్లలో మూసుకుంటుంది', new_voter:'కొత్త ఓటరు', district:'జిల్లా', tap_to_select:'ఎంచు' },
  bn: { welcome:'স্বাগতম', place_finger:'আঙুল রাখুন', scanning:'স্ক্যান হচ্ছে…', please_wait:'অনুগ্রহ করে অপেক্ষা করুন', verified:'যাচাই হয়েছে', start_voting:'ভোট শুরু করুন', select:'প্রার্থী বেছে নিন', progress:'অগ্রগতি', of:'এর', back:'ফিরে যান', confirm:'ভোট নিশ্চিত করুন?', confirm_btn:'নিশ্চিত করুন', change:'পরিবর্তন করুন', vote_recorded:'ভোট নথিভুক্ত!', processing:'প্রক্রিয়াকরণ…', thank_you:'ধন্যবাদ!', your_receipt:'আপনার রসিদ', scan_to_verify:'পরে স্ক্যান করুন', print_receipt:'রসিদ প্রিন্ট করুন', auto_close:'৩০ সেকেন্ডে বন্ধ হবে', new_voter:'নতুন ভোটার', district:'জেলা', tap_to_select:'বেছে' },
  mr: { welcome:'स्वागत आहे', place_finger:'बोट ठेवा', scanning:'स्कॅन होत आहे…', please_wait:'कृपया थांबा', verified:'सत्यापित', start_voting:'मतदान सुरू करा', select:'उमेदवार निवडा', progress:'प्रगती', of:'पैकी', back:'मागे', confirm:'मत निश्चित करायचे?', confirm_btn:'निश्चित करा', change:'बदला', vote_recorded:'मत नोंदवले!', processing:'प्रक्रिया सुरू…', thank_you:'धन्यवाद!', your_receipt:'आपली पावती', scan_to_verify:'नंतर स्कॅन करा', print_receipt:'पावती प्रिंट करा', auto_close:'30 सेकंदात बंद होईल', new_voter:'नवीन मतदार', district:'जिल्हा', tap_to_select:'निवडा' },
}

export function t(key, locale = 'en') {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key
}

export const AUDIO_MSGS = {
  1: { en:'Welcome. Please place your finger on the scanner.', hi:'स्वागत है। कृपया उंगली स्कैनर पर रखें।', ta:'வரவேற்கிறோம். விரலை ஸ்கேனரில் வையுங்கள்.', te:'స్వాగతం. వేలు స్కానర్‌పై పెట్టండి.', bn:'স্বাগতম। আঙুল স্ক্যানারে রাখুন।', mr:'स्वागत आहे. बोट स्कॅनरवर ठेवा.' },
  2: { en:'Scanning. Please hold still.', hi:'स्कैन हो रहा है। कृपया स्थिर रहें।', ta:'ஸ்கேன் ஆகிறது. அசையாதீர்கள்.', te:'స్కాన్ అవుతోంది. కదలకుండా ఉండండి.', bn:'স্ক্যান হচ্ছে। নড়বেন না।', mr:'स्कॅन होत आहे. हलू नका.' },
  3: { en:'Welcome. Tap Start Voting to proceed.', hi:'स्वागत है। मतदान शुरू करने के लिए टैप करें।', ta:'வரவேற்கிறோம். தொடர தட்டுங்கள்.', te:'స్వాగతం. కొనసాగించడానికి నొక్కండి.', bn:'স্বাগতম। চালিয়ে যেতে ট্যাপ করুন।', mr:'स्वागत आहे. पुढे जाण्यासाठी टॅप करा.' },
}
