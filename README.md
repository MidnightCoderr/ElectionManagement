# 🔐 Secure and Transparent Election Management System

A **blockchain-based, IoT-enabled election management system** designed to ensure **security, transparency, and auditability** in large-scale elections, especially for developing countries. The system integrates **biometric authentication**, **permissioned blockchain (Hyperledger Fabric)**, **real-time analytics**, and **machine-learning-based fraud detection**.

> **Status:** Implementation Complete — Backend APIs, Blockchain, ML Ensemble, DevOps, Security & Pilot Testing

---

## 📚 Documentation Index

### Getting Started
- **[Quick Setup Guide](SETUP.md)** — Development environment setup
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** — Production deployment (Kubernetes)
- **[PRD](PRD.md)** — Product Requirements Document

### Architecture & Design
- **[System Architecture](docs/architecture/LIFECYCLE_AND_ROLES.md)** — Component lifecycle & roles
- **[Data Model](docs/architecture/DATA_MODEL.md)** — Database schema & relationships
- **[API Contracts](docs/architecture/API_CONTRACTS.md)** — Complete API specification
- **[Blockchain Schema](docs/architecture/BLOCKCHAIN_SCHEMA.md)** — Ledger structure
- **[Fabric Topology](docs/blockchain/FABRIC_TOPOLOGY.md)** — Network configuration

### Component Specifications
- **[Backend Services](docs/backend/SERVICE_DESIGN.md)** — Service architecture
- **[IoT Firmware](docs/iot/FIRMWARE_SPEC.md)** — ESP32 firmware & security
- **[Voter UX](docs/frontend/UX_SPEC.md)** — 7-step voting flow
- **[ML Fraud Detection](docs/ml/FRAUD_DETECTION_SPEC.md)** — Anomaly detection pipeline

### Security & Operations
- **[Threat Model](docs/security/THREAT_MODEL.md)** — Complete security analysis
- **[Monitoring Plan](docs/operations/MONITORING_PLAN.md)** — Observability strategy
- **[Reliability Plan](docs/testing/RELIABILITY_PLAN.md)** — Testing & DR

### Reference
- **[OpenAPI Spec](docs/api/openapi.yaml)** — Machine-readable API
- **[Tech Stack](tech_stack.md)** — Technologies & libraries

---

## 🚀 Project Motivation

Many electoral systems in developing regions face challenges such as:

* Voter impersonation and multiple voting
* Lack of transparency in vote counting
* Manual processes prone to corruption
* Limited trust from citizens and international observers

This project proposes a **technology-driven election framework** that guarantees:

* **One person, one vote**
* **Tamper-proof vote storage**
* **Real-time verification and auditing**
* **Privacy-preserving voter authentication**

---

## 🧠 Key Features

* ✅ **Biometric-based voter authentication** (fingerprint hashing)
* 🔗 **Permissioned blockchain ledger** for immutable vote storage
* 🗳️ **Secure IoT voting terminal** using ESP32
* 🔐 **End-to-end encrypted vote casting**
* 📊 **Real-time election results dashboard**
* 🚨 **ML ensemble fraud detection** (Isolation Forest + XGBoost + LSTM)
* 📡 **Kafka event streaming** with WebSocket push notifications
* 👁️ **Observer-friendly audit and verification tools**
* 🌐 **Multi-language support** (6 languages)
* ♿ **Accessibility features** (low-literacy, voice guidance)

---

## 🏗️ System Architecture

```
[ IoT Voting Terminal (ESP32 + R307 Fingerprint) ]
                ↓ (MQTT / mTLS)
         [ Backend API Layer (Node.js + Express) ]
          ↓               ↓               ↓
[ Hyperledger Fabric ] [ Kafka ] [ PostgreSQL / MongoDB ]
                          ↓
          [ ML Ensemble Fraud Detector (Python) ]
                          ↓
              [ WebSocket → Observer Dashboard ]
```

> **See:** [Complete Architecture](docs/architecture/LIFECYCLE_AND_ROLES.md)

