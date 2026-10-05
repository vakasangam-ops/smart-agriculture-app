import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Preliminary Agronomic AI/Rule-based screening logic with clear non-guarantee disclaimer
function generatePreliminaryAdvisory(text = '', symptoms = '') {
  const combined = (text + ' ' + symptoms).toLowerCase();

  let preliminaryDiagnosis = 'Undetermined crop disorder. Field inspection recommended.';
  let advisoryNote = 'Symptoms require direct examination of leaf underside and soil roots by KVK scientist.';

  if (combined.includes('curl') || combined.includes('boat') || combined.includes('puckering') || combined.includes('thrip')) {
    preliminaryDiagnosis = 'Likely Thrips vector or Chilli Leaf Curl Begomovirus complex.';
    advisoryNote = 'Symptom pattern matches upward leaf margin curling and vector feeding. Check for minute yellow/brown thrips on undersides.';
  } else if (combined.includes('blast') || combined.includes('spindle') || combined.includes('brown spot') || combined.includes('lesion')) {
    preliminaryDiagnosis = 'Likely Rice Blast (Magnaporthe oryzae) or Brown Spot fungal disease.';
    advisoryNote = 'Spindle-shaped lesions indicate airborne fungal spore germination favored by humid conditions.';
  } else if (combined.includes('bollworm') || combined.includes('caterpillar') || combined.includes('bore') || combined.includes('hole')) {
    preliminaryDiagnosis = 'Likely Lepidopteran borer (e.g., Pink Bollworm or Fall Armyworm).';
    advisoryNote = 'Bore holes and larval frass observed. Pheromone trap scouting recommended.';
  } else if (combined.includes('yellow') || combined.includes('chlorosis') || combined.includes('pale')) {
    preliminaryDiagnosis = 'Likely Micronutrient Deficiency (Zinc/Iron) or Nitrogen chlorosis.';
    advisoryNote = 'Interveinal yellowing without necrotic lesions often points to soil alkalinity or nutrient lock.';
  } else if (combined.includes('wilt') || combined.includes('droop') || combined.includes('dry')) {
    preliminaryDiagnosis = 'Likely Fusarium Wilt or Bacterial Vascular Wilt.';
    advisoryNote = 'Sudden drooping during sunny hours indicates vascular tissue blockage. Check root collar.';
  }

  return {
    preliminary_ai_advisory: `Automated Pattern Match: ${preliminaryDiagnosis} ${advisoryNote}`,
    ai_disclaimer: 'DISCLAIMER: Automated preliminary advisory is an AI assistance tool for early screening only and does NOT guarantee diagnosis. Always follow verified prescription from a certified Agriculture Officer or KVK Scientist.'
  };
}

// Get issues
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, urgency } = req.query;
    let issues = await db.find('crop_issues');

    // Role filtering: Farmers see their own issues; Experts, Staff, and Admins see all
    if (req.user.role === 'FARMER') {
      issues = issues.filter(iss => iss.farmer_id === req.user.id);
    }

    if (status) {
      issues = issues.filter(iss => iss.status === status);
    }
    if (urgency) {
      issues = issues.filter(iss => iss.urgency === urgency);
    }

    // Attach farmer and crop details
    const users = await db.find('users');
    const crops = await db.find('crops');

    const enriched = issues.map(iss => {
      const farmer = users.find(u => u.id === iss.farmer_id);
      const crop = crops.find(c => c.id === iss.crop_id);
      const expert = users.find(u => u.id === iss.expert_id);
      return {
        ...iss,
        farmer_name: farmer ? farmer.name : 'Unknown Farmer',
        farmer_phone: farmer ? farmer.phone : '',
        farmer_village: farmer ? farmer.village : '',
        crop_name: crop ? crop.crop_name : 'Unknown Crop',
        crop_variety: crop ? crop.variety : '',
        expert_name: expert ? expert.name : null
      };
    });

    // Sort newest first
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ issues: enriched });
  } catch (error) {
    console.error('Fetch issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues.' });
  }
});

// Report new issue (Farmer)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { crop_id, title, description, image_url, symptoms, urgency = 'MEDIUM' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Calculate preliminary AI advisory
    const aiAnalysis = generatePreliminaryAdvisory(description, symptoms);

    const newIssue = await db.insert('crop_issues', {
      crop_id: crop_id || null,
      farmer_id: req.user.id,
      title,
      description,
      image_url: image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
      symptoms: symptoms || '',
      preliminary_ai_advisory: aiAnalysis.preliminary_ai_advisory,
      ai_disclaimer: aiAnalysis.ai_disclaimer,
      urgency: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(urgency) ? urgency : 'MEDIUM',
      status: 'OPEN',
      expert_id: null,
      expert_diagnosis: null,
      chemical_treatment: null,
      organic_treatment: null,
      dosage: null,
      spray_instructions: null,
      safety_precautions: null,
      expert_notes: null,
      resolved_at: null
    });

    // Update crop health status if attached
    if (crop_id) {
      await db.update('crops', crop_id, { health_status: 'Issue Reported' });
    }

    res.status(201).json({
      message: 'Crop issue reported successfully and queued for expert review.',
      issue: newIssue
    });
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({ error: 'Failed to report issue.' });
  }
});

// Get issue by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await db.findById('crop_issues', req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue ticket not found.' });
    }

    const farmer = await db.findById('users', issue.farmer_id);
    const expert = issue.expert_id ? await db.findById('users', issue.expert_id) : null;
    const crop = issue.crop_id ? await db.findById('crops', issue.crop_id) : null;

    res.json({
      issue: {
        ...issue,
        farmer_name: farmer ? farmer.name : 'Unknown',
        farmer_phone: farmer ? farmer.phone : '',
        expert_name: expert ? expert.name : null,
        crop_name: crop ? crop.crop_name : 'Unknown'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue details.' });
  }
});

// Expert review and prescription
router.put('/:id/review', authenticateToken, requireRole('AGRI_EXPERT', 'ADMIN'), async (req, res) => {
  try {
    const issue = await db.findById('crop_issues', req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue ticket not found.' });
    }

    const {
      expert_diagnosis,
      chemical_treatment,
      organic_treatment,
      dosage,
      spray_instructions,
      safety_precautions,
      expert_notes,
      status = 'RESOLVED'
    } = req.body;

    if (!expert_diagnosis) {
      return res.status(400).json({ error: 'Official diagnosis is required.' });
    }

    const updated = await db.update('crop_issues', req.params.id, {
      expert_id: req.user.id,
      expert_diagnosis,
      chemical_treatment: chemical_treatment || 'None specified.',
      organic_treatment: organic_treatment || 'Neem-based organic formulation recommended.',
      dosage: dosage || 'As per package guidelines.',
      spray_instructions: spray_instructions || 'Spray in calm evening conditions.',
      safety_precautions: safety_precautions || 'Wear mask and protective gloves during handling.',
      expert_notes: expert_notes || '',
      status,
      resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null
    });

    res.json({
      message: 'Expert advisory and prescription submitted successfully.',
      issue: updated
    });
  } catch (error) {
    console.error('Review issue error:', error);
    res.status(500).json({ error: 'Failed to submit expert review.' });
  }
});

// Update status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const updated = await db.update('crop_issues', req.params.id, { status });
    res.json({ message: 'Status updated', issue: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

export default router;
