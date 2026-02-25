# Election Management System — Complete Architecture Specification

## Overview

The Election Management System is a cryptographically secure, real-time, multi-component platform for conducting tamper-evident elections. It integrates a blockchain-anchored vote ledger, biometric voter authentication, IoT voting terminals, real-time ML fraud detection, and multiple role-based user interfaces.

---

## Top-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACES (Frontends)                         │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│   Voter UI       │   Admin Portal   │ Observer Dashboard│ Verification Portal│
│   (React/Vite)   │   (React/Vite)   │   (React/Vite)   │   (React/Vite)     │
│   Port 5173      │   Port 5174      │   Port 5175      │   Port 5176        │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬───────────┘
         │                  │                   │                  │
         └──────────────────┴───────────────────┴──────────────────┘
                                     │
                            HTTPS / REST API
                                     │
         ┌───────────────────────────▼──────────────────────────┐
         │              Backend API (Node.js / Express)          │
         │              Port 3000                                │
         │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
         │  │  Auth   │ │  Routes  │ │ Services │ │   DB    │  │
         │  │ Module  │ │  Layer   │ │  Layer   │ │  Layer  │  │
         │  └─────────┘ └──────────┘ └──────────┘ └─────────┘  │
         └──────┬────────────┬───────────────┬──────────────────┘
                │            │               │
         ┌──────▼─────┐ ┌───▼────┐  ┌───────▼──────────┐
         │  MongoDB   │ │ Fabric │  │   ML Service      │
         │  + Postgres│ │  SDK  │  │   (Python/Flask)  │
         └──────┬─────┘ └───┬────┘  └───────┬──────────┘
                │            │               │
         ┌──────▼──────┐ ┌──▼─────────────┐ │
         │  Databases  │ │   Hyperledger  │ │
         │  (Storage)  │ │   Fabric Chain │ │
         └─────────────┘ └────────────────┘ │
                                             │
         ┌───────────────────────────────────┘
         │
         │      MQTT Broker (Mosquitto)
         │      ┌──────────────────────┐
         └─────►│  IoT Terminal Layer  │
                │  (ESP32 + Raspberry  │
                │   Pi per terminal)   │
                └──────────────────────┘
```

---

## Module 1 — Voter UI (`voter-ui/`)

The kiosk-mode touchscreen interface a voter uses to cast their ballot.

```
                    ┌────────────────────────────┐
                    │       Voter Approaches      │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │       WelcomeScreen.jsx      │
                    │  (Step 1: Select language,  │
                    │   enter voter NID)          │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │   BiometricAuth.jsx /        │
                    │   BiometricScan.jsx          │
                    │  (Step 2: Fingerprint scan, │
                    │   verify via backend)       │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │   CandidateSelection.jsx     │
                    │   CandidateSelector.jsx      │
                    │  (Step 3: Ballot display,   │
                    │   pick a candidate)         │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │   VoteConfirmation.jsx       │
                    │  (Step 4: "Are you sure?"   │
                    │   final confirmation)       │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │   VoteReceipt.jsx            │
                    │  (Step 5: Show cryptographic│
                    │   receipt + QR code)        │
                    └────────────────────────────┘

  Services Layer:
  ├── api.js        →  Base Axios client (headers, base URL)
  ├── auth.js       →  POST /auth/biometric
  ├── election.js   →  GET /elections/:id/candidates
  └── vote.js       →  POST /votes (encrypted ballot)

  State:
  └── store/        →  Zustand/Context: voter session, selected candidate
```

---

## Module 2 — Admin Portal (`admin-portal/`)

Web dashboard for election officials to manage and monitor elections.

```
                    ┌──────────────────────────┐
                    │        Login.jsx          │
                    │  (JWT auth via backend)  │
                    └─────────────┬────────────┘
                                  │  Auth token
                    ┌─────────────▼────────────┐
                    │       App.jsx (Router)    │
                    └─────┬─────────┬──────────┘
                          │         │
              ┌───────────▼─┐   ┌───▼──────────────────────────┐
              │  Sidebar.jsx│   │         Dashboard.jsx          │
              │  Navigation │   │                               │
              │  ├ Elections│   │  ┌────────────┬────────────┐  │
              │  ├ Candidates│  │  │  Election  │ Live Vote  │  │
              │  ├ Results   │  │  │  Controls  │   Stats    │  │
              │  └ Audit    │   │  ├────────────┼────────────┤  │
              └─────────────┘   │  │ Candidate  │ Fraud Alert│  │
                                │  │ Management │   Panel    │  │
                                │  └────────────┴────────────┘  │
                                └───────────────────────────────┘
