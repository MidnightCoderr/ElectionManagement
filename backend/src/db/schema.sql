-- ===================================
-- Election Management System Database Schema
-- PostgreSQL 16
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- TABLE: districts
-- ===================================
CREATE TABLE districts (
    district_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_districts_state ON districts(state);

-- ===================================
-- TABLE: elections
-- ===================================
CREATE TABLE elections (
    election_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    election_type VARCHAR(50) NOT NULL CHECK (election_type IN ('NATIONAL', 'STATE', 'LOCAL', 'INSTITUTIONAL')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_election_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);

-- ===================================
-- TABLE: candidates
-- ===================================
CREATE TABLE candidates (
    candidate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(district_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255),
    party_symbol VARCHAR(255),
    photo_url TEXT,
    bio TEXT,
    manifesto TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_election ON candidates(election_id);
CREATE INDEX idx_candidates_district ON candidates(district_id);

-- ===================================
-- TABLE: voters
-- ===================================
CREATE TABLE voters (
    voter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(255) UNIQUE NOT NULL,
    bio_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of biometric data
    district_id UUID NOT NULL REFERENCES districts(district_id) ON DELETE RESTRICT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_status VARCHAR(50) DEFAULT 'PENDING' CHECK (registration_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voters_district ON voters(district_id);
CREATE INDEX idx_voters_bio_hash ON voters(bio_hash);
CREATE INDEX idx_voters_registration_status ON voters(registration_status);
CREATE INDEX idx_voters_national_id ON voters(national_id);

-- ===================================
-- TABLE: voting_records
-- ===================================
CREATE TABLE voting_records (
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL REFERENCES voters(voter_id) ON DELETE RESTRICT,
    election_id UUID NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE,
    has_voted BOOLEAN DEFAULT false,
    voted_at TIMESTAMP,
    terminal_id VARCHAR(255),
    blockchain_tx_hash VARCHAR(255), -- Hash of blockchain transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(voter_id, election_id)
);

CREATE INDEX idx_voting_records_voter ON voting_records(voter_id);
CREATE INDEX idx_voting_records_election ON voting_records(election_id);
CREATE INDEX idx_voting_records_terminal ON voting_records(terminal_id);
CREATE INDEX idx_voting_records_blockchain_tx ON voting_records(blockchain_tx_hash);

-- ===================================
-- TABLE: iot_terminals
-- ===================================
CREATE TABLE iot_terminals (
    terminal_id VARCHAR(255) PRIMARY KEY,
    mac_address VARCHAR(17) UNIQUE NOT NULL,
    district_id UUID REFERENCES districts(district_id) ON DELETE SET NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'COMPROMISED')),
    firmware_version VARCHAR(50),
    last_heartbeat TIMESTAMP,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_terminals_district ON iot_terminals(district_id);
CREATE INDEX idx_terminals_status ON iot_terminals(status);
CREATE INDEX idx_terminals_mac ON iot_terminals(mac_address);

-- ===================================
-- TABLE: admin_users
-- ===================================
CREATE TABLE admin_users (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ELECTION_OFFICER', 'TECHNICAL_ADMIN', 'OBSERVER')),
    district_id UUID REFERENCES districts(district_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- ===================================
-- TABLE: audit_logs (PostgreSQL side)
-- ===================================
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) CHECK (event_category IN ('AUTHENTICATION', 'VOTING', 'ADMINISTRATION', 'SYSTEM', 'SECURITY')),
    user_id UUID,
    user_type VARCHAR(50) CHECK (user_type IN ('VOTER', 'ADMIN', 'SYSTEM', 'IOT_TERMINAL')),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    severity VARCHAR(20) CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_category ON audit_logs(event_category);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- ===================================
-- TABLE: fraud_alerts
-- ===================================
CREATE TABLE fraud_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    election_id UUID REFERENCES elections(election_id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(district_id) ON DELETE SET NULL,
    terminal_id VARCHAR(255) REFERENCES iot_terminals(terminal_id) ON DELETE SET NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    resolution_notes TEXT,
    ml_confidence DECIMAL(5,4), -- ML model confidence score
    metadata JSONB
);

CREATE INDEX idx_fraud_alerts_election ON fraud_alerts(election_id);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_detected_at ON fraud_alerts(detected_at DESC);

-- ===================================
-- TABLE: system_config
-- ===================================
CREATE TABLE system_config (
    config_key VARCHAR(255) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- FUNCTIONS: Update timestamp trigger
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_terminals_updated_at BEFORE UPDATE ON iot_terminals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SEED DATA
-- ===================================

-- Insert sample districts
INSERT INTO districts (name, state, country) VALUES
('District 001', 'Maharashtra', 'India'),
('District 002', 'Karnataka', 'India'),
('District 003', 'Tamil Nadu', 'India');

-- Insert default system config
INSERT INTO system_config (config_key, config_value, description) VALUES
('system_name', 'Secure Election Management System', 'System display name'),
('version', '1.0.0', 'Current system version'),
('maintenance_mode', 'false', 'System maintenance mode flag'),
('max_votes_per_second', '10000', 'Maximum votes processed per second threshold'),
('fraud_detection_enabled', 'true', 'Enable ML-based fraud detection');

-- ===================================
-- COMMENTS
-- ===================================
COMMENT ON TABLE voters IS 'Stores voter registration information with hashed biometric data';
COMMENT ON TABLE voting_records IS 'Tracks which voters have voted in which elections';
COMMENT ON TABLE iot_terminals IS 'Registry of all IoT voting terminals';
COMMENT ON TABLE fraud_alerts IS 'ML-detected anomalies and fraud attempts';
COMMENT ON COLUMN voters.bio_hash IS 'SHA-256 hash of fingerprint template, never stores raw biometric data';
COMMENT ON COLUMN voting_records.blockchain_tx_hash IS 'Reference to blockchain transaction for auditability';
