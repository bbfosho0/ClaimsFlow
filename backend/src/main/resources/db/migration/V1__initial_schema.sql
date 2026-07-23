CREATE TABLE adjusters (
    id UUID PRIMARY KEY,
    display_name VARCHAR(120) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    role VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL,
    workload_capacity INTEGER NOT NULL CHECK (workload_capacity > 0)
);

CREATE TABLE claims (
    id UUID PRIMARY KEY,
    claim_number VARCHAR(32) NOT NULL UNIQUE,
    claimant_name VARCHAR(160) NOT NULL,
    claimant_email VARCHAR(200) NOT NULL,
    claim_type VARCHAR(40) NOT NULL,
    incident_date DATE NOT NULL,
    estimated_loss NUMERIC(14,2) NOT NULL CHECK (estimated_loss >= 0),
    description VARCHAR(2000) NOT NULL,
    incident_report_present BOOLEAN NOT NULL,
    photos_present BOOLEAN NOT NULL,
    proof_of_ownership_present BOOLEAN NOT NULL,
    medical_documentation_present BOOLEAN NOT NULL,
    completeness_percentage INTEGER NOT NULL CHECK (completeness_percentage BETWEEN 0 AND 100),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(40) NOT NULL,
    assigned_adjuster_id UUID REFERENCES adjusters(id),
    sla_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    recommended_action VARCHAR(80) NOT NULL,
    explanation VARCHAR(1200) NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    missing_information VARCHAR(1000),
    generated_at TIMESTAMPTZ NOT NULL,
    review_state VARCHAR(20) NOT NULL,
    reviewer_name VARCHAR(160),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    actor VARCHAR(160) NOT NULL,
    action_type VARCHAR(80) NOT NULL,
    summary VARCHAR(600) NOT NULL,
    previous_value VARCHAR(600),
    new_value VARCHAR(600),
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_priority ON claims(priority);
CREATE INDEX idx_claims_adjuster ON claims(assigned_adjuster_id);
CREATE INDEX idx_claims_sla ON claims(sla_deadline);
CREATE INDEX idx_audit_claim_time ON audit_events(claim_id, occurred_at DESC);
CREATE INDEX idx_recommendation_claim ON recommendations(claim_id, generated_at DESC);
