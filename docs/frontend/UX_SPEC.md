# UX Flows & Observer Dashboard Specification

## Voter UI Flow (Low-Literacy Optimized)

### Design Principles

1. **Visual-First:** Icons and images over text
2. **Minimal Text:** Max 5 words per screen
3. **Large Touch Targets:** Min 80x80px buttons
4. **Audio Guidance:** Voice prompts in local language
5. **Progress Indicators:** Clear visual feedback
6. **Error Recovery:** Simple back/retry options

---

### Voter Flow Wireframes

**Step 1: Welcome Screen (5 seconds)**
```
┌─────────────────────────────────────┐
│                                      │
│         [Election Logo]              │
│                                      │
│     ✋ Place Finger to Start         │
│                                      │
│         [Fingerprint Icon]           │
│                                      │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  🔊 Hindi | English | Tamil    │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Time:** 5 seconds  
**Audio:** "Welcome. Place your finger on the scanner."

---

**Step 2: Biometric Scan (3-5 seconds)**
```
┌─────────────────────────────────────┐
│                                      │
│     Scanning Fingerprint...          │
│                                      │
│     ┌─────────────────────┐         │
│     │   [Animated          │         │
│     │    Fingerprint       │         │
│     │    Scanning]         │         │
│     └─────────────────────┘         │
│                                      │
│         Please Wait                  │
│                                      │
└─────────────────────────────────────┘
```
**Time:** 3-5 seconds  
**Audio:** "Scanning. Please hold still."

---

**Step 3: Authentication Success**
```
┌─────────────────────────────────────┐
│                                      │
│          ✅ Verified                 │
│                                      │
│         Welcome,                     │
│         Ramesh Kumar                 │
│                                      │
│      District: Mumbai Central        │
│                                      │
│   ┌────────────────────────────┐    │
│   │   ▶ Start Voting (5:00)    │    │
│   └────────────────────────────┘    │
│                                      │
└─────────────────────────────────────┘
```
**Time:** Auto-advance in 5 seconds  
**Audio:** "Welcome Ramesh. Tap to start voting."  
**Note:** 5-minute timeout to prevent walkaway

---

**Step 4: Candidate Selection**
```
┌─────────────────────────────────────┐
│  Choose Your Candidate              │
│  [ Progress: 1 of 1 ]               │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ [Photo]  Candidate A          │  │
│  │          Party X | Symbol 🦅  │  │
│  │          [TAP TO SELECT]      │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ [Photo]  Candidate B          │  │
│  │          Party Y | Symbol 🌸  │  │
│  │          [TAP TO SELECT]      │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ [Photo]  Candidate C          │  │
│  │          Party Z | Symbol ⭐  │  │
│  │          [TAP TO SELECT]      │  │
│  └──────────────────────────────┘  │
│                                      │
│         ◀ BACK                       │
└─────────────────────────────────────┘
```
**Features:**
- Large candidate cards (180mm high)
- Color-coded parties
- Symbols (for illiterate voters)
- Audio on hover: "Candidate A, Party X, Eagle symbol"

---

**Step 5: Vote Confirmation**
```
┌─────────────────────────────────────┐
│       Confirm Your Vote?            │
├─────────────────────────────────────┤
│                                      │
│         ┌────────────────┐          │
│         │   [Photo]      │          │
│         │                │          │
│         │  Candidate A   │          │
│         │  Party X | 🦅  │          │
│         └────────────────┘          │
│                                      │
│                                      │
│  ┌──────────────┐  ┌──────────────┐│
│  │  ✅ CONFIRM  │  │  ❌ CHANGE   ││
│  │              │  │              ││
│  └──────────────┘  └──────────────┘│
│                                      │
└─────────────────────────────────────┘
```
**Audio:** "You selected Candidate A from Party X. Confirm to cast your vote, or change to select again."

---

**Step 6: Vote Cast (2 seconds)**
```
┌─────────────────────────────────────┐
│                                      │
│                                      │
│         ✅ Vote Recorded!            │
│                                      │
│      [Checkmark Animation]           │
│                                      │
│       Processing...                  │
│                                      │
│                                      │
└─────────────────────────────────────┘
```
**Audio:** "Your vote is being recorded."

---

**Step 7: Receipt (30 seconds)**
```
┌─────────────────────────────────────┐
│      Thank You for Voting!           │
├─────────────────────────────────────┤
│   Your Vote Receipt:                 │
│                                      │
│   ┌─────────────────────────────┐   │
│   │  [QR Code]                   │   │
│   │                              │   │
│   │  Receipt #: 12ABC34          │   │
│   │  Time: 10:45 AM              │   │
│   │  Blockchain: 0xAB12...       │   │
│   └─────────────────────────────┘   │
│                                      │
│   📱 Scan to verify later            │
│                                      │
│   ┌──────────────────────┐          │
│   │   🖨 Print Receipt   │          │
│   └──────────────────────┘          │
│                                      │
│   Auto-close in 30s                  │
└─────────────────────────────────────┘
```
**Audio:** "Thank you! Save this receipt to verify your vote later."

---

### Time Requirements

| Step | Target | Maximum | Pass Criteria |
|------|--------|---------|---------------|
| 1. Welcome | 5s | 10s | ✅ Auto-advance |
| 2. Biometric | 3s | 10s | ✅ < 10s scan |
| 3. Verified | 5s | 15s | ✅ Clear message |
| 4. Select | 30s | 120s | ✅ Within 2 min |
| 5. Confirm | 10s | 30s | ✅ Clear confirm |
| 6. Cast | 2s | 5s | ✅ < 5s submit |
| 7. Receipt | 30s | 60s | ✅ Receipt shown |
| **TOTAL** | **85s** | **240s** | **✅ < 4 min** |

**Result:** Voter flow can be completed within defined time bounds ✅

---

## Accessibility Features

### 1. Screen Reader Support
```javascript
// React component
<button 
  aria-label="Confirm vote for Candidate A from Party X with Eagle symbol"
  onClick={confirmVote}
