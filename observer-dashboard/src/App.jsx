import { useState, useEffect } from 'react'
import axios from 'axios'
import ObserverSidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import MetricCards from './components/MetricCards.jsx'
import LiveResults from './components/LiveResults.jsx'
import StatusBar from './components/StatusBar.jsx'
import useWebSocket from './hooks/useWebSocket.js'
import { MOCK_RESULTS } from './data/mockData.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

function App() {
    const [results, setResults] = useState(null)
    const [stats, setStats] = useState({ totalVoters: 0, votesCast: 0, turnout: 0 })
    const [loading, setLoading] = useState(true)
    const [electionId] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851')
    const [activeNav, setActiveNav] = useState('Dashboard')
    const [activeTab, setActiveTab] = useState('Overview')
    const [timeFilter, setTimeFilter] = useState('24H')
    const [currentTime, setCurrentTime] = useState(new Date())

    // WebSocket connection
    const { connected, alerts: wsAlerts } = useWebSocket()

    useEffect(() => {
        fetchResults()
        const dataInterval = setInterval(fetchResults, 5000)
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => { clearInterval(dataInterval); clearInterval(clockInterval) }
    }, [electionId])

    const fetchResults = async () => {
        if (MOCK_MODE) {
            setResults(MOCK_RESULTS)
            const e = MOCK_RESULTS.election
            const turnout = e.totalVoters > 0 ? ((e.totalVotesCast / e.totalVoters) * 100).toFixed(2) : 0
            setStats({ totalVoters: e.totalVoters, votesCast: e.totalVotesCast, turnout })
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(`${API_BASE}/api/v1/votes/results/${electionId}`)
            setResults(response.data)
            const e = response.data.election
            if (e) {
                const turnout = e.totalVoters > 0 ? ((e.totalVotesCast / e.totalVoters) * 100).toFixed(2) : 0
                setStats({ totalVoters: e.totalVoters, votesCast: e.totalVotesCast, turnout })
            }
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch results:', error)
            setLoading(false)
        }
    }

    const prepareChartData = () => {
        if (!results?.blockchainResults) return []
        return Object.entries(results.blockchainResults).map(([name, votes]) => ({
            name: name.split(' - ')[0],
            fullName: name,
            votes,
        }))
    }

    const totalVotes = prepareChartData().reduce((s, c) => s + c.votes, 0)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted text-sm">Loading election data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-dark-950">
            <ObserverSidebar activeNav={activeNav} onNavChange={setActiveNav} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <TopBar currentTime={currentTime} connected={connected} />

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <MetricCards
                        stats={stats}
                        timeFilter={timeFilter}
                        onTimeFilterChange={setTimeFilter}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <LiveResults
                            chartData={prepareChartData()}
                            totalVotes={totalVotes}
                            electionId={electionId}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </div>

                    <StatusBar />
                </div>
            </main>
        </div>
    )
}

export default App
