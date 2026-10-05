import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all farms for current user (or all if admin/staff)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const isStaffOrAdmin = ['SERVICE_CENTER_STAFF', 'AGRI_EXPERT', 'ADMIN'].includes(req.user.role);
    const filterFarmerId = req.query.farmer_id;

    let farms;
    if (isStaffOrAdmin && !filterFarmerId) {
      farms = await db.find('farms');
    } else {
      const targetUserId = filterFarmerId || req.user.id;
      farms = await db.find('farms', f => f.user_id === targetUserId);
    }

    // Attach crops count and crops list
    const allCrops = await db.find('crops');
    const enriched = farms.map(farm => {
      const farmCrops = allCrops.filter(c => c.farm_id === farm.id);
      return {
        ...farm,
        crops: farmCrops,
        crops_count: farmCrops.length
      };
    });

    res.json({ farms: enriched });
  } catch (error) {
    console.error('Fetch farms error:', error);
    res.status(500).json({ error: 'Failed to fetch farms.' });
  }
});

// Create new farm plot
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { farm_name, survey_no, area_acres, soil_type, irrigation_type, village, district, state } = req.body;

    if (!farm_name || !area_acres) {
      return res.status(400).json({ error: 'Farm name and area in acres are required.' });
    }

    const newFarm = await db.insert('farms', {
      user_id: req.user.id,
      farm_name,
      survey_no: survey_no || 'N/A',
      area_acres: parseFloat(area_acres),
      soil_type: soil_type || 'Red Loam Soil',
      irrigation_type: irrigation_type || 'Borewell',
      village: village || req.user.village || 'Tenali',
      district: district || req.user.district || 'Guntur',
      state: state || 'Andhra Pradesh'
    });

    res.status(201).json({ message: 'Farm plot registered successfully', farm: newFarm });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Failed to create farm.' });
  }
});

// Update farm
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const farm = await db.findById('farms', req.params.id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found.' });
    }

    if (farm.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to modify this farm.' });
    }

    const updated = await db.update('farms', req.params.id, req.body);
    res.json({ message: 'Farm updated', farm: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update farm.' });
  }
});

// Delete farm
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const farm = await db.findById('farms', req.params.id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found.' });
    }

    if (farm.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this farm.' });
    }

    // Cascade delete crops
    const crops = await db.find('crops', c => c.farm_id === req.params.id);
    for (const crop of crops) {
      await db.delete('crops', crop.id);
    }

    await db.delete('farms', req.params.id);
    res.json({ message: 'Farm and associated crops deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farm.' });
  }
});

// Add crop to farm
router.post('/:farmId/crops', authenticateToken, async (req, res) => {
  try {
    const farm = await db.findById('farms', req.params.farmId);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found.' });
    }

    if (farm.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to add crop to this farm.' });
    }

    const { crop_name, variety, season = 'Kharif', sowing_date, expected_harvest_date, stage = 'Sowing', area_acres } = req.body;

    if (!crop_name || !sowing_date) {
      return res.status(400).json({ error: 'Crop name and sowing date are required.' });
    }

    const newCrop = await db.insert('crops', {
      farm_id: farm.id,
      crop_name,
      variety: variety || 'Standard High Yield',
      season,
      sowing_date,
      expected_harvest_date: expected_harvest_date || null,
      stage,
      health_status: 'Healthy',
      area_acres: area_acres ? parseFloat(area_acres) : farm.area_acres
    });

    res.status(201).json({ message: 'Crop registered successfully', crop: newCrop });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ error: 'Failed to create crop.' });
  }
});

// Update crop
router.put('/crops/:cropId', authenticateToken, async (req, res) => {
  try {
    const crop = await db.findById('crops', req.params.cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found.' });
    }

    const updated = await db.update('crops', req.params.cropId, req.body);
    res.json({ message: 'Crop status updated', crop: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update crop.' });
  }
});

// Delete crop
router.delete('/crops/:cropId', authenticateToken, async (req, res) => {
  try {
    const crop = await db.findById('crops', req.params.cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found.' });
    }

    await db.delete('crops', req.params.cropId);
    res.json({ message: 'Crop removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove crop.' });
  }
});

export default router;
