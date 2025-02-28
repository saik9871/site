// import { fs } from 'fs'
// import { path } from 'path'
// import { sql } from '@/lib/db'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = "postgresql://weenstocks_owner:npg_7zRe1wTSZbDl@ep-square-thunder-a5226a70-pooler.us-east-2.aws.neon.tech/weenstocks?sslmode=require"

async function initDatabase() {
  try {
    const sql = neon(DATABASE_URL)
    
    // Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        balance DECIMAL(10,2) DEFAULT 500.00,
        role VARCHAR(50) DEFAULT 'user'
      )
    `

    // Create Stocks table
    await sql`
      CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL UNIQUE,
        current_price DECIMAL(10,2) NOT NULL,
        total_supply INTEGER NOT NULL,
        available_supply INTEGER NOT NULL
      )
    `

    // Create UserStocks table
    await sql`
      CREATE TABLE IF NOT EXISTS user_stocks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        stock_id INTEGER REFERENCES stocks(id),
        quantity INTEGER NOT NULL,
        purchase_price DECIMAL(10,2) NOT NULL,
        UNIQUE(user_id, stock_id)
      )
    `

    // Create Predictions table
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        options JSONB NOT NULL,
        end_time TIMESTAMP NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        winning_option VARCHAR(255)
      )
    `

    // Create Bets table
    await sql`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        prediction_id INTEGER REFERENCES predictions(id),
        amount DECIMAL(10,2) NOT NULL,
        chosen_option VARCHAR(255) NOT NULL
      )
    `

    // Inside initDatabase function, add this command:
    await sql`
      ALTER TABLE predictions 
      ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS winning_option VARCHAR(255)
    `

    // Add Portfolio History table
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_value DECIMAL(10,2) NOT NULL,
        cash_balance DECIMAL(10,2) NOT NULL,
        stock_value DECIMAL(10,2) NOT NULL,
        daily_profit_loss DECIMAL(10,2),
        total_profit_loss DECIMAL(10,2),
        CONSTRAINT fk_user
          FOREIGN KEY(user_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_portfolio_history_user_timestamp 
      ON portfolio_history(user_id, timestamp)
    `

    // Add price history table
    await sql`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER REFERENCES stocks(id),
        price DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        volume INTEGER DEFAULT 0,
        high_price DECIMAL(10,2),
        low_price DECIMAL(10,2),
        CONSTRAINT fk_stock
          FOREIGN KEY(stock_id) 
          REFERENCES stocks(id)
          ON DELETE CASCADE
      )
    `

    // Add index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_price_history_stock_timestamp 
      ON price_history(stock_id, timestamp)
    `

    // Recreate stock_interactions table
    await sql`DROP TABLE IF EXISTS stock_interactions`

    await sql`
      CREATE TABLE stock_interactions (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER REFERENCES stocks(id),
        views INTEGER DEFAULT 0,
        buy_orders INTEGER DEFAULT 0,
        sell_orders INTEGER DEFAULT 0,
        last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_stock_id UNIQUE (stock_id)
      )
    `

    console.log('Database initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

initDatabase()
