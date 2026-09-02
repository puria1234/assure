-- ============================================================================
-- Assure: Neon Postgres schema
--
-- Run this once against your Neon database:
--
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- This file is idempotent: running it twice is safe.
--
-- It does NOT create auth tables. Managed Better Auth (Neon Auth) provisions
-- and owns everything in the `neon_auth` schema. Enable it in the Neon console
-- before running this, then never hand-edit that schema.
-- ============================================================================

BEGIN;

-- gen_random_uuid() is built into Postgres 13+, so no extension is required.


-- ----------------------------------------------------------------------------
-- app_users
--
-- Application-level profile and settings. One row per authenticated user.
--
-- `id` holds the Neon Auth user id, which is TEXT, not a uuid. There is
-- deliberately NO foreign key to the neon_auth schema: those tables are managed
-- for you and may be recreated or migrated (this project already moved from
-- Stack Auth to Better Auth once), and a hard FK would turn that into a broken
-- database. Rows are created by the app on first sign-in instead.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_users (
    id                 TEXT        PRIMARY KEY,
    email              TEXT        NOT NULL,
    name               TEXT        NOT NULL DEFAULT '',

    -- Replaces the notificationPrefs map from Firestore.
    notif_enabled      BOOLEAN     NOT NULL DEFAULT FALSE,
    notif_days_before  INTEGER     NOT NULL DEFAULT 30
                                   CHECK (notif_days_before > 0),

    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email is deliberately NOT unique. Neon Auth owns identity, and the same
-- address can legitimately map to a new auth id: delete and recreate an
-- account, or sign in with Google after registering with a password, and the
-- id changes while the email does not. A unique index here made the
-- upsert-on-id in getSessionUser collide on email instead, which returned 500
-- on every authenticated request. Orphaned rows are harmless; they carry no
-- warranties because nothing can reference a user id that no longer signs in.
CREATE INDEX IF NOT EXISTS app_users_email_idx
    ON app_users (lower(email));


-- ----------------------------------------------------------------------------
-- warranties
--
-- One row per tracked product. Mirrors the old Firestore `warranties`
-- collection, with camelCase fields converted to snake_case columns.
--
-- expiry_date is NOT NULL because every status calculation in the app derives
-- from it; a row without one could never render.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warranties (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        TEXT        NOT NULL
                               REFERENCES app_users (id) ON DELETE CASCADE,

    product_name   TEXT        NOT NULL,
    brand          TEXT,
    category       TEXT,
    purchase_date  DATE,
    expiry_date    DATE        NOT NULL,
    price          NUMERIC(12,2),
    retailer       TEXT,
    serial         TEXT,
    notes          TEXT,
    receipt_url    TEXT,

    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- A warranty cannot expire before it was bought.
    CONSTRAINT warranties_dates_ordered
        CHECK (purchase_date IS NULL OR expiry_date >= purchase_date)
);

-- The dashboard's only query is "all warranties for this user", sorted by
-- expiry. This composite index serves both the filter and the sort.
CREATE INDEX IF NOT EXISTS warranties_user_expiry_idx
    ON warranties (user_id, expiry_date);

-- Supports the client-side search box if it ever moves server-side.
CREATE INDEX IF NOT EXISTS warranties_user_product_idx
    ON warranties (user_id, lower(product_name));


-- ----------------------------------------------------------------------------
-- usage_counters
--
-- Replaces the scanCounts / claimCounts maps that were keyed by 'YYYY-MM' on
-- the Firestore user document. A map column would have worked, but a row per
-- (user, month, kind) means the monthly limit check is a single indexed read
-- and an atomic UPSERT instead of a read-modify-write on a JSON blob.
--
-- `kind` is constrained rather than free text so a typo cannot silently create
-- a parallel counter that never hits its limit.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_counters (
    user_id    TEXT        NOT NULL
                           REFERENCES app_users (id) ON DELETE CASCADE,
    month      TEXT        NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
    kind       TEXT        NOT NULL CHECK (kind IN ('scan', 'claim')),
    count      INTEGER     NOT NULL DEFAULT 0 CHECK (count >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, month, kind)
);


-- ----------------------------------------------------------------------------
-- updated_at maintenance
--
-- Firestore had serverTimestamp() on every write. A trigger keeps that
-- behaviour without every query having to remember to set it.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_users_set_updated_at ON app_users;
CREATE TRIGGER app_users_set_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS warranties_set_updated_at ON warranties;
CREATE TRIGGER warranties_set_updated_at
    BEFORE UPDATE ON warranties
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS usage_counters_set_updated_at ON usage_counters;
CREATE TRIGGER usage_counters_set_updated_at
    BEFORE UPDATE ON usage_counters
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------------------------
-- warranty_status
--
-- The same three-way bucket the UI uses (active / expiring / expired), defined
-- once here so the dashboard, the stat tiles, and any future email job cannot
-- drift apart in how they classify a warranty.
--
-- 30 days matches getStatus() in the app. It is intentionally NOT the user's
-- notif_days_before, which controls reminders rather than display colour.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW warranty_status AS
SELECT
    w.*,
    (w.expiry_date - CURRENT_DATE) AS days_remaining,
    CASE
        WHEN w.expiry_date <  CURRENT_DATE                     THEN 'expired'
        WHEN w.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
        ELSE 'active'
    END AS status
FROM warranties w;


COMMIT;

-- ============================================================================
-- Notes
--
-- Plan limits (5 warranties, 3 scans/month, 1 claim/month) are enforced in the
-- API layer, not here. They were in firestore.rules only because the browser
-- talked to Firestore directly. Nothing reaches Postgres except your own server
-- code, so a database trigger would just hardcode pricing into the schema and
-- make paid tiers a migration.
--
-- Row Level Security is likewise not enabled. The app connects as a single
-- owner role and scopes every query by user_id. RLS would only earn its keep if
-- you later expose Postgres directly to the browser via the Data API.
-- ============================================================================
