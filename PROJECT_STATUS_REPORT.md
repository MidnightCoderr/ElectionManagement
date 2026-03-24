# Project Status Report: Secure and Transparent Election Management System

**Date:** March 2026  
**Status:** Phase 0 - Documentation Alignment / Phase 1-2 Implementation    

---

## 1. Executive Summary & Completed Work to Date

The **Secure and Transparent Election Management System** is a blockchain-based, IoT-enabled voting platform designed to guarantee "one person, one vote" while maintaining tamper-proof vote storage and real-time verification capabilities. The project integrates biometric authentication, a permissioned blockchain (Hyperledger Fabric), and machine-learning-based fraud detection.

**Completed Work and Capabilities:**
- **Core Architecture & Design:** Complete specifications for the system architecture, blockchain schema, API contracts, IoT firmware, ML pipelines, and threat models have been meticulously documented.
- **Backend Core APIs:** Phase 1-2 APIs are essentially complete, covering domains such as election setup, candidate management, secure vote casting, biometric authentication, and results aggregation.
- **Frontend Interfaces:** 
  - The **Voter UI** has been implemented, covering a 7-step accessible voting flow that integrates multi-language support and voice guidance.
  - The framework for the Observer Dashboard and Admin Portal has been laid out.
- **IoT & Biometric Integration Design:** The architecture for ESP32 microcontrollers integrating R307 fingerprint sensors for local biometric hashing (without storing raw biometric data) is finalized.

---

## 2. System Architecture & Workflows

The system follows a highly modular, multi-tier architecture ensuring clean separation of concerns and robust security.

**High-Level Architecture Components:**
1. **IoT Edge Layer (Voting Terminal):** Captures fingerprints via R307, creates a SHA-256 hash, and securely communicates with the backend via MQTT/WebSockets using mTLS.
2. **Backend Services (Node.js/Express):** Handles API requests, performs business logic validations, coordinates with off-chain storage for metadata, and acts as a gateway to the blockchain.
3. **Hyperledger Fabric Blockchain:** A 3-organization permissioned ledger (Election Commission, Judiciary, Observers) that immutably stores votes and enforces eligibility and double-voting prevention via smart contracts.
4. **ML & Analytics Engine:** ingests real-time events via a Kafka stream and uses Apache Spark to engineer features for real-time anomaly and fraud detection.
5. **Frontend UI:** Displays real-time result aggregations (Observer Dashboard), facilitates the admin setup (Admin Portal), and guides the voter (Voter Interface).

**End-to-End Voting Workflow:**
- **Authentication:** Voter scans fingerprint on the IoT terminal -> ESP32 hashes data -> secure payload sent to backend -> backend validates eligibility against the ledger and PostgreSQL.
- **Vote Selection:** The voter interface guides the user to select candidates.
- **Vote Casting:** Encrypted vote cast -> backend forwards to Fabric Smart Contract -> endorsement policy (e.g., `AND('Org1.peer', 'Org2.peer')`) applied -> block generated.
- **Telemetry & Fraud Detection:** Metadata generated during the process (e.g., duration, retries) streams into Kafka -> ML models analyze the transaction -> alerts generated if anomalies are detected.

---

## 3. Technology Stack and Languages

| Component Layer | Technology / Language | Justification & Alternatives Considered |
|-----------------|-----------------------|-----------------------------------------|
| **IoT / Edge** | ESP32 (C++ / Arduino) / R307 Sensor | Chosen for high performance-to-cost ratio, built-in Wi-Fi, and ease of TLS stack integration relative to alternatives like simple Arduino Unos or costlier Raspberry Pis. |
| **Backend API** | Node.js 18+ (Express) | JavaScript/Node offers excellent asynchronous I/O and mature first-class integration via the `fabric-network` SDK. Go/Python were considered but Node provided better developer productivity for API tooling. |
| **Blockchain** | Hyperledger Fabric 2.5 (Go Chaincode) | A permissioned context was mandatory for privacy and access control. Public blockchains (Ethereum) were dismissed due to gas costs and privacy challenges. Go was selected for chaincode due to its performance. |
| **Frontend** | React 18 / Vite / Vanilla CSS | React provides modular component reusability. Vite ensures rapid dev-build cycles. Vanilla CSS retains maximum granular flexibility over bloated utility frameworks. Chart.js was favored over D3 for immediate ease-of-use. |
| **Databases**   | PostgreSQL 15 & MongoDB 6 | PostgreSQL offers strong ACID compliance for rigid voter metadata. MongoDB accommodates high-velocity unstructured audit logs. |
| **Data Stream** | Apache Kafka & Spark | Kafka provides resilient high-throughput event brokering necessary for scalable ML ingestion. |

---

## 4. Machine Learning Components in Depth

The ML pipeline solves the problem of detecting coordinated election fraud, voter impersonation, and technical anomalies without compromising individual voter privacy.

**Detection Workflow:**
Raw telemetry (auth attempts, time of day, terminal health, network stats) is streamed into **Apache Spark** for real-time windowed feature engineering (e.g., votes processed in 5 min, error rates, geographic clustering). Voter IDs are never included.

