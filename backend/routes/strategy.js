const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all strategies
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM strategies';
    let params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY expected_return DESC';

    const strategies = await pool.query(query, params);
    res.json(strategies.rows);
  } catch (error) {
    console.error('Strategies fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run portfolio simulation
router.post('/simulate', async (req, res) => {
  try {
    const { riskTolerance, timeHorizon, initialInvestment = 10000 } = req.body;

    // Simple Monte Carlo simulation
    const scenarios = generateMonteCarloScenarios(riskTolerance, timeHorizon, initialInvestment);

    res.json({
      scenarios,
      summary: {
        expectedReturn: scenarios.expected,
        bestCase: scenarios.upper,
        worstCase: scenarios.lower,
        timeHorizon,
        riskTolerance
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get strategy details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await pool.query(
      'SELECT * FROM strategies WHERE strategy_id = $1',
      [id]
    );

    if (strategy.rows.length === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    res.json(strategy.rows[0]);
  } catch (error) {
    console.error('Strategy fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function for Monte Carlo simulation
function generateMonteCarloScenarios(riskTolerance, timeHorizon, initialInvestment) {
  const years = timeHorizon / 12; // Convert months to years
  const baseReturn = 0.07; // 7% base return
  const volatility = riskTolerance / 100 * 0.3; // Higher risk = higher volatility

  // Generate multiple scenarios
  const numScenarios = 1000;
  const results = [];

  for (let i = 0; i < numScenarios; i++) {
    let value = initialInvestment;
    
    for (let year = 0; year < years; year++) {
      // Random return based on normal distribution
      const randomReturn = baseReturn + (Math.random() - 0.5) * volatility * 2;
      value *= (1 + randomReturn);
    }
    
    results.push(value);
  }

  // Sort results to find percentiles
  results.sort((a, b) => a - b);

  return {
    lower: Math.round(results[Math.floor(numScenarios * 0.1)]), // 10th percentile
    expected: Math.round(results[Math.floor(numScenarios * 0.5)]), // 50th percentile (median)
    upper: Math.round(results[Math.floor(numScenarios * 0.9)]), // 90th percentile
    scenarios: results.slice(0, 100) // Return first 100 for charting
  };
}

module.exports = router;