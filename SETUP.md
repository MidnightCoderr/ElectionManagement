# Election Management System - Development Setup Guide

> **For Production Deployment:** See [docs/deployment/DEPLOYMENT_GUIDE.md](docs/deployment/DEPLOYMENT_GUIDE.md)

This guide is for **local development only**. It will get you up and running in ~5 minutes.

---

## 📋 Prerequisites

- **Docker** (v24.0+) and **Docker Compose** (v2.20+)
- **Node.js** (v18.0+) and **npm** (v9.0+)
- **Go** (v1.21+) for Hyperledger Fabric chaincode (optional)
- **Python** (v3.11+) for ML analytics (optional)
- **Git**

---

## ⚡ Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/navyaaasingh/ElectionManagement.git
cd ElectionManagement
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

**Important:** Edit `.env` and change all `changeme_*` passwords to secure values.

### 3. Start Development Environment

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- MQTT Broker (ports 1883, 9001)
- Backend API (port 3000)

### 4. Verify Services

```bash
docker-compose ps
```

All services should show status as "Up".

### 5. Initialize the Database

The PostgreSQL schema is automatically initialized on first run:

```bash
docker-compose exec postgres psql -U election_admin -d election_db -c "\dt"
```

You should see tables: `elections`, `candidates`, `voters`, `voting_records`, etc.

### 6. Access the Applications

- **Backend API:** http://localhost:3000/api/v1
- **API Docs:** http://localhost:3000/api-docs (Swagger UI)

---

## 🔧 Local Development (Without Docker)

If you prefer to run services locally for development:

### Backend API

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:3000

### Frontend Applications

> **Note:** Current implementation status - Phase 1-2 complete

```bash
# Voter UI (✅ Implemented)
cd voter-ui
npm install
npm run dev
# Runs on http://localhost:5173

# Observer Dashboard (⏳ Planned - Phase 5)
cd observer-dashboard
npm install
npm run dev
# Will run on http://localhost:5174

# Admin Portal (⏳ Planned - Phase 5)
cd admin-portal
npm install
npm run dev
# Will run on http://localhost:5175
```

### ML Analytics (Optional)

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

---

## 📂 Project Structure

```
ElectionManagement/
│
├── voter-ui/                  ← Voter interface (React + Vite) [✅ Implemented]
├── observer-dashboard/        ← Observer dashboard [⏳ Phase 5]
├── admin-portal/              ← Admin portal [⏳ Phase 5]
│
├── backend/                   ← Node.js API server [✅ Core Complete]
│   ├── src/
│   │   ├── controllers/      ← Election, candidate, vote
│   │   ├── services/         ← Auth, vote, results, IoT
│   │   ├── routes/           ← API routes
│   │   └── models/           ← Sequelize models
│   └── package.json
│


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

├── blockchain/                ← Hyperledger Fabric [⏳ Phase 2]
│   ├── chaincode/            ← Smart contracts
│   ├── network/              ← Network config
│   └── scripts/              ← Deployment scripts
│
├── iot-terminal/              ← ESP32 firmware [⏳ Phase 4]
│   ├── esp32_firmware/       ← C++ code
│   └── platformio.ini        ← Build config
│
├── ml-service/                ← Fraud detection [⏳ Phase 6]
│   ├── anomaly_detection.py
│   └── requirements.txt
│
├── docs/                      ← Comprehensive documentation
│   ├── architecture/          ← Design specs
│   ├── security/              ← Threat model
│   ├── deployment/            ← Production guides
│   └── user-guides/           ← End-user docs
│
└── tests/                     ← Testing [⏳ Phase 8]
    ├── integration/
    ├── e2e/
    └── load/
```

---

## 🧪 Testing

### Backend Unit Tests

```bash
cd backend
npm test
```

### Integration Tests (when implemented)

```bash
cd backend
npm run test:integration
```

### Frontend Tests

```bash
cd voter-ui
npm test
```

---

## 🗄️ Database Management

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
docker-compose exec mongodb mongosh -u mongo_admin -p <password>
```

---

## 📡 IoT Terminal Development (Phase 4)

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

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Backend application logs
tail -f backend/logs/application.log
```

---

## 🐛 Troubleshooting

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

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`.

---

## 🧹 Cleanup

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
```

---

## 📖 Documentation

For comprehensive documentation, see:

- **[README](README.md)** - Project overview & documentation index
- **[Architecture](docs/architecture/LIFECYCLE_AND_ROLES.md)** - System design
- **[API Contracts](docs/architecture/API_CONTRACTS.md)** - API specification
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Gap Resolution Plan](docs/gap_resolution_plan.md)** - Current phase planning

---

## 🎯 Current Implementation Status

### ✅ Phase 1-2 Complete (18 files):
- Backend core APIs (election, candidate, vote, auth, results, IoT)
- Voter UI (complete 7-step flow)
- Service layer & i18n

### 🔄 Phase 0 (In Progress):
- Documentation alignment
- Technical standardization

### ⏳ Upcoming Phases:
- Phase 1: Data & Contract Lock
- Phase 2: Blockchain Layer
- Phase 3-9: See [full_implementation_plan.md](docs/full_implementation_plan.md)

---

## 🚀 Next Steps

1. Start development server: `docker-compose up -d`
2. Review [Implementation Plan](docs/full_implementation_plan.md)
3. Check [Gap Resolution](docs/gap_resolution_plan.md) for current priorities

---

## 💡 Need Production Deployment?

This guide is for **development only**.

**For production deployment:**
- See [DEPLOYMENT_GUIDE.md](docs/deployment/DEPLOYMENT_GUIDE.md)
- Includes Kubernetes setup
- Security hardening
- Monitoring configuration
- DR procedures

---

**Built with ❤️ for secure, transparent elections**

