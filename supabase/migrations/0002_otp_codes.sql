-- OTP codes for custom email verification (used by Resend-based signup flow)
CREATE TABLE otp_codes (
  email       TEXT PRIMARY KEY,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only the service role can access this table (no user-level RLS needed)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS automatically
