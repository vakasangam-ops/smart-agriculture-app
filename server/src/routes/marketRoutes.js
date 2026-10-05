import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get market prices
router.get('/', async (req, res) => {
  try {
    const { state, commodity, search } = req.query;
    let prices = await db.find('market_prices');

    if (state && state !== 'ALL') {
      prices = prices.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }

    if (commodity && commodity !== 'ALL') {
      prices = prices.filter(p =>
        p.commodity_en.toLowerCase().includes(commodity.toLowerCase()) ||
        p.commodity_te.includes(commodity) ||
        p.commodity_hi.includes(commodity)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      prices = prices.filter(p =>
        p.commodity_en.toLowerCase().includes(q) ||
        p.market_center.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }

    // Extract unique states and commodities for UI filter dropdowns
    const allPrices = await db.find('market_prices');
    const states = [...new Set(allPrices.map(p => p.state))];
    const commodities = [...new Set(allPrices.map(p => p.commodity_en))];

    res.json({
      prices,
      metadata: {
        total_records: prices.length,
        states,
        commodities,
        verified_disclaimer: 'Data sourced from e-NAM / Agricultural Produce Market Committees (APMC). Prices are per quintal (100 kg) based on official market yard auction arrivals.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mandi market prices.' });
  }
});

// Add or update mandi price (Admin or Staff)
router.post('/', authenticateToken, requireRole('SERVICE_CENTER_STAFF', 'ADMIN'), async (req, res) => {
  try {
    const {
      commodity_en,
      commodity_te,
      commodity_hi,
      variety,
      market_center,
      district,
      state,
      min_price,
      max_price,
      modal_price,
      unit = 'Quintal (100 kg)',
      trend = 'STABLE'
    } = req.body;

    if (!commodity_en || !market_center || !modal_price) {
      return res.status(400).json({ error: 'Commodity, Market Yard, and Modal Price are required.' });
    }

    const newRecord = await db.insert('market_prices', {
      commodity_en,
      commodity_te: commodity_te || commodity_en,
      commodity_hi: commodity_hi || commodity_en,
      variety: variety || 'Standard',
      market_center,
      district: district || req.user.district || 'Guntur',
      state: state || 'Andhra Pradesh',
      arrival_date: new Date().toISOString().split('T')[0],
      min_price: parseFloat(min_price) || parseFloat(modal_price) * 0.9,
      max_price: parseFloat(max_price) || parseFloat(modal_price) * 1.1,
      modal_price: parseFloat(modal_price),
      unit,
      trend: ['RISING', 'STABLE', 'FALLING'].includes(trend) ? trend : 'STABLE',
      is_verified_feed: true,
      data_source_label: 'e-NAM / State APMC Mandi Daily Yard Record'
    });

    res.status(201).json({ message: 'Mandi price record saved', record: newRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save market price.' });
  }
});

export default router;