>
  ✅ CONFIRM
</button>
```

### 2. High Contrast Mode
```css
@media (prefers-contrast: high) {
  .candidate-card {
    border: 4px solid #000;
    background: #FFF;
    color: #000;
  }
}
```

### 3. Font Scaling
- Base font: 24px
- Supports 150%, 200% scaling
- Buttons: 48px minimum

### 4. Voice Guidance
```javascript
function speak(text, lang = 'hi-IN') {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;  // Slightly slower
  speechSynthesis.speak(utterance);
}
```

---

## Localization

### Supported Languages

1. **Hindi** (hi-IN) - Primary
2. **English** (en-IN)
3. **Tamil** (ta-IN)
4. **Telugu** (te-IN)
5. **Bengali** (bn-IN)
6. **Marathi** (mr-IN)

### Translation Format

```json
{
  "hi-IN": {
    "welcome": "स्वागत है",
    "place_finger": "उंगली रखें",
    "scanning": "स्कैन हो रहा है...",
    "verified": "सत्यापित",
    "select_candidate": "उम्मीदवार चुनें",
    "confirm": "पुष्टि करें",
    "thank_you": "धन्यवाद"
  },
  "en-IN": {
    "welcome": "Welcome",
    "place_finger": "Place Finger",
    "scanning": "Scanning...",
    "verified": "Verified",
    "select_candidate": "Select Candidate",
    "confirm": "Confirm",
    "thank_you": "Thank You"
  }
}
```

### Dynamic Text Rendering

```javascript
import i18n from 'i18next';

function VoterWelcome() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('place_finger')}</p>
    </div>
  );
}
```

---

## Performance Requirements

### Load Time Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| Initial Load | < 2s | < 5s |
| Page Transition | < 200ms | < 500ms |
| Biometric Auth | < 3s | < 10s |
| Vote Submit | < 2s | < 5s |
| Receipt Generate | < 1s | < 3s |

### Bundle Size

- **Voter UI:** < 500 KB (gzipped)
- **Observer Dashboard:** < 1 MB (gzipped)
- **Admin Portal:** < 2 MB (gzipped)

### Optimization Techniques

```javascript
// Code splitting
const CandidateList = lazy(() => import('./CandidateList'));

// Image optimization
<img 
  src={candidate.photo} 
  loading="lazy"
  width={150}
  height={150}
/>

// Service Worker caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('voter-ui-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        '/icons/fingerprint.svg'
      ]);
    })
  );
});
```

---

## Observer Dashboard

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Observer Dashboard | Election: General 2024 | 🔴 LIVE      │
├────────────────┬────────────────────────────────────────────┤
│  Navigation    │  Main Content                              │
│                │                                             │
│  📊 Overview   │  ┌──────────────────────────────────────┐  │
│  📈 Real-Time  │  │  Total Votes: 1,234,567              │  │
│  🚨 Alerts     │  │  Turnout: 58.3%                      │  │
│  📜 Audit Log  │  │  Active Terminals: 45,234            │  │
│  🔍 Verify     │  │  Alerts: 3 (2 High, 1 Medium)        │  │
│  📥 Export     │  └──────────────────────────────────────┘  │
│                │                                             │
│                │  ┌──────────────────────────────────────┐  │
│                │  │  Voting Rate (Last Hour)             │  │
│                │  │  [Line Chart: 0-10K votes/min]       │  │
│                │  │                                       │  │
│                │  └──────────────────────────────────────┘  │
│                │                                             │
│                │  ┌──────────────┬──────────────────────┐   │
│                │  │  By District │  By Terminal         │   │
│                │  │  [Heat Map]  │  [Status Grid]       │   │
│                │  │              │                      │   │
│                │  └──────────────┴──────────────────────┘   │
└────────────────┴────────────────────────────────────────────┘
```