---

## 🧩 Module Breakdown

### 1️⃣ Voter Registration & Identity Management
* Fingerprint captured and converted into SHA-256 hash
* **No raw biometric data is stored**
* Voter metadata stored off-chain (PostgreSQL)
* Voting eligibility verified via blockchain

### 2️⃣ IoT Voting Terminal (Edge Layer)
* ESP32 microcontroller with **R307 fingerprint sensor**
* Local biometric hashing, offline vote caching (SPIFFS)
* Secure communication via **MQTT** with tamper detection

> **See:** [IoT Terminal README](iot-terminal/README.md) | [Firmware Spec](docs/iot/FIRMWARE_SPEC.md)

### 3️⃣ Blockchain Voting Ledger
* **Hyperledger Fabric** — 3-org topology (Election Commission, Judiciary, Observers)
* Smart contracts enforce voter eligibility, single vote, and immutable recording

> **See:** [Blockchain README](blockchain/README.md) | [Fabric Topology](docs/blockchain/FABRIC_TOPOLOGY.md)

### 4️⃣ Backend & Data Management
* Node.js + Express API (14 REST endpoints)
* Fabric SDK integration, PostgreSQL + MongoDB
* Kafka telemetry producer, WebSocket push server
* Prometheus `/metrics` endpoint for observability

**Key APIs:** `POST /api/v1/votes/cast` · `POST /api/v1/auth/biometric` · `GET /api/v1/results/:electionId` · `GET /api/v1/audit`

> **See:** [API Contracts](docs/architecture/API_CONTRACTS.md) | [OpenAPI Spec](docs/api/openapi.yaml)

### 5️⃣ Frontend Interfaces
* **Voter Interface** — 7-step accessible flow, multi-language, voice guidance
* **Observer Dashboard** — Live vote tally, Chart.js visualizations, fraud alerts
* **Admin Portal** — Election creation wizard, poll control

> **See:** [UX Specification](docs/frontend/UX_SPEC.md) | [Voter UI README](voter-ui/README.md)

### 6️⃣ ML-Based Fraud Detection (Ensemble)
* **3-model ensemble** — Isolation Forest (40%) + XGBoost (40%) + LSTM (20%)
* Kafka stream consumer for real-time telemetry analysis
* 6 behavioral features extracted per vote
* Configurable threshold (default: 0.6 confidence)

> **See:** [ML Service README](ml-service/README.md) | [Fraud Detection Spec](docs/ml/FRAUD_DETECTION_SPEC.md)

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| IoT | ESP32, R307 Fingerprint | 160 MHz, 520 KB RAM, SPIFFS |
| Backend | Node.js 18+, Express | REST API + WebSocket + Kafka |
| Blockchain | Hyperledger Fabric 2.5 | 3-org, Raft consensus |
| Frontend | React 18, Chart.js | Vite build |
| Databases | PostgreSQL 15, MongoDB 6 | Primary + audit logs |
| Cache | Redis | Session & rate limiting |
| Streaming | Apache Kafka | Vote telemetry pipeline |
| ML | Python 3.11, scikit-learn, XGBoost, TensorFlow | Ensemble fraud detection |
| Monitoring | Prometheus, Grafana | Metrics & dashboards |
| CI/CD | GitHub Actions, OWASP ZAP | Lint, test, DAST scan |
| Orchestration | Kubernetes, Docker Compose | StatefulSets, HPA, Ingress |
| Security | SHA-256, TLS 1.3, AES-256-GCM, Helmet | Transport + at-rest |

> **See:** [Complete Tech Stack](tech_stack.md)

---

## 📂 Project Structure

