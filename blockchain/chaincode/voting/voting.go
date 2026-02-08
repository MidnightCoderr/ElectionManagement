package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/navyaaasingh/ElectionManagement/blockchain/chaincode/voting/lib"
)

// VotingContract provides functions for managing elections and votes
type VotingContract struct {
	contractapi.Contract
}

// InitLedger initializes the blockchain ledger with sample data
func (vc *VotingContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("Initializing Election Ledger")

	// Create a sample election
	election := lib.Election{
		ElectionID: "ELECTION_2024_001",
		Name:       "General Election 2024",
		StartDate:  time.Now(),
		EndDate:    time.Now().Add(24 * time.Hour),
		Status:     "ACTIVE",
		CreatedBy:  "ADMIN_001",
		CreatedAt:  time.Now(),
	}

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return fmt.Errorf("failed to marshal election: %v", err)
	}

	err = ctx.GetStub().PutState("ELECTION_"+election.ElectionID, electionJSON)
	if err != nil {
		return fmt.Errorf("failed to put election to world state: %v", err)
	}

	// Create sample candidates
	candidates := []lib.Candidate{
		{
			CandidateID: "CANDIDATE_001",
			ElectionID:  "ELECTION_2024_001",
			Name:        "Alice Johnson",
			Party:       "Progressive Party",
			District:    "District 001",
		},
		{
			CandidateID: "CANDIDATE_002",
			ElectionID:  "ELECTION_2024_001",
			Name:        "Bob Smith",
			Party:       "Democratic Alliance",
			District:    "District 001",
		},
	}

	for _, candidate := range candidates {
		candidateJSON, err := json.Marshal(candidate)
		if err != nil {
			return fmt.Errorf("failed to marshal candidate: %v", err)
		}

		err = ctx.GetStub().PutState("CANDIDATE_"+candidate.CandidateID, candidateJSON)
		if err != nil {
			return fmt.Errorf("failed to put candidate to world state: %v", err)
		}
	}

	fmt.Println("Ledger initialized successfully")
	return nil
}

// RegisterVoter registers a voter's eligibility for an election
func (vc *VotingContract) RegisterVoter(ctx contractapi.TransactionContextInterface, voterID string, district string, electionID string) error {
	// Check if voter already registered for this election
	compositeKey := "VOTER_" + electionID + "_" + voterID
	existingVoter, err := ctx.GetStub().GetState(compositeKey)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}

	if existingVoter != nil {
		return fmt.Errorf("voter %s already registered for election %s", voterID, electionID)
	}

	// Create voter record
	voter := lib.Voter{
		VoterID:      voterID,
		District:     district,
		ElectionID:   electionID,
		HasVoted:     false,
		RegisteredAt: time.Now(),
	}

	voterJSON, err := json.Marshal(voter)
	if err != nil {
		return fmt.Errorf("failed to marshal voter: %v", err)
	}

	err = ctx.GetStub().PutState(compositeKey, voterJSON)
	if err != nil {
		return fmt.Errorf("failed to put voter to world state: %v", err)
	}

	fmt.Printf("Voter %s registered for election %s\n", voterID, electionID)
	return nil
}

