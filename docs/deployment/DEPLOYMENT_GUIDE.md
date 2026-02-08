# Election Management System - Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Production Deployment](#production-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Docker** >= 24.0
- **Docker Compose** >= 2.20
- **Node.js** >= 20.x
- **Python** >= 3.11
- **Go** >= 1.21
- **Kubernetes** >= 1.28 (for production)
- **kubectl** >= 1.28
- **Helm** >= 3.12 (optional)

### Required Services
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- Hyperledger Fabric 2.5+

---

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ElectionManagement.git
cd ElectionManagement
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend Applications:**
```bash
cd voter-ui && npm install
cd ../observer-dashboard && npm install
cd ../admin-portal && npm install
```

**ML Service:**
```bash
cd ml-service
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

**Required Variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=election_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/election_logs

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT & Encryption
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRY=24h
ENCRYPTION_MASTER_KEY=your_256_bit_encryption_key_here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_in_production

# ML Service
ML_SERVICE_PORT=5000
FRAUD_MODEL_PATH=models/fraud_detector.joblib

# Email Alerts
ALERT_EMAIL_ENABLED=false
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_RECIPIENTS=admin@example.com
```

### 4. Start Services

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d
```

**Manual Start:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - ML Service:
```bash
cd ml-service
python api.py
```

Terminal 3 - Voter UI:
```bash
cd voter-ui
npm run dev
```

Terminal 4 - Observer Dashboard:
```bash
cd observer-dashboard
npm run dev
```

Terminal 5 - Admin Portal:
```bash
cd admin-portal
npm run dev
```

### 5. Access Applications

- **Backend API**: http://localhost:3000
- **Voter UI**: http://localhost:3001
- **Observer Dashboard**: http://localhost:3002
- **Admin Portal**: http://localhost:3003
- **ML Service**: http://localhost:5000
- **API Docs**: http://localhost:3000/api-docs

---

## Docker Deployment

### 1. Build Images

```bash
# Build all services
docker-compose build

# Or build individually
docker build -t election-backend:latest ./backend
docker build -t election-ml:latest ./ml-service
docker build -t election-voter-ui:latest ./voter-ui
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### 4. Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

---

## Kubernetes Deployment

### 1. Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

### 2. Create Namespace

```bash
kubectl create namespace production
kubectl create namespace staging
```

### 3. Create Secrets

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=host=postgres.example.com \
  --from-literal=password=your_secure_password \
  -n production

# App secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your_jwt_secret \
  --from-literal=encryption-key=your_encryption_key \
  -n production
```

### 4. Deploy Services

```bash
# Apply all manifests
kubectl apply -f infrastructure/kubernetes/ -n production

# Or deploy individually
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml -n production
kubectl apply -f infrastructure/kubernetes/ml-service-deployment.yaml -n production
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get svc -n production

# Check ingress
kubectl get ingress -n production
```

### 6. Scale Deployment

```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n production

# Auto-scaling is configured via HPA (see manifests)
kubectl get hpa -n production
```

---

## Production Deployment

### Architecture Overview

```
┌─────────────────────────────────────────┐
│           Load Balancer                  │
│         (NGINX/CloudFlare)               │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐        ┌─────▼────┐
│  CDN   │        │ Ingress  │
│  (UI)  │        │Controller│
└────────┘        └─────┬────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼───┐    ┌─────▼────┐   ┌────▼──────┐
    │Backend │    │ML Service│   │ Blockchain│
    │ (3-10  │    │   (2-5   │   │  Network  │
    │ pods)  │    │   pods)  │   │           │
    └────┬───┘    └─────┬────┘   └───────────┘
         │              │
    ┌────▼──────────────▼────┐
    │   Database Cluster      │
    │ PostgreSQL + MongoDB    │
    └─────────────────────────┘
```

### 1. DNS Configuration

Point your domains to the load balancer:
```
api.election-system.com       → Load Balancer IP
voter.election-system.com     → CDN/Load Balancer
observer.election-system.com  → CDN/Load Balancer
admin.election-system.com     → CDN/Load Balancer
```

### 2. SSL/TLS Configuration

**Using cert-manager:**
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f infrastructure/kubernetes/cert-issuer.yaml
```

### 3. Database Setup

**PostgreSQL High Availability:**
```bash
# Using Helm
helm install postgres bitnami/postgresql-ha \
  --set postgresql.replicaCount=3 \
  --set postgresql.database=election_db \
  -n production
```

**MongoDB Replica Set:**
```bash
helm install mongodb bitnami/mongodb \
  --set architecture=replicaset \
  --set replicaCount=3 \
  -n production
```

### 4. Blockchain Network

**Deploy Hyperledger Fabric:**
```bash
cd blockchain/network
./startNetwork.sh production
./deployChaincode.sh
```

### 5. Monitoring Setup

**Prometheus + Grafana:**
```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

**Access Grafana:**
```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Default: admin/prom-operator
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_SWAGGER=true
```

### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_SWAGGER=true
RATE_LIMIT_REQUESTS=1000
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_SWAGGER=false
RATE_LIMIT_REQUESTS=100
ENABLE_HTTPS=true
STRICT_SECURITY=true
```

---

## Database Setup

### 1. Initialize PostgreSQL

```bash
cd backend/db
node migrate.js
```

###2. Seed Test Data (Development Only)

```bash
node seed.js
```

### 3. Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_voters_aadhar ON voters(aadhar_number);
CREATE INDEX idx_voting_records_voter ON voting_records(voter_id);
CREATE INDEX idx_voting_records_election ON voting_records(election_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

---

## Monitoring & Logging

### Health Checks

- **Backend**: `GET /health`
- **ML Service**: `GET /health`
- **Database**: Check via admin tools

### Log Aggregation

**Using Loki:**
```bash
helm install loki grafana/loki-stack \
  --set promtail.enabled=true \
  -n monitoring
```

### Metrics

Key metrics to monitor:
- Request rate (RPS)
- Response time (p50, p95, p99)
- Error rate
- Database connections
- Memory/CPU usage
- Vote processing time
- Blockchain transaction rate

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check PostgreSQL status
kubectl logs deployment/postgres -n production

# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

**2. Pod Not Starting**
```bash
# Check pod events
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs <pod-name> -n production
```

**3. High Memory Usage**
```bash
# Check resource usage
kubectl top pods -n production

# Scale up
kubectl scale deployment backend --replicas=5 -n production
```

**4. Blockchain Sync Issues**
```bash
cd blockchain/network
./stopNetwork.sh
./startNetwork.sh
```

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** (monthly recommended)
3. **Use strong passwords** (min 32 characters)
4. **Enable HTTPS/TLS** in production
5. **Implement rate limiting** on all public endpoints
6. **Regular security audits** (`npm audit`, `snyk test`)
7. **Keep dependencies updated**
8. **Monitor logs** for suspicious activity
9. **Backup databases daily**
10. **Use secrets management** (Vault, AWS Secrets Manager)

---

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# MongoDB backup
mongodump --uri=$MONGODB_URI --out=backup_$(date +%Y%m%d)
```

### Restore
```bash
# PostgreSQL restore
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup_20240101.sql

# MongoDB restore
mongorestore --uri=$MONGODB_URI backup_20240101
```

---

## Support

For issues and questions:
- **Documentation**: https://docs.election-system.com
- **Issues**: https://github.com/yourusername/ElectionManagement/issues
- **Email**: support@election-system.com

---

**Last Updated**: February 2024
