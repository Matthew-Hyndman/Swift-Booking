-- BookWise Database Schema
-- PostgreSQL booking system with business, owners, addresses, employees, bookings and customers tables

DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_addresses CASCADE;
DROP TABLE IF EXISTS business_owners CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Owners Table
CREATE TABLE IF NOT EXISTS owners (
    owner_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    address_id SERIAL PRIMARY KEY,
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Table
CREATE TABLE IF NOT EXISTS businesses (
    business_id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Addresses Junction Table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS business_addresses (
    business_id INTEGER NOT NULL,
    address_id INTEGER NOT NULL,
    PRIMARY KEY (business_id, address_id),
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE CASCADE
);

-- Business Owners Junction Table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS business_owners (
    business_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    PRIMARY KEY (business_id, owner_id),
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES owners(owner_id) ON DELETE CASCADE
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    job_title VARCHAR(100),
    hire_date DATE,
    address_id INTEGER, -- the branch of the business where the employee works
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL
);

-- Customer Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Indexes for performance
--CREATE INDEX IF NOT EXISTS idx_businesses_address_id ON businesses(address_id);
CREATE INDEX IF NOT EXISTS idx_business_owners_owner_id ON business_owners(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_business_addresses_id ON business_addresses(business_id);
CREATE INDEX IF NOT EXISTS idx_employees_business_id ON employees(business_id);
CREATE INDEX IF NOT EXISTS idx_employees_address_id ON employees(address_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_employee_id ON bookings(employee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Dummy Data

-- Insert Owners
INSERT INTO owners (first_name, last_name, email, phone) VALUES
('John', 'Smith', 'john.smith@email.com', '555-0101'),
('Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0102'),
('Michael', 'Williams', 'michael.williams@email.com', '555-0103'),
('Emma', 'Brown', 'emma.brown@email.com', '555-0104');

-- Insert Addresses
INSERT INTO addresses (street_line1, street_line2, city, county, postal_code, country) VALUES
('123 Main Street', NULL, 'New York', 'New York', '10001', 'USA'),
('456 Oak Avenue', 'Suite 200', 'Los Angeles', 'California', '90001', 'USA'),
('789 Pine Road', NULL, 'Chicago', 'Illinois', '60601', 'USA'),
('321 Elm Street', 'Unit 5', 'Houston', 'Texas', '77001', 'USA'),
('654 Maple Drive', NULL, 'Phoenix', 'Arizona', '85001', 'USA');

-- Insert Businesses
INSERT INTO businesses (business_name, description, phone, email) VALUES
('Bella Salon', 'Premium hair and beauty salon', '555-1001', 'bella@salon.com'),
('FitPro Gym', 'Full-service fitness and wellness center', '555-1002', 'fitpro@gym.com'),
('Smile Dental', 'Modern dental practice with latest technology', '555-1003', 'smile@dental.com'),
('Harmony Spa', 'Relaxation and therapeutic spa services', '555-1004', 'harmony@spa.com');

-- Insert Business Addresses
INSERT INTO business_addresses (business_id, address_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(1, 5);

-- Insert Business Owners
INSERT INTO business_owners (business_id, owner_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 1),
(4, 4);

-- Insert Employees
INSERT INTO employees (business_id, first_name, last_name, email, phone, job_title, hire_date, address_id, is_active) VALUES
(1, 'Lisa', 'Anderson', 'lisa.anderson@bella.com', '555-2001', 'Hair Stylist', '2023-01-15', 1, TRUE),
(1, 'Maria', 'Garcia', 'maria.garcia@bella.com', '555-2002', 'Beauty Therapist', '2023-03-20', 1, TRUE),
(2, 'David', 'Martinez', 'david.martinez@fitpro.com', '555-2003', 'Personal Trainer', '2023-02-10', 2, TRUE),
(2, 'James', 'Taylor', 'james.taylor@fitpro.com', '555-2004', 'Yoga Instructor', '2023-04-05', 2, TRUE),
(3, 'Dr. Robert', 'Chen', 'robert.chen@smile.com', '555-2005', 'Dentist', '2022-06-01', 3, TRUE),
(3, 'Angela', 'Smith', 'angela.smith@smile.com', '555-2006', 'Dental Hygienist', '2023-05-12', 3, TRUE),
(4, 'Sophie', 'Laurent', 'sophie.laurent@harmony.com', '555-2007', 'Massage Therapist', '2023-01-20', 4, TRUE),
(4, 'Tom', 'Wilson', 'tom.wilson@harmony.com', '555-2008', 'Spa Manager', '2022-11-15', 4, TRUE);

-- Insert Customers
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('Alice', 'Robinson', 'alice.robinson@email.com', '555-3001'),
('Bob', 'Thompson', 'bob.thompson@email.com', '555-3002'),
('Catherine', 'White', 'catherine.white@email.com', '555-3003'),
('Daniel', 'Harris', 'daniel.harris@email.com', '555-3004'),
('Eva', 'Martin', 'eva.martin@email.com', '555-3005'),
('Frank', 'Lee', 'frank.lee@email.com', '555-3006'),
('Grace', 'Walker', 'grace.walker@email.com', '555-3007'),
('Henry', 'Young', 'henry.young@email.com', '555-3008');

-- Insert Bookings
INSERT INTO bookings (business_id, employee_id, customer_id, booking_date, start_time, end_time, service_description, status, notes) VALUES
(1, 1, 1, '2024-01-15', '10:00:00', '11:30:00', 'Haircut and styling', 'completed', 'Customer satisfied'),
(1, 1, 2, '2024-01-15', '13:00:00', '14:30:00', 'Hair coloring', 'completed', NULL),
(1, 2, 3, '2024-01-16', '14:00:00', '15:30:00', 'Facial treatment', 'confirmed', NULL),
(2, 3, 4, '2024-01-17', '07:00:00', '08:00:00', 'Personal training session', 'confirmed', NULL),
(2, 4, 5, '2024-01-17', '16:00:00', '17:00:00', 'Yoga class', 'pending', 'New customer'),
(3, 5, 6, '2024-01-18', '09:00:00', '10:00:00', 'Dental checkup and cleaning', 'completed', 'No issues found'),
(3, 6, 7, '2024-01-18', '10:30:00', '11:00:00', 'Teeth whitening', 'confirmed', NULL),
(4, 7, 8, '2024-01-19', '11:00:00', '12:00:00', 'Swedish massage', 'confirmed', 'VIP customer'),
(4, 7, 1, '2024-01-20', '14:00:00', '15:30:00', 'Deep tissue massage', 'pending', NULL),
(1, 2, 4, '2024-01-22', '15:00:00', '16:00:00', 'Manicure and pedicure', 'confirmed', NULL);

-- Analytics Functions

-- Function 1: Booking Summary by Business
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
    RETURN QUERY
    SELECT 
        b.business_id,
        b.business_name,
        COUNT(bk.booking_id) as total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN bk.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN bk.status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN bk.status = 'cancelled' THEN 1 END) as cancelled_bookings
    FROM businesses b
    LEFT JOIN bookings bk ON b.business_id = bk.business_id
    WHERE b.business_id = p_business_id
    GROUP BY b.business_id, b.business_name
    ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Employee Performance Analytics
CREATE OR REPLACE FUNCTION f_employee_performance(p_business_id INTEGER)
RETURNS TABLE (
    employee_id INTEGER,
    first_name VARCHAR,
    last_name VARCHAR,
    job_title VARCHAR,
    business_name VARCHAR,
    total_bookings BIGINT,
    completed_bookings BIGINT,
    avg_booking_duration_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.job_title,
        b.business_name,
        COUNT(bk.booking_id) as total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_bookings,
        AVG(EXTRACT(EPOCH FROM (bk.end_time - bk.start_time))/3600) as avg_booking_duration_hours
    FROM employees e
    JOIN businesses b ON e.business_id = b.business_id
    LEFT JOIN bookings bk ON e.employee_id = bk.employee_id
    WHERE e.business_id = p_business_id AND e.is_active = TRUE
    GROUP BY e.employee_id, e.first_name, e.last_name, e.job_title, b.business_name
    ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Customer Booking History for Business
CREATE OR REPLACE FUNCTION f_customer_booking_history(p_business_id INTEGER)
RETURNS TABLE (
    customer_id INTEGER,
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
        COUNT(bk.booking_id) as total_bookings,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_bookings,
        MAX(bk.booking_date) as last_booking_date,
        MIN(bk.booking_date) as first_booking_date
    FROM customers c
    LEFT JOIN bookings bk ON c.customer_id = bk.customer_id AND bk.business_id = p_business_id
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
    HAVING COUNT(bk.booking_id) > 0
    ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Daily Booking Insights for Business
CREATE OR REPLACE FUNCTION f_daily_booking_insights(p_business_id INTEGER)
RETURNS TABLE (
    booking_date DATE,
    business_name VARCHAR,
    bookings_count BIGINT,
    completed_count BIGINT,
    confirmed_count BIGINT,
    total_service_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bk.booking_date,
        b.business_name,
        COUNT(bk.booking_id) as bookings_count,
        COUNT(CASE WHEN bk.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN bk.status = 'confirmed' THEN 1 END) as confirmed_count,
        SUM(EXTRACT(EPOCH FROM (bk.end_time - bk.start_time))/3600) as total_service_hours
    FROM bookings bk
    JOIN businesses b ON bk.business_id = b.business_id
    WHERE bk.business_id = p_business_id
    GROUP BY bk.booking_date, b.business_name
    ORDER BY bk.booking_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Search Functions

-- Function 1: Dynamic Customer Search
CREATE OR REPLACE FUNCTION f_search_customers(p_name VARCHAR, p_business_id INTEGER)
RETURNS TABLE (
    customer_id INTEGER,
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
    JOIN bookings bk ON c.customer_id = bk.customer_id
    JOIN businesses b ON bk.business_id = b.business_id
    WHERE 
        ((p_name IS NULL OR c.first_name ILIKE '%' || p_name || '%')
        OR (p_name IS NULL OR c.last_name ILIKE '%' || p_name || '%'))
        AND (p_business_id IS NULL OR b.business_id = p_business_id)
        
    ORDER BY c.first_name, c.last_name;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Retrieve Booking Date & Times by Business Location
CREATE OR REPLACE FUNCTION f_get_bookings_by_location(p_business_id INTEGER)
RETURNS TABLE (
    booking_id INTEGER,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    business_name VARCHAR,
    business_location TEXT,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bk.booking_id,
        bk.booking_date,
        bk.start_time,
        bk.end_time,
        b.business_name,
        CONCAT(a.street_line1, ', ', a.city, ' ', a.postal_code) as business_location,
        bk.status
    FROM bookings bk
    JOIN businesses b ON bk.business_id = b.business_id
    JOIN business_addresses ba ON b.business_id = ba.business_id
    JOIN addresses a ON ba.address_id = a.address_id
    WHERE 
        (p_business_id IS NULL OR bk.business_id = p_business_id)    
    ORDER BY bk.booking_date DESC, bk.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Test Queries for Analytics and Search Functions

SELECT * FROM public.f_booking_summary_by_business(2);

SELECT * FROM public.f_customer_booking_history(2);

SELECT * FROM public.f_daily_booking_insights(2);

SELECT * FROM public.f_employee_performance(2);

SELECT * FROM public.f_get_bookings_by_location(2);

SELECT * FROM public.f_search_customers('E', 1);