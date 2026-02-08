# Blockchain Schema & Chaincode Interface Specification

## Hyperledger Fabric World State Schema

### Overview

The blockchain stores **encrypted vote data** only. Voter identity and vote metadata are kept off-chain for privacy.

---

## World State Structure

### Asset: Vote

**Key:** `VOTE_{vote_id}`  
**Example:** `VOTE_a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Value (JSON):**
```json
{
  "voteId": "uuid",
  "electionId": "uuid",
  "districtId": "uuid",
  "terminalId": "string",
  "timestamp": 1707439800000,
  "encryptedVote": {
    "ciphertext": "hex_string",
    "iv": "hex_string",
    "tag": "hex_string",
    "algorithm": "AES-256-GCM"
  },
  "zkpCommitment": "hash_string",
  "zkpProof": {
    "commitment": "string",
    "challenge": "string",
    "response": "string"
  },
  "integrityHash": "sha256_hash",
  "version": "1.0",
  "docType": "vote"
}
```

**Field Descriptions:**
- `voteId`: Unique vote identifier (UUID)
- `electionId`: Which election this vote belongs to
- `districtId`: Geographic district
- `terminalId`: IoT terminal that recorded it
- `timestamp`: Unix timestamp in milliseconds
- `encryptedVote`: AES-256-GCM encrypted vote data
  - Contains: `candidateId`, `voterId` (encrypted together)
- `zkpCommitment`: Zero-knowledge proof commitment
- `integrityHash`: SHA-256 of entire vote record
- `docType`: "vote" (for CouchDB queries)

---

### Composite Keys

**By Election:**
```
election~voteId : electionId~voteId
```

**By District:**
```
district~voteId : districtId~voteId
```

**By Terminal:**
```
terminal~voteId : terminalId~voteId
```

**By Timestamp:**
```
timestamp~voteId : timestamp~voteId
```

---

## Chaincode Functions

### 1. InitLedger
**Purpose:** Initialize chaincode with genesis data

**Parameters:** None

**Returns:** Success message

**Access:** Admin only (during deployment)

---

### 2. SubmitVote
**Purpose:** Record a new vote on blockchain

**Function Signature:**
```go
func (s *SmartContract) SubmitVote(
    ctx contractapi.TransactionContextInterface,
    voteId string,
    electionId string,
    districtId string,
    terminalId string,
    encryptedVoteData string,
    zkpCommitment string,
    integrityHash string
) error
```

**Input Validation:**
- voteId must be valid UUID
- electionId must exist
- Duplicate voteId not allowed
- Encrypted data must be valid JSON
- Integrity hash must match

**Logic:**
1. Check if vote already exists (prevent double-vote)
2. Validate election is active
3. Create vote asset
4. Create composite keys
5. Store on ledger
6. Emit VoteSubmitted event

**Returns:** Vote asset or error

**Events Emitted:**
```json
{
  "eventType": "VoteSubmitted",
  "voteId": "uuid",
  "electionId": "uuid",
  "timestamp": 1707439800000,
  "blockNumber": 12345
}
```

---

### 3. ReadVote
**Purpose:** Retrieve a vote by ID

**Function Signature:**
```go
func (s *SmartContract) ReadVote(
    ctx contractapi.TransactionContextInterface,
    voteId string
) (*Vote, error)
```

**Returns:** Vote asset (encrypted)

**Access:** Authorized auditors only

---

### 4. GetVotesByElection
**Purpose:** Query all votes for an election

**Function Signature:**
```go
func (s *SmartContract) GetVotesByElection(
    ctx contractapi.TransactionContextInterface,
    electionId string
) ([]*Vote, error)
```

**Returns:** Array of vote assets

**Access:** Election officials, auditors

**Use Case:** Tallying, auditing

---

### 5. GetVotesByDistrict
**Purpose:** Query votes by district

**Function Signature:**
```go
func (s *SmartContract) GetVotesByDistrict(
    ctx contractapi.TransactionContextInterface,
    districtId string
) ([]*Vote, error)
```

**Returns:** Array of vote assets

---

### 6. VerifyVoteIntegrity
**Purpose:** Verify vote hasn't been tampered with

**Function Signature:**
```go
func (s *SmartContract) VerifyVoteIntegrity(
    ctx contractapi.TransactionContextInterface,
    voteId string,
    expectedHash string
) (bool, error)
```

**Logic:**
1. Retrieve vote from ledger
2. Recalculate integrity hash
3. Compare with expected hash

**Returns:** true if match, false otherwise

---

### 7. GetVoteHistory
**Purpose:** Get complete history of a vote (all modifications)

**Function Signature:**
```go
func (s *SmartContract) GetVoteHistory(
    ctx contractapi.TransactionContextInterface,
    voteId string
) ([]HistoryRecord, error)
```

**Returns:** Array of historical states

**Use Case:** Audit trail, detecting tampering

---

### 8. QueryVotes
**Purpose:** Rich queries using CouchDB

**Function Signature:**
```go
func (s *SmartContract) QueryVotes(
    ctx contractapi.TransactionContextInterface,
    queryString string
) ([]*Vote, error)
```

**Example Query:**
```json
{
  "selector": {
    "docType": "vote",
    "electionId": "uuid",
    "timestamp": {
      "$gte": 1707439800000,
      "$lte": 1707526200000
    }
  }
}
```

**Returns:** Matching votes

---

### 9. GetVoteCount
**Purpose:** Count votes for an election/candidate

**Function Signature:**
```go
func (s *SmartContract) GetVoteCount(
    ctx contractapi.TransactionContextInterface,
    electionId string
) (int, error)
```

**Returns:** Integer count

**Note:** Does not reveal who voted for whom

---

### 10. GetTransactionInfo
**Purpose:** Get blockchain transaction details

**Function Signature:**
```go
func (s *SmartContract) GetTransactionInfo(
    ctx contractapi.TransactionContextInterface,
    txId string
) (*TransactionInfo, error)
```

**Returns:**
```json
{
  "txId": "string",
  "timestamp": 1707439800000,
  "blockNumber": 12345,
  "channelId": "election-channel",
  "creator": "org1MSP"
}
```

---

## Chaincode Events

### VoteSubmitted
```json
{
  "eventType": "VoteSubmitted",
  "voteId": "uuid",
  "electionId": "uuid",
  "districtId": "uuid",
  "timestamp": 1707439800000
}
```

**Subscribers:** Backend API, ML service

---

### DoubleVoteAttempt
```json
{
  "eventType": "DoubleVoteAttempt",
  "voterId": "uuid",
  "electionId": "uuid",
  "timestamp": 1707439800000,
  "blocked": true
}
```

**Subscribers:** Fraud detection, alerts

---

### IntegrityViolation
```json
{
  "eventType": "IntegrityViolation",
  "voteId": "uuid",
  "expectedHash": "string",
  "actualHash": "string",
  "timestamp": 1707439800000
}
```

**Subscribers:** Security team, auditors

---

## Event Stream Schema (for ML Pipeline)

### Kafka Topic: `election-events`

**Message Structure:**
```json
{
  "eventId": "uuid",
  "eventType": "VOTE_CAST | FRAUD_ALERT | TERMINAL_ISSUE",
  "timestamp": 1707439800000,
  "source": "blockchain | api | iot",
  "payload": {
    "voteId": "uuid",
    "electionId": "uuid",
    "districtId": "uuid",
    "terminalId": "string",
    "votingDuration": 45,
    "biometricConfidence": 0.98
  },
  "metadata": {
    "blockNumber": 12345,
    "txId": "string",
    "peerId": "peer0.org1"
  }
}
```

---

### Event Types

**1. VOTE_CAST**
```json
{
  "eventType": "VOTE_CAST",
  "payload": {
    "voteId": "uuid",
    "electionId": "uuid",
    "districtId": "uuid",
    "terminalId": "TERM-001",
    "votingDuration": 45,
    "biometricConfidence": 0.98,
    "timestamp": 1707439800000
  }
}
```

**ML Features:**
- Time between votes
- Geographic distribution
- Terminal load pattern
- Voting duration anomalies

---

**2. FRAUD_ALERT**
```json
{
  "eventType": "FRAUD_ALERT",
  "payload": {
    "alertType": "DOUBLE_VOTE | HIGH_VOLUME | PATTERN_ANOMALY",
    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
    "terminalId": "TERM-001",
    "affectedVotes": ["uuid1", "uuid2"],
    "confidence": 0.95,
    "reason": "Detected 100 votes in 5 minutes"
  }
}
```

---

**3. TERMINAL_STATUS**
```json
{
  "eventType": "TERMINAL_STATUS",
  "payload": {
    "terminalId": "TERM-001",
    "status": "ACTIVE | OFFLINE | TAMPERED",
    "batteryLevel": 75,
    "votesProcessed": 234,
    "lastHeartbeat": 1707439800000
  }
}
```

---

## Access Control

### Chaincode ACL

| Function | Voter | Observer | Auditor | Admin |
|----------|-------|----------|---------|-------|
| SubmitVote | ✅ | ❌ | ❌ | ❌ |
| ReadVote | ❌ | ❌ | ✅ | ✅ |
| GetVotesByElection | ❌ | ✅ | ✅ | ✅ |
| GetVoteHistory | ❌ | ❌ | ✅ | ✅ |
| QueryVotes | ❌ | ❌ | ✅ | ✅ |
| VerifyVoteIntegrity | ❌ | ✅ | ✅ | ✅ |

---

## Chaincode Lifecycle

### 1. Package
```bash
peer lifecycle chaincode package election.tar.gz \
  --path ./chaincode/election \
  --lang golang \
  --label election_1.0
```

### 2. Install
```bash
peer lifecycle chaincode install election.tar.gz
```

### 3. Approve
```bash
peer lifecycle chaincode approveformyorg \
  --channelID election-channel \
  --name election \
  --version 1.0 \
  --package-id $PACKAGE_ID \
  --sequence 1
```

### 4. Commit
```bash
peer lifecycle chaincode commit \
  --channelID election-channel \
  --name election \
  --version 1.0 \
  --sequence 1
```

---

## Validation Checklist

- [x] World state schema defined
- [x] All chaincode functions documented
- [x] Function signatures in Go specified
- [x] Event schema defined for ML pipeline
- [x] Access control rules specified
- [x] Composite keys for efficient queries
- [x] Integrity verification method defined
- [x] Blockchain-API integration clear

---

**Document Version:** 1.0  
**Last Updated:** February 2024  
**Status:** ✅ Complete
