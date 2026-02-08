# Election Management System - Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v24.0+) and **Docker Compose** (v2.20+)
- **Node.js** (v20.0+) and **npm** (v9.0+)
- **Go** (v1.21+) for Hyperledger Fabric chaincode
- **Python** (v3.11+) for ML analytics
- **Git**
- **Make** (optional, for convenience scripts)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/navyaaasingh/ElectionManagement.git
cd ElectionManagement
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Important:** Edit `.env` and change all `changeme_*` passwords and secrets to secure values.

### 3. Start the Development Environment

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- MQTT Broker (ports 1883, 9001)
- Hyperledger Fabric Network (Orderer + Peers)
- Backend API (port 3000)
- ML Analytics Service (port 5000)
- Voter UI (port 3001)
- Observer Dashboard (port 3002)
- Admin Portal (port 3003)
- Prometheus (port 9090)
- Grafana (port 3004)

### 4. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

All services should show status as "Up".

### 5. Initialize the Database

The PostgreSQL schema is automatically initialized on first run. You can verify:

```bash
docker-compose exec postgres psql -U election_admin -d election_db -c "\dt"
```

You should see 11 tables listed.

### 6. Access the Applications

- **Voter UI:** http://localhost:3001
- **Observer Dashboard:** http://localhost:3002
- **Admin Portal:** http://localhost:3003
- **Backend API:** http://localhost:3000/api
- **Grafana:** http://localhost:3004 (default login: admin/admin)
- **Prometheus:** http://localhost:9090

---

## Development Workflow

### Running Locally (Without Docker)

If you prefer to run services locally for development:

#### Backend API

```bash
cd backend
npm install
npm run dev
```

#### Frontend Applications

```bash
# Voter UI
cd frontend/voter-ui
npm install
npm run dev

# Observer Dashboard
cd frontend/observer-dashboard
npm install
npm run dev

# Admin Portal
cd frontend/admin-portal
npm install
npm run dev
```

#### ML Analytics

```bash
cd ml-analytics
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

---

## Hyperledger Fabric Network

### Starting the Fabric Network

```bash
cd blockchain
./scripts/startNetwork.sh
```

### Deploying Chaincode

```bash
cd blockchain
./scripts/deployChaincode.sh
```

### Stopping the Network

```bash
cd blockchain
./scripts/stopNetwork.sh
```

---

## Testing

### Backend Unit Tests

```bash
cd backend
npm test
```

### Backend Integration Tests

```bash
cd backend
npm run test:integration
```

### Frontend Tests

```bash
cd frontend/voter-ui
npm test
```

### End-to-End Tests

```bash
cd tests/e2e
npm install
npm test
```

### Load Testing

```bash
cd tests/load
k6 run vote-casting-load-test.js
```

---

## Database Management

### Run Migrations

```bash
cd backend
npm run db:migrate
```

### Seed Test Data

```bash
cd backend
npm run db:seed
```

### Connect to PostgreSQL

```bash
docker-compose exec postgres psql -U election_admin -d election_db
```

### Connect to MongoDB

```bash
docker-compose exec mongodb mongosh -u mongo_admin -p changeme_mongo_password
```

---

## IoT Terminal Development

### Flashing ESP32 Firmware

1. Install PlatformIO:
```bash
cd iot-terminal
pip install platformio
```

2. Build and upload:
```bash
pio run --target upload
```

3. Monitor serial output:
```bash
pio device monitor
```

---

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Backend application logs
tail -f logs/application.log
```

### Access Grafana Dashboards

1. Open http://localhost:3004
2. Login with admin/admin
3. Navigate to Dashboards
4. Pre-configured dashboards for system health are available

---

## Troubleshooting

### Services Won't Start

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs [service-name]

# Restart a specific service
docker-compose restart [service-name]
```

### Database Connection Issues

Ensure environment variables in `.env` match the Docker Compose configuration.

### Blockchain Network Issues

```bash
# Stop and clean the network
cd blockchain
./scripts/stopNetwork.sh
docker volume prune -f

# Restart
./scripts/startNetwork.sh
```

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`.

---

## Cleanup

### Stop All Services

```bash
docker-compose down
```

### Remove All Data (Volumes)

```bash
docker-compose down -v
```

### Clean Everything

```bash
docker-compose down -v --rmi all
npm run clean
```

---

## Project Structure

```
ElectionManagement/
├── backend/                  # Node.js/Express backend API
├── blockchain/              # Hyperledger Fabric network & chaincode
├── frontend/
│   ├── voter-ui/           # Voter interface
│   ├── observer-dashboard/ # Observer dashboard
│   └── admin-portal/       # Admin interface
├── iot-terminal/           # ESP32 firmware
├── ml-analytics/           # Python ML fraud detection
├── infrastructure/         # Docker, Kubernetes, Terraform
├── docs/                   # Documentation
└── tests/                  # E2E and load tests
```

---

## Next Steps

1. Review the [Implementation Plan](/.gemini/antigravity/brain/22f58fb0-ef2d-4dda-bb35-c3a2d2062e92/implementation_plan.md)
2. Check the [Project Analysis](/.gemini/antigravity/brain/22f58fb0-ef2d-4dda-bb35-c3a2d2062e92/project_analysis.md)
3. Start with Phase 2: Smart Contracts & Blockchain development

---

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for secure, transparent elections**
