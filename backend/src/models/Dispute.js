"""
Dispute Model(MongoDB)
"""

const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    dispute_id: {
        type: String,
        required: true,
        unique: true
    },
    election_id: {
        type: String,
        required: true,
        ref: 'Election'
    },
    district_id: {
        type: String,
        required: true
    },
    filed_by: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    evidence_description: String,
    evidence_files: [String],
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RECOUNT_IN_PROGRESS', 'RECOUNT_COMPLETE', 'RESOLVED'],
        default: 'PENDING'
    },
    filed_at: {
        type: Date,
        default: Date.now
    },
    blockchain_evidence: {
        type: Object,
        default: null
    },
    recount_results: {
        type: Object,
        default: null
    },
    resolution: {
        type: String,
        default: null
    },
    resolved_at: Date,
    events: [{
        event_type: String,
        timestamp: Date,
        details: Object
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