**Models Implemented (Ensemble Approach):**
1. **Isolation Forest (Unsupervised Anomaly Detection):** 
   - *Purpose:* Detects unusual patterns (e.g., voting duration spikes, strange temporal behaviors).
   - *Hyperparameters:* 100 estimators, 1% contamination assumption.
   - *Why:* Unsupervised learning is critical here since labeled "fraud" data for training is historically scarce.
2. **XGBoost (Supervised Fraud Classifier):**
   - *Purpose:* Identifies coordinated fraud networks at an aggregate terminal/district level.
   - *Hyperparameters:* Max depth 6, eta 0.1, trained on historical/simulated binary labels.
   - *Why:* Gradient boosting handles complex, non-linear tabular feature interactions better than simple logistic regression and executes with exceptional latency.
3. **LSTM Neural Network (Time-Series Prediction):**
   - *Purpose:* Forecasts expected voting rates based on past sequences to track severe deviations.
   - *Why:* Specifically designed for sequence modeling, allowing dynamic threshold adjustment unlike static heuristic rules.

**Alternative Considered:** Simple threshold heuristic alerts. Rejected because they produce too many false positives during natural voting spikes and fail to catch sophisticated, slow-drip coordinated fraud.

---

## 5. File and Module-Level Overview

**Repository Structure:**
- `/backend/` (Node.js): Contains the API layer. Key subdirectories include `src/controllers/` for business logic, `src/services/` for fabric-sdk integrations and auth, and `src/models/` for database schemas.
- `/voter-ui/` (React): Contains the voter-facing web interface orchestrating the 7-step accessible voting flow.
- `/iot-terminal/` (C++): The firmware folder `esp32_firmware/` processes the physical biometric hashing and handles MQTT networking.
- `/blockchain/` (Go/YAML): Configuration for the Hyperledger network (`network/`) and the central smart contracts (`chaincode/`) that enforce constraints.
- `/ml-service/` (Python): Defines the `anomaly_detection.py` and data pipelines using Scikit-learn and XGBoost.
- `/docs/`: The single source of truth for specifications, security models, gap resolution, and operational playbooks.

**Design Patterns:** The system relies heavily on a micro-service inspired separation of state: critical state on-chain, metadata in SQL, events in NoSQL, and deterministic functional segregation throughout the codebase.

---

## 6. Task Status: Completed vs. Pending

**Completed:**
- Extensive architecture, API, UI, and ML documentation and specifications.
- Phase 1-2 features involving core Backend REST APIs and the core logic for the Voter UI.
- Resolution of documentation gaps, threat modeling, and baseline security standards (Phase 0).

**Pending / In-Progress:**
- **Phase 1-2 Wrap-up:** Freezing data contracts entirely.
- **Phase 4 - IoT Firmware Implementation:** Transitioning firmware specifications into production-ready C++ code.
- **Phase 5 - Observer & Admin Dashboards:** Full implementation of the `observer-dashboard/` and `admin-portal/` apps to consume backend APIs.
- **Phase 6 - ML System:** Deploying the Apache Spark pipeline and integrating the ensemble Python models to the Kafka stream.
- **Phase 8-9:** End-to-end integration testing, load testing for the 5,000 TPS burst targets, and pilot deployments.

---

## 7. Next Steps and Roadmap

**Short-Term Roadmap (Sprints 1-3):**
1. **Blockchain Finalization:** Instantiate the 3-org Fabric network locally via Docker-compose and test Endorsement Policies and Chaincode lifecycle.
2. **IoT Integration:** Flash initial ESP32 development boards, test R307 hash production, and validate mTLS connection to the backend.
3. **Admin and Observer Subsystems:** Stand up the React environments for the dashboards and hook up the real-time reporting APIs using websockets and Chart.js.

**Long-Term Vision:**
- Transition the pilot MongoDB query analytics to the fully-fledged Kafka+Spark ML streaming engine.
- Implement comprehensive zero-knowledge proofs for secondary verifiability.
- Prepare Kubernetes manifests (`docs/deployment/DEPLOYMENT_GUIDE.md`) for production staging.
- **Risks:** The primary dependency is resolving real-world network friction over MQTT for IoT devices under low-bandwidth connections, and properly calibrating the Isolation Forest thresholds to prevent alert fatigue.

---

## 8. Documentation Quality and Reproducibility

The documentation framework in this project is exceptionally high-quality and professional:
- **Reproducibility:** A comprehensive `SETUP.md` and `RUNBOOK.md` dictate the environment setup, local execution, and infrastructure orchestration required.
- **Machine-Readable:** The `docs/api/openapi.yaml` enables automated test generation and swagger UI exploration.
- **Standards:** All components dictate code styles, linter configurations, and git commit standards ensuring collaborative consistency.

**To Reproduce Results:** 
- The project primarily boots via `docker-compose.yml` to spin up dependencies (Postgres, Mongo, Mosquitto). 
- To reproduce ML components, analysts will utilize `requirements.txt` in the `ml-service/` directory and execute the offline evaluation scripts against the `data/training_extended.csv` datasets.
