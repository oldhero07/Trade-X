-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE tradex;

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(500),
    subscription_tier VARCHAR(50) DEFAULT 'Free',
    currency_preference VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table for portfolio tracking
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity DECIMAL(15, 6) NOT NULL,
    price_per_share DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    watchlist_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS watchlist_items (
    watchlist_id INTEGER REFERENCES watchlists(watchlist_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (watchlist_id, ticker)
);

-- Strategies table for strategy builder
CREATE TABLE IF NOT EXISTS strategies (
    strategy_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    asset_allocation JSONB NOT NULL,
    description TEXT,
    expected_return DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data cache (to avoid hitting external APIs too frequently)
CREATE TABLE IF NOT EXISTS market_data_cache (
    ticker VARCHAR(10) PRIMARY KEY,
    current_price DECIMAL(15, 2),
    change_percent DECIMAL(5, 2),
    volume BIGINT,
    market_cap BIGINT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample strategies
INSERT INTO strategies (name, category, risk_level, asset_allocation, description, expected_return) VALUES
('Tech Momentum Titans', 'Growth', 'High', '{"stocks": 80, "crypto": 20}', 'Capture the AI & Semiconductor wave with high-growth tech stocks', 15.5),
('Balanced Growth', 'Balanced', 'Medium', '{"stocks": 60, "bonds": 30, "crypto": 10}', 'Steady growth with moderate risk through diversified portfolio', 8.2),
('Conservative Income', 'Income', 'Low', '{"bonds": 70, "stocks": 25, "cash": 5}', 'Focus on dividend income and capital preservation', 5.8),
('Crypto Pioneer', 'Growth', 'Very High', '{"crypto": 70, "stocks": 30}', 'High-risk, high-reward cryptocurrency focused strategy', 25.0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_market_data_ticker ON market_data_cache(ticker);