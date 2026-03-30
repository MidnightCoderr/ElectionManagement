const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/index.js');

const Student = sequelize.define('students', {
    student_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    roll_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    course: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    program: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'students',
});

module.exports = Student;
