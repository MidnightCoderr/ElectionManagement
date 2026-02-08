# Technology Stack Specification

> **Last Updated:** February 2026 | **Status:** Phase 0 - Documentation Alignment

---

## 1. Core Technology Stack

### IoT / Edge Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Microcontroller | ESP32 | ESP-WROOM-32 | Terminal processing |
| Fingerprint Sensor | **R307** | - | Biometric auth |
| Secure Element | ATECC608A | - | Key storage |
| Display | 3.5" TFT | ILI9486 | UI & instructions |
| Firmware Language | C++ | Arduino Framework | Embedded logic |
| Build System | PlatformIO | Latest | Compilation & OTA |

> **Note:** Standardized on **R307** (previously conflicted with AS608)

---

### Backend Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18.x LTS | API server |
| Framework | Express | 4.x | REST API |
| Blockchain SDK | Fabric SDK Node | 2.5.x | Ledger integration |
| Database (Primary) | PostgreSQL | 15.x | Voter metadata |
| Database (Audit) | MongoDB | 6.x | Logs & analytics |
| MQTT Broker | Mosquitto | 2.x | IoT communication |

**Key Libraries:**
- `express-validator` - Input validation
- `jsonwebtoken` - JWT auth
- `sequelize` - PostgreSQL ORM
- `mongoose` - MongoDB ODM
- `mqtt` - MQTT client
- `winston` - Logging

---

### Blockchain Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Platform | Hyperledger Fabric | 2.5.x | Permissioned ledger |
| Chaincode Language | Go | 1.21+ | Smart contracts |
| CA | Fabric CA | 1.5.x | Certificate authority |
| Snapshot | Ethereum (Sepolia) | - | Block anchoring |

**Network Topology:** 3-org (EC, Judiciary, Observers)  
**Endorsement Policy:** `AND('Org1.peer', 'Org2.peer')`

---

### Frontend Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Library | React | 18.x | UI components |
| Build Tool | Vite | 5.x | Fast dev server |
| Styling | Vanilla CSS | - | Maximum flexibility |
| Charts | **Chart.js** | 4.x | Visualizations |
| i18n | react-i18next | 14.x | Multi-language |
| HTTP Client | Axios | 1.x | API calls |
| QR Codes | qrcode.react | 3.x | Receipt generation |

> **Note:** Using **Chart.js** (not D3.js) for standard visualizations

**Applications:**
- `voter-ui/` - 7-step voting interface (top-level folder)
- `observer-dashboard/` - Real-time monitoring (top-level folder)
- `admin-portal/` - Election management (top-level folder)

---

### ML / Analytics Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Python | 3.11+ | ML pipeline |
| ML Library | Scikit-learn | 1.4+ | Anomaly detection |
| Data Processing | Pandas | 2.x | Feature engineering |
| Model Tracking | MLflow | 2.x | Experiment tracking |

**Pilot:** Direct PostgreSQL queries (no Kafka/Spark)  
**Production (Optional):** Kafka + Spark for streaming

---

## 2. Security & Encryption

### Transport Layer Security
```yaml
Protocol: TLS 1.3
Cipher Suites:
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
Certificate Management:
  - Let's Encrypt (auto-renewal)
  - mTLS for IoT terminals
```

> **Corrected:** TLS 1.3 for transport (previously incorrectly listed AES-256-GCM)

---

### Application-Layer Encryption
```yaml
At-Rest Encryption:
  Database: AES-256-GCM for sensitive fields
  Filesystem: LUKS (Linux) / FileVault (Mac)

Vote Encryption:
  Scheme: Hybrid (RSA-2048 + AES-256-GCM)
  Process: Encrypt candidate ID, store commitment hash

Biometric Security:
  Storage: SHA-256 hash only (no raw data)
  Never stored: Raw fingerprints, templates
```

---

### Key Management
```yaml
Backend Keys:
  - JWT secret: 256-bit random (env variable)
  - Database encryption: Key rotation every 90 days
  
IoT Keys:
  - Secure element: ATECC608A stores private keys
  - Certificate: X.509 per-terminal
  
Blockchain Keys:
  - Fabric CA manages org identities
  - HSM for production (optional)
```

---

## 3. Performance Targets

### Realistic Specifications
```yaml
Sustained TPS: 1,000 votes/second
Burst TPS: 5,000 votes/second (1-minute peak)
Peak Load: 10,000 votes in 10 seconds (batch write)

Implementation:
  - Vote batching: Every 100ms or 50 votes
  - Block size: 2 MB
  - Endorsement: Parallel (both orgs simultaneously)
  - Sharding: Optional (district-based channels if needed)
```

> **Updated:** Realistic targets (previously claimed 10,000 TPS sustained - not achievable without extreme tuning)

---

## 4. Development Standards

