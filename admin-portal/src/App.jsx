import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/v1'

function App() {
    const [activeTab, setActiveTab] = useState('elections')
    const [elections, setElections] = useState([])
    const [candidates, setCandidates] = useState([])
    const [showCreateElection, setShowCreateElection] = useState(false)
    const [showCreateCandidate, setShowCreateCandidate] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loginForm, setLoginForm] = useState({ username: '', password: '' })

    // Login
    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${API_URL}/auth/admin/login`, loginForm)
            localStorage.setItem('adminToken', response.data.token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
            setIsAuthenticated(true)
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || error.message))
        }
    }

    // Fetch data
    useEffect(() => {
        if (isAuthenticated) {
            fetchElections()
            fetchCandidates()
        }
    }, [isAuthenticated])

    const fetchElections = async () => {
        try {
            const response = await axios.get(`${API_URL}/elections`)
            setElections(response.data.elections || [])
        } catch (error) {
            console.error('Failed to fetch elections:', error)
        }
    }

    const fetchCandidates = async () => {
        try {
            const response = await axios.get(`${API_URL}/candidates`)
            setCandidates(response.data.candidates || [])
        } catch (error) {
            console.error('Failed to fetch candidates:', error)
        }
    }

    // Create election
    const createElection = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        try {
            await axios.post(`${API_URL}/elections`, {
                electionName: formData.get('name'),
                electionType: formData.get('type'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
            })

            alert('Election created successfully!')
            setShowCreateElection(false)
            fetchElections()
        } catch (error) {
            alert('Failed to create election: ' + (error.response?.data?.message || error.message))
        }
    }

    // Update election status
    const updateElectionStatus = async (electionId, status) => {
        try {
            await axios.put(`${API_URL}/elections/${electionId}/status`, { status })
            alert(`Election ${status} successfully!`)
            fetchElections()
        } catch (error) {
            alert('Failed to update status: ' + (error.response?.data?.message || error.message))
        }
    }

    // Create candidate
    const createCandidate = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        try {
            await axios.post(`${API_URL}/candidates`, {
                electionId: formData.get('electionId'),
                fullName: formData.get('fullName'),
                partyName: formData.get('partyName'),
                partySymbol: formData.get('partySymbol'),
                districtId: formData.get('districtId'),
                candidatePhoto: formData.get('photoUrl'),
            })

            alert('Candidate registered successfully!')
            setShowCreateCandidate(false)
            fetchCandidates()
        } catch (error) {
            alert('Failed to register candidate: ' + (error.response?.data?.message || error.message))
        }
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
                <div className="card max-w-md w-full">
                    <h1 className="text-3xl font-bold text-center mb-6">🔐 Admin Portal</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Login
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Demo: admin / admin123
                        </p>
                    </form>
                </div>
            </div>
        )
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">⚙️ Election Admin Portal</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('adminToken')
                            setIsAuthenticated(false)
                        }}
                        className="btn btn-danger"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        {['elections', 'candidates'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 border-b-2 font-medium capitalize ${activeTab === tab
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'elections' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Elections</h2>
                            <button
                                onClick={() => setShowCreateElection(!showCreateElection)}
                                className="btn btn-primary"
                            >
                                + Create Election
                            </button>
                        </div>

                        {/* Create Election Form */}
                        {showCreateElection && (
                            <div className="card mb-6">
                                <h3 className="text-xl font-bold mb-4">Create New Election</h3>
                                <form onSubmit={createElection} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Election Name</label>
                                        <input name="name" type="text" className="w-full px-4 py-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Type</label>
                                        <select name="type" className="w-full px-4 py-2 border rounded-lg" required>
                                            <option value="general">General</option>
                                            <option value="state">State</option>
                                            <option value="local">Local</option>
                                            <option value="by-election">By-election</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Start Date</label>
                                            <input name="startDate" type="datetime-local" className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">End Date</label>
                                            <input name="endDate" type="datetime-local" className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="btn btn-primary">Create</button>
                                        <button type="button" onClick={() => setShowCreateElection(false)} className="btn bg-gray-200">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Elections List */}
                        <div className="grid gap-4">
                            {elections.map(election => (
                                <div key={election.election_id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{election.election_name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Type: {election.election_type} | Status: <span className="font-semibold">{election.status}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Votes: {election.total_votes_cast} / {election.total_voters}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {election.status === 'upcoming' && (
                                                <button
                                                    onClick={() => updateElectionStatus(election.election_id, 'active')}
                                                    className="btn bg-green-600 text-white text-sm"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {election.status === 'active' && (
                                                <button
                                                    onClick={() => updateElectionStatus(election.election_id, 'completed')}
                                                    className="btn btn-danger text-sm"
                                                >
                                                    End
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'candidates' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Candidates</h2>
                            <button
                                onClick={() => setShowCreateCandidate(!showCreateCandidate)}
                                className="btn btn-primary"
                            >
                                + Register Candidate
                            </button>
                        </div>

                        {/* Create Candidate Form */}
                        {showCreateCandidate && (
                            <div className="card mb-6">
                                <h3 className="text-xl font-bold mb-4">Register New Candidate</h3>
                                <form onSubmit={createCandidate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Election</label>
                                        <select name="electionId" className="w-full px-4 py-2 border rounded-lg" required>
                                            {elections.map(e => (
                                                <option key={e.election_id} value={e.election_id}>{e.election_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <input name="fullName" type="text" className="w-full px-4 py-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Party Name</label>
                                        <input name="partyName" type="text" className="w-full px-4 py-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">District ID</label>
                                        <input name="districtId" type="text" className="w-full px-4 py-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Party Symbol URL (optional)</label>
                                        <input name="partySymbol" type="url" className="w-full px-4 py-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Photo URL (optional)</label>
                                        <input name="photoUrl" type="url" className="w-full px-4 py-2 border rounded-lg" />
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="btn btn-primary">Register</button>
                                        <button type="button" onClick={() => setShowCreateCandidate(false)} className="btn bg-gray-200">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Candidates List */}
                        <div className="grid gap-4">
                            {candidates.map(candidate => (
                                <div key={candidate.candidate_id} className="card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                            {candidate.candidate_photo ? (
                                                <img src={candidate.candidate_photo} alt={candidate.full_name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold">{candidate.full_name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold">{candidate.full_name}</h3>
                                            <p className="text-sm text-gray-600">{candidate.party_name}</p>
                                            <p className="text-xs text-gray-500">District: {candidate.district_id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Status: {candidate.status}</p>
                                            <p className="text-sm text-gray-600">Votes: {candidate.votes_received || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
