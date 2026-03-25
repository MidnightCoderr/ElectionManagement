const { WebSocketServer } = require('ws');
const logger = require('../utils/logger.js');

let wss;

const initWebSocketServer = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        logger.info('New WebSocket connection established', { ip: req.socket.remoteAddress });
        
        // Send initial connection success message
        ws.send(JSON.stringify({
            type: 'CONNECTION_SUCCESS',
            message: 'Connected to CampusVote WebSocket Server'
        }));

        // Send initial heartbeat
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('error', (error) => {
            logger.error('WebSocket connection error', { error: error.message });
        });

        ws.on('close', () => {
            logger.info('WebSocket connection closed');
        });
    });

    // Heartbeat ping every 30 seconds to keep connections alive
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(heartbeatInterval);
    });

    console.log(`\n📡 WebSocket Server initialized alongside HTTP server`);
};

/**
 * Broadcasts a message to all connected clients
 * @param {string} type - Event type (e.g., 'VOTE_CAST', 'FRAUD_ALERT')
 * @param {Object} payload - Data payload to send
 */
const broadcastMessage = (type, payload) => {
    if (!wss) {
        logger.warn('WebSocket server not initialized; cannot broadcast message');
        return;
    }

    const message = JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        payload
    });

    let clientCount = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // 1 = OPEN
            client.send(message);
            clientCount++;
        }
    });

    logger.info('WebSocket broadcast sent', { type, clientsMessaged: clientCount });
};

/**
 * Broadcasts updated vote tally for an election
 * @param {string} electionId - The election identifier
 * @param {Object} tally - { candidateId: voteCount, ... }
 */
const broadcastVoteTally = (electionId, tally) => {
    broadcastMessage('VOTE_TALLY', { electionId, tally });
};

/**
 * Broadcasts a new blockchain block event
 * @param {Object} blockData - { blockNumber, hash, timestamp, transactionCount }
 */
const broadcastBlockEvent = (blockData) => {
    broadcastMessage('BLOCK_MINED', blockData);
};

/**
 * Broadcasts a fraud/anomaly alert
 * @param {Object} alert - { type, severity, message, department, terminalId }
 */
const broadcastAlert = (alert) => {
    broadcastMessage('FRAUD_ALERT', alert);
};

/**
 * Broadcasts a single vote cast event
 * @param {Object} voteData - { electionId, candidateId, department, terminalId }
 */
const broadcastVoteCast = (voteData) => {
    broadcastMessage('VOTE_CAST', voteData);
};

module.exports = {
    initWebSocketServer,
    broadcastMessage,
    broadcastVoteTally,
    broadcastBlockEvent,
    broadcastAlert,
    broadcastVoteCast
};
