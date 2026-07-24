
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status_enum AS ENUM ('active','inactive','suspended');
CREATE TYPE rental_status_enum AS ENUM ('draft','confirmed','active','completed','cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE deposit_status_enum AS ENUM ('held','partial_refund','refunded','forfeited');

CREATE TABLE users(
 user_id BIGSERIAL PRIMARY KEY,
 username VARCHAR(50) UNIQUE NOT NULL,
 email VARCHAR(150) UNIQUE NOT NULL,
 phone VARCHAR(20),
 password_hash TEXT NOT NULL,
 profile_image TEXT,
 email_verified BOOLEAN DEFAULT FALSE,
 status user_status_enum DEFAULT 'active',
 failed_login_count SMALLINT DEFAULT 0,
 last_login_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ DEFAULT now(),
 updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles(
 role_id SERIAL PRIMARY KEY,
 role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions(
 permission_id SERIAL PRIMARY KEY,
 permission_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_roles(
 user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
 role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
 PRIMARY KEY(user_id,role_id)
);

CREATE TABLE role_permissions(
 role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
 permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
 PRIMARY KEY(role_id,permission_id)
);

CREATE TABLE sessions(
 session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
 ip_address INET,
 user_agent TEXT,
 last_activity TIMESTAMPTZ DEFAULT now(),
 expires_at TIMESTAMPTZ NOT NULL,
 revoked_at TIMESTAMPTZ
);

CREATE TABLE oauth_accounts(
 oauth_account_id BIGSERIAL PRIMARY KEY,
 user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
 provider VARCHAR(30) NOT NULL,
 provider_user_id VARCHAR(255) NOT NULL,
 provider_email VARCHAR(255),
 access_token TEXT,
 refresh_token TEXT,
 token_expires_at TIMESTAMPTZ,
 provider_data JSONB,
 UNIQUE(provider,provider_user_id)
);

CREATE TABLE customers(
 customer_id BIGSERIAL PRIMARY KEY,
 user_id BIGINT UNIQUE REFERENCES users(user_id),
 first_name VARCHAR(100),
 last_name VARCHAR(100),
 phone VARCHAR(20),
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customer_addresses(
 address_id BIGSERIAL PRIMARY KEY,
 customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
 address_line TEXT,
 city VARCHAR(100),
 state VARCHAR(100),
 country VARCHAR(100),
 postal_code VARCHAR(20)
);

CREATE TABLE categories(
 category_id SERIAL PRIMARY KEY,
 category_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE products(
 product_id BIGSERIAL PRIMARY KEY,
 category_id INT REFERENCES categories(category_id),
 sku VARCHAR(60) UNIQUE,
 product_name VARCHAR(200) NOT NULL,
 description TEXT,
 replacement_cost NUMERIC(10,2),
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE price_lists(
 price_list_id SERIAL PRIMARY KEY,
 name VARCHAR(100),
 effective_from DATE,
 effective_to DATE
);

CREATE TABLE product_prices(
 product_price_id BIGSERIAL PRIMARY KEY,
 product_id BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
 price_list_id INT REFERENCES price_lists(price_list_id),
 rental_period VARCHAR(20),
 rate NUMERIC(10,2)
);

CREATE TABLE inventory_assets(
 asset_id BIGSERIAL PRIMARY KEY,
 product_id BIGINT REFERENCES products(product_id) ON DELETE CASCADE,
 serial_number VARCHAR(100) UNIQUE,
 qr_code VARCHAR(100) UNIQUE,
 status VARCHAR(30) DEFAULT 'available'
);

CREATE TABLE rental_orders(
 rental_order_id BIGSERIAL PRIMARY KEY,
 customer_id BIGINT REFERENCES customers(customer_id),
 status rental_status_enum DEFAULT 'draft',
 rental_start TIMESTAMPTZ,
 rental_end TIMESTAMPTZ,
 total_amount NUMERIC(10,2),
 created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rental_order_items(
 rental_order_item_id BIGSERIAL PRIMARY KEY,
 rental_order_id BIGINT REFERENCES rental_orders(rental_order_id) ON DELETE CASCADE,
 asset_id BIGINT REFERENCES inventory_assets(asset_id),
 rate NUMERIC(10,2)
);

CREATE TABLE security_deposits(
 deposit_id BIGSERIAL PRIMARY KEY,
 rental_order_id BIGINT UNIQUE REFERENCES rental_orders(rental_order_id),
 deposit_amount NUMERIC(10,2),
 deduction_amount NUMERIC(10,2) DEFAULT 0,
 refund_amount NUMERIC(10,2),
 status deposit_status_enum DEFAULT 'held'
);

CREATE TABLE late_fee_rules(
 rule_id SERIAL PRIMARY KEY,
 calculation_unit VARCHAR(20),
 rate NUMERIC(10,2),
 grace_minutes INT DEFAULT 0,
 maximum_fee NUMERIC(10,2)
);

CREATE TABLE returns(
 return_id BIGSERIAL PRIMARY KEY,
 rental_order_id BIGINT REFERENCES rental_orders(rental_order_id),
 returned_at TIMESTAMPTZ,
 late_fee NUMERIC(10,2),
 damage_fee NUMERIC(10,2),
 remarks TEXT
);

CREATE TABLE payments(
 payment_id BIGSERIAL PRIMARY KEY,
 rental_order_id BIGINT REFERENCES rental_orders(rental_order_id),
 amount NUMERIC(10,2),
 payment_method VARCHAR(50),
 status payment_status_enum DEFAULT 'pending',
 paid_at TIMESTAMPTZ
);

CREATE TABLE refunds(
 refund_id BIGSERIAL PRIMARY KEY,
 payment_id BIGINT REFERENCES payments(payment_id),
 amount NUMERIC(10,2),
 refunded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quotations(
 quotation_id BIGSERIAL PRIMARY KEY,
 customer_id BIGINT REFERENCES customers(customer_id),
 valid_until DATE,
 status VARCHAR(20)
);

CREATE TABLE quotation_items(
 quotation_item_id BIGSERIAL PRIMARY KEY,
 quotation_id BIGINT REFERENCES quotations(quotation_id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(product_id),
 quantity INT,
 rate NUMERIC(10,2)
);

CREATE TABLE audit_logs(
 audit_log_id BIGSERIAL PRIMARY KEY,
 table_name VARCHAR(100),
 record_id BIGINT,
 action VARCHAR(20),
 old_data JSONB,
 new_data JSONB,
 changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_rental_customer ON rental_orders(customer_id);
CREATE INDEX idx_assets_status ON inventory_assets(status);

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at=now();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

INSERT INTO roles(role_name)
VALUES
('SUPER_ADMIN'),
('ADMIN'),
('MANAGER'),
('STAFF'),
('CUSTOMER')
ON CONFLICT DO NOTHING;

INSERT INTO permissions(permission_name)
VALUES
('user.create'),
('user.read'),
('user.update'),
('user.delete'),
('product.create'),
('product.read'),
('product.update'),
('product.delete'),
('rental.create'),
('rental.read'),
('rental.update'),
('payment.create'),
('payment.read'),
('dashboard.read')
ON CONFLICT DO NOTHING;

INSERT INTO categories(category_name)
VALUES
('Electronics'),
('Furniture'),
('Photography'),
('Audio'),
('Gaming'),
('Sports'),
('Tools'),
('Camping')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.role_id,p.permission_id
FROM roles r CROSS JOIN permissions p
WHERE r.role_name='SUPER_ADMIN'
ON CONFLICT DO NOTHING;
