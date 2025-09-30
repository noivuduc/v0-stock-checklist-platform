-- Sample data for development and testing

-- Insert sample data sources
INSERT INTO data_sources (provider_name, api_endpoint, status, rate_limit) VALUES
('Financial Datasets API', 'https://api.financialdatasets.ai', 'active', 1000),
('Alpha Vantage', 'https://www.alphavantage.co/query', 'active', 500),
('Finnhub', 'https://finnhub.io/api/v1', 'active', 300);

-- Insert sample users
INSERT INTO users (email, first_name, last_name, subscription_tier) VALUES
('demo@example.com', 'Demo', 'User', 'free'),
('premium@example.com', 'Premium', 'User', 'premium'),
('admin@example.com', 'Admin', 'User', 'enterprise');

-- Insert sample stock data
INSERT INTO stock_data (symbol, pe_ratio, market_cap, volume, price, dividend_yield, sector) VALUES
('AAPL', 28.5, 3000000000000, 50000000, 175.50, 0.5, 'Technology'),
('MSFT', 32.1, 2800000000000, 30000000, 380.25, 0.7, 'Technology'),
('GOOGL', 25.8, 1700000000000, 25000000, 135.75, 0.0, 'Technology'),
('TSLA', 65.2, 800000000000, 80000000, 250.00, 0.0, 'Automotive'),
('JPM', 12.5, 450000000000, 15000000, 155.80, 2.8, 'Financial'),
('JNJ', 15.8, 420000000000, 8000000, 162.30, 2.9, 'Healthcare');

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, plan_name, status, start_date, monthly_fee) VALUES
(1, 'Free Plan', 'active', CURRENT_DATE, 0.00),
(2, 'Premium Plan', 'active', CURRENT_DATE, 29.99),
(3, 'Enterprise Plan', 'active', CURRENT_DATE, 99.99);

-- Insert sample checklists
INSERT INTO checklists (user_id, name, description) VALUES
(1, 'Value Investing Checklist', 'Focus on undervalued stocks with strong fundamentals'),
(2, 'Growth Stock Screener', 'High-growth companies with strong momentum'),
(2, 'Dividend Aristocrats', 'Stable dividend-paying companies');

-- Insert sample checklist items
INSERT INTO checklist_items (checklist_id, left_operand, operator, right_operand, sort_order) VALUES
-- Value investing criteria
(1, 'pe_ratio', '<', '20', 1),
(1, 'market_cap', '>', '1000000000', 2),
(1, 'dividend_yield', '>', '1.0', 3),

-- Growth stock criteria  
(2, 'pe_ratio', '<', '40', 1),
(2, 'market_cap', '>', '5000000000', 2),
(2, 'volume', '>', '1000000', 3),

-- Dividend aristocrats criteria
(3, 'dividend_yield', '>', '2.0', 1),
(3, 'pe_ratio', '<', '25', 2),
(3, 'market_cap', '>', '10000000000', 3);
