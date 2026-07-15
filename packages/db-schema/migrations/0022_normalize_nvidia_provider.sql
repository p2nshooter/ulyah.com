-- Repair AI key-pool rows ingested under the wrong provider id.
--
-- The bulk-paste path (admin) and the deploy-time ingest script both used
-- "nvidia" as the provider, but the registered provider id is "nvidia-nim".
-- Rows stored as "nvidia" fail getProvider()/testApiKey() and are never
-- selected by Orchestra Core's text failover chain (which filters on
-- provider = 'nvidia-nim') — so every donated NVIDIA key sat unusable
-- ("cuma sebagian bekerja"). Normalising the id makes those existing keys
-- immediately testable and eligible for text routing.
UPDATE ai_key_pool SET provider = 'nvidia-nim' WHERE provider = 'nvidia';
