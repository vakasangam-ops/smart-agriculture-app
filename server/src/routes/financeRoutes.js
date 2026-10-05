import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get finances for farmer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { farm_id, crop_id } = req.query;
    let records = await db.find('farm_finances');

    // Farmers only see their own finances
    if (req.user.role === 'FARMER') {
      records = records.filter(r => r.farmer_id === req.user.id);
    }

    if (farm_id) {
      records = records.filter(r => r.farm_id === farm_id);
    }
    if (crop_id) {
      records = records.filter(r => r.crop_id === crop_id);
    }

    // Attach farm and crop names
    const farms = await db.find('farms');
    const crops = await db.find('crops');

    const enriched = records.map(r => {
      const f = farms.find(farm => farm.id === r.farm_id);
      const c = crops.find(crop => crop.id === r.crop_id);
      return {
        ...r,
        farm_name: f ? f.farm_name : 'General Farm',
        crop_name: c ? c.crop_name : 'General Crop'
      };
    });

    enriched.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    // Calculate Summary
    const totalExpenses = enriched
      .filter(r => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + parseFloat(r.amount_inr || 0), 0);

    const totalIncome = enriched
      .filter(r => r.type === 'INCOME')
      .reduce((sum, r) => sum + parseFloat(r.amount_inr || 0), 0);

    const netProfit = totalIncome - totalExpenses;

    // Expenses breakdown by category
    const categoryBreakdown = {};
    enriched
      .filter(r => r.type === 'EXPENSE')
      .forEach(r => {
        categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + parseFloat(r.amount_inr || 0);
      });

    res.json({
      records: enriched,
      summary: {
        total_expenses: Math.round(totalExpenses * 100) / 100,
        total_income: Math.round(totalIncome * 100) / 100,
        net_profit: Math.round(netProfit * 100) / 100,
        category_breakdown: categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial records.' });
  }
});

// Add financial transaction (Expense or Income)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { farm_id, crop_id, type = 'EXPENSE', category, amount_inr, description, transaction_date } = req.body;

    if (!farm_id || !category || !amount_inr) {
      return res.status(400).json({ error: 'Farm, category, and amount are required.' });
    }

    const newRecord = await db.insert('farm_finances', {
      farm_id,
      crop_id: crop_id || null,
      farmer_id: req.user.id,
      type: ['EXPENSE', 'INCOME'].includes(type) ? type : 'EXPENSE',
      category,
      amount_inr: parseFloat(amount_inr),
      description: description || '',
      transaction_date: transaction_date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ message: 'Transaction logged successfully', record: newRecord });
  } catch (error) {
    console.error('Log finance error:', error);
    res.status(500).json({ error: 'Failed to log financial entry.' });
  }
});

// Delete financial record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.findById('farm_finances', req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    if (record.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this record.' });
    }

    await db.delete('farm_finances', req.params.id);
    res.json({ message: 'Record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

export default router;