### Code Style
```yaml
JavaScript/Node:
  - Naming: camelCase
  - Linting: ESLint (Airbnb config)
  - Formatting: Prettier

Python:
  - Naming: snake_case
  - Linting: Flake8, Black
  - Type hints: Required for public APIs

C++ (IoT):
  - Naming: camelCase for functions, UPPER_CASE for constants
  - Linting: Clang-format
```

---

### API Design
```yaml
Style: REST
Versioning: /api/v1/
Auth: JWT (24h expiry)
Validation: express-validator
Error Format:
  {
    "success": false,
    "error": "Human-readable message",
    "code": "ERROR_CODE"
  }
```

---

### Commit Convention
```
Format: <type>(<scope>): <subject>

Types:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - refactor: Code restructure
  - test: Tests
  - chore: Build/tooling

Examples:
  - feat(vote): add offline reconciliation
  - fix(auth): prevent token expiry edge case
  - docs(api): update biometric endpoint spec
```

---

## 5. Dependencies & Versions

### Backend (`package.json` excerpt)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "express-validator": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "sequelize": "^6.35.0",
    "pg": "^8.11.0",
    "mongoose": "^8.1.0",
    "mqtt": "^5.3.0",
    "fabric-network": "^2.5.0",
    "winston": "^3.11.0"
  }
}
```

---

### Frontend (`package.json` excerpt)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "react-i18next": "^14.0.0",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "qrcode.react": "^3.1.0",
    "crypto-js": "^4.2.0"
  }
}
```

---

### IoT (`platformio.ini` excerpt)
```ini
[env:esp32]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps =
    adafruit/Adafruit Fingerprint Sensor Library @ ^2.1.0
    knolleary/PubSubClient @ ^2.8.0
    bblanchon/ArduinoJson @ ^6.21.0
    sparkfun/SparkFun ATECCX08a Arduino Library @ ^1.3.0
```

---

## 6. External Services

### Production Dependencies
```yaml
MQTT Broker: Mosquitto (self-hosted) or AWS IoT Core
Certificate Authority: Let's Encrypt
Monitoring: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Alerting: PagerDuty or Opsgenie
Email: SendGrid (notifications)
```

### Optional (Production Scale-Out)
```yaml
Message Queue: Apache Kafka (if streaming ML needed)
Stream Processing: Apache Spark (if real-time features needed)
Load Balancer: Nginx or AWS ALB
CDN: CloudFlare (for static assets)
```

---

## 7. Infrastructure

### Development
```yaml
Containerization: Docker + Docker Compose
OS: Ubuntu 22.04 LTS (Linux), macOS (dev)
IDE: VS Code, IntelliJ IDEA
Version Control: Git + GitHub
CI/CD: GitHub Actions
```

### Production
```yaml
Orchestration: Kubernetes (1.28+)
Cloud Provider: AWS, Azure, or GCP
Container Registry: Docker Hub or ECR
Secrets Management: HashiCorp Vault
Backup: PostgreSQL WAL + daily snapshots
```

---

## 8. Browser & Device Support

### Voter UI
```yaml
Browsers:
  - Chrome 120+ (primary)
  - Firefox 120+
  - Safari 17+ (iOS)
  - Edge 120+

Screen Sizes:
  - 1024x768 minimum (terminal display)
  - Touch interface optimized
```

### Observer Dashboard
```yaml
Browsers: Same as Voter UI
Screen Sizes: 1920x1080 recommended (desktop)
```

---

## 9. Compliance & Standards

### Jurisdictional Compliance
```yaml
Primary: India
  - Election Commission of India (ECI) guidelines
  - Information Technology Act, 2000
  - Aadhaar Act, 2016 (biometric auth)
  - Data Protection Bill (design-ready)

International: EU (if deployed)
  - GDPR requires legal review
  - Current design: India-first, GDPR-compatible where possible
```

---

## 📊 Summary Table

| Layer | Primary Tech | Alternatives | Rationale |
|-------|--------------|--------------|-----------|
| **IoT** | ESP32 + R307 | Raspberry Pi | Cost, power efficiency |
| **Backend** | Node.js | Go, Python | Fabric SDK maturity |
| **Blockchain** | Fabric 2.5 | Ethereum | Permissioned, TPS |
| **Frontend** | React + Chart.js | Vue + D3 | Ecosystem, simplicity |
| **Database** | PostgreSQL | MySQL | JSON support, ACID |
| **ML** | Scikit-learn | TensorFlow | Interpretability |
| **Transport** | TLS 1.3 | - | Latest standard |

---

## 📚 Related Documentation

- **[Architecture](docs/architecture/LIFECYCLE_AND_ROLES.md)** - System design
- **[Security](docs/security/THREAT_MODEL.md)** - Threat model
- **[Deployment](docs/deployment/DEPLOYMENT_GUIDE.md)** - Production setup
- **[API Reference](docs/api/openapi.yaml)** - OpenAPI spec

---

**Document Version:** 2.0  
**Last Review:** February 2026  
**Status:** ✅ Aligned with Gap Resolution Plan