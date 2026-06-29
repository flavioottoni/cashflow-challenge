CREATE SCHEMA IF NOT EXISTS ledger;
CREATE SCHEMA IF NOT EXISTS reporting;

-- Ledger schema (entries-service)
CREATE TABLE IF NOT EXISTS ledger.entries (
  id UUID PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_merchant_date ON ledger.entries (merchant_id, date);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON ledger.entries (created_at);

-- Reporting schema (consolidated-service read model)
CREATE TABLE IF NOT EXISTS reporting.daily_balances (
  merchant_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  total_credits DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_debits DECIMAL(15, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (merchant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_balances_date ON reporting.daily_balances (date);

-- Outbox pattern for reliable event publishing
CREATE TABLE IF NOT EXISTS ledger.outbox_events (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON ledger.outbox_events (published_at) WHERE published_at IS NULL;
