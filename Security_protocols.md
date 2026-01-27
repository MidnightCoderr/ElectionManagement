# Security & Anti-Fraud Protocols

## 1. Zero-Knowledge Proof (ZKP) Implementation
To maintain voter privacy, the system will implement a simplified ZKP.
* **Formula:** $P(v) \rightarrow \{0, 1\}$. 
* The system confirms the voter is in the set of eligible voters without revealing which specific voter cast which ballot.

## 2. Hardware Security
* **Tamper Detection:** If the ESP32 casing is opened, a physical switch triggers a "Wipe" command of the local encryption keys.
* **MAC Filtering:** Only registered IoT Terminal MAC addresses can communicate with the backend.

## 3. Auditability
* Every 10 minutes, a **State Snapshot** is hashed and published to a public secondary ledger (like Ethereum Mainnet) to ensure the private Hyperledger hasn't been rewritten.