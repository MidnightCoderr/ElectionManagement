# System Design Document

## 1. High-Level Architecture
The system uses a 4-tier architecture:
1. **Edge Layer:** IoT Biometric Terminals (ESP32).
2. **Gateway Layer:** Node.js/Express API.
3. **Consensus Layer:** Hyperledger Fabric Blockchain.
4. **Analysis Layer:** Python/ML Fraud Detection.



## 2. Data Flow
1. Voter scans finger on **IoT Terminal**.
2. Terminal sends a **SHA-256 Hash** of the biometric to the Backend.
3. Backend verifies ID against **PostgreSQL** registry.
4. If valid, a **Smart Contract** executes on the Blockchain.
5. **Python Service** monitors the transaction speed to detect "Ballot Stuffing."



## 3. Database Schema
### PostgreSQL (Voter Registry)
| Column | Type | Description |
| :--- | :--- | :--- |
| voter_id | UUID | Primary Key |
| bio_hash | STRING | Hashed biometric data |
| has_voted | BOOLEAN | Status flag |

### Blockchain Ledger (World State)
* **Key:** `VoteID_District_001`
* **Value:** `{ Timestamp, CandidateID, VerificationHash }`