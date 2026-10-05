import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get schemes list
router.get('/', async (req, res) => {
  try {
    const { level, category } = req.query;
    let schemes = await db.find('schemes', s => s.is_active !== false);

    if (level) {
      schemes = schemes.filter(s => s.level === level);
    }
    if (category) {
      schemes = schemes.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }

    res.json({ schemes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes.' });
  }
});

// Check eligibility
router.post('/check-eligibility', authenticateToken, async (req, res) => {
  try {
    const { land_acres = 2.5, state = 'Andhra Pradesh', category = 'General', is_tenant = false } = req.body;
    const schemes = await db.find('schemes', s => s.is_active !== false);

    const evaluated = schemes.map(scheme => {
      let isEligible = true;
      let reason = 'Eligible for application.';

      if (scheme.level === 'STATE' && scheme.state_scope !== state && scheme.state_scope !== 'ALL_INDIA') {
        isEligible = false;
        reason = `Exclusive to residents of ${scheme.state_scope}.`;
      } else if (scheme.scheme_code === 'PM-KISAN' && is_tenant) {
        isEligible = false;
        reason = 'Requires land ownership in revenue records; pure tenant farmers are covered under state Rythu Bharosa CCRC scheme.';
      }

      return {
        ...scheme,
        is_eligible: isEligible,
        eligibility_reason: reason
      };
    });

    res.json({ results: evaluated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate eligibility.' });
  }
});

// Submit Scheme Application (Farmer)
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { scheme_id, applicant_name, aadhaar_last4, bank_account_last4, ifsc, land_passbook_no, acres_applied, documents_uploaded } = req.body;

    if (!scheme_id || !aadhaar_last4 || !bank_account_last4 || !ifsc) {
      return res.status(400).json({ error: 'Scheme, Aadhaar last 4, Bank account last 4, and IFSC are required.' });
    }

    const scheme = await db.findById('schemes', scheme_id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found.' });
    }

    const application_no = `${scheme.scheme_code.replace(/[^A-Z0-9]/gi, '')}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const application = await db.insert('scheme_applications', {
      scheme_id,
      farmer_id: req.user.id,
      application_no,
      applicant_name: applicant_name || req.user.name,
      aadhaar_last4,
      bank_account_last4,
      ifsc,
      land_passbook_no: land_passbook_no || 'N/A',
      acres_applied: parseFloat(acres_applied) || 0,
      documents_uploaded: documents_uploaded || 'Aadhaar_card.pdf, Bank_passbook.pdf',
      status: 'SUBMITTED',
      verified_by: null,
      verification_notes: null,
      submission_date: new Date().toISOString()
    });

    res.status(201).json({
      message: `Application submitted successfully. Your tracking number is ${application_no}.`,
      application
    });
  } catch (error) {
    console.error('Apply scheme error:', error);
    res.status(500).json({ error: 'Failed to submit scheme application.' });
  }
});

// Get applications list
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    let apps = await db.find('scheme_applications');

    if (req.user.role === 'FARMER') {
      apps = apps.filter(a => a.farmer_id === req.user.id);
    }

    const schemes = await db.find('schemes');
    const users = await db.find('users');

    const enriched = apps.map(app => {
      const sch = schemes.find(s => s.id === app.scheme_id);
      const farmer = users.find(u => u.id === app.farmer_id);
      const verifier = app.verified_by ? users.find(u => u.id === app.verified_by) : null;
      return {
        ...app,
        scheme_name_en: sch ? sch.name_en : 'Scheme',
        scheme_name_te: sch ? sch.name_te : 'పథకం',
        scheme_name_hi: sch ? sch.name_hi : 'योजना',
        department: sch ? sch.department : '',
        max_benefit_inr: sch ? sch.max_benefit_inr : 0,
        farmer_phone: farmer ? farmer.phone : '',
        farmer_village: farmer ? farmer.village : '',
        verified_by_name: verifier ? verifier.name : null
      };
    });

    enriched.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

    res.json({ applications: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// Verify / Review Application (Service Center Staff or Admin)
router.put('/applications/:id/verify', authenticateToken, requireRole('SERVICE_CENTER_STAFF', 'ADMIN'), async (req, res) => {
  try {
    const { status, verification_notes } = req.body;

    if (!['VERIFIED_BY_CENTER', 'REJECTED', 'SANCTIONED', 'DISBURSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status.' });
    }

    const app = await db.findById('scheme_applications', req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const updated = await db.update('scheme_applications', req.params.id, {
      status,
      verification_notes: verification_notes || 'Verified against revenue land records and e-KYC status.',
      verified_by: req.user.id
    });

    res.json({
      message: `Application marked as ${status} successfully.`,
      application: updated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify application.' });
  }
});

export default router;
