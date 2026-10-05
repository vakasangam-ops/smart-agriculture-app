import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get Admin platform analytics & statistics
router.get('/stats', authenticateToken, requireRole('ADMIN', 'SERVICE_CENTER_STAFF', 'AGRI_EXPERT'), async (req, res) => {
  try {
    const users = await db.find('users');
    const farms = await db.find('farms');
    const crops = await db.find('crops');
    const issues = await db.find('crop_issues');
    const bookings = await db.find('service_bookings');
    const schemes = await db.find('schemes');
    const applications = await db.find('scheme_applications');
    const soilTests = await db.find('soil_health_records');

    const totalAcreage = farms.reduce((sum, f) => sum + (parseFloat(f.area_acres) || 0), 0);
    const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;
    const openIssues = issues.filter(i => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;

    const stats = {
      total_farmers: users.filter(u => u.role === 'FARMER').length,
      total_experts: users.filter(u => u.role === 'AGRI_EXPERT').length,
      total_service_staff: users.filter(u => u.role === 'SERVICE_CENTER_STAFF').length,
      total_farms: farms.length,
      total_acreage: Math.round(totalAcreage * 100) / 100,
      active_crops_count: crops.length,
      crop_issues: {
        total: issues.length,
        open: openIssues,
        resolved: resolvedIssues,
        resolution_rate_pct: issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 100
      },
      service_bookings: {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length
      },
      schemes: {
        total_active: schemes.filter(s => s.is_active).length,
        total_applications: applications.length,
        verified_by_center: applications.filter(a => a.status === 'VERIFIED_BY_CENTER' || a.status === 'SANCTIONED').length
      },
      soil_tests_conducted: soilTests.length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to generate administrative analytics.' });
  }
});

// List users (Admin)
router.get('/users', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = req.query;
    let users = await db.find('users');

    if (role) {
      users = users.filter(u => u.role === role);
    }

    const safeUsers = users.map(({ password_hash, ...u }) => u);
    res.json({ users: safeUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// Update user role (Admin)
router.put('/users/:id/role', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['FARMER', 'SERVICE_CENTER_STAFF', 'AGRI_EXPERT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid user role.' });
    }

    const updated = await db.update('users', req.params.id, { role });
    const { password_hash, ...safe } = updated;
    res.json({ message: 'User role updated', user: safe });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// Broadcast Advisory Alert (Expert or Admin)
router.post('/alerts', authenticateToken, requireRole('AGRI_EXPERT', 'ADMIN'), async (req, res) => {
  try {
    const { title, message, severity = 'WARNING', district, state, active_until } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Alert title and message are required.' });
    }

    const newAlert = await db.insert('advisory_alerts', {
      title,
      message,
      severity: ['INFO', 'WARNING', 'CRITICAL_PEST', 'WEATHER_ALERT'].includes(severity) ? severity : 'WARNING',
      district: district || req.user.district || 'Guntur',
      state: state || req.user.state || 'Andhra Pradesh',
      broadcast_by_name: req.user.name,
      active_until: active_until || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });

    res.status(201).json({ message: 'Advisory alert broadcasted to farmers successfully.', alert: newAlert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast alert.' });
  }
});

// Get active alerts (Public / Farmers)
router.get('/alerts', async (req, res) => {
  try {
    const { district } = req.query;
    let alerts = await db.find('advisory_alerts');

    if (district) {
      alerts = alerts.filter(a => !a.district || a.district.toLowerCase() === district.toLowerCase());
    }

    alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch advisory alerts.' });
  }
});

// Dismiss / Delete alert (Admin or Author)
router.delete('/alerts/:id', authenticateToken, requireRole('AGRI_EXPERT', 'ADMIN'), async (req, res) => {
  try {
    await db.delete('advisory_alerts', req.params.id);
    res.json({ message: 'Alert removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert.' });
  }
});

export default router;