```

---

## Module 3 — Observer Dashboard (`observer-dashboard/`)

Read-only real-time monitoring for auditors, media, and election observers.

```
                    ┌──────────────────────────────────┐
                    │           App.jsx                 │
                    │                                   │
                    │  ┌─────────────────────────────┐ │
                    │  │   Live Vote Count Graph      │ │
                    │  ├─────────────────────────────┤ │
                    │  │   Turnout by District Map    │ │
                    │  ├─────────────────────────────┤ │
                    │  │   Terminal Health Status     │ │
                    │  ├─────────────────────────────┤ │
                    │  │   ML Fraud Alert Feed        │ │
                    │  └─────────────────────────────┘ │
                    │                                   │
                    │  [READ ONLY — No controls]        │
                    └──────────────────────────────────┘

  Polling: GET /api/results/:id  (every 30s)
           GET /api/alerts       (every 10s)
           GET /api/terminals    (every 15s)
```

---

## Module 4 — Verification Portal (`verification-portal/`)

Public portal for any citizen to confirm their vote was recorded correctly.

```
                    ┌──────────────────────────────────┐
                    │   Home.jsx                        │
                    │   "Verify your vote was counted"  │
                    └──────────────┬───────────────────┘
                                   │  Enter receipt ID
                    ┌──────────────▼───────────────────┐
                    │   VerifyReceipt.jsx               │
                    │                                   │
                    │   Input: [Receipt ID / QR scan]   │
                    │                                   │
                    │          ┌───────────┐            │
                    │   POST   │  Backend  │ Blockchain │
                    │ ────────►│  API      │◄─────────  │
                    │          └───────────┘            │
                    │                                   │
                    │   ✅ "Vote confirmed on block #N" │
                    │   ❌ "Receipt not found"          │
                    └──────────────────────────────────┘
```

---

## Module 5 — Backend API (`backend/`)

Central server. All frontends and IoT terminals communicate through this.

```
┌─────────────────────────────────────────────────────────────────┐
│                     server.js (Entry Point)                      │
│                     Port 3000                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────▼──────────────────────┐
         │              Middleware Layer             │
         │  ┌─────────────────────────────────────┐ │
         │  │ auth.middleware.js  (JWT validation) │ │
         │  │ macFilter.middleware.js (IP/MAC ACL) │ │
         │  │ rateLimit.middleware.js (throttle)   │ │
         │  └─────────────────────────────────────┘ │
         └──────────────────┬──────────────────────┘
                            │
         ┌──────────────────▼──────────────────────┐
         │               Routes Layer               │
         │  ┌──────────────────────────────────┐   │
         │  │ auth.routes.js    POST /login     │   │
         │  │                   POST /register  │   │
         │  │ voter.routes.js   GET  /voters    │   │
         │  │                   POST /voters    │   │
         │  │ election.routes.js POST /elections│   │
         │  │                   GET  /elections │   │
         │  │ candidate.routes.js CRUD /candidates  │
         │  │ vote.routes.js    POST /votes     │   │
         │  │ results.routes.js GET  /results   │   │
         │  │ audit.routes.js   GET  /audit-logs│   │
         │  └──────────────────────────────────┘   │
         └──────────────────┬──────────────────────┘
                            │
         ┌──────────────────▼──────────────────────┐
         │              Services Layer              │
         │                                          │
         │  voteService.js   ─────────────────────► fabricService.js
         │     │ Encrypt ballot (ZKP)               │   │
         │     │ Submit to blockchain               │   ▼
         │     │ Store receipt                      │  Hyperledger Fabric
         │     │                                    │
         │  biometricAuthService.js                 │
         │     │ Verify fingerprint hash            │
         │     ▼                                    │
         │  encryptionService.js                    │
         │     │ RSA/AES ballot encryption          │
         │     │                                    │
         │  zkpService.js                           │
         │     │ Zero-knowledge proofs              │
         │     │                                    │
         │  resultsService.js                       │
         │     │ Tally + decrypt results            │
         │     │                                    │
         │  iotService.js                           │
         │     │ Send/receive MQTT to terminals     │
         │     │                                    │
         │  disputeService.js                       │
         │     │ Create/resolve voter disputes      │
         │     │                                    │
         │  keyCeremony/ceremonyService.py          │
         │     │ Multi-party key generation         │
         │     ▼                                    │
         │  keyCeremony/shamirs.py                  │
         │     Shamir's Secret Sharing (M-of-N)     │
         └──────────────────┬──────────────────────┘
                            │
         ┌──────────────────▼──────────────────────┐
         │              Database Layer              │
         │  ┌────────────────┐  ┌────────────────┐ │
         │  │   MongoDB       │  │  PostgreSQL     │ │
         │  │                │  │                │ │
         │  │  Models:        │  │  schema.sql     │ │
         │  │  voter.model   │  │  (relational   │ │
         │  │  election.model│  │   tables for   │ │
         │  │  candidate.model│ │   audit trail) │ │
         │  │  votingRecord  │  │                │ │
         │  │  auditLog      │  │  migrate.js     │ │
         │  │  Dispute       │  │  (auto-migrate) │ │
         │  └────────────────┘  └────────────────┘ │
         └─────────────────────────────────────────┘
