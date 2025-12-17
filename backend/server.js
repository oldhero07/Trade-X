const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize price cache service
const priceCache = require('./services/priceCache');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Trade-X Backend is running!' });
});

// Import route modules (we'll create these)
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const marketRoutes = require('./routes/market');
const strategyRoutes = require('./routes/strategy');
const watchlistRoutes = require('./routes/watchlist');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start price cache service after server is running
  setTimeout(async () => {
    try {
      await priceCache.start();
    } catch (error) {
      console.error('Failed to start price cache:', error);
    }
  }, 2000); // Wait 2 seconds for database connection to be ready
});