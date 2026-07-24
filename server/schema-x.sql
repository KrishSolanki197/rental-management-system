-- ====================================================================
-- RENTAL MANAGEMENT SYSTEM - PRODUCTION DATABASE SCHEMA (PostgreSQL 14+)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ====================================================================
-- ENUM TYPES
-- ====================================================================

CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended', 'locked');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'undisclosed');
CREATE TYPE address_type_enum AS ENUM ('billing', 'shipping', 'both');
CREATE TYPE document_type_enum AS ENUM ('id_proof', 'address_proof', 'passport', 'driving_license', 'other');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE stock_movement_type_enum AS ENUM ('inbound', 'outbound', 'transfer', 'adjustment', 'rental_out', 'rental_return', 'damaged', 'repair_out', 'repair_in');
CREATE TYPE rental_order_status_enum AS ENUM ('draft', 'confirmed', 'active', 'completed', 'cancelled', 'overdue');
CREATE TYPE rental_item_status_enum AS ENUM ('reserved', 'picked_up', 'returned', 'damaged', 'lost', 'cancelled');
CREATE TYPE pickup_status_enum AS ENUM ('scheduled', 'completed', 'missed', 'rescheduled');
CREATE TYPE return_status_enum AS ENUM ('scheduled', 'completed', 'late', 'missed');
CREATE TYPE damage_severity_enum AS ENUM ('none', 'minor', 'moderate', 'severe', 'total_loss');
CREATE TYPE repair_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'unrepairable');
CREATE TYPE price_rule_type_enum AS ENUM ('flat', 'percentage', 'tiered');
CREATE TYPE discount_type_enum AS ENUM ('flat', 'percentage');
CREATE TYPE invoice_status_enum AS ENUM ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'void');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE refund_status_enum AS ENUM ('pending', 'processed', 'rejected');
CREATE TYPE quotation_status_enum AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted');
CREATE TYPE notification_channel_enum AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE audit_action_enum AS ENUM ('insert', 'update', 'delete');

-- ====================================================================
-- SECTION 1: AUTHENTICATION
-- ====================================================================

