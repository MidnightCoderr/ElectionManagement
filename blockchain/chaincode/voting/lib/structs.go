package lib

import (
	"time"
)

// Voter represents a registered voter's eligibility on the blockchain
type Voter struct {
	VoterID      string    `json:"voterId"`
	District     string    `json:"district"`
	ElectionID   string    `json:"electionId"`
	HasVoted     bool      `json:"hasVoted"`
	RegisteredAt time.Time `json:"registeredAt"`
}

// Vote represents a cast vote on the blockchain
type Vote struct {
	VoteID           string    `json:"voteId"`
	ElectionID       string    `json:"electionId"`
	CandidateID      string    `json:"candidateId"`
	District         string    `json:"district"`
	Timestamp        time.Time `json:"timestamp"`
	VerificationHash string    `json:"verificationHash"` // SHA-256 hash of biometric + timestamp
	TerminalID       string    `json:"terminalId"`
}

// Election represents an election configuration
type Election struct {
	ElectionID  string    `json:"electionId"`
	Name        string    `json:"name"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	Status      string    `json:"status"` // PENDING, ACTIVE, COMPLETED, CANCELLED
	CreatedBy   string    `json:"createdBy"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Candidate represents a candidate in an election
type Candidate struct {
	CandidateID string `json:"candidateId"`
	ElectionID  string `json:"electionId"`
	Name        string `json:"name"`
	Party       string `json:"party"`
	District    string `json:"district"`
}

// VoteResult represents the tally for a candidate
type VoteResult struct {
	CandidateID string `json:"candidateId"`
	Name        string `json:"name"`
	Party       string `json:"party"`
	VoteCount   int    `json:"voteCount"`
	District    string `json:"district"`
}

// ElectionResults represents complete results
type ElectionResults struct {
	ElectionID   string       `json:"electionId"`
	ElectionName string       `json:"electionName"`
	TotalVotes   int          `json:"totalVotes"`
	Results      []VoteResult `json:"results"`
	GeneratedAt  time.Time    `json:"generatedAt"`
}
