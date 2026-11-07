CREATE TABLE IF NOT EXISTS signups (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('business', 'user', 'investor', 'region_interest')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  region TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'landing'
);

CREATE INDEX IF NOT EXISTS signups_email_idx ON signups (email);
CREATE INDEX IF NOT EXISTS signups_created_at_idx ON signups (created_at DESC);