```

---

## Module 6 — Blockchain (`blockchain/`)

Every vote is recorded as an immutable Hyperledger Fabric transaction.

```
┌──────────────────────────────────────────────────────────┐
│              Hyperledger Fabric Network                   │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                  │
│  │  Peer Node   │      │  Peer Node   │                  │
│  │  Org1        │      │  Org2        │                  │
│  └──────┬───────┘      └──────┬───────┘                  │
│         │                     │                          │
│         └──────────┬──────────┘                          │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │     Orderer Node    │                          │
│         └──────────┬──────────┘                          │
│                    │                                      │
│         ┌──────────▼──────────────────────────────┐      │
│         │    Channel: election-channel             │      │
│         │                                          │      │
│         │    Chaincode: voting.go                  │      │
│         │    ┌──────────────────────────────────┐  │      │
│         │    │ CastVote(proof, encryptedBallot)  │  │      │
│         │    │   → validates ZKP                 │  │      │
│         │    │   → stores encrypted ballot       │  │      │
│         │    │   → returns receipt hash          │  │      │
│         │    │                                   │  │      │
│         │    │ GetVote(receiptId)                 │  │      │
│         │    │   → returns vote record           │  │      │
│         │    │                                   │  │      │
│         │    │ GetResults(electionId)             │  │      │
│         │    │   → returns encrypted tally       │  │      │
│         │    │                                   │  │      │
│         │    │ VerifyReceipt(receiptHash)         │  │      │
│         │    │   → confirms vote existence       │  │      │
│         │    └──────────────────────────────────┘  │      │
│         └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘

  Files:
  chaincode/voting/voting.go        ← Smart contract (core logic)
  chaincode/voting/voting_test.go   ← Unit tests
  chaincode/voting/lib/             ← Helper libs
  network/                          ← Peer/orderer topology
  config/                           ← Crypto material
  scripts/                          ← start.sh / stop.sh / reset.sh
```

---

## Module 7 — IoT Terminal (`iot-terminal/`)

The physical voting machine. Two layers: C++ firmware on ESP32 + Python on Raspberry Pi.

```
┌─────────────────────────────────────────────────────────────┐
│                  Physical Voting Terminal                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ESP32 Microcontroller (C++ Firmware)                │  │
│  │                                                      │  │
│  │  main.cpp  ─── State Machine:                        │  │
│  │                                                      │  │
│  │  [IDLE] ──► [SCAN] ──► [VERIFY] ──► [VOTE] ──► [DONE]  │
│  │                                                      │  │
│  │  BiometricHandler.cpp   ← Drives R307 sensor        │  │
│  │  NetworkManager.cpp     ← WiFi + MQTT connect       │  │
│  │  OfflineCache.cpp       ← Store votes if offline    │  │
│  │  TamperDetection.cpp    ← Physical tamper sensors   │  │
│  │  config.h               ← Pins, credentials         │  │
│  └─────────────────────┬────────────────────────────── ┘  │
│                        │  Serial / GPIO                    │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │  Raspberry Pi (Python Layer)                         │  │
│  │                                                      │  │
│  │  terminal_main.py   ← Main orchestration loop       │  │
│  │  mqtt_client.py     ← MQTT broker relay              │  │
│  │  config.json        ← Terminal ID, broker URL       │  │
│  │  sensor/r307_driver.py   ← Fingerprint driver       │  │
│  │  printer/vvpat_printer.py ← Paper receipt printer   │  │
│  └─────────────────────┬────────────────────────────── ┘  │
│                        │                                   │
└────────────────────────┼───────────────────────────────────┘
                         │  MQTT over WiFi
                    ┌────▼────────────┐
                    │ Mosquitto Broker │
                    └────┬────────────┘
                         │
                    ┌────▼────────────┐
                    │  Backend API    │
                    │  iotService.js  │
                    └─────────────────┘

  MQTT Topics:
  terminal/{id}/status     → heartbeat + health
  terminal/{id}/vote       → encrypted vote submission
  terminal/{id}/command    → admin commands (lock, unlock)
  terminal/{id}/alert      → tamper detection events
