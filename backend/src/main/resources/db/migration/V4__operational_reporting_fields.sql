ALTER TABLE adjusters ADD COLUMN team VARCHAR(80) NOT NULL DEFAULT 'Claims Operations';
UPDATE adjusters SET team = 'Claims Intake' WHERE email = 'maya.chen@example.test';
UPDATE adjusters SET team = 'Adjusting Team' WHERE email = 'daniel.brooks@example.test';
UPDATE adjusters SET team = 'Medical Review' WHERE email = 'priya.shah@example.test';
UPDATE adjusters SET team = 'SIU Investigations' WHERE email = 'jordan.lee@example.com';

ALTER TABLE claims ADD COLUMN region VARCHAR(40) NOT NULL DEFAULT 'SOUTHEAST';
ALTER TABLE claims ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE claims ADD COLUMN demo_dataset_key VARCHAR(64);
UPDATE claims SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED') AND resolved_at IS NULL;

CREATE INDEX idx_claims_created_at ON claims(created_at);
CREATE INDEX idx_claims_region ON claims(region);
CREATE INDEX idx_claims_demo_dataset_key ON claims(demo_dataset_key);
CREATE INDEX idx_adjusters_team ON adjusters(team);
