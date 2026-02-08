package main

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/navyaaasingh/ElectionManagement/blockchain/chaincode/voting/lib"
	"github.com/stretchr/testify/assert"
)

// MockTransactionContext is a mock implementation for testing
type MockTransactionContext struct {
	contractapi.TransactionContext
	stub *shim.MockStub
}

func (m *MockTransactionContext) GetStub() shim.ChaincodeStubInterface {
	return m.stub
}

// TestInitLedger tests the ledger initialization
func TestInitLedger(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	err := contract.InitLedger(ctx)
	assert.NoError(t, err, "InitLedger should not return an error")

	// Verify election was created
	electionBytes := stub.State["ELECTION_ELECTION_2024_001"]
	assert.NotNil(t, electionBytes, "Election should exist in state")

	var election lib.Election
	err = json.Unmarshal(electionBytes, &election)
	assert.NoError(t, err)
	assert.Equal(t, "General Election 2024", election.Name)
}

// TestRegisterVoter tests voter registration
func TestRegisterVoter(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Register a voter
	err := contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")
	assert.NoError(t, err, "RegisterVoter should not return an error")

	// Verify voter exists
	voterBytes := stub.State["VOTER_ELECTION_001_VOTER_001"]
	assert.NotNil(t, voterBytes, "Voter should exist in state")

	var voter lib.Voter
	err = json.Unmarshal(voterBytes, &voter)
	assert.NoError(t, err)
	assert.Equal(t, "VOTER_001", voter.VoterID)
	assert.False(t, voter.HasVoted, "New voter should not have voted yet")
}

// TestRegisterVoterDuplicate tests that duplicate registration is prevented
func TestRegisterVoterDuplicate(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Register voter first time
	err := contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")
	assert.NoError(t, err)

	// Try to register same voter again
	err = contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")
	assert.Error(t, err, "Duplicate registration should return an error")
	assert.Contains(t, err.Error(), "already registered")
}

// TestCastVote tests successful vote casting
func TestCastVote(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Setup: Create election
	election := lib.Election{
		ElectionID: "ELECTION_001",
		Name:       "Test Election",
		Status:     "ACTIVE",
		StartDate:  time.Now(),
		EndDate:    time.Now().Add(24 * time.Hour),
		CreatedBy:  "ADMIN",
		CreatedAt:  time.Now(),
	}
	electionJSON, _ := json.Marshal(election)
	stub.State["ELECTION_ELECTION_001"] = electionJSON

	// Setup: Create candidate
	candidate := lib.Candidate{
		CandidateID: "CANDIDATE_001",
		ElectionID:  "ELECTION_001",
		Name:        "Test Candidate",
		Party:       "Test Party",
		District:    "District 001",
	}
	candidateJSON, _ := json.Marshal(candidate)
	stub.State["CANDIDATE_CANDIDATE_001"] = candidateJSON

	// Setup: Register voter
	err := contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")
	assert.NoError(t, err)

	// Cast vote
	voteID, err := contract.CastVote(ctx, "VOTER_001", "ELECTION_001", "CANDIDATE_001", "District 001", "abc123hash", "TERMINAL_001")
	assert.NoError(t, err, "CastVote should not return an error")
	assert.NotEmpty(t, voteID, "Vote ID should be returned")

	// Verify voter is marked as voted
	voterBytes := stub.State["VOTER_ELECTION_001_VOTER_001"]
	var voter lib.Voter
	json.Unmarshal(voterBytes, &voter)
	assert.True(t, voter.HasVoted, "Voter should be marked as having voted")
}

