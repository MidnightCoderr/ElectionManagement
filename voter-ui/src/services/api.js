import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('voterToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('voterToken')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

// Authentication
export const authenticateBiometric = async (biometricHash, terminalId) => {
    const response = await api.post('/auth/biometric', {
        biometricTemplate: biometricHash,
        terminalId,
    })
    return response.data
}

// Elections
export const getActiveElections = async () => {
    const response = await api.get('/elections?status=active')
    return response.data
}

export const getElection = async (electionId) => {
    const response = await api.get(`/elections/${electionId}`)
    return response.data
}

// Candidates
export const getCandidates = async (electionId, districtId) => {
    const response = await api.get('/candidates', {
        params: { electionId, districtId },
    })
    return response.data
}

// Voting
export const castVote = async (voteData) => {
    const response = await api.post('/votes/cast', voteData)
    return response.data
}

export const checkVoterStatus = async (voterId, electionId) => {
    const response = await api.get(`/votes/status/${voterId}/${electionId}`)
    return response.data
}

export const getResults = async (electionId) => {
    const response = await api.get(`/votes/results/${electionId}`)
    return response.data
}

export default api
