# Blockchain Layer - Hyperledger Fabric

This directory contains the Hyperledger Fabric blockchain implementation for the Election Management System.

## 📁 Structure

```
blockchain/
├── chaincode/
│   └── voting/
│       ├── voting.go          # Main chaincode smart contract
│       ├── voting_test.go     # Comprehensive tests
│       ├── go.mod             # Go module dependencies
│       └── lib/
│           └── structs.go     # Data structure definitions
├── network/
│   ├── configtx.yaml          # Channel configuration
│   └── crypto-config.yaml     # Crypto material configuration
└── scripts/
    ├── startNetwork.sh        # Network startup script
    ├── deployChaincode.sh     # Chaincode deployment script
    └── stopNetwork.sh         # Network shutdown script
```

## 🔧 Features Implemented

### Smart Contract Functions

1. **`InitLedger()`** - Initialize blockchain with sample data
2. **`RegisterVoter(voterId, district, electionId)`** - Register voter eligibility
3. **`CastVote(voterId, electionId, candidateId, district, verificationHash, terminalId)`** - Record immutable vote
4. **`CheckVoterStatus(voterId, electionId)`** - Check if voter has voted
5. **`GetResults(electionId)`** - Get vote tallies
6. **`CreateElection(electionId, name, startDate, endDate, createdBy)`** - Create new election
7. **`RegisterCandidate(candidateId, electionId, name, party, district)`** - Register candidate
8. **`GetVoteByID(voteID)`** - Retrieve specific vote

### Security Features

✅ **Double-Voting Prevention** - Enforced at smart contract level  
✅ **Immutability** - All votes permanently recorded  
✅ **Election Status Validation** - Only active elections accept votes  
✅ **Voter Eligibility Checks** - Must be registered before voting  
✅ **Cryptographic Verification** - SHA-256 hash verification  

## 🚀 Quick Start

### 1. Start the Fabric Network

```bash
cd blockchain
./scripts/startNetwork.sh
```

This will:
- Generate cryptographic material for all organizations
- Create the election channel
- Start orderer and peer nodes
- Join peers to the channel

### 2. Deploy the Chaincode

```bash
./scripts/deployChaincode.sh
```

This will:
- Package the voting chaincode
- Install on peers
- Approve and commit to channel
- Initialize the ledger with sample data

### 3. Test the Deployment

Query the blockchain:

```bash
docker exec peer0.electioncommission.election.com \
  peer chaincode query \
  -C election-channel \
  -n voting \
  -c '{"function":"CheckVoterStatus","Args":["VOTER_001","ELECTION_2024_001"]}'
```

## 🧪 Testing

### Run Chaincode Tests

```bash
cd chaincode/voting
go test -v
```

### Test Coverage

The test suite includes:
- ✅ Ledger initialization
- ✅ Voter registration
- ✅ Duplicate registration prevention
- ✅ Successful vote casting
- ✅ **Double-voting prevention (CRITICAL)**
- ✅ Inactive election rejection
- ✅ Voter status checking
- ✅ Election creation
- ✅ Candidate registration

### Critical Test: Double-Voting Prevention

```go
func TestDoubleVotingPrevention(t *testing.T) {
    // First vote succeeds
    voteID1, err := contract.CastVote(...)
    assert.NoError(t, err)
    
    // Second vote MUST fail
    voteID2, err := contract.CastVote(...)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "DOUBLE_VOTE_ATTEMPT")
}
```

## 🏗️ Network Architecture

### Organizations

1. **Election Commission** - Primary organization managing elections
2. **Judiciary** - Oversight and validation
3. **Observers** - International monitoring entities

### Consensus

- **Type**: Raft (etcdraft)
- **Batch Size**: 10 transactions
- **Batch Timeout**: 2 seconds

### Channel

- **Name**: `election-channel`
- **Endorsement Policy**: Majority of organizations

## 📊 Data Models

### Voter

```go
type Voter struct {
    VoterID      string
    District     string
    ElectionID   string
    HasVoted     bool
    RegisteredAt time.Time
}
```

### Vote

```go
type Vote struct {
    VoteID           string
    ElectionID       string
    CandidateID      string
    District         string
    Timestamp        time.Time
    VerificationHash string
    TerminalID       string
}
```

### Election

```go
type Election struct {
    ElectionID  string
    Name        string
    StartDate   time.Time
    EndDate     time.Time
    Status      string  // PENDING, ACTIVE, COMPLETED
}
```

## 🔐 Security Principles

1. **No Voter Identity in Votes** - Votes are anonymous, only verification hashes
2. **Immutable Records** - Cannot modify or delete votes
3. **Distributed Consensus** - Multiple organizations validate transactions
4. **Cryptographic Proof** - All transactions signed and hashed

## 🛠️ Troubleshooting

### Network Won't Start

```bash
# Clean up and restart
./scripts/stopNetwork.sh
docker system prune -f
./scripts/startNetwork.sh
```

### Chaincode Deployment Fails

```bash
# Check peer logs
docker logs peer0.electioncommission.election.com

# Verify chaincode builds locally
cd chaincode/voting
GO111MODULE=on go mod vendor
go build
```

### Query Returns Empty

```bash
# Ensure ledger was initialized
docker exec peer0.electioncommission.election.com \
  peer chaincode invoke \
  -C election-channel \
  -n voting \
  -c '{"function":"InitLedger","Args":[]}'
```

## 📝 Next Steps

The blockchain layer is complete. Next implementation phases:

1. **Phase 3**: Backend API with Fabric SDK integration
2. **Phase 4**: IoT terminal integration
3. **Phase 5-7**: Frontend applications
4. **Phase 8**: ML fraud detection
5. **Phase 9**: Security hardening

## 🎯 Success Criteria

- [x] Chaincode compiles without errors
- [x] All tests pass
- [x] Double-voting prevention verified
- [x] Network starts successfully
- [x] Chaincode deploys to channel
- [x] Sample queries return valid data
- [ ] SDK integration complete (Phase 3)

---

**Built with Hyperledger Fabric 2.5 for maximum security and transparency.**
