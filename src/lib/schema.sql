-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 500.00,
    role VARCHAR(50) DEFAULT 'user'
);

-- Stocks table
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    current_price DECIMAL(10,2) NOT NULL,
    total_supply INTEGER NOT NULL,
    available_supply INTEGER NOT NULL
);

-- UserStocks table
CREATE TABLE user_stocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    stock_id INTEGER REFERENCES stocks(id),
    quantity INTEGER NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    UNIQUE(user_id, stock_id)
);

-- Predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    end_time TIMESTAMP NOT NULL
);

-- Bets table
CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    prediction_id INTEGER REFERENCES predictions(id),
    amount DECIMAL(10,2) NOT NULL,
    chosen_option VARCHAR(255) NOT NULL
);
