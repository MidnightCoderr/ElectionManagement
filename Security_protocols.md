# Security Protocols - Quick Reference

> **Note:** For complete security specifications, see [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md)

This document provides a quick reference. The comprehensive threat model and security implementation details are in the full specification.

---

## 🔐 Security Layers

### 1. Biometric Authentication
- **Hash-only storage:** SHA-256 of fingerprints (no raw data)
- **Sensor:** R307 fingerprint scanner
- **Auth token:** JWT with 24-hour expiry

> **See:** [THREAT_MODEL.md - Authentication](docs/security/THREAT_MODEL.md#authentication-flows)

---

### 2. Transport Encryption
- **Protocol:** TLS 1.3
- **Cipher suites:** TLS_AES_256_GCM_SHA384
- **Certificate management:** Let's Encrypt with auto-renewal

---

###3. Application-Layer Encryption
- **At-rest:** AES-256-GCM for sensitive database fields
- **Vote encryption:** Hybrid (RSA + AES) for ballot secrecy
- **Blockchain:** Hash commitments (not full ZKP)

---

### 4. IoT Terminal Security
- **Secure boot:** ESP32 Secure Boot v2
- **OTA updates:** Signed firmware with rollback protection
- **Tamper detection:** GPIO interrupt → wipe keys & disable

> **See:** [FIRMWARE_SPEC.md - Security](docs/iot/FIRMWARE_SPEC.md#security-model)

---

### 5. Blockchain Security
- **Network:** 3-org Hyperledger Fabric (permissioned)
- **Endorsement policy:** AND('Org1.peer', 'Org2.peer')
- **Snapshots:** Every 1,000 blocks → Ethereum anchoring

> **See:** [FABRIC_TOPOLOGY.md](docs/blockchain/FABRIC_TOPOLOGY.md)

---

## 📋 Quick Reference Table

| Component | Technology | Purpose |
|-----------|------------|---------|
| Biometric | SHA-256 | Hash fingerprints |
| Transport | TLS 1.3 | Encrypt HTTP/MQTT |
| Payload | AES-256-GCM | Encrypt sensitive fields |
| Votes | RSA + AES | Ballot secrecy |
| Blockchain | Hash commitments | Vote privacy |
| IoT | Secure Boot v2 | Tamper resistance |
| CI/CD | OWASP ZAP DAST | Automated dynamic scanning |
| Dependencies| `npm audit` | Proactive vulnerability gating |

---

## 🎯 For Complete Security Specifications

**See:** [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md)

This comprehensive document includes:
- Threat analysis (20+ scenarios)
- Mitigation strategies
- Attack surface analysis
- Incident response procedures
- Compliance requirements

---

**Last Updated:** February 2026  
**Status:** Quick reference (see THREAT_MODEL.md for authoritative spec)