// CastVote records a vote on the blockchain
// This is the critical function that ensures immutability and prevents double-voting
func (vc *VotingContract) CastVote(ctx contractapi.TransactionContextInterface, voterID string, electionID string, candidateID string, district string, verificationHash string, terminalID string) (string, error) {
	// 1. Check if voter is registered
	voterKey := "VOTER_" + electionID + "_" + voterID
	voterBytes, err := ctx.GetStub().GetState(voterKey)
	if err != nil {
		return "", fmt.Errorf("failed to read voter: %v", err)
	}
	if voterBytes == nil {
		return "", fmt.Errorf("voter %s not registered for election %s", voterID, electionID)
	}

	var voter lib.Voter
	err = json.Unmarshal(voterBytes, &voter)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal voter: %v", err)
	}

	// 2. CRITICAL: Check if voter has already voted (double-voting prevention)
	if voter.HasVoted {
		return "", fmt.Errorf("DOUBLE_VOTE_ATTEMPT: voter %s has already voted in election %s", voterID, electionID)
	}

	// 3. Verify election is active
	electionKey := "ELECTION_" + electionID
	electionBytes, err := ctx.GetStub().GetState(electionKey)
	if err != nil {
		return "", fmt.Errorf("failed to read election: %v", err)
	}
	if electionBytes == nil {
		return "", fmt.Errorf("election %s does not exist", electionID)
	}

	var election lib.Election
	err = json.Unmarshal(electionBytes, &election)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal election: %v", err)
	}

	if election.Status != "ACTIVE" {
		return "", fmt.Errorf("election %s is not active (status: %s)", electionID, election.Status)
	}

	// 4. Verify candidate exists
	candidateKey := "CANDIDATE_" + candidateID
	candidateBytes, err := ctx.GetStub().GetState(candidateKey)
	if err != nil {
		return "", fmt.Errorf("failed to read candidate: %v", err)
	}
	if candidateBytes == nil {
		return "", fmt.Errorf("candidate %s does not exist", candidateID)
	}

	// 5. Generate unique vote ID
	voteID := "VOTE_" + electionID + "_" + fmt.Sprintf("%d", time.Now().UnixNano())

	// 6. Create vote record
	vote := lib.Vote{
		VoteID:           voteID,
		ElectionID:       electionID,
		CandidateID:      candidateID,
		District:         district,
		Timestamp:        time.Now(),
		VerificationHash: verificationHash,
		TerminalID:       terminalID,
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return "", fmt.Errorf("failed to marshal vote: %v", err)
	}

	// 7. Store vote
	err = ctx.GetStub().PutState(voteID, voteJSON)
	if err != nil {
		return "", fmt.Errorf("failed to put vote to world state: %v", err)
	}

	// 8. CRITICAL: Mark voter as having voted (prevents double-voting)
	voter.HasVoted = true
	voterJSON, err := json.Marshal(voter)
	if err != nil {
		return "", fmt.Errorf("failed to marshal updated voter: %v", err)
	}

	err = ctx.GetStub().PutState(voterKey, voterJSON)
	if err != nil {
		return "", fmt.Errorf("failed to update voter status: %v", err)
	}

	// 9. Emit event for real-time monitoring
	eventPayload := fmt.Sprintf("Vote cast: %s in election %s", voteID, electionID)
	err = ctx.GetStub().SetEvent("VoteCast", []byte(eventPayload))
	if err != nil {
		return "", fmt.Errorf("failed to set event: %v", err)
	}

	fmt.Printf("Vote %s cast successfully\n", voteID)
	return voteID, nil
}

// CheckVoterStatus checks if a voter has voted in an election
func (vc *VotingContract) CheckVoterStatus(ctx contractapi.TransactionContextInterface, voterID string, electionID string) (*lib.Voter, error) {
	voterKey := "VOTER_" + electionID + "_" + voterID
	voterBytes, err := ctx.GetStub().GetState(voterKey)
	if err != nil {
		return nil, fmt.Errorf("failed to read voter: %v", err)
	}
	if voterBytes == nil {
		return nil, fmt.Errorf("voter %s not found for election %s", voterID, electionID)
	}

	var voter lib.Voter
	err = json.Unmarshal(voterBytes, &voter)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal voter: %v", err)
	}

	return &voter, nil
}

// GetResults retrieves vote tallies for an election
func (vc *VotingContract) GetResults(ctx contractapi.TransactionContextInterface, electionID string) (*lib.ElectionResults, error) {
	// Get election details
	electionKey := "ELECTION_" + electionID
	electionBytes, err := ctx.GetStub().GetState(electionKey)
	if err != nil {
		return nil, fmt.Errorf("failed to read election: %v", err)
	}
	if electionBytes == nil {
		return nil, fmt.Errorf("election %s does not exist", electionID)
	}

	var election lib.Election
	err = json.Unmarshal(electionBytes, &election)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal election: %v", err)
	}

	// Query all votes for this election
	query := fmt.Sprintf(`{"selector":{"electionId":"%s"}}`, electionID)
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query votes: %v", err)
	}
	defer resultsIterator.Close()

	// Count votes per candidate
	voteCounts := make(map[string]int)
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to iterate: %v", err)
		}

		var vote lib.Vote
		err = json.Unmarshal(queryResponse.Value, &vote)
		if err != nil {
			continue // Skip invalid entries
		}

		voteCounts[vote.CandidateID]++
	}

	// Build results
	var results []lib.VoteResult
	totalVotes := 0

	for candidateID, count := range voteCounts {
		candidateKey := "CANDIDATE_" + candidateID
		candidateBytes, _ := ctx.GetStub().GetState(candidateKey)
		
		var candidate lib.Candidate
		if candidateBytes != nil {
			json.Unmarshal(candidateBytes, &candidate)
		}

		results = append(results, lib.VoteResult{
			CandidateID: candidateID,
			Name:        candidate.Name,
			Party:       candidate.Party,
			VoteCount:   count,
			District:    candidate.District,
		})
		totalVotes += count
	}

	electionResults := &lib.ElectionResults{
		ElectionID:   electionID,
		ElectionName: election.Name,
		TotalVotes:   totalVotes,
		Results:      results,
		GeneratedAt:  time.Now(),
	}

	return electionResults, nil
}

