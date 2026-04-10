-- ============================================================
-- DrawVault — Initial Schema
-- ============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace members (for team sharing - Business tier)
CREATE TABLE workspace_members (
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'viewer', -- 'owner' | 'editor' | 'viewer'
  invited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Workspace invites
CREATE TABLE workspace_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forms
CREATE TABLE forms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  subdomain           TEXT NOT NULL UNIQUE,
  custom_domain       TEXT,
  status              TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'closed'
  template            TEXT NOT NULL DEFAULT 'clean',
  draw_theme          TEXT NOT NULL DEFAULT 'slot',  -- 'slot' | 'wheel' | 'cards' | 'dice'
  accent_color        TEXT NOT NULL DEFAULT '#6366f1',
  logo_url            TEXT,
  fields              JSONB NOT NULL DEFAULT '[]',
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,
  max_entries         INTEGER,
  allow_duplicates    BOOLEAN NOT NULL DEFAULT FALSE,
  require_captcha     BOOLEAN NOT NULL DEFAULT TRUE,
  social_sharing      BOOLEAN NOT NULL DEFAULT TRUE,
  show_entry_count    BOOLEAN NOT NULL DEFAULT TRUE,
  winners_page        BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash       TEXT,
  embed_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  webhook_url         TEXT,
  raffle_type         TEXT NOT NULL DEFAULT 'giveaway', -- 'giveaway' | 'earlyaccess' | 'contest' | 'internal'
  require_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Form entries
CREATE TABLE entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data          JSONB NOT NULL DEFAULT '{}',
  ip_hash       TEXT,
  email_hash    TEXT,
  status        TEXT NOT NULL DEFAULT 'confirmed', -- 'pending' | 'confirmed'
  source        TEXT NOT NULL DEFAULT 'web',       -- 'web' | 'twitch' | 'discord'
  referral_code TEXT,
  referral_count INTEGER NOT NULL DEFAULT 0,
  is_winner     BOOLEAN NOT NULL DEFAULT FALSE,
  flagged       BOOLEAN NOT NULL DEFAULT FALSE,
  draw_id       UUID,
  entered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draws
CREATE TABLE draws (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  drawn_by      UUID NOT NULL REFERENCES profiles(id),
  winner_count  INTEGER NOT NULL DEFAULT 1,
  notes         TEXT,
  drawn_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from entries to draws (after draws table exists)
ALTER TABLE entries ADD CONSTRAINT entries_draw_id_fk
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE SET NULL;

-- Subscriptions (synced from Stripe webhooks)
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT NOT NULL UNIQUE,
  stripe_sub_id         TEXT NOT NULL UNIQUE,
  plan                  TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'business'
  status                TEXT NOT NULL,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Form analytics (daily snapshots)
CREATE TABLE form_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  entries_count   INTEGER NOT NULL DEFAULT 0,
  views_count     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (form_id, date)
);

-- Audit logs (Business tier)
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_forms_workspace_id     ON forms(workspace_id);
CREATE INDEX idx_forms_subdomain        ON forms(subdomain);
CREATE INDEX idx_forms_status           ON forms(status);
CREATE INDEX idx_entries_form_id        ON entries(form_id);
CREATE INDEX idx_entries_form_entered   ON entries(form_id, entered_at DESC);
CREATE INDEX idx_entries_email_hash     ON entries(email_hash);
CREATE INDEX idx_draws_form_id          ON draws(form_id);
CREATE INDEX idx_form_analytics_date    ON form_analytics(form_id, date);
CREATE INDEX idx_audit_logs_workspace   ON audit_logs(workspace_id, created_at DESC);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-create profile + workspace on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_slug TEXT;
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  workspace_slug := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ));

  INSERT INTO workspaces (owner_id, name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    workspace_slug || '-' || substr(gen_random_uuid()::text, 1, 6)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add owner as workspace member
CREATE OR REPLACE FUNCTION handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION handle_new_workspace();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_workspaces_updated_at  BEFORE UPDATE ON workspaces  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_forms_updated_at       BEFORE UPDATE ON forms       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_subs_updated_at        BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws              ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a member of a workspace?
CREATE OR REPLACE FUNCTION is_workspace_member(wid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = wid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's workspace IDs
CREATE OR REPLACE FUNCTION my_workspace_ids()
RETURNS SETOF UUID AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Workspaces
CREATE POLICY "Members can view workspace"   ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "Owners can update workspace"  ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can create workspace"   ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspace members
CREATE POLICY "Members can view members"     ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Owners can manage members"    ON workspace_members FOR ALL USING (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);

-- Forms
CREATE POLICY "Members can manage forms"     ON forms FOR ALL USING (workspace_id IN (SELECT my_workspace_ids()));
CREATE POLICY "Public can view active forms" ON forms FOR SELECT USING (status = 'active');

-- Entries
CREATE POLICY "Anyone can insert entry"      ON entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM forms WHERE id = form_id AND status = 'active')
);
CREATE POLICY "Members can view entries"     ON entries FOR SELECT USING (
  form_id IN (SELECT id FROM forms WHERE workspace_id IN (SELECT my_workspace_ids()))
);
CREATE POLICY "Members can update entries"   ON entries FOR UPDATE USING (
  form_id IN (SELECT id FROM forms WHERE workspace_id IN (SELECT my_workspace_ids()))
);

-- Draws
CREATE POLICY "Members can manage draws"     ON draws FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE workspace_id IN (SELECT my_workspace_ids()))
);

-- Subscriptions
CREATE POLICY "Members can view subscription" ON subscriptions FOR SELECT USING (workspace_id IN (SELECT my_workspace_ids()));
CREATE POLICY "Service role manages subs"     ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Form analytics
CREATE POLICY "Members can view analytics"   ON form_analytics FOR SELECT USING (
  form_id IN (SELECT id FROM forms WHERE workspace_id IN (SELECT my_workspace_ids()))
);
CREATE POLICY "Service role manages analytics" ON form_analytics FOR ALL USING (auth.role() = 'service_role');

-- Audit logs
CREATE POLICY "Members can view audit logs"  ON audit_logs FOR SELECT USING (workspace_id IN (SELECT my_workspace_ids()));
CREATE POLICY "Service role manages audit"   ON audit_logs FOR ALL USING (auth.role() = 'service_role');

-- Workspace invites
CREATE POLICY "Members can view invites"     ON workspace_invites FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Anyone can read invite by token" ON workspace_invites FOR SELECT USING (true);
