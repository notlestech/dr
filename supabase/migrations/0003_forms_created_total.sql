-- Track total forms ever created per workspace (includes deleted forms).
-- This prevents free users from bypassing the 3-form limit by deleting and recreating.
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS forms_created_total INTEGER NOT NULL DEFAULT 0;

-- Backfill from currently existing forms (deleted ones are already gone, so this
-- is a best-effort baseline for existing workspaces).
UPDATE workspaces w
SET forms_created_total = (
  SELECT COUNT(*) FROM forms f WHERE f.workspace_id = w.id
);