---

### Vote Verification Tool

**Purpose:** Observer can verify a vote against blockchain

**UI:**
```
┌─────────────────────────────────────┐
│   Verify Vote on Blockchain         │
├─────────────────────────────────────┤
│                                      │
│  Enter Receipt Number:               │
│  ┌─────────────────────────────┐   │
│  │ 12ABC34                      │   │
│  └─────────────────────────────┘   │
│                                      │
│       OR                             │
│                                      │
│  Scan QR Code:                       │
│  ┌─────────────────────────────┐   │
│  │   [QR Scanner Active]        │   │  
│  └─────────────────────────────┘   │
│                                      │
│  ┌──────────────────────┐          │
│  │    🔍 VERIFY         │          │
│  └──────────────────────┘          │
└─────────────────────────────────────┘
```

**Verification Result:**
```
┌─────────────────────────────────────┐
│   ✅ Vote Verified                  │
├─────────────────────────────────────┤
│  Receipt: 12ABC34                    │
│  Vote ID: a1b2c3d4-...               │
│  Timestamp: 2024-03-15 10:45:23      │
│  Election: General Election 2024     │
│                                      │
│  ✅ Found on Blockchain              │
│  Block: 12,345                       │
│  TX Hash: 0xAB12CD34...              │
│  Integrity: ✅ Verified              │
│                                      │
│  District: Mumbai Central            │
│  Terminal: TERM-001                  │
│                                      │
│  ┌──────────────────────┐          │
│  │  📥 Export Proof     │          │
│  └──────────────────────┘          │
└─────────────────────────────────────┘
```

**Backend API:**
```javascript
GET /api/v1/votes/verify/:receiptId

Response:
{
  "success": true,
  "verified": true,
  "vote": {
    "voteId": "uuid",
    "timestamp": "2024-03-15T10:45:23Z",
    "blockchainTxId": "0xAB12...",
    "blockNumber": 12345,
    "districtId": "uuid",
    "terminalId": "TERM-001",
    "integrityVerified": true
  }
}
```

**Result:** Observer can verify vote against blockchain hash ✅

---

### Fraud Alert Panel

```
┌─────────────────────────────────────────┐
│   🚨 Fraud Alerts (Live)                │
├──────────┬──────────────────────────────┤
│ 2:45 PM  │ HIGH: Unusual voting spike   │
│ TERM-045 │ 150 votes in 5 minutes       │
│          │ [INVESTIGATE] [DISMISS]      │
├──────────┼──────────────────────────────┤
│ 1:30 PM  │ MEDIUM: Terminal offline     │
│ TERM-012 │ No heartbeat for 15 mins     │
│          │ [CHECK] [IGNORE]             │
├──────────┼──────────────────────────────┤
│ 12:15 PM │ HIGH: Multiple failed auth   │
│ TERM-089 │ 10 failed biometric scans    │
│          │ [REVIEW] [DISMISS]           │
└──────────┴──────────────────────────────┘
```

---

### Audit Log Viewer

```
┌───────────────────────────────────────────────────────────┐
│  Audit Log | Filter: [All] [Voting] [Security] [System]  │
├──────────┬─────────┬──────────────┬───────────────────────┤
│ Time     │ Event   │ Terminal     │ Details               │
├──────────┼─────────┼──────────────┼───────────────────────┤
│ 3:45 PM  │ VOTE    │ TERM-001     │ Vote cast, TX: 0xAB.. │
│ 3:44 PM  │ AUTH    │ TERM-001     │ Voter authenticated   │
│ 3:42 PM  │ VOTE    │ TERM-032     │ Vote cast, TX: 0x12.. │
│ 3:40 PM  │ ALERT   │ TERM-045     │ Fraud: High volume    │
│ 3:38 PM  │ VOTE    │ TERM-001     │ Vote cast, TX: 0xCD.. │
└──────────┴─────────┴──────────────┴───────────────────────┘

[◀ Prev] Page 1 of 523 [Next ▶]  [Export CSV]
```

---

## Validation Checklist

- [x] Voter UI flow defined (7 steps)
- [x] Low-literacy optimized (visual-first, minimal text)
- [x] Time bounds: < 4 minutes total ✅
- [x] Accessibility features (screen reader, high contrast, voice)
- [x] Localization (6 languages)
- [x] Performance targets (< 2s load, < 500ms transitions)
- [x] Observer dashboard layout defined
- [x] Vote verification tool specified ✅
- [x] Verification against blockchain hash ✅
- [x] Fraud alert panel designed
- [x] Audit log viewer specified

---

**Document Version:** 1.0  
**Last Updated:** February 2024  
**Status:** ✅ Complete
