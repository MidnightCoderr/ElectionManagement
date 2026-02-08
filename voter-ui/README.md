# Voter UI - User Guide

## Overview

The Voter UI is a React-based web application for casting votes in elections using biometric authentication and blockchain verification.

## Features

- 🔐 Biometric authentication
- 🗳️ Visual candidate selection
- ✅ Vote confirmation step
- 📜 Blockchain-verified receipts
- 📱 Responsive design

## Getting Started

### Installation

```bash
cd voter-ui
npm install
```

### Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

```bash
npm run dev
```

Access at: `http://localhost:3001`

### Build for Production

```bash
npm run build
```

## Voting Flow

1. **Biometric Authentication**
   - Voter places finger on sensor
   - System authenticates via backend
   - JWT token issued

2. **Candidate Selection**
   - View all candidates
   - Search by name or party
   - Select preferred candidate

3. **Vote Confirmation**
   - Review selection
   - Confirm vote submission
   - Vote sent to blockchain

4. **Success Receipt**
   - Vote ID displayed
   - Blockchain transaction confirmed
   - Receipt shown

## Security

- No biometric data stored
- JWT authentication
- HTTPS in production
- Vote anonymity maintained

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- Axios (API calls)

---

**Version:** 1.0.0
