# Cloud Deployment Guide: AWS & DigitalOcean

This guide provides step-by-step instructions for deploying the Election Management System to a cloud provider. Since the system is fully containerized with Docker, the deployment process is straightforward on any standard Linux Virtual Private Server (VPS).

## Option A: DigitalOcean (Recommended for Simplicity & Cost)

DigitalOcean is perfect for testing, staging, and small-to-medium scale productions. We will deploy the system using a standard **Droplet** (VPS).

### 1. Provision a Droplet
1. Create an account on [DigitalOcean](https://www.digitalocean.com/).
2. Create a new Droplet.
3. **OS**: Choose **Ubuntu 24.04 LTS**.
4. **Plan**: Choose a Basic Premium Intel/AMD plan.
   * *Minimum Required*: 4 GB RAM / 2 CPUs ($24/mo) — required for Fabric & DBs.
5. **Authentication**: Use SSH keys for security.
6. Click **Create Droplet**.

### 2. Server Setup & Dependencies
SSH into your new droplet:
```bash
ssh root@your_droplet_ip
```

Install Docker and Git:
```bash
# Update packages
apt update && apt upgrade -y

# Install Docker & Compose
apt install docker.io docker-compose git curl -y

# Start and enable Docker
systemctl start docker
systemctl enable docker
```

### 3. Deploy the Application
```bash
# Clone the repository
git clone https://github.com/navyaaasingh/ElectionManagement.git
cd ElectionManagement

# Setup Environment Variables
cp .env.example .env
nano .env  # Update JWT_SECRET, passwords, and set HOSTs to your Droplet's IP

# Start the Infrastructure & Backend
docker-compose --profile backend up -d

# Start Frontends (if needed directly on VPS, though Vercel is recommended for UI)
docker-compose --profile frontend up -d
```

Your backend API is now running at `http://YOUR_DROPLET_IP:3000`.

---

## Option B: Amazon Web Services (AWS) (Recommended for Enterprise Scale)

AWS is recommended for high availability, auto-scaling, and production-grade security.

### 1. Provision an EC2 Instance
1. Go to the AWS EC2 Dashboard.
2. Click **Launch Instance**.
3. **AMI**: Select **Ubuntu Server 24.04 LTS**.
4. **Instance Type**: Select **t3.medium** (4 GB RAM, 2 vCPU).
5. **Key Pair**: Create or select an existing `.pem` key.
6. **Security Group**: Allow the following inbound ports:
   * `22` (SSH)
   * `80` (HTTP)
   * `443` (HTTPS)
   * `3000` (Backend API)
   * `1883` (MQTT)
   * `3001-3003` (Frontend apps, for testing)
7. Click **Launch**.

### 2. Server Setup
SSH into your EC2 instance (replace `key.pem` and `IP`):
```bash
ssh -i "key.pem" ubuntu@your_ec2_public_ip
```

Install Docker:
```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Deploy
```bash
git clone https://github.com/navyaaasingh/ElectionManagement.git
cd ElectionManagement

cp .env.example .env
nano .env # Configure production passwords!

# Launch
docker-compose up -d
```

---

## Next Steps for Production 🚀

1. **Domain Name & SSL**:
   * Point your domain (e.g., `api.election.com`) to your Droplet/EC2 IP.
   * Install **Nginx** and **Certbot** on the server to reverse-proxy traffic to port `3000` and enable HTTPS (`certbot --nginx`).

2. **Frontend Hosting (Vercel/Netlify)**:
   * Do not host frontends on the VPS if handling high traffic.
   * Import the `voter-ui`, `admin-portal`, and `observer-dashboard` folders directly into **Vercel**.
   * Set the environment variables in Vercel to point to your new cloud API:
     `VITE_API_BASE_URL=https://api.yourdomain.com/v1`

3. **Database Backups**:
   * Set up automated cron jobs to `pg_dump` the PostgreSQL database and back it up to an S3 bucket or DigitalOcean Spaces daily.
