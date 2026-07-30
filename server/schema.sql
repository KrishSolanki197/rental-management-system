
create TABLE roles (
    role_id serial primary key,
    role_name VARCHAR(20) not null unique
)

insert into roles (role_name) values 
    ('Admin'),
    ('User'),
    ('Manager'),
    ('Vendor');

create type providers as enum(
    'local', 'google'
) 

create type u_status as enum (
    'active', 'inactive', 'suspend'
)

create table users(
    userId bigserial primary key,
    username varchar(100) unique not null,
    email varchar(100) unique not null,
    password_hash TEXT not null,
    phone_no varchar(20),
    provider providers not null default 'local',
    provider_user_id varchar(100) default null,
    user_status u_status default 'active',
    email_verified boolean not null default FALSE,
    last_login_at timestamp, 
    failed_login_attemp smallint default 0,
    created_at timestamp default now(),
    updated_at timestamp default now()
)

create type otp_purpose as enum (
    'login', 'reset password', 'email verify'
)

create table user_otp (
    otp_id bigserial primary key,
    userId bigint references users(userId) not null,
    otp_code char(6) not null,
    purpose otp_purpose not null, 
    expireAt timestamp not null,
    used_at timestamp,
    created_at timestamp default now()
)   

create type genders as enum (
    'male', 'female', 'others', 'Not Specified Yet'
)

create table user_roles (
    userId bigint references users(userId) on delete cascade,    
    roleId int references roles(role_id) on delete cascade,
    primary key(userId, roleId)
)

create table profiles (
    profile_id bigserial primary key,
    userId bigint unique references users(userId),
    firstName varchar(50) not null,
    lastname varchar(50) not null,
    date_of_birth date,
    gender genders default 'Not Specified Yet',
    profile_image_url TEXT default null,
    bio varchar(150),
    created_at timestamp default now(),
    updated_at timestamp default now()
)


create table customers (
    customerId bigserial primary key not null,
    userId bigint unique references users(userId) on delete cascade,
    created_at timestamp default now(),
    updated_at timestamp default now()
)

create table addresses (
    address_id bigserial primary key,
    customerId bigint not null references customers(customerId) on delete cascade,
    city varchar(100) not null,
    street_name varchar(100) not null,
    landmark varchar(100) not null,
    postal_code varchar(10) not null,
    state varchar(50) not null,
    country varchar(100) not null,
    active_address boolean not null default FALSE,
    created_at timestamp default now(),
    updated_at timestamp default now()
)

CREATE INDEX idx_profiles_user
ON profiles(userId);

CREATE INDEX idx_customers_user
ON customers(userId);

CREATE INDEX idx_addresses_customer
ON addresses(customerId);

