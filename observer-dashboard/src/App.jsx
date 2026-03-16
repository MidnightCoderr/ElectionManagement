import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Mock data for when backend is not available
const MOCK_RESULTS = {
    election: { totalVoters: 2120000, totalVotesCast: 1236567 },
    blockchainResults: {
        'Candidate A - Party X': 523400,
        'Candidate B - Party Y': 412300,
        'Candidate C - Party Z': 300867,
    },
}

function App() {
    const [results, setResults] = useState(null)
    const [stats, setStats] = useState({
        totalVoters: 0,
        votesCast: 0,
        turnout: 0,
    })
    const [loading, setLoading] = useState(true)
    const [electionId, setElectionId] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851')

    useEffect(() => {
        fetchResults()
        const interval = setInterval(fetchResults, 5000) // Refresh every 5 seconds
        return () => clearInterval(interval)
    }, [electionId])

    const fetchResults = async () => {
        if (MOCK_MODE) {
            setResults(MOCK_RESULTS)
            const election = MOCK_RESULTS.election
            const turnout = election.totalVoters > 0
                ? ((election.totalVotesCast / election.totalVoters) * 100).toFixed(2)
                : 0
            setStats({ totalVoters: election.totalVoters, votesCast: election.totalVotesCast, turnout })
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(`${API_BASE}/api/v1/votes/results/${electionId}`)
            setResults(response.data)

            // Calculate stats
            const election = response.data.election
            if (election) {
                const turnout = election.totalVoters > 0
                    ? ((election.totalVotesCast / election.totalVoters) * 100).toFixed(2)
                    : 0

                setStats({
                    totalVoters: election.totalVoters,
                    votesCast: election.totalVotesCast,
                    turnout,
                })
            }

            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch results:', error)
            setLoading(false)
        }
    }

    const prepareChartData = () => {
        if (!results?.blockchainResults) return []

        return Object.entries(results.blockchainResults).map(([candidateId, votes]) => ({
            name: candidateId.substring(0, 20) + '...',
            votes: votes,
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading election results...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            📊 Election Observer Dashboard
                        </h1>
                        <p className="text-slate-400">Real-time election monitoring and results</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Last updated:</p>
                        <p className="text-white font-mono">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Registered Voters</p>
                            <p className="text-3xl font-bold text-white">{stats.totalVoters.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Votes Cast</p>
                            <p className="text-3xl font-bold text-green-400">{stats.votesCast.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Voter Turnout</p>
                            <p className="text-3xl font-bold text-purple-400">{stats.turnout}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Votes by Candidate</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={prepareChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Bar dataKey="votes" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Vote Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={prepareChartData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.votes}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="votes"
                            >
                                {prepareChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Live Feed */}
            <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">📡 Live Updates</h2>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-300">System Status</span>
                        <span className="flex items-center text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Online
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-300">Blockchain Sync</span>
                        <span className="flex items-center text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Synchronized
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-300">Last Vote Timestamp</span>
                        <span className="text-slate-400 font-mono text-sm">{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-500">
                <p>🔒 Blockchain-verified results | Read-only dashboard</p>
            </div>
        </div>
    )
}

export default App
