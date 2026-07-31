
CREATE TABLE roles (
    role_id serial PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE
)

INSERT INTO roles (role_name) VALUES 
    ('admin'),
    ('user'),
    ('manager'),
    ('vendor');

CREATE TYPE providers AS ENUM(
    'local', 'google'
) 

CREATE TYPE u_status AS ENUM (
    'active', 'inactive', 'suspended'
)

CREATE TYPE otp_purpose AS ENUM (
    'login', 'password_reset', 'email_verification'
)

CREATE TYPE genders AS ENUM (
    'male', 'female', 'others', 'not specified'
)

CREATE table users(
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    phone_no VARCHAR(20),
    provider providers NOT NULL DEFAULT 'local',
    provider_user_id VARCHAR(100) DEFAULT NULL,
    user_status u_status DEFAULT 'active',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ, 
    failed_login_attempts SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)


CREATE table user_otp (
    otp_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) NOT NULL ON DELETE CASCADE,
    otp_code char(6) NOT NULL,
    purpose otp_purpose NOT NULL, 
    expire_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
)   

CREATE table user_roles (
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,    
    role_id int REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_id)
)


CREATE table profiles (
    profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(user_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth date,
    gender genders DEFAULT 'not specified',
    profile_image_url TEXT DEFAULT NULL,
    bio VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)


CREATE table customers (
    customer_id BIGSERIAL PRIMARY KEY NOT NULL,
    user_id BIGINT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)

CREATE table addresses (
    address_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    landmark VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    active_address BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
)

CREATE INDEX idx_profiles_user
ON profiles(user_id);

CREATE INDEX idx_customers_user
ON customers(user_id);

CREATE INDEX idx_addresses_customer
ON addresses(customer_id);