// TestDoubleVotingPrevention is the CRITICAL test for election integrity
func TestDoubleVotingPrevention(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Setup: Create election
	election := lib.Election{
		ElectionID: "ELECTION_001",
		Name:       "Test Election",
		Status:     "ACTIVE",
		StartDate:  time.Now(),
		EndDate:    time.Now().Add(24 * time.Hour),
		CreatedBy:  "ADMIN",
		CreatedAt:  time.Now(),
	}
	electionJSON, _ := json.Marshal(election)
	stub.State["ELECTION_ELECTION_001"] = electionJSON

	// Setup: Create candidate
	candidate := lib.Candidate{
		CandidateID: "CANDIDATE_001",
		ElectionID:  "ELECTION_001",
		Name:        "Test Candidate",
		Party:       "Test Party",
		District:    "District 001",
	}
	candidateJSON, _ := json.Marshal(candidate)
	stub.State["CANDIDATE_CANDIDATE_001"] = candidateJSON

	// Setup: Register voter
	contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")

	// Cast first vote - should succeed
	voteID1, err := contract.CastVote(ctx, "VOTER_001", "ELECTION_001", "CANDIDATE_001", "District 001", "hash1", "TERMINAL_001")
	assert.NoError(t, err, "First vote should succeed")
	assert.NotEmpty(t, voteID1)

	// Attempt to cast second vote - should FAIL
	voteID2, err := contract.CastVote(ctx, "VOTER_001", "ELECTION_001", "CANDIDATE_001", "District 001", "hash2", "TERMINAL_001")
	assert.Error(t, err, "Second vote should be rejected")
	assert.Contains(t, err.Error(), "DOUBLE_VOTE_ATTEMPT", "Error should indicate double voting")
	assert.Empty(t, voteID2, "No vote ID should be returned")
}

// TestCastVoteInactiveElection tests that votes cannot be cast in inactive elections
func TestCastVoteInactiveElection(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Setup: Create COMPLETED election
	election := lib.Election{
		ElectionID: "ELECTION_001",
		Name:       "Test Election",
		Status:     "COMPLETED",
		StartDate:  time.Now().Add(-48 * time.Hour),
		EndDate:    time.Now().Add(-24 * time.Hour),
		CreatedBy:  "ADMIN",
		CreatedAt:  time.Now(),
	}
	electionJSON, _ := json.Marshal(election)
	stub.State["ELECTION_ELECTION_001"] = electionJSON

	// Setup: Register voter
	contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")

	// Attempt to cast vote in completed election
	voteID, err := contract.CastVote(ctx, "VOTER_001", "ELECTION_001", "CANDIDATE_001", "District 001", "hash", "TERMINAL_001")
	assert.Error(t, err, "Vote in completed election should fail")
	assert.Contains(t, err.Error(), "not active")
	assert.Empty(t, voteID)
}

// TestCheckVoterStatus tests voter status checking
func TestCheckVoterStatus(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	// Register voter
	contract.RegisterVoter(ctx, "VOTER_001", "District 001", "ELECTION_001")

	// Check status
	voter, err := contract.CheckVoterStatus(ctx, "VOTER_001", "ELECTION_001")
	assert.NoError(t, err)
	assert.NotNil(t, voter)
	assert.Equal(t, "VOTER_001", voter.VoterID)
	assert.False(t, voter.HasVoted)
}

// TestCreateElection tests election creation
func TestCreateElection(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	startDate := time.Now().Format(time.RFC3339)
	endDate := time.Now().Add(24 * time.Hour).Format(time.RFC3339)

	err := contract.CreateElection(ctx, "ELECTION_NEW", "New Election", startDate, endDate, "ADMIN_001")
	assert.NoError(t, err)

	// Verify election exists
	electionBytes := stub.State["ELECTION_ELECTION_NEW"]
	assert.NotNil(t, electionBytes)

	var election lib.Election
	json.Unmarshal(electionBytes, &election)
	assert.Equal(t, "New Election", election.Name)
	assert.Equal(t, "PENDING", election.Status)
}

// TestRegisterCandidate tests candidate registration
func TestRegisterCandidate(t *testing.T) {
	contract := new(VotingContract)
	stub := shim.NewMockStub("voting", nil)
	ctx := &MockTransactionContext{stub: stub}

	err := contract.RegisterCandidate(ctx, "CANDIDATE_NEW", "ELECTION_001", "John Doe", "Independent", "District 001")
	assert.NoError(t, err)

	// Verify candidate exists
	candidateBytes := stub.State["CANDIDATE_CANDIDATE_NEW"]
	assert.NotNil(t, candidateBytes)

	var candidate lib.Candidate
	json.Unmarshal(candidateBytes, &candidate)
	assert.Equal(t, "John Doe", candidate.Name)
	assert.Equal(t, "Independent", candidate.Party)
}
