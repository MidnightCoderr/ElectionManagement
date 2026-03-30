const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../db/index.js');

const Voter = sequelize.define('voters', {
    voter_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    roll_number: {
        type: DataTypes.STRING(20),
        allowNull: true, // Existing voters might not have it yet
        unique: true,
    },
    aadhar_number: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true,
        validate: {
            len: [12, 12],
            isNumeric: true,
        },
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    biometric_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: 'SHA-256 hash of fingerprint template',
    },
    district_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'districts',
            key: 'district_id',
        },
    },
    has_voted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'deceased'),
        defaultValue: 'active',
    },
}, {
    indexes: [
        { fields: ['aadhar_number'] },
        { fields: ['biometric_hash'] },
        { fields: ['district_id'] },
        { fields: ['has_voted'] },
    ],
    timestamps: true,
    tableName: 'voters',
});

module.exports = Voter;
