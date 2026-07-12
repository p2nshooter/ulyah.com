-- A non-reversible fingerprint (SHA-256 hex of the raw key) so bulk key
-- ingestion from a GitHub Secret is idempotent: re-running a deploy never
-- creates duplicate pool rows for a key already present. The raw key itself is
-- still only ever stored encrypted (key_ref/key_iv); this is just a hash for
-- de-duplication, safe to compare in plaintext.
ALTER TABLE ai_key_pool ADD COLUMN key_fingerprint TEXT;
CREATE INDEX IF NOT EXISTS idx_ai_key_pool_fingerprint ON ai_key_pool (key_fingerprint);
