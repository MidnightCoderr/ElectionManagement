const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../db/index.js');

const VotingRecord = sequelize.define('voting_records', {
    record_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    voter_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'voters',
            key: 'voter_id',
        },
    },
    election_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'elections',
            key: 'election_id',
        },
    },
    terminal_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'iot_terminals',
            key: 'terminal_id',
        },
    },
    vote_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    blockchain_tx_id: {
        type: DataTypes.STRING(255),
        comment: 'Transaction ID on Hyperledger Fabric',
    },
    verification_hash: {
        type: DataTypes.STRING(64),
        comment: 'SHA-256 hash of biometric + timestamp for verification',
    },
}, {
    indexes: [
        { unique: true, fields: ['voter_id', 'election_id'] },
        { fields: ['election_id'] },
        { fields: ['vote_timestamp'] },
        { fields: ['blockchain_tx_id'] },
    ],
    timestamps: true,
    tableName: 'voting_records',
});

module.exports = VotingRecord;
