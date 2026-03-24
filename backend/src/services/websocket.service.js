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
            message: 'Connected to Election Management WebSocket Server'
        }));

        ws.on('error', (error) => {
            logger.error('WebSocket connection error', { error: error.message });
        });

        ws.on('close', () => {
            logger.info('WebSocket connection closed');
        });
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

module.exports = {
    initWebSocketServer,
    broadcastMessage
};
