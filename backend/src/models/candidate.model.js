import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Candidate = sequelize.define('candidates', {
    candidate_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    election_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'elections',
            key: 'election_id',
        },
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    party_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    party_symbol: {
        type: DataTypes.STRING(255),
        comment: 'URL or path to party symbol image',
    },
    district_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'districts',
            key: 'district_id',
        },
    },
    candidate_photo: {
        type: DataTypes.STRING(255),
        comment: 'URL or path to candidate photo',
    },
    votes_received: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('active', 'withdrawn', 'disqualified'),
        defaultValue: 'active',
    },
}, {
    indexes: [
        { fields: ['election_id'] },
        { fields: ['district_id'] },
        { fields: ['status'] },
    ],
    timestamps: true,
    tableName: 'candidates',
});

export default Candidate;