```

---

## Module 8 —  Fraud Detection Service (`ml-service/`)

Real-time fraud detection microservice. Watches every vote event and scores it.

```
┌─────────────────────────────────────────────────────────┐
│             Data Sources (Inputs)                       │
├──────────────┬──────────────┬──────────────────────────┤
│  Vote Events │  Auth Logs   │  Terminal Health (MQTT)  │
│  (MongoDB)   │  (MongoDB)   │                          │
└───────┬──────┴──────┬───────┴────────────┬─────────────┘
        │             │                    │
        └─────────────┴────────────────────┘
                            │
        ┌───────────────────▼──────────────┐
        │   monitor.py                     │
        │   (Polling loop — polls DB       │
        │    every N seconds, feeds        │
        │    events downstream)            │
        └───────────────────┬──────────────┘
                            │
        ┌───────────────────▼──────────────┐
        │   fraud_detector.py              │
        │   (ML Ensemble)                  │
        │   ├─ Isolation Forest            │
        │   │   anomaly_detector.pkl       │
        │   ├─ XGBoost                     │
        │   │   fraud_detector.xgb         │
        │   └─ LSTM Rate Predictor         │
        │       rate_predictor.h5          │
        └───────────────────┬──────────────┘
                            │  fraud score + confidence
        ┌───────────────────▼──────────────┐
        │   alert_service.py               │
        │   (Threshold enforcement)        │
        │   ├─ Score > threshold → Alert   │
        │   ├─ Write alert to MongoDB      │
        │   └─ POST to backend /alerts     │
        └───────────────────┬──────────────┘
                            │
        ┌───────────────────▼──────────────┐
        │   api.py  (Flask REST API)       │
        │   GET  /health                   │
        │   POST /score   (event → score)  │
        │   GET  /alerts  (pending alerts) │
        └──────────────────────────────────┘

  Consumed by:
  └── Observer Dashboard  (alert feed)
  └── Admin Portal        (fraud panel)
  └── Backend API         (real-time scoring on vote submit)
```

---

## Module 9 — Infrastructure (`infrastructure/`)

All deployment, containerization, and orchestration configuration.

```
┌──────────────────────────────────────────────────────────┐
│              docker-compose.yml  (Local Dev)             │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  backend   │  │  voter-ui  │  │   admin-portal     │ │
│  │  :3000     │  │  :5173     │  │   :5174            │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ observer   │  │verification│  │  ml-service        │ │
│  │ :5175      │  │ :5176      │  │  :8000             │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  MongoDB   │  │ PostgreSQL │  │  Mosquitto MQTT    │ │
│  │  :27017    │  │  :5432     │  │  :1883             │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐  │
│  │   Hyperledger Fabric (peer0, orderer)              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

  Docker Images:
  ├── Dockerfile.backend   → Node.js Alpine image
  ├── Dockerfile.frontend  → nginx (serves built React)
  ├── Dockerfile.ml        → Python 3.11 + ML deps
  └── mosquitto.conf       → MQTT broker config

  Kubernetes (Production):
  └── kubernetes/backend-deployment.yaml
      → Deployment (3 replicas) + Service + HPA

  Monitoring:
  └── monitoring/          → Prometheus + Grafana configs

  Terraform:
  └── terraform/           → Cloud VM / VPC provisioning
```

---

## Module 10 — Scripts (`scripts/`)

```
  scripts/simulation/
  ├── simulate-election.py      ← Generates synthetic voters, cast votes,
  │                               injects configurable fraud scenarios
  ├── simulation-config.json   ← N voters, N candidates, fraud rate
  └── requirements.txt         ← Python deps (requests, faker, etc.)
```

---

## Full Data Flow — Vote Casting

```
Voter arrives at terminal
        │
        ▼
[IoT] ESP32 → detect approach (IR sensor)
        │
        ▼
