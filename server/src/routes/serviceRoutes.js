import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let services = await db.find('services');
    if (category) {
      services = services.filter(s => s.category === category);
    }
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// Create new service (Staff or Admin)
router.post('/', authenticateToken, requireRole('SERVICE_CENTER_STAFF', 'ADMIN'), async (req, res) => {
  try {
    const { code, name, category, description, unit, rate_inr, subsidy_applicable = false, subsidy_pct = 0, center_name, contact_phone } = req.body;

    if (!code || !name || !category || !unit || rate_inr === undefined) {
      return res.status(400).json({ error: 'Code, name, category, unit, and rate are required.' });
    }

    const newService = await db.insert('services', {
      code,
      name,
      category,
      description: description || '',
      unit,
      rate_inr: parseFloat(rate_inr),
      subsidy_applicable: Boolean(subsidy_applicable),
      subsidy_pct: parseFloat(subsidy_pct) || 0,
      availability_status: 'AVAILABLE',
      center_name: center_name || 'Village Rythu Bharosa Kendram',
      village: req.user.village || 'Tenali',
      contact_phone: contact_phone || req.user.phone
    });

    res.status(201).json({ message: 'Service added successfully', service: newService });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service.' });
  }
});

// Book a service (Farmer)
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { service_id, booking_date, time_slot, quantity = 1, farmer_notes } = req.body;

    if (!service_id || !booking_date || !time_slot) {
      return res.status(400).json({ error: 'Service ID, booking date, and time slot are required.' });
    }

    const service = await db.findById('services', service_id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const qty = parseFloat(quantity) || 1;
    let baseAmount = service.rate_inr * qty;
    if (service.subsidy_applicable && service.subsidy_pct > 0) {
      baseAmount = baseAmount * (1 - (service.subsidy_pct / 100));
    }

    const booking = await db.insert('service_bookings', {
      service_id,
      farmer_id: req.user.id,
      booking_date,
      time_slot,
      quantity: qty,
      total_amount_inr: Math.round(baseAmount * 100) / 100,
      status: 'PENDING',
      farmer_notes: farmer_notes || '',
      staff_notes: '',
      assigned_staff_id: null
    });

    res.status(201).json({ message: 'Service booked successfully. Service center will confirm slot.', booking });
  } catch (error) {
    console.error('Book service error:', error);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// Get bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    let bookings = await db.find('service_bookings');

    if (req.user.role === 'FARMER') {
      bookings = bookings.filter(b => b.farmer_id === req.user.id);
    }

    const services = await db.find('services');
    const users = await db.find('users');

    const enriched = bookings.map(b => {
      const srv = services.find(s => s.id === b.service_id);
      const farmer = users.find(u => u.id === b.farmer_id);
      const staff = b.assigned_staff_id ? users.find(u => u.id === b.assigned_staff_id) : null;
      return {
        ...b,
        service_name: srv ? srv.name : 'Unknown Service',
        service_category: srv ? srv.category : '',
        center_name: srv ? srv.center_name : '',
        farmer_name: farmer ? farmer.name : 'Farmer',
        farmer_phone: farmer ? farmer.phone : '',
        farmer_village: farmer ? farmer.village : '',
        staff_name: staff ? staff.name : null
      };
    });

    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ bookings: enriched });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Update booking status (Staff or Admin)
router.put('/bookings/:id/status', authenticateToken, requireRole('SERVICE_CENTER_STAFF', 'ADMIN'), async (req, res) => {
  try {
    const { status, staff_notes } = req.body;
    if (!['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await db.findById('service_bookings', req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const updated = await db.update('service_bookings', req.params.id, {
      status,
      staff_notes: staff_notes !== undefined ? staff_notes : booking.staff_notes,
      assigned_staff_id: req.user.id
    });

    res.json({ message: 'Booking status updated successfully', booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

// Soil health records list
router.get('/soil-health', authenticateToken, async (req, res) => {
  try {
    let records = await db.find('soil_health_records');
    if (req.user.role === 'FARMER') {
      records = records.filter(r => r.farmer_id === req.user.id);
    }

    const farms = await db.find('farms');
    const users = await db.find('users');

    const enriched = records.map(r => {
      const farm = farms.find(f => f.id === r.farm_id);
      const farmer = users.find(u => u.id === r.farmer_id);
      const tester = users.find(u => u.id === r.tested_by);
      return {
        ...r,
        farm_name: farm ? farm.farm_name : 'Unknown Farm',
        farmer_name: farmer ? farmer.name : 'Unknown Farmer',
        tested_by_name: tester ? tester.name : 'KVK Soil Scientist'
      };
    });

    res.json({ records: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch soil health records.' });
  }
});

// Record new soil test (Staff or Expert)
router.post('/soil-health', authenticateToken, requireRole('SERVICE_CENTER_STAFF', 'AGRI_EXPERT', 'ADMIN'), async (req, res) => {
  try {
    const {
      farmer_id,
      farm_id,
      sample_date,
      ph_level,
      organic_carbon_pct,
      nitrogen_kg_ha,
      phosphorus_kg_ha,
      potassium_kg_ha,
      zinc_ppm,
      iron_ppm,
      electrical_conductivity,
      recommendations,
      fertilizer_plan,
      lab_name
    } = req.body;

    if (!farmer_id || !farm_id || !sample_date) {
      return res.status(400).json({ error: 'Farmer, Farm, and Sample date are required.' });
    }

    const newRecord = await db.insert('soil_health_records', {
      farmer_id,
      farm_id,
      sample_date,
      ph_level: parseFloat(ph_level) || 7.0,
      organic_carbon_pct: parseFloat(organic_carbon_pct) || 0.5,
      nitrogen_kg_ha: parseFloat(nitrogen_kg_ha) || 200,
      phosphorus_kg_ha: parseFloat(phosphorus_kg_ha) || 30,
      potassium_kg_ha: parseFloat(potassium_kg_ha) || 250,
      zinc_ppm: parseFloat(zinc_ppm) || 0.5,
      iron_ppm: parseFloat(iron_ppm) || 4.5,
      electrical_conductivity: parseFloat(electrical_conductivity) || 0.3,
      recommendations: recommendations || 'Apply recommended organic compost and balanced NPK fertilizer.',
      fertilizer_plan: fertilizer_plan || 'Standard dosage as per Soil Health Card guidelines.',
      tested_by: req.user.id,
      lab_name: lab_name || 'Village Rythu Bharosa Kendram Soil Test Unit'
    });

    res.status(201).json({ message: 'Soil health record added successfully.', record: newRecord });
  } catch (error) {
    console.error('Soil record error:', error);
    res.status(500).json({ error: 'Failed to create soil test record.' });
  }
});

export default router;
