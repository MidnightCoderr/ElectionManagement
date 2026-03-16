const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../db/index.js');

const Election = sequelize.define('elections', {
    election_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    election_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    election_type: {
        type: DataTypes.ENUM('general', 'state', 'local', 'by-election'),
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfterStart(value) {
                if (value <= this.start_date) {
                    throw new Error('End date must be after start date');
                }
            },
        },
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
        defaultValue: 'upcoming',
    },
    total_voters: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_votes_cast: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    indexes: [
        { fields: ['start_date', 'end_date'] },
        { fields: ['status'] },
    ],
    timestamps: true,
    tableName: 'elections',
});

module.exports = Election;