// GetVoteByID retrieves a specific vote by its ID
func (vc *VotingContract) GetVoteByID(ctx contractapi.TransactionContextInterface, voteID string) (*lib.Vote, error) {
	voteBytes, err := ctx.GetStub().GetState(voteID)
	if err != nil {
		return nil, fmt.Errorf("failed to read vote: %v", err)
	}
	if voteBytes == nil {
		return nil, fmt.Errorf("vote %s does not exist", voteID)
	}

	var vote lib.Vote
	err = json.Unmarshal(voteBytes, &vote)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal vote: %v", err)
	}

	return &vote, nil
}

// CreateElection creates a new election
func (vc *VotingContract) CreateElection(ctx contractapi.TransactionContextInterface, electionID string, name string, startDate string, endDate string, createdBy string) error {
	electionKey := "ELECTION_" + electionID
	existingElection, err := ctx.GetStub().GetState(electionKey)
	if err != nil {
		return fmt.Errorf("failed to read election: %v", err)
	}
	if existingElection != nil {
		return fmt.Errorf("election %s already exists", electionID)
	}

	start, err := time.Parse(time.RFC3339, startDate)
	if err != nil {
		return fmt.Errorf("invalid start date format: %v", err)
	}

	end, err := time.Parse(time.RFC3339, endDate)
	if err != nil {
		return fmt.Errorf("invalid end date format: %v", err)
	}

	election := lib.Election{
		ElectionID: electionID,
		Name:       name,
		StartDate:  start,
		EndDate:    end,
		Status:     "PENDING",
		CreatedBy:  createdBy,
		CreatedAt:  time.Now(),
	}

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return fmt.Errorf("failed to marshal election: %v", err)
	}

	err = ctx.GetStub().PutState(electionKey, electionJSON)
	if err != nil {
		return fmt.Errorf("failed to put election to world state: %v", err)
	}

	fmt.Printf("Election %s created successfully\n", electionID)
	return nil
}

// RegisterCandidate registers a candidate for an election
func (vc *VotingContract) RegisterCandidate(ctx contractapi.TransactionContextInterface, candidateID string, electionID string, name string, party string, district string) error {
	candidateKey := "CANDIDATE_" + candidateID
	existingCandidate, err := ctx.GetStub().GetState(candidateKey)
	if err != nil {
		return fmt.Errorf("failed to read candidate: %v", err)
	}
	if existingCandidate != nil {
		return fmt.Errorf("candidate %s already exists", candidateID)
	}

	candidate := lib.Candidate{
		CandidateID: candidateID,
		ElectionID:  electionID,
		Name:        name,
		Party:       party,
		District:    district,
	}

	candidateJSON, err := json.Marshal(candidate)
	if err != nil {
		return fmt.Errorf("failed to marshal candidate: %v", err)
	}

	err = ctx.GetStub().PutState(candidateKey, candidateJSON)
	if err != nil {
		return fmt.Errorf("failed to put candidate to world state: %v", err)
	}

	fmt.Printf("Candidate %s registered successfully\n", candidateID)
	return nil
}

func main() {
	votingChaincode, err := contractapi.NewChaincode(&VotingContract{})
	if err != nil {
		fmt.Printf("Error creating voting chaincode: %v\n", err)
		return
	}

	if err := votingChaincode.Start(); err != nil {
		fmt.Printf("Error starting voting chaincode: %v\n", err)
	}
}
