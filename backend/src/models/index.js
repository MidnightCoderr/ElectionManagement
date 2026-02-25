const Voter = require('./voter.model.js');
const Election = require('./election.model.js');
const Candidate = require('./candidate.model.js');
const VotingRecord = require('./votingRecord.model.js');
const AuditLog = require('./auditLog.model.js');

// Define relationships
Election.hasMany(Candidate, {
    foreignKey: 'election_id',
    as: 'candidates',
});
Candidate.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election',
});

Election.hasMany(VotingRecord, {
    foreignKey: 'election_id',
    as: 'voting_records',
});
VotingRecord.belongsTo(Election, {
    foreignKey: 'election_id',
    as: 'election',
});

Voter.hasMany(VotingRecord, {
    foreignKey: 'voter_id',
    as: 'voting_records',
});
VotingRecord.belongsTo(Voter, {
    foreignKey: 'voter_id',
    as: 'voter',
});

Object.assign(module.exports, {
    Voter,
    Election,
    Candidate,
    VotingRecord,
    AuditLog,
});

module.exports = {
    Voter,
    Election,
    Candidate,
    VotingRecord,
    AuditLog,
};