CREATE TABLE users (
    user_id            BIGSERIAL PRIMARY KEY,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(150) NOT NULL UNIQUE,
    phone               VARCHAR(20)  UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    status              user_status_enum NOT NULL DEFAULT 'active',
    last_login_at        TIMESTAMPTZ,
    failed_login_count   SMALLINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          BIGINT,
    updated_by          BIGINT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE roles (
    role_id       SERIAL PRIMARY KEY,
    role_name     VARCHAR(50) NOT NULL UNIQUE,
    description   VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE permissions (
    permission_id   SERIAL PRIMARY KEY,
    permission_key   VARCHAR(100) NOT NULL UNIQUE,
    description      VARCHAR(255),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id         INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    permission_id   INT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    role_id      INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    refresh_token_id   BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    token_hash         VARCHAR(255) NOT NULL UNIQUE,
    issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at         TIMESTAMPTZ NOT NULL,
    revoked_at         TIMESTAMPTZ,
    CONSTRAINT chk_refresh_token_expiry CHECK (expires_at > issued_at)
);

CREATE TABLE sessions (
    session_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    ip_address      INET,
    user_agent      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL
);

ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- ====================================================================
-- SECTION 2: CUSTOMER
-- ====================================================================

CREATE TABLE customers (
    customer_id     BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    date_of_birth    DATE,
    gender          gender_enum,
    company_name     VARCHAR(150),
    tax_id          VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_by      BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_customer_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE customer_addresses (
    customer_address_id   BIGSERIAL PRIMARY KEY,
    customer_id           BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    address_type            address_type_enum NOT NULL DEFAULT 'both',
    address_line1           VARCHAR(255) NOT NULL,
    address_line2           VARCHAR(255),
    city                    VARCHAR(100) NOT NULL,
    state                   VARCHAR(100) NOT NULL,
    postal_code              VARCHAR(20)  NOT NULL,
    country                 VARCHAR(100) NOT NULL,
    is_default              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE customer_documents (
    customer_document_id   BIGSERIAL PRIMARY KEY,
    customer_id            BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    document_type            document_type_enum NOT NULL,
    document_number          VARCHAR(100) NOT NULL,
    file_url                VARCHAR(500) NOT NULL,
    verification_status       verification_status_enum NOT NULL DEFAULT 'pending',
    verified_by              BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    verified_at              TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted                BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_customer_document UNIQUE (customer_id, document_type, document_number)
);

CREATE TABLE customer_profile_images (
    customer_profile_image_id   BIGSERIAL PRIMARY KEY,
    customer_id                  BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    image_url                    VARCHAR(500) NOT NULL,
    is_primary                   BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- SECTION 3: PRODUCTS
-- ====================================================================

CREATE TABLE product_categories (
    product_category_id   SERIAL PRIMARY KEY,
    parent_category_id     INT REFERENCES product_categories(product_category_id) ON DELETE SET NULL,
    category_name          VARCHAR(100) NOT NULL,
    slug                   VARCHAR(120) NOT NULL UNIQUE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active              BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE manufacturers (
    manufacturer_id   SERIAL PRIMARY KEY,
    manufacturer_name  VARCHAR(150) NOT NULL UNIQUE,
    country            VARCHAR(100),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE product_brands (
    product_brand_id   SERIAL PRIMARY KEY,
    manufacturer_id     INT REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL,
    brand_name          VARCHAR(150) NOT NULL UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    product_id           BIGSERIAL PRIMARY KEY,
    product_category_id    INT NOT NULL REFERENCES product_categories(product_category_id) ON DELETE RESTRICT,
    product_brand_id        INT REFERENCES product_brands(product_brand_id) ON DELETE SET NULL,
    sku                    VARCHAR(64) NOT NULL UNIQUE,
    barcode                VARCHAR(64) UNIQUE,
    qr_code                VARCHAR(128) UNIQUE,
    product_name            VARCHAR(200) NOT NULL,
    description             TEXT,
    is_rentable             BOOLEAN NOT NULL DEFAULT TRUE,
    replacement_value        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (replacement_value >= 0),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by              BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_by              BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted               BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE product_images (
    product_image_id   BIGSERIAL PRIMARY KEY,
    product_id          BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    image_url            VARCHAR(500) NOT NULL,
    display_order         SMALLINT NOT NULL DEFAULT 0,
    is_primary            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE variant_values (
    variant_value_id   SERIAL PRIMARY KEY,
    attribute_name        VARCHAR(50) NOT NULL,
    attribute_value       VARCHAR(100) NOT NULL,
    CONSTRAINT uq_variant_attribute UNIQUE (attribute_name, attribute_value)
);

CREATE TABLE product_variants (
    product_variant_id   BIGSERIAL PRIMARY KEY,
    product_id            BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    variant_sku            VARCHAR(64) NOT NULL UNIQUE,
    variant_value_id        INT NOT NULL REFERENCES variant_values(variant_value_id) ON DELETE RESTRICT,
    additional_price         NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_product_variant_value UNIQUE (product_id, variant_value_id)
);

CREATE TABLE warehouses (
    warehouse_id     SERIAL PRIMARY KEY,
    warehouse_name    VARCHAR(150) NOT NULL UNIQUE,
    address_line1      VARCHAR(255) NOT NULL,
    city               VARCHAR(100) NOT NULL,
    state              VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20) NOT NULL,
    country            VARCHAR(100) NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inventory (
    inventory_id         BIGSERIAL PRIMARY KEY,
    product_variant_id     BIGINT NOT NULL REFERENCES product_variants(product_variant_id) ON DELETE CASCADE ON UPDATE CASCADE,
    warehouse_id           INT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    quantity_on_hand         INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved        INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_under_repair     INT NOT NULL DEFAULT 0 CHECK (quantity_under_repair >= 0),
    reorder_level            INT NOT NULL DEFAULT 0,
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_inventory_variant_warehouse UNIQUE (product_variant_id, warehouse_id),
    CONSTRAINT chk_inventory_reserved_le_onhand CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE TABLE stock_movements (
    stock_movement_id   BIGSERIAL PRIMARY KEY,
    inventory_id          BIGINT NOT NULL REFERENCES inventory(inventory_id) ON DELETE CASCADE ON UPDATE CASCADE,
    movement_type          stock_movement_type_enum NOT NULL,
    quantity               INT NOT NULL CHECK (quantity <> 0),
    reference_type          VARCHAR(50),
    reference_id            BIGINT,
    notes                  VARCHAR(255),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by              BIGINT REFERENCES users(user_id) ON DELETE SET NULL
);

-- ====================================================================
-- SECTION 4: PRICING
-- ====================================================================

CREATE TABLE price_lists (
    price_list_id     SERIAL PRIMARY KEY,
    price_list_name    VARCHAR(150) NOT NULL UNIQUE,
    currency           CHAR(3) NOT NULL DEFAULT 'USD',
    valid_from          DATE NOT NULL,
    valid_to            DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_price_list_dates CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE TABLE rental_pricing (
    rental_pricing_id   BIGSERIAL PRIMARY KEY,
    price_list_id         INT NOT NULL REFERENCES price_lists(price_list_id) ON DELETE CASCADE ON UPDATE CASCADE,
    product_variant_id     BIGINT NOT NULL REFERENCES product_variants(product_variant_id) ON DELETE CASCADE ON UPDATE CASCADE,
    rate_hourly            NUMERIC(10,2) CHECK (rate_hourly >= 0),
    rate_daily             NUMERIC(10,2) CHECK (rate_daily >= 0),
    rate_weekly            NUMERIC(10,2) CHECK (rate_weekly >= 0),
    rate_monthly            NUMERIC(10,2) CHECK (rate_monthly >= 0),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_rental_pricing UNIQUE (price_list_id, product_variant_id)
);

CREATE TABLE price_rules (
    price_rule_id     BIGSERIAL PRIMARY KEY,
    price_list_id       INT NOT NULL REFERENCES price_lists(price_list_id) ON DELETE CASCADE ON UPDATE CASCADE,
    rule_name           VARCHAR(150) NOT NULL,
    rule_type           price_rule_type_enum NOT NULL,
    min_duration_hours    INT NOT NULL DEFAULT 0,
    max_duration_hours    INT,
    adjustment_value      NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_price_rule_duration CHECK (max_duration_hours IS NULL OR max_duration_hours >= min_duration_hours)
);

CREATE TABLE discount_rules (
    discount_rule_id   BIGSERIAL PRIMARY KEY,
    discount_code        VARCHAR(50) NOT NULL UNIQUE,
    discount_type        discount_type_enum NOT NULL,
    discount_value        NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
    valid_from            DATE NOT NULL,
    valid_to              DATE,
    usage_limit           INT,
    times_used            INT NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_discount_dates CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE TABLE security_deposit_rules (
    security_deposit_rule_id   SERIAL PRIMARY KEY,
    product_category_id          INT NOT NULL REFERENCES product_categories(product_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
    deposit_type                 price_rule_type_enum NOT NULL DEFAULT 'percentage',
    deposit_value                 NUMERIC(10,2) NOT NULL CHECK (deposit_value >= 0),
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active                    BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_deposit_rule_category UNIQUE (product_category_id)
);

-- ====================================================================
-- SECTION 5: QUOTATION
-- ====================================================================

CREATE TABLE quotation_templates (
    quotation_template_id   SERIAL PRIMARY KEY,
    template_name             VARCHAR(150) NOT NULL UNIQUE,
    template_body              TEXT NOT NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active                  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE quotations (
    quotation_id         BIGSERIAL PRIMARY KEY,
    quotation_number       VARCHAR(30) NOT NULL UNIQUE,
    customer_id            BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    quotation_template_id    INT REFERENCES quotation_templates(quotation_template_id) ON DELETE SET NULL,
    status                 quotation_status_enum NOT NULL DEFAULT 'draft',
    valid_until              DATE NOT NULL,
    subtotal_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by               BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_deleted                BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE quotation_items (
    quotation_item_id   BIGSERIAL PRIMARY KEY,
    quotation_id          BIGINT NOT NULL REFERENCES quotations(quotation_id) ON DELETE CASCADE ON UPDATE CASCADE,
    product_variant_id     BIGINT NOT NULL REFERENCES product_variants(product_variant_id) ON DELETE RESTRICT,
    quantity               INT NOT NULL CHECK (quantity > 0),
    rental_start_date        DATE NOT NULL,
    rental_end_date          DATE NOT NULL,
    unit_price              NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total               NUMERIC(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_quotation_item_dates CHECK (rental_end_date >= rental_start_date)
);

-- ====================================================================
-- SECTION 6: RENTAL
-- ====================================================================

CREATE TABLE rental_orders (
    rental_order_id       BIGSERIAL PRIMARY KEY,
    order_number            VARCHAR(30) NOT NULL UNIQUE,
    customer_id              BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    quotation_id             BIGINT REFERENCES quotations(quotation_id) ON DELETE SET NULL,
    billing_address_id        BIGINT REFERENCES customer_addresses(customer_address_id) ON DELETE SET NULL,
    shipping_address_id       BIGINT REFERENCES customer_addresses(customer_address_id) ON DELETE SET NULL,
    status                   rental_order_status_enum NOT NULL DEFAULT 'draft',
    subtotal_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount                NUMERIC(12,2) NOT NULL DEFAULT 0,
    deposit_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_rule_id            BIGINT REFERENCES discount_rules(discount_rule_id) ON DELETE SET NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by                 BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_by                 BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    is_deleted                  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE rental_periods (
    rental_period_id   SERIAL PRIMARY KEY,
    period_name           VARCHAR(30) NOT NULL UNIQUE,
    duration_hours         INT NOT NULL CHECK (duration_hours > 0)
);

CREATE TABLE rental_order_items (
    rental_order_item_id   BIGSERIAL PRIMARY KEY,
    rental_order_id          BIGINT NOT NULL REFERENCES rental_orders(rental_order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    product_variant_id        BIGINT NOT NULL REFERENCES product_variants(product_variant_id) ON DELETE RESTRICT,
    warehouse_id               INT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    rental_period_id            INT REFERENCES rental_periods(rental_period_id) ON DELETE SET NULL,
    quantity                    INT NOT NULL CHECK (quantity > 0),
    scheduled_pickup_date        TIMESTAMPTZ NOT NULL,
    scheduled_return_date        TIMESTAMPTZ NOT NULL,
    actual_pickup_date           TIMESTAMPTZ,
    actual_return_date           TIMESTAMPTZ,
    unit_price                  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total                   NUMERIC(12,2) NOT NULL DEFAULT 0,
    item_status                  rental_item_status_enum NOT NULL DEFAULT 'reserved',
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_rental_item_dates CHECK (scheduled_return_date > scheduled_pickup_date)
);

CREATE TABLE rental_schedules (
    rental_schedule_id   BIGSERIAL PRIMARY KEY,
    rental_order_item_id   BIGINT NOT NULL REFERENCES rental_order_items(rental_order_item_id) ON DELETE CASCADE ON UPDATE CASCADE,
    warehouse_id            INT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    blocked_from             TIMESTAMPTZ NOT NULL,
    blocked_to               TIMESTAMPTZ NOT NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_rental_schedule_range CHECK (blocked_to > blocked_from)
);

CREATE TABLE pickups (
    pickup_id             BIGSERIAL PRIMARY KEY,
    rental_order_item_id    BIGINT NOT NULL UNIQUE REFERENCES rental_order_items(rental_order_item_id) ON DELETE CASCADE ON UPDATE CASCADE,
    pickup_status            pickup_status_enum NOT NULL DEFAULT 'scheduled',
    scheduled_at             TIMESTAMPTZ NOT NULL,
    completed_at             TIMESTAMPTZ,
    handled_by               BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    notes                   VARCHAR(255),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE returns (
    return_id             BIGSERIAL PRIMARY KEY,
    rental_order_item_id    BIGINT NOT NULL UNIQUE REFERENCES rental_order_items(rental_order_item_id) ON DELETE CASCADE ON UPDATE CASCADE,
    return_status            return_status_enum NOT NULL DEFAULT 'scheduled',
    scheduled_at             TIMESTAMPTZ NOT NULL,
    completed_at             TIMESTAMPTZ,
    handled_by               BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    late_days                 INT NOT NULL DEFAULT 0 CHECK (late_days >= 0),
    notes                   VARCHAR(255),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE damage_inspections (
    damage_inspection_id   BIGSERIAL PRIMARY KEY,
    return_id                BIGINT NOT NULL REFERENCES returns(return_id) ON DELETE CASCADE ON UPDATE CASCADE,
    inspected_by              BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    severity                 damage_severity_enum NOT NULL DEFAULT 'none',
    description               TEXT,
    estimated_repair_cost      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (estimated_repair_cost >= 0),
    inspected_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE repair_records (
    repair_record_id   BIGSERIAL PRIMARY KEY,
    damage_inspection_id   BIGINT NOT NULL REFERENCES damage_inspections(damage_inspection_id) ON DELETE CASCADE ON UPDATE CASCADE,
    repair_status            repair_status_enum NOT NULL DEFAULT 'pending',
    repair_cost               NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (repair_cost >= 0),
    started_at                TIMESTAMPTZ,
    completed_at               TIMESTAMPTZ,
    vendor_name                VARCHAR(150),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- SECTION 7: PAYMENTS
-- ====================================================================

CREATE TABLE payment_methods (
    payment_method_id   SERIAL PRIMARY KEY,
    method_name           VARCHAR(50) NOT NULL UNIQUE,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE invoices (
    invoice_id         BIGSERIAL PRIMARY KEY,
    invoice_number       VARCHAR(30) NOT NULL UNIQUE,
    rental_order_id       BIGINT NOT NULL REFERENCES rental_orders(rental_order_id) ON DELETE RESTRICT,
    customer_id           BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    status                invoice_status_enum NOT NULL DEFAULT 'draft',
    issue_date             DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date               DATE NOT NULL,
    subtotal_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid            NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_invoice_dates CHECK (due_date >= issue_date)
);

CREATE TABLE invoice_items (
    invoice_item_id     BIGSERIAL PRIMARY KEY,
    invoice_id            BIGINT NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE ON UPDATE CASCADE,
    rental_order_item_id   BIGINT REFERENCES rental_order_items(rental_order_item_id) ON DELETE SET NULL,
    description            VARCHAR(255) NOT NULL,
    quantity               INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price              NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total               NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE payments (
    payment_id         BIGSERIAL PRIMARY KEY,
    invoice_id           BIGINT NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE ON UPDATE CASCADE,
    payment_method_id     INT NOT NULL REFERENCES payment_methods(payment_method_id) ON DELETE RESTRICT,
    amount               NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status               payment_status_enum NOT NULL DEFAULT 'pending',
    transaction_reference   VARCHAR(150) UNIQUE,
    paid_at               TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
    refund_id       BIGSERIAL PRIMARY KEY,
    payment_id        BIGINT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    reason            VARCHAR(255),
    status            refund_status_enum NOT NULL DEFAULT 'pending',
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deposit_history (
    deposit_history_id   BIGSERIAL PRIMARY KEY,
    rental_order_id        BIGINT NOT NULL REFERENCES rental_orders(rental_order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount_collected        NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_refunded         NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_forfeited         NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE late_fee_history (
    late_fee_history_id   BIGSERIAL PRIMARY KEY,
    rental_order_item_id    BIGINT NOT NULL REFERENCES rental_order_items(rental_order_item_id) ON DELETE CASCADE ON UPDATE CASCADE,
    late_days                INT NOT NULL CHECK (late_days > 0),
    fee_amount               NUMERIC(10,2) NOT NULL CHECK (fee_amount >= 0),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- SECTION 8: NOTIFICATIONS
-- ====================================================================

CREATE TABLE notifications (
    notification_id   BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    customer_id         BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    channel             notification_channel_enum NOT NULL,
    title               VARCHAR(150) NOT NULL,
    message             TEXT NOT NULL,
    status              notification_status_enum NOT NULL DEFAULT 'pending',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at              TIMESTAMPTZ,
    CONSTRAINT chk_notification_recipient CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL)
);

CREATE TABLE email_logs (
    email_log_id     BIGSERIAL PRIMARY KEY,
    notification_id    BIGINT REFERENCES notifications(notification_id) ON DELETE SET NULL,
    recipient_email     VARCHAR(150) NOT NULL,
    subject             VARCHAR(255) NOT NULL,
    status              notification_status_enum NOT NULL DEFAULT 'pending',
    sent_at              TIMESTAMPTZ,
    error_message         VARCHAR(500),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sms_logs (
    sms_log_id       BIGSERIAL PRIMARY KEY,
    notification_id    BIGINT REFERENCES notifications(notification_id) ON DELETE SET NULL,
    recipient_phone     VARCHAR(20) NOT NULL,
    message              VARCHAR(320) NOT NULL,
    status               notification_status_enum NOT NULL DEFAULT 'pending',
    sent_at               TIMESTAMPTZ,
    error_message          VARCHAR(500),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- SECTION 9: AUDIT
-- ====================================================================

CREATE TABLE audit_logs (
    audit_log_id     BIGSERIAL PRIMARY KEY,
    table_name          VARCHAR(100) NOT NULL,
    record_id            BIGINT NOT NULL,
    action               audit_action_enum NOT NULL,
    old_data              JSONB,
    new_data              JSONB,
    changed_by            BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    changed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_logs (
    activity_log_id   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    activity_type         VARCHAR(100) NOT NULL,
    description           VARCHAR(500),
    ip_address             INET,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- SECTION 10: INDEXES
-- ====================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_documents_customer_id ON customer_documents(customer_id);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_qr_code ON products(qr_code);
CREATE INDEX idx_products_category ON products(product_category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_inventory_variant_warehouse ON inventory(product_variant_id, warehouse_id);
CREATE INDEX idx_stock_movements_inventory_id ON stock_movements(inventory_id);

CREATE INDEX idx_rental_orders_customer_id ON rental_orders(customer_id);
CREATE INDEX idx_rental_orders_status ON rental_orders(status);
CREATE INDEX idx_rental_order_items_order_id ON rental_order_items(rental_order_id);
CREATE INDEX idx_rental_order_items_status ON rental_order_items(item_status);
CREATE INDEX idx_rental_order_items_pickup_date ON rental_order_items(scheduled_pickup_date);
CREATE INDEX idx_rental_order_items_return_date ON rental_order_items(scheduled_return_date);
CREATE INDEX idx_rental_order_items_variant ON rental_order_items(product_variant_id);
CREATE INDEX idx_rental_schedules_item_id ON rental_schedules(rental_order_item_id);
CREATE INDEX idx_rental_schedules_range ON rental_schedules(blocked_from, blocked_to);

CREATE INDEX idx_pickups_scheduled_at ON pickups(scheduled_at);
CREATE INDEX idx_returns_scheduled_at ON returns(scheduled_at);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_number ON quotations(quotation_number);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- ====================================================================
-- SECTION 11: TRIGGER FUNCTIONS
-- ====================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'users','roles','customers','customer_addresses','customer_documents',
        'product_categories','manufacturers','product_brands','products',
        'product_variants','warehouses','price_lists','rental_pricing',
        'quotations','rental_orders','rental_order_items','pickups','returns',
        'repair_records','invoices','deposit_history'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END $$;

-- Prevent negative inventory on hand
CREATE OR REPLACE FUNCTION fn_prevent_negative_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_on_hand < 0 THEN
        RAISE EXCEPTION 'Inventory quantity_on_hand cannot be negative for inventory_id %', NEW.inventory_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_prevent_negative
BEFORE INSERT OR UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION fn_prevent_negative_inventory();

-- Decrease available inventory when a rental item is picked up
CREATE OR REPLACE FUNCTION fn_decrease_inventory_on_pickup()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id BIGINT;
    v_warehouse_id INT;
    v_quantity INT;
BEGIN
    IF NEW.pickup_status = 'completed' AND (OLD.pickup_status IS DISTINCT FROM 'completed') THEN
        SELECT product_variant_id, warehouse_id, quantity
        INTO v_variant_id, v_warehouse_id, v_quantity
        FROM rental_order_items
        WHERE rental_order_item_id = NEW.rental_order_item_id;

        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand - v_quantity,
            quantity_reserved = GREATEST(quantity_reserved - v_quantity, 0)
        WHERE product_variant_id = v_variant_id AND warehouse_id = v_warehouse_id;

        UPDATE rental_order_items
        SET item_status = 'picked_up', actual_pickup_date = now()
        WHERE rental_order_item_id = NEW.rental_order_item_id;

        INSERT INTO stock_movements (inventory_id, movement_type, quantity, reference_type, reference_id)
        SELECT inventory_id, 'rental_out', -v_quantity, 'rental_order_item', NEW.rental_order_item_id
        FROM inventory WHERE product_variant_id = v_variant_id AND warehouse_id = v_warehouse_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pickup_decrease_inventory
AFTER UPDATE ON pickups
FOR EACH ROW EXECUTE FUNCTION fn_decrease_inventory_on_pickup();

-- Increase inventory back when item is returned
CREATE OR REPLACE FUNCTION fn_increase_inventory_on_return()
RETURNS TRIGGER AS $$
DECLARE
    v_variant_id BIGINT;
    v_warehouse_id INT;
    v_quantity INT;
BEGIN
    IF NEW.return_status = 'completed' AND (OLD.return_status IS DISTINCT FROM 'completed') THEN
        SELECT product_variant_id, warehouse_id, quantity
        INTO v_variant_id, v_warehouse_id, v_quantity
        FROM rental_order_items
        WHERE rental_order_item_id = NEW.rental_order_item_id;

        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand + v_quantity
        WHERE product_variant_id = v_variant_id AND warehouse_id = v_warehouse_id;

        UPDATE rental_order_items
        SET item_status = 'returned', actual_return_date = now()
        WHERE rental_order_item_id = NEW.rental_order_item_id;

        INSERT INTO stock_movements (inventory_id, movement_type, quantity, reference_type, reference_id)
        SELECT inventory_id, 'rental_return', v_quantity, 'rental_order_item', NEW.rental_order_item_id
        FROM inventory WHERE product_variant_id = v_variant_id AND warehouse_id = v_warehouse_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_increase_inventory
AFTER UPDATE ON returns
FOR EACH ROW EXECUTE FUNCTION fn_increase_inventory_on_return();

-- Calculate late fee automatically when a return is marked late
CREATE OR REPLACE FUNCTION fn_calculate_late_fee()
RETURNS TRIGGER AS $$
DECLARE
    v_scheduled_return TIMESTAMPTZ;
    v_late_days INT;
    v_daily_rate NUMERIC(10,2);
    v_fee NUMERIC(10,2);
BEGIN
    IF NEW.completed_at IS NOT NULL THEN
        SELECT scheduled_return_date INTO v_scheduled_return
        FROM rental_order_items WHERE rental_order_item_id = NEW.rental_order_item_id;

        v_late_days := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (NEW.completed_at - v_scheduled_return)) / 86400.0))::INT;

        IF v_late_days > 0 THEN
            SELECT COALESCE(rp.rate_daily, 0) INTO v_daily_rate
            FROM rental_order_items roi
            JOIN rental_pricing rp ON rp.product_variant_id = roi.product_variant_id
            WHERE roi.rental_order_item_id = NEW.rental_order_item_id
            LIMIT 1;

            v_fee := v_late_days * COALESCE(v_daily_rate, 0) * 1.5;
            NEW.late_days := v_late_days;
            NEW.return_status := 'late';

            INSERT INTO late_fee_history (rental_order_item_id, late_days, fee_amount)
            VALUES (NEW.rental_order_item_id, v_late_days, v_fee);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_late_fee
BEFORE UPDATE ON returns
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
EXECUTE FUNCTION fn_calculate_late_fee();

-- Update rental order status based on item statuses
CREATE OR REPLACE FUNCTION fn_update_rental_order_status()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id BIGINT;
    v_total_items INT;
    v_returned_items INT;
BEGIN
    v_order_id := NEW.rental_order_id;

    SELECT COUNT(*), COUNT(*) FILTER (WHERE item_status = 'returned')
    INTO v_total_items, v_returned_items
    FROM rental_order_items WHERE rental_order_id = v_order_id;

    IF v_total_items > 0 AND v_total_items = v_returned_items THEN
        UPDATE rental_orders SET status = 'completed' WHERE rental_order_id = v_order_id;
    ELSIF EXISTS (
        SELECT 1 FROM rental_order_items
        WHERE rental_order_id = v_order_id AND item_status = 'picked_up'
    ) THEN
        UPDATE rental_orders SET status = 'active' WHERE rental_order_id = v_order_id
        AND status NOT IN ('cancelled','completed');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rental_order_status_update
AFTER UPDATE ON rental_order_items
FOR EACH ROW EXECUTE FUNCTION fn_update_rental_order_status();

-- Generic audit logger for rental_orders and invoices
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_at)
        VALUES (TG_TABLE_NAME, NEW.rental_order_id, 'insert', to_jsonb(NEW), now());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_at)
        VALUES (TG_TABLE_NAME, NEW.rental_order_id, 'update', to_jsonb(OLD), to_jsonb(NEW), now());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_at)
        VALUES (TG_TABLE_NAME, OLD.rental_order_id, 'delete', to_jsonb(OLD), now());
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rental_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON rental_orders
FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- Generate sequential invoice numbers
CREATE SEQUENCE IF NOT EXISTS seq_invoice_number START 1;

CREATE OR REPLACE FUNCTION fn_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || to_char(now(),'YYYY') || '-' ||
            LPAD(nextval('seq_invoice_number')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION fn_generate_invoice_number();

-- Generate sequential quotation numbers
CREATE SEQUENCE IF NOT EXISTS seq_quotation_number START 1;

CREATE OR REPLACE FUNCTION fn_generate_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quotation_number IS NULL THEN
        NEW.quotation_number := 'QUO-' || to_char(now(),'YYYY') || '-' ||
            LPAD(nextval('seq_quotation_number')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_quotation_number
BEFORE INSERT ON quotations
FOR EACH ROW EXECUTE FUNCTION fn_generate_quotation_number();

-- ====================================================================
-- SECTION 12: VIEWS
-- ====================================================================

CREATE OR REPLACE VIEW vw_active_rentals AS
SELECT ro.rental_order_id, ro.order_number, c.customer_id,
       c.first_name || ' ' || c.last_name AS customer_name,
       roi.rental_order_item_id, roi.product_variant_id,
       roi.scheduled_pickup_date, roi.scheduled_return_date, roi.item_status
FROM rental_orders ro
JOIN customers c ON c.customer_id = ro.customer_id
JOIN rental_order_items roi ON roi.rental_order_id = ro.rental_order_id
WHERE ro.status = 'active' AND roi.item_status = 'picked_up';

CREATE OR REPLACE VIEW vw_overdue_rentals AS
SELECT ro.rental_order_id, ro.order_number, c.customer_id,
       c.first_name || ' ' || c.last_name AS customer_name,
       roi.rental_order_item_id, roi.scheduled_return_date,
       (CURRENT_DATE - roi.scheduled_return_date::date) AS days_overdue
FROM rental_orders ro
JOIN customers c ON c.customer_id = ro.customer_id
JOIN rental_order_items roi ON roi.rental_order_id = ro.rental_order_id
WHERE roi.item_status = 'picked_up'
  AND roi.scheduled_return_date < now();

CREATE OR REPLACE VIEW vw_todays_pickups AS
SELECT p.pickup_id, roi.rental_order_item_id, ro.order_number,
       c.first_name || ' ' || c.last_name AS customer_name, p.scheduled_at, p.pickup_status
FROM pickups p
JOIN rental_order_items roi ON roi.rental_order_item_id = p.rental_order_item_id
JOIN rental_orders ro ON ro.rental_order_id = roi.rental_order_id
JOIN customers c ON c.customer_id = ro.customer_id
WHERE p.scheduled_at::date = CURRENT_DATE;

CREATE OR REPLACE VIEW vw_todays_returns AS
SELECT r.return_id, roi.rental_order_item_id, ro.order_number,
       c.first_name || ' ' || c.last_name AS customer_name, r.scheduled_at, r.return_status
FROM returns r
JOIN rental_order_items roi ON roi.rental_order_item_id = r.rental_order_item_id
JOIN rental_orders ro ON ro.rental_order_id = roi.rental_order_id
JOIN customers c ON c.customer_id = ro.customer_id
WHERE r.scheduled_at::date = CURRENT_DATE;

CREATE OR REPLACE VIEW vw_revenue_report AS
SELECT date_trunc('month', i.issue_date)::date AS revenue_month,
       COUNT(DISTINCT i.invoice_id) AS invoice_count,
       SUM(i.total_amount) AS total_billed,
       SUM(i.amount_paid) AS total_collected
FROM invoices i
WHERE i.status <> 'void'
GROUP BY date_trunc('month', i.issue_date);

CREATE OR REPLACE VIEW vw_deposit_summary AS
SELECT ro.rental_order_id, ro.order_number, dh.amount_collected,
       dh.amount_refunded, dh.amount_forfeited,
       (dh.amount_collected - dh.amount_refunded - dh.amount_forfeited) AS balance_held
FROM deposit_history dh
JOIN rental_orders ro ON ro.rental_order_id = dh.rental_order_id;

CREATE OR REPLACE VIEW vw_inventory_availability AS
SELECT inv.inventory_id, pv.product_variant_id, p.product_name, w.warehouse_name,
       inv.quantity_on_hand, inv.quantity_reserved, inv.quantity_under_repair,
       (inv.quantity_on_hand - inv.quantity_reserved - inv.quantity_under_repair) AS quantity_available
FROM inventory inv
JOIN product_variants pv ON pv.product_variant_id = inv.product_variant_id
JOIN products p ON p.product_id = pv.product_id
JOIN warehouses w ON w.warehouse_id = inv.warehouse_id;

-- ====================================================================
-- SECTION 13: STORED PROCEDURES / FUNCTIONS
-- ====================================================================

CREATE OR REPLACE FUNCTION sp_confirm_rental(p_rental_order_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE rental_orders SET status = 'confirmed'
    WHERE rental_order_id = p_rental_order_id AND status = 'draft';

    UPDATE inventory inv
    SET quantity_reserved = inv.quantity_reserved + roi.quantity
    FROM rental_order_items roi
    WHERE roi.rental_order_id = p_rental_order_id
      AND inv.product_variant_id = roi.product_variant_id
      AND inv.warehouse_id = roi.warehouse_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_return_product(p_rental_order_item_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE returns
    SET return_status = 'completed', completed_at = now()
    WHERE rental_order_item_id = p_rental_order_item_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_calculate_deposit_refund(p_rental_order_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_collected NUMERIC(12,2);
    v_damage_cost NUMERIC(12,2);
    v_refund NUMERIC(12,2);
BEGIN
    SELECT COALESCE(amount_collected,0) INTO v_collected
    FROM deposit_history WHERE rental_order_id = p_rental_order_id;

    SELECT COALESCE(SUM(di.estimated_repair_cost),0) INTO v_damage_cost
    FROM damage_inspections di
    JOIN returns r ON r.return_id = di.return_id
    JOIN rental_order_items roi ON roi.rental_order_item_id = r.rental_order_item_id
    WHERE roi.rental_order_id = p_rental_order_id;

    v_refund := GREATEST(v_collected - v_damage_cost, 0);

    UPDATE deposit_history
    SET amount_refunded = v_refund, amount_forfeited = v_collected - v_refund
    WHERE rental_order_id = p_rental_order_id;

    RETURN v_refund;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_calculate_late_fee(p_rental_order_item_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_scheduled_return TIMESTAMPTZ;
    v_late_days INT;
    v_daily_rate NUMERIC(10,2);
BEGIN
    SELECT scheduled_return_date INTO v_scheduled_return
    FROM rental_order_items WHERE rental_order_item_id = p_rental_order_item_id;

    v_late_days := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (now() - v_scheduled_return)) / 86400.0))::INT;

    SELECT COALESCE(rp.rate_daily, 0) INTO v_daily_rate
    FROM rental_order_items roi
    JOIN rental_pricing rp ON rp.product_variant_id = roi.product_variant_id
    WHERE roi.rental_order_item_id = p_rental_order_item_id
    LIMIT 1;

    RETURN v_late_days * COALESCE(v_daily_rate, 0) * 1.5;
END;
$$ LANGUAGE plpgsql;