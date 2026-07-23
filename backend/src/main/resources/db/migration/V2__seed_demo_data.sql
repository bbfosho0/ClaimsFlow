INSERT INTO adjusters (id, display_name, email, role, active, workload_capacity) VALUES
('10000000-0000-0000-0000-000000000001', 'Maya Chen', 'maya.chen@example.test', 'SENIOR_ADJUSTER', TRUE, 12),
('10000000-0000-0000-0000-000000000002', 'Daniel Brooks', 'daniel.brooks@example.test', 'ADJUSTER', TRUE, 10),
('10000000-0000-0000-0000-000000000003', 'Priya Shah', 'priya.shah@example.test', 'ADJUSTER', TRUE, 10);

INSERT INTO claims (
 id, claim_number, claimant_name, claimant_email, claim_type, incident_date, estimated_loss, description,
 incident_report_present, photos_present, proof_of_ownership_present, medical_documentation_present,
 completeness_percentage, priority, status, assigned_adjuster_id, sla_deadline, created_at, updated_at, version
) VALUES
('20000000-0000-0000-0000-000000000001', 'CLM-2026-0001', 'Jordan Ellis', 'jordan.ellis@example.test', 'AUTO', CURRENT_DATE - 2, 18500.00,
 'Rear-end collision with visible bumper and trunk damage.', TRUE, TRUE, FALSE, FALSE, 100, 'HIGH', 'UNDER_REVIEW',
 '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP + INTERVAL '18 hours', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP, 0),
('20000000-0000-0000-0000-000000000002', 'CLM-2026-0002', 'Avery Morgan', 'avery.morgan@example.test', 'PROPERTY', CURRENT_DATE - 5, 6200.00,
 'Water damage affected flooring and lower kitchen cabinets.', FALSE, TRUE, FALSE, FALSE, 50, 'MEDIUM', 'WAITING_FOR_INFORMATION',
 '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP + INTERVAL '45 hours', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP, 0),
('20000000-0000-0000-0000-000000000003', 'CLM-2026-0003', 'Sam Rivera', 'sam.rivera@example.test', 'PERSONAL_INJURY', CURRENT_DATE - 1, 42000.00,
 'Passenger reported neck pain following a multi-vehicle incident.', TRUE, FALSE, FALSE, TRUE, 100, 'CRITICAL', 'NEW',
 NULL, CURRENT_TIMESTAMP + INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP, 0);

INSERT INTO audit_events (id, claim_id, actor, action_type, summary, previous_value, new_value, occurred_at) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'system', 'CLAIM_CREATED', 'Claim created and triaged', NULL, 'HIGH', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Maya Chen', 'STATUS_CHANGED', 'Claim moved to waiting for information', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'system', 'CLAIM_CREATED', 'Claim created and triaged', NULL, 'CRITICAL', CURRENT_TIMESTAMP - INTERVAL '12 hours');