[IoT] R307 fingerprint sensor → capture print
        │   MQTT: terminal/T001/vote
        ▼
[MQTT] Mosquitto broker
        │
        ▼
[Backend] iotService.js receives fingerprint
        │
        ▼
[Backend] biometricAuthService.js
        │   hash fingerprint
        │   compare against voter.model (MongoDB)
        │
        ├─── ❌ No match → MQTT lock terminal → Log to auditLog
        │
        └─── ✅ Match → voter marked eligible
                │
                ▼
        [Voter UI] CandidateSelection displayed
                │   voter selects candidate
                ▼
        [Voter UI] VoteConfirmation → voter confirms
                │
                ▼
        [Voter UI] vote.js → POST /api/votes
                │   { electionId, candidateId, terminalId }
                ▼
        [Backend] vote.routes.js → voteService.js
                │
                ▼
        [Backend] zkpService.js
                │   generate zero-knowledge proof
                │   (proves vote is valid without revealing candidate)
                │
                ▼
        [Backend] encryptionService.js
                │   encrypt ballot with election public key (RSA)
                │
                ▼
        [Backend] fabricService.js
                │   call: CastVote(proof, encryptedBallot)
                ▼
        [Blockchain] voting.go chaincode
                │   validate ZKP ✅
                │   store encrypted ballot
                │   return: TX ID + receipt hash
                │
                ▼
        [Backend] store votingRecord (MongoDB)
                │   { voterId hash, txId, receiptHash, timestamp }
                │
                ▼
        [Backend] forward event to ML service
                │   POST ml-service/score
                ▼
        [ML] fraud_detector.py scores event
                │   score < threshold ✅  → continue
                │   score > threshold ❌  → alert_service.py fires alert
                │
                ▼
        [Backend] return receipt to Voter UI
                │
                ▼
        [Voter UI] VoteReceipt.jsx displays QR + hash
                │
                ▼
        [IoT] vvpat_printer.py prints paper receipt
```

---

## Full Data Flow — Results Decryption

```
Election closed (Admin Portal)
        │
        ▼
[Backend] election.routes.js → PATCH /elections/:id/end
        │
        ▼
[Backend] keyCeremony/ceremonyService.py
        │   M-of-N key holders present their shares
        │   shamirs.py reconstructs private key
        │
        ▼
[Backend] resultsService.js
        │   GET all encrypted ballots from Fabric
        │   decrypt each ballot with reconstructed key
        │   tally per candidate
        │
        ▼
[Backend] store results (PostgreSQL)
        │
        ▼
[Admin Portal / Observer Dashboard] GET /results/:id
        │   display winners and vote counts
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Security Layers                           │
├────────────────────────────────────────────────────────────┤
│  Network:   TLS everywhere (HTTPS + MQTTS)                │
│             MAC address whitelist (macFilter.middleware)   │
│             Rate limiting (rateLimit.middleware)           │
├────────────────────────────────────────────────────────────┤
│  Identity:  JWT tokens (auth.middleware)                   │
│             Biometric fingerprint (R307 sensor)           │
│             Voter NID hash (never raw PII stored)         │
├────────────────────────────────────────────────────────────┤
│  Vote:      AES/RSA ballot encryption (encryptionService) │
│             Zero-Knowledge Proofs (zkpService)            │
│             Blockchain immutability (Fabric chaincode)    │
├────────────────────────────────────────────────────────────┤
│  Key Mgmt:  Shamir Secret Sharing (shamirs.py)            │
│             M-of-N key ceremony (ceremonyService.py)      │
│             No single party holds election key            │
├────────────────────────────────────────────────────────────┤
│  Audit:     Every action logged (auditLog.model)          │
│             Tamper detection (TamperDetection.cpp)        │
│             Offline cache with sync (OfflineCache.cpp)    │
│             Dispute resolution (disputeService.js)        │
└────────────────────────────────────────────────────────────┘
```

---

## Port Map (Local Development)

```
  Service                     Port
  ─────────────────────────── ─────
  Backend API (Node.js)        3000
  Voter UI (React)             5173
  Admin Portal (React)         5174
  Observer Dashboard (React)   5175
  Verification Portal (React)  5176
  ML Service (Flask)           8000
  MongoDB                     27017
  PostgreSQL                   5432
  Mosquitto MQTT               1883
  Hyperledger Fabric Peer     7051
  Hyperledger Fabric Orderer  7050
```

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Status:** ✅ Complete
