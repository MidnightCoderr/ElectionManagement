import { create } from 'zustand'

export const useVotingStore = create((set) => ({
    // Voter state
    voter: null,
    isAuthenticated: false,

    // Election state
    currentElection: null,
    candidates: [],
    selectedCandidate: null,

    // Voting state
    hasVoted: false,
    voteReceipt: null,
    loading: false,
    error: null,

    // Actions
    setVoter: (voter) => set({ voter, isAuthenticated: true }),

    setElection: (election) => set({ currentElection: election }),

    setCandidates: (candidates) => set({ candidates }),

    selectCandidate: (candidateId) => set({ selectedCandidate: candidateId }),

    setVoteReceipt: (receipt) => set({
        voteReceipt: receipt,
        hasVoted: true
    }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    reset: () => set({
        voter: null,
        isAuthenticated: false,
        currentElection: null,
        candidates: [],
        selectedCandidate: null,
        hasVoted: false,
        voteReceipt: null,
        loading: false,
        error: null,
    }),
}))
