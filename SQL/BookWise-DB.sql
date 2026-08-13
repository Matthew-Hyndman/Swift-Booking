-- Swift Booking schema coupled to Keycloak Organizations.
--
-- IMPORTANT
-- 1) Run this script in the same PostgreSQL database/schema where Keycloak tables exist.
-- 2) This script requires Keycloak org + user tables (org and user_entity).
--    Membership table is auto-detected (organization_member or org_member).
-- 3) Legacy business/owner/employee tables are removed from the booking domain.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_missing TEXT;
BEGIN
    SELECT string_agg(t.table_name, ', ')
    INTO v_missing
    FROM (
        SELECT 'org' AS table_name
        WHERE NOT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'org'
        )
        UNION ALL
        SELECT 'user_entity'
        WHERE NOT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'user_entity'
        )
    ) t;

    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION 'Keycloak coupling failed. Missing required table(s): %', v_missing;
    END IF;
END
$$;

-- Drop legacy tables first (if they still exist from old model).
DROP TABLE IF EXISTS business_owners CASCADE;
DROP TABLE IF EXISTS business_addresses CASCADE;
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- Drop booking domain objects to recreate with Keycloak foreign keys.
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;

DROP FUNCTION IF EXISTS f_booking_summary_by_business(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS f_employee_performance(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS f_customer_booking_history(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS f_daily_booking_insights(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS f_search_customers(VARCHAR, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS f_get_bookings_by_location(INTEGER) CASCADE;

DROP FUNCTION IF EXISTS f_org_members(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS f_is_org_member(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS trg_bookings_validate_org_member() CASCADE;

-- Addresses are now directly scoped to a Keycloak organization.
CREATE TABLE IF NOT EXISTS addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(36) NOT NULL,
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_organization
        FOREIGN KEY (organization_id) REFERENCES org(id) ON DELETE CASCADE
);

-- Customers belong to an organization; optionally linked to Keycloak user_entity.
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(36) NOT NULL,
    keycloak_user_id VARCHAR(36),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_organization
        FOREIGN KEY (organization_id) REFERENCES org(id) ON DELETE CASCADE,
    CONSTRAINT fk_customers_user_entity
        FOREIGN KEY (keycloak_user_id) REFERENCES user_entity(id) ON DELETE SET NULL,
    CONSTRAINT uq_customers_org_email UNIQUE (organization_id, email),
    CONSTRAINT uq_customers_org_keycloak_user UNIQUE (organization_id, keycloak_user_id)
);

-- Bookings reference Keycloak organization + staff user directly.
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(36) NOT NULL,
    staff_user_id VARCHAR(36) NOT NULL,
    customer_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_organization
        FOREIGN KEY (organization_id) REFERENCES org(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_staff_user
        FOREIGN KEY (staff_user_id) REFERENCES user_entity(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CONSTRAINT chk_bookings_status
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    CONSTRAINT chk_bookings_time_window
        CHECK (end_time > start_time)
);

-- Enforce that customer and booking belong to the same organization.
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_id_org
    ON customers(customer_id, organization_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_bookings_customer_org_match'
    ) THEN
        ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_customer_org_match
            FOREIGN KEY (customer_id, organization_id)
            REFERENCES customers(customer_id, organization_id)
            ON DELETE CASCADE;
    END IF;
END
$$;

-- Performance indexes.
CREATE INDEX IF NOT EXISTS idx_addresses_organization_id ON addresses(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_keycloak_user_id ON customers(keycloak_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_organization_id ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_user_id ON bookings(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Helper: return organization members for either Keycloak column model (member_id or user_id).
CREATE OR REPLACE FUNCTION f_org_members(p_organization_id VARCHAR DEFAULT NULL)
RETURNS TABLE (
    organization_id VARCHAR,
    user_id VARCHAR
) AS $$
DECLARE
    v_has_organization_member BOOLEAN;
    v_has_org_member BOOLEAN;
    v_has_member_id BOOLEAN;
    v_has_user_id BOOLEAN;
    v_table_name TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'organization_member'
    ) INTO v_has_organization_member;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'org_member'
    ) INTO v_has_org_member;

    IF v_has_organization_member THEN
        v_table_name := 'organization_member';
    ELSIF v_has_org_member THEN
        v_table_name := 'org_member';
    ELSE
        RETURN;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = v_table_name
          AND column_name = 'member_id'
    ) INTO v_has_member_id;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = v_table_name
          AND column_name = 'user_id'
    ) INTO v_has_user_id;

    IF v_has_member_id THEN
        RETURN QUERY EXECUTE
            format('SELECT om.organization_id::varchar, om.member_id::varchar
             FROM %I om
             WHERE ($1 IS NULL OR om.organization_id = $1)',
             v_table_name)
        USING p_organization_id;
        RETURN;
    END IF;

    IF v_has_user_id THEN
        RETURN QUERY EXECUTE
            format('SELECT om.organization_id::varchar, om.user_id::varchar
             FROM %I om
             WHERE ($1 IS NULL OR om.organization_id = $1)',
             v_table_name)
        USING p_organization_id;
        RETURN;
    END IF;

    RAISE EXCEPTION '% table has no member_id/user_id column.', v_table_name;
END;
$$ LANGUAGE plpgsql;

-- Helper: membership check using whichever Keycloak membership table is available.
CREATE OR REPLACE FUNCTION f_is_org_member(p_organization_id VARCHAR, p_user_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_membership_table BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('organization_member', 'org_member')
    ) INTO v_has_membership_table;

    IF NOT v_has_membership_table THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM f_org_members(p_organization_id) om
        WHERE om.user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_bookings_validate_org_member()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT f_is_org_member(NEW.organization_id, NEW.staff_user_id) THEN
        RAISE EXCEPTION
            'Staff user % is not a member of organization %',
            NEW.staff_user_id,
            NEW.organization_id;
    END IF;

    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_validate_org_member
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION trg_bookings_validate_org_member();

-- Minimal seed data (only if Keycloak already has at least one organization and member).
INSERT INTO addresses (
    organization_id,
    street_line1,
    city,
    county,
    postal_code,
    country
)
SELECT
    o.id,
    '123 Main Street',
    'New York',
    'New York',
    '10001',
    'USA'
FROM org o
ORDER BY o.id
LIMIT 1;

INSERT INTO customers (
    organization_id,
    first_name,
    last_name,
    email,
    phone
)
SELECT
    o.id,
    'Alice',
    'Robinson',
    'alice.robinson@email.com',
    '555-3001'
FROM org o
ORDER BY o.id
LIMIT 1;

INSERT INTO bookings (
    organization_id,
    staff_user_id,
    customer_id,
    booking_date,
    start_time,
    end_time,
    service_description,
    status,
    notes
)
SELECT
    c.organization_id,
    om.user_id,
    c.customer_id,
    CURRENT_DATE,
    '10:00:00'::TIME,
    '11:00:00'::TIME,
    'Initial seeded booking',
    'confirmed',
    'Auto-seeded'
FROM customers c
JOIN LATERAL (
    SELECT om.organization_id, om.user_id
    FROM f_org_members(c.organization_id) om
    ORDER BY om.user_id
    LIMIT 1
) om ON TRUE
LIMIT 1;

-- Analytics Functions (Keycloak-coupled)

CREATE OR REPLACE FUNCTION f_booking_summary_by_organization(p_organization_id VARCHAR)
RETURNS TABLE (
    organization_id VARCHAR,
    organization_name VARCHAR,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        COUNT(bk.booking_id) AS total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) AS completed_bookings,
        COUNT(CASE WHEN bk.status = 'confirmed' THEN 1 END) AS confirmed_bookings,
        COUNT(CASE WHEN bk.status = 'pending' THEN 1 END) AS pending_bookings,
        COUNT(CASE WHEN bk.status = 'cancelled' THEN 1 END) AS cancelled_bookings
    FROM org o
    LEFT JOIN bookings bk ON o.id = bk.organization_id
    WHERE o.id = p_organization_id
    GROUP BY o.id, o.name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_staff_performance(p_organization_id VARCHAR)
RETURNS TABLE (
    staff_user_id VARCHAR,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    organization_name VARCHAR,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    avg_booking_duration_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        o.name,
        COUNT(bk.booking_id) AS total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) AS completed_bookings,
        AVG(EXTRACT(EPOCH FROM (bk.end_time - bk.start_time)) / 3600) AS avg_booking_duration_hours
    FROM org o
    JOIN LATERAL f_org_members(o.id) om ON TRUE
    JOIN user_entity u ON u.id = om.user_id
    LEFT JOIN bookings bk
        ON bk.organization_id = o.id
       AND bk.staff_user_id = u.id
    WHERE o.id = p_organization_id
    GROUP BY u.id, u.username, u.first_name, u.last_name, o.name
    ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_customer_booking_history(p_organization_id VARCHAR)
RETURNS TABLE (
    customer_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    last_booking_date DATE,
    first_booking_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        COUNT(bk.booking_id) AS total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) AS completed_bookings,
        MAX(bk.booking_date) AS last_booking_date,
        MIN(bk.booking_date) AS first_booking_date
    FROM customers c
    LEFT JOIN bookings bk
        ON bk.customer_id = c.customer_id
       AND bk.organization_id = p_organization_id
    WHERE c.organization_id = p_organization_id
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
    HAVING COUNT(bk.booking_id) > 0
    ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_daily_booking_insights(p_organization_id VARCHAR)
RETURNS TABLE (
    booking_date DATE,
    organization_name VARCHAR,
    bookings_count BIGINT,
    completed_count BIGINT,
    confirmed_count BIGINT,
    total_service_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bk.booking_date,
        o.name,
        COUNT(bk.booking_id) AS bookings_count,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN bk.status = 'confirmed' THEN 1 END) AS confirmed_count,
        SUM(EXTRACT(EPOCH FROM (bk.end_time - bk.start_time)) / 3600) AS total_service_hours
    FROM bookings bk
    JOIN org o ON o.id = bk.organization_id
    WHERE bk.organization_id = p_organization_id
    GROUP BY bk.booking_date, o.name
    ORDER BY bk.booking_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Search Functions (Keycloak-coupled)

CREATE OR REPLACE FUNCTION f_search_customers(p_name VARCHAR, p_organization_id VARCHAR)
RETURNS TABLE (
    customer_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.created_at
    FROM customers c
    WHERE c.organization_id = p_organization_id
      AND (
            p_name IS NULL
            OR c.first_name ILIKE '%' || p_name || '%'
            OR c.last_name ILIKE '%' || p_name || '%'
      )
    ORDER BY c.first_name, c.last_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_get_bookings_by_location(p_organization_id VARCHAR)
RETURNS TABLE (
    booking_id UUID,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    organization_name VARCHAR,
    organization_location TEXT,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bk.booking_id,
        bk.booking_date,
        bk.start_time,
        bk.end_time,
        o.name,
        CONCAT(a.street_line1, ', ', a.city, ' ', a.postal_code) AS organization_location,
        bk.status
    FROM bookings bk
    JOIN org o ON o.id = bk.organization_id
    LEFT JOIN addresses a ON a.organization_id = o.id
    WHERE bk.organization_id = p_organization_id
    ORDER BY bk.booking_date DESC, bk.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Compatibility wrapper for old function name.
CREATE OR REPLACE FUNCTION f_booking_summary_by_business(p_business_id INTEGER)
RETURNS TABLE (
    business_id INTEGER,
    business_name VARCHAR,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT
) AS $$
BEGIN
    RAISE EXCEPTION 'Legacy integer business IDs are removed. Use f_booking_summary_by_organization(varchar_keycloak_org_id).';
END;
$$ LANGUAGE plpgsql;

-- Test Queries (derive org ID from Keycloak).
SELECT *
FROM public.f_booking_summary_by_organization((SELECT id FROM org ORDER BY id LIMIT 1));

SELECT *
FROM public.f_customer_booking_history((SELECT id FROM org ORDER BY id LIMIT 1));

SELECT *
FROM public.f_daily_booking_insights((SELECT id FROM org ORDER BY id LIMIT 1));

SELECT *
FROM public.f_staff_performance((SELECT id FROM org ORDER BY id LIMIT 1));

SELECT *
FROM public.f_get_bookings_by_location((SELECT id FROM org ORDER BY id LIMIT 1));

SELECT *
FROM public.f_search_customers('E', (SELECT id FROM org ORDER BY id LIMIT 1));