-- Stock Checklist Platform Database Schema
-- Based on the provided database design diagram

-- Users table - stores user profiles and subscription information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT true
);

-- Data sources table - manages different financial data providers
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rate_limit INTEGER DEFAULT 1000,
    api_key_hash VARCHAR(255)
);

-- Stock data table - normalized stock information from various providers
CREATE TABLE IF NOT EXISTS stock_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pe_ratio DECIMAL(10,2),
    market_cap BIGINT,
    volume INTEGER,
    price DECIMAL(10,2),
    dividend_yield DECIMAL(5,2),
    sector VARCHAR(100),
    INDEX idx_symbol (symbol),
    INDEX idx_date_updated (date_updated)
);

-- Subscriptions table - manages user subscription details
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklists table - user-created trading checklists
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- Checklist items table - individual criteria within checklists
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
    left_operand VARCHAR(100) NOT NULL, -- e.g., 'pe_ratio', 'market_cap'
    operator VARCHAR(10) NOT NULL CHECK (operator IN ('<', '>', '<=', '>=', '=', '!=')),
    right_operand VARCHAR(100) NOT NULL, -- e.g., '15', '1000000000'
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist results table - evaluation history and results
CREATE TABLE IF NOT EXISTS checklist_results (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    passed_checks INTEGER DEFAULT 0,
    total_checks INTEGER DEFAULT 0,
    result_date DATE DEFAULT CURRENT_DATE,
    score_percentage DECIMAL(5,2),
    details TEXT, -- JSON string with detailed results
    INDEX idx_checklist_symbol (checklist_id, symbol),
    INDEX idx_result_date (result_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_checklists_user ON checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
