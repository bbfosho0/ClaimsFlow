CREATE TABLE claim_messages (
    id UUID PRIMARY KEY,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    author VARCHAR(160) NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('CLAIMANT', 'INTERNAL')),
    body VARCHAR(1200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_claim_messages_claim_time
    ON claim_messages(claim_id, created_at ASC);

INSERT INTO adjusters (id, display_name, email, role, active, workload_capacity)
VALUES (
    '00000000-0000-0000-0000-0000000000a1',
    'Jordan Lee',
    'jordan.lee@example.com',
    'SENIOR_ADJUSTER',
    TRUE,
    18
)
ON CONFLICT (email) DO NOTHING;
