# Tech Rules & Stack Definition

## 1. The Stack
* **Blockchain:** Hyperledger Fabric v2.5 (Enterprise-grade, permissioned).
* **Backend:** Node.js 20.x (LTS) with Express.
* **Frontend:** React 18+ (Vite) with Tailwind CSS.
* **IoT:** C++ / Arduino Framework for ESP32.
* **Database:** PostgreSQL (Relational) & MongoDB (Audit Logs).
* **ML:** Python 3.11 with Scikit-Learn (Anomaly Detection).

## 2. Coding Standards
* **Security:** All API endpoints must use JWT (JSON Web Tokens).
* **Naming:** `camelCase` for JS/Node, `snake_case` for Python.
* **Encryption:** Use `AES-256-GCM` for sensitive voter data in transit.
* **Commits:** Follow Conventional Commits (e.g., `feat: add biometric route`).