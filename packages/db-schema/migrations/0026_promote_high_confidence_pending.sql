-- Migration number: 0026    2026-07-15
-- One-time backlog clear-out to match the new auto-publish rule added in
-- lib/scaling.ts: every AI story used to sit in 'pending_review' forever
-- until a human admin manually clicked Approve, no matter how solid its
-- confidence score already was — this is a likely reason several
-- categories (e.g. "Pondasi Iman") showed as empty on the public site even
-- though generation jobs had already produced content for them. Promote
-- whatever is already sitting in the queue that meets the same bar new
-- content now auto-publishes at (fact-checked implicitly by having reached
-- 'pending_review' in the first place — only a passing fact-check ever
-- lands a story there — plus confidence_score >= 0.85). Anything below that
-- bar is left in the queue for a human to look at, unchanged.
UPDATE stories
SET status = 'published', published_at = datetime('now')
WHERE status = 'pending_review' AND confidence_score >= 0.85;
