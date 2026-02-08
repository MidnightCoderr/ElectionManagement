# Monitoring & Maintenance Plan

## System Monitoring Strategy

### 1. Health Monitoring

**Services to Monitor:**
- Backend API (port 3000)
- ML Service (port 5000)
- PostgreSQL database
- MongoDB logs
- Redis cache
- Blockchain network
- IoT terminals

**Tools:**
- Prometheus + Grafana
- Loki (logs)
- Alert Manager

### 2. Key Metrics

**Application:**
- Request rate (RPS)
- Response time (p50, p95, p99)
- Error rate  
- Active connections

**Infrastructure:**
- CPU usage (< 70%)
- Memory usage (< 80%)
- Disk space (> 20% free)
- Network bandwidth

**Business:**
- Votes per hour
- Authentication success rate
- Fraud detection rate
- Terminal uptime

---

## Alert Configuration

### Critical Alerts (Page On-Call)

```yaml
- name: APIDown
  threshold: 3 failed health checks
  action: Page on-call engineer

- name: DatabaseDown
  threshold: Connection failure
  action: Page DBA + engineer

- name: HighErrorRate
  threshold: > 5% errors
  action: Page on-call engineer

- name: FraudDetected
  threshold: Confidence > 90%
  action: Notify security team
```

### Warning Alerts (Email/Slack)

- High CPU (> 80%)
- High memory (> 85%)
- Slow queries (> 1s)  
- Terminal offline

---

## Maintenance Schedule

### Daily
- [ ] Review error logs
- [ ] Check disk space
- [ ] Verify backups
- [ ] Monitor fraud alerts

### Weekly
- [ ] Database optimization
- [ ] Log rotation
- [ ] Security patches
- [ ] Performance review

### Monthly
- [ ] Rotate secrets/keys
- [ ] Update dependencies
- [ ] Capacity planning
- [ ] Security audit

---

## Backup Strategy

### Database Backups

**PostgreSQL:**
```bash
# Daily full backup
0 2 * * * pg_dump election_db > /backups/db_$(date +\%Y\%m\%d).sql

# Retention: 30 days
```

**MongoDB:**
```bash
# Daily backup
0 3 * * * mongodump --uri=$MONGODB_URI --out=/backups/mongo_$(date +\%Y\%m\%d)

# Retention: 30 days
```

### Blockchain Backup
- Ledger snapshot: Weekly
- Chaincode backup: After each deployment
- Network config: Version controlled

---

## Incident Response

### Severity Levels

**P0 - Critical**
- System down
- Data breach
- Blockchain failure
- Response: < 15 minutes

**P1 - High**
- Major feature broken
- Performance degradation
- Response: < 1 hour

**P2 - Medium**
- Minor bugs
- Non-critical issues
- Response: < 24 hours

**P3 - Low**
- Feature requests
- Documentation
- Response: Next sprint

### On-Call Rotation
- 24/7 coverage during elections
- 1-week rotations
- Primary + backup engineer

---

## Runbooks

### Service Restart

```bash
# Backend
kubectl rollout restart deployment/backend -n production

# ML Service
kubectl rollout restart deployment/ml-service -n production

# Check status
kubectl rollout status deployment/backend -n production
```

### Database Recovery

```bash
# PostgreSQL restore
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup_YYYYMMDD.sql

# MongoDB restore
mongorestore --uri=$MONGODB_URI backup_YYYYMMDD/
```

### Blockchain Network Reset

```bash
cd blockchain/network
./stopNetwork.sh
./startNetwork.sh
./deployChaincode.sh
```

---

## Performance Tuning

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM votes WHERE election_id = '...';

-- Create indexes
CREATE INDEX CONCURRENTLY idx_votes_election ON votes(election_id);

-- Vacuum
VACUUM ANALYZE votes;
```

### Application Tuning

- Enable Redis caching
- Connection pooling (pg: 20, mongo: 10)
- Compress responses (gzip)
- CDN for static assets

---

## Security Maintenance

### Regular Tasks

**Weekly:**
- Review audit logs
- Check fraud alerts
- Monitor failed logins

**Monthly:**
- Rotate encryption keys
- Update SSL certificates
- Dependency updates: `npm audit fix`

**Quarterly:**
- Penetration testing
- Security audit
- Access review

---

## Capacity Planning

### Scaling Triggers

**Scale Up (add pods):**
- CPU > 70% for 5 min
- Memory > 80% for 5 min
- Response time > 2s

**Scale Down:**
- CPU < 30% for 15 min
- Outside election period

### Resource Estimates

**Per 10,000 voters:**
- Backend: 2 pods (2 CPU, 4GB RAM each)
- ML Service: 1 pod (1 CPU, 2GB RAM)
- Database: 50GB storage

---

## Contacts

**Engineering Team**: engineering@election-system.com  
**Security Team**: security@election-system.com  
**On-Call Phone**: +1-XXX-XXX-XXXX

---

**Last Updated:** February 2024
