const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Since some legacy files use require(), we need to export it in a way 
// that might be compatible, but since type="module", require() in other files will crash anyway.
// We'll module.exports = for; ESM.
module.exports = logger;
