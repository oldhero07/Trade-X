# Trade-X Backend API

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Install PostgreSQL or use a cloud service (Neon.tech, Supabase)
   - Create a database named `tradex`
   - Run the SQL commands in `database/schema.sql`
   - Update `.env` file with your database credentials

3. **Environment Variables**
   Copy `.env` and update with your values:
   ```
   DB_HOST=your-db-host
   DB_NAME=tradex
   DB_USER=your-username
   DB_PASSWORD=your-password
   JWT_SECRET=your-secret-key
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/profile` - Update profile (requires auth)

### Portfolio
- `GET /api/portfolio` - Get user portfolio (requires auth)
- `POST /api/portfolio/transaction` - Add transaction (requires auth)
- `GET /api/portfolio/transactions` - Get transaction history (requires auth)

### Market Data
- `GET /api/market/movers` - Get top gainers/losers
- `GET /api/market/sector-flow` - Get sector performance
- `GET /api/market/price/:ticker` - Get current price for ticker
- `GET /api/market/overview` - Get market overview

### Strategy
- `GET /api/strategy` - Get all strategies
- `POST /api/strategy/simulate` - Run portfolio simulation
- `GET /api/strategy/:id` - Get strategy details

## Example Usage

### Register User
```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Add Transaction
```javascript
POST /api/portfolio/transaction
Headers: { "Authorization": "Bearer your-jwt-token" }
{
  "ticker": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "pricePerShare": 195.50
}
```

### Run Simulation
```javascript
POST /api/strategy/simulate
{
  "riskTolerance": 75,
  "timeHorizon": 60,
  "initialInvestment": 10000
}
```