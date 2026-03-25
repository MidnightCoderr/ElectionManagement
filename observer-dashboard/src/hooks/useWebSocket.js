import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

/**
 * useWebSocket — real-time WebSocket hook for the observer dashboard.
 * Connects to the backend WebSocket server and provides live data.
 */
export default function useWebSocket() {
    const [connected, setConnected] = useState(false)
    const [lastMessage, setLastMessage] = useState(null)
    const [voteTally, setVoteTally] = useState({})
    const [alerts, setAlerts] = useState([])
    const [blockEvents, setBlockEvents] = useState([])
    const wsRef = useRef(null)
    const reconnectTimer = useRef(null)

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('[WS] Connected to', WS_URL)
                setConnected(true)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setLastMessage(data)

                    switch (data.type) {
                        case 'CONNECTION_SUCCESS':
                            console.log('[WS]', data.message)
                            break
                        case 'VOTE_CAST':
                            setVoteTally(prev => ({
                                ...prev,
                                [data.payload?.candidateId]: (prev[data.payload?.candidateId] || 0) + 1
                            }))
                            break
                        case 'VOTE_TALLY':
                            setVoteTally(data.payload?.tally || {})
                            break
                        case 'BLOCK_MINED':
                            setBlockEvents(prev => [data.payload, ...prev].slice(0, 20))
                            break
                        case 'FRAUD_ALERT':
                            setAlerts(prev => [
                                { ...data.payload, timestamp: data.timestamp },
                                ...prev
                            ].slice(0, 50))
                            break
                        default:
                            break
                    }
                } catch (err) {
                    console.warn('[WS] Failed to parse message:', err)
                }
            }

            ws.onclose = () => {
                console.log('[WS] Disconnected, reconnecting in 3s...')
                setConnected(false)
                reconnectTimer.current = setTimeout(connect, 3000)
            }

            ws.onerror = (err) => {
                console.error('[WS] Error:', err)
                ws.close()
            }
        } catch (err) {
            console.error('[WS] Connection failed:', err)
            reconnectTimer.current = setTimeout(connect, 3000)
        }
    }, [])

    useEffect(() => {
        connect()
        return () => {
            if (wsRef.current) wsRef.current.close()
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
        }
    }, [connect])

    return { connected, lastMessage, voteTally, alerts, blockEvents }
}