```
ElectionManagement/
│
├── backend/                   ← Node.js API server
│   ├── src/
│   │   ├── controllers/      ← Election, candidate, vote logic
│   │   ├── services/         ← Auth, Fabric SDK, Kafka, WebSocket
│   │   ├── routes/           ← API routes (14 endpoints)
│   │   ├── models/           ← Sequelize + Mongoose models
│   │   ├── middleware/       ← Auth, rate limiting, MAC filter
│   │   └── utils/            ← Security audit tools
│   └── package.json
│
├── blockchain/                ← Hyperledger Fabric
│   ├── chaincode/            ← Go smart contracts
│   ├── network/              ← Crypto config + channel setup
│   └── scripts/              ← Start/stop/deploy scripts
│
├── iot-terminal/              ← ESP32 firmware (C++)
│   ├── esp32_firmware/       ← Biometric + MQTT + offline cache
│   └── platformio.ini
│
├── ml-service/                ← ML fraud detection (Python)
│   ├── fraud_detector.py     ← Ensemble engine (IF + XGB + LSTM)
│   ├── kafka_consumer.py     ← Kafka stream processor
│   ├── api.py                ← Flask REST API
│   ├── *.ipynb               ← Jupyter notebook versions
│   └── requirements.txt
│
├── voter-ui/                  ← Voter interface (React)
├── observer-dashboard/        ← Observer dashboard (React)
├── frontend/                  ← Admin portal (React + Vite)
│
├── infrastructure/
│   ├── kubernetes/           ← K8s manifests (namespace, deployments, ingress, HPA)
│   ├── monitoring/           ← Prometheus config, alerting rules, Grafana dashboard
│   └── docker/               ← Dockerfiles
│
├── tests/
│   ├── load/                 ← Artillery load testing (500 VU burst)
│   └── pilot/                ← Mock election runner (1,000 synthetic votes)
│
├── .github/workflows/        ← CI/CD (lint, test, build, ZAP DAST)
├── docker-compose.yml        ← Full stack orchestration
└── docs/                     ← Comprehensive documentation
```

---

## 🔐 Security & Privacy

* **No raw biometric data stored** (only SHA-256 hashes)
* Permissioned blockchain with endorsement policies
* Role-based access control (Commissioner, Officer, Observer)
* TLS 1.3 for all transport encryption
* AES-256-GCM for sensitive payload encryption
* Helmet.js HTTP headers hardening
* OWASP ZAP automated DAST scanning in CI/CD
* `npm audit` dependency vulnerability gates

> **See:** [Complete Threat Model](docs/security/THREAT_MODEL.md)

---

## 📊 Performance Targets

* **1,000 TPS** sustained (votes per second)
* **5,000 TPS** burst capacity (1-minute peak)
* **< 2 minutes** average voting time
* **> 95%** biometric auth success rate
* **< 4 minutes** complete voter flow (7 steps)

---

## 🎯 Current Status

All major implementation phases are complete:

- [x] **Backend Core APIs** — 14 REST endpoints, PostgreSQL + MongoDB models
- [x] **Blockchain Layer** — Hyperledger Fabric chaincode, 3-org network, SDK integration
- [x] **IoT Firmware** — ESP32 + R307 fingerprint, MQTT, offline caching, tamper detection
- [x] **ML Fraud Detection** — 3-model ensemble (Isolation Forest + XGBoost + LSTM), Kafka consumer
- [x] **Event Streaming** — Kafka telemetry pipeline + WebSocket push notifications
- [x] **DevOps** — Kubernetes manifests, Prometheus/Grafana, CI/CD with GitHub Actions
- [x] **Security** — OWASP ZAP DAST, npm audit gates, custom security auditor
- [x] **Load Testing** — Artillery (500 VU burst) + Mock Election pilot (1,000 synthetic votes)
- [x] **Frontend UIs** — Voter interface, Observer dashboard, Admin portal

---

## 📜 Disclaimer

This project is a **research and academic prototype** and is **not intended for direct deployment** in real national elections without comprehensive legal, ethical, and security reviews by qualified authorities.

**Compliance:** Designed for India (ECI guidelines, Aadhaar Act). International deployment requires jurisdiction-specific legal review.

---

## ⭐ If you like this project

Give it a ⭐ and feel free to fork, experiment, and contribute!

---

**Built with a focus on security, transparency, and trust.**
