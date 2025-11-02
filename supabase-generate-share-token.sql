-- Generates a share token for a given public_id (core schema)
-- Usage: run as-is after replacing the token and public_id values.

INSERT INTO event_share_tokens (event_id, token, expires_at)
SELECT id, 'demo-token-001', now() + interval '7 days'
FROM events
WHERE public_id = 'demo-public-001'
LIMIT 1;

