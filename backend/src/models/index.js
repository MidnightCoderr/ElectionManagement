import Voter from './voter.model.js';
import Election from './election.model.js';
import Candidate from './candidate.model.js';
import VotingRecord from './votingRecord.model.js';
import AuditLog from './auditLog.model.js';

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

export {
    Voter,
    Election,
    Candidate,
    VotingRecord,
    AuditLog,
};

export default {
    Voter,
    Election,
    Candidate,
    VotingRecord,
    AuditLog,
};
