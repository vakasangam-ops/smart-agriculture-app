import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  ShieldAlert,
  FlaskConical,
  Volume2,
  X,
  FileText,
  UserCheck,
  Leaf,
  Bug,
  AlertCircle
} from 'lucide-react';

export function CropIssuesView({ initialCrop }) {
  const { user } = useAuth();
  const { t, language, speakText } = useLanguage();

  const [issues, setIssues] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals & Active Drawer
  const [showReportModal, setShowReportModal] = useState(!!initialCrop);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showExpertReviewModal, setShowExpertReviewModal] = useState(false);

  // New Issue Form
  const [issueForm, setIssueForm] = useState({
    crop_id: initialCrop?.id || '',
    title: '',
    description: '',
    symptoms: 'Leaf curl, yellow veins, stunting',
    urgency: 'HIGH',
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
  });

  // Expert Prescription Form (for AGRI_EXPERT role)
  const [expertForm, setExpertForm] = useState({
    expert_diagnosis: '',
    chemical_treatment: '',
    organic_treatment: '',
    dosage: '',
    spray_instructions: '',
    safety_precautions: '',
    expert_notes: '',
    status: 'RESOLVED'
  });

  const loadIssues = async () => {
    try {
      setLoading(true);
      const [issRes, farmsRes] = await Promise.all([
        api.getIssues(),
        api.getFarms()
      ]);
      setIssues(issRes.issues || []);
      setFarms(farmsRes.farms || []);
      if (issRes.issues && issRes.issues.length > 0 && !selectedIssue) {
        setSelectedIssue(issRes.issues[0]);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.title || !issueForm.description) return;
    try {
      const res = await api.reportIssue(issueForm);
      setShowReportModal(false);
      setIssueForm({
        crop_id: '',
        title: '',
        description: '',
        symptoms: '',
        urgency: 'MEDIUM',
        image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
      });
      await loadIssues();
      if (res.issue) setSelectedIssue(res.issue);
    } catch (err) {
      alert('Failed to report issue: ' + err.message);
    }
  };

  const handleOpenExpertReview = (issue) => {
    setSelectedIssue(issue);
    setExpertForm({
      expert_diagnosis: issue.expert_diagnosis || 'Confirmed Leaf Curl Vector Infestation (Thrips complex)',
      chemical_treatment: issue.chemical_treatment || 'Diafenthiuron 50% WP @ 1.25 g/L OR Fipronil 5% SC @ 2.0 ml/L of water',
      organic_treatment: issue.organic_treatment || 'Neem oil (Azadirachtin 10,000 ppm) @ 2.5 ml/L + 20 Yellow & Blue sticky traps per acre',
      dosage: issue.dosage || '200 Litres of spray solution per acre with hollow cone nozzle',
      spray_instructions: issue.spray_instructions || 'Spray between 4:30 PM and 6:30 PM in calm weather. Avoid spraying if wind > 15 km/h.',
      safety_precautions: issue.safety_precautions || 'Wear protective face mask, goggles, and nitrile gloves. Pre-harvest waiting interval (PHI): 14 days.',
      expert_notes: issue.expert_notes || 'Repeat inspection in 8 days. Maintain adequate irrigation.',
      status: 'RESOLVED'
    });
    setShowExpertReviewModal(true);
  };

  const handleSubmitExpertReview = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    try {
      await api.submitExpertReview(selectedIssue.id, expertForm);
      setShowExpertReviewModal(false);
      await loadIssues();
    } catch (err) {
      alert('Failed to submit prescription: ' + err.message);
    }
  };

  const allCrops = farms.flatMap(f => f.crops || []);
  const filteredIssues = filterStatus === 'ALL'
    ? issues
    : issues.filter(i => i.status === filterStatus);

  const isExpertOrAdmin = user && ['AGRI_EXPERT', 'ADMIN'].includes(user.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bug size={24} style={{ color: '#d97706' }} />
            {t('cropIssuesTitle')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Early symptom screening with mandatory AI disclaimers and verified prescriptions by certified KVK Agri Scientists.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-amber"
          >
            <Plus size={16} />
            <span>{t('reportIssueBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        {[
          { id: 'ALL', label: 'All Tickets' },
          { id: 'OPEN', label: 'Pending Review' },
          { id: 'UNDER_REVIEW', label: 'Under Review' },
          { id: 'RESOLVED', label: 'Prescription Issued' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            style={{
              background: filterStatus === tab.id ? 'var(--primary-100)' : 'transparent',
              color: filterStatus === tab.id ? 'var(--primary-800)' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Two-Column View: Ticket List & Ticket Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '20px' }}>
        {/* Left: Issue Tickets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredIssues.length === 0 && (
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No issue tickets found under this status.
            </div>
          )}

          {filteredIssues.map(issue => {
            const isSelected = selectedIssue?.id === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  background: isSelected ? 'var(--primary-50)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {issue.crop_name}
                  </span>
                  <span className={`badge ${issue.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                    {issue.status === 'RESOLVED' ? '✓ Prescription Ready' : '⏳ Review Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600, lineClamp: 1, marginBottom: '6px' }}>
                  {issue.title}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Farmer: {issue.farmer_name} • Urgency: <strong style={{ color: issue.urgency === 'HIGH' ? '#dc2626' : 'inherit' }}>{issue.urgency}</strong>
                </div>

                {issue.expert_diagnosis && (
                  <div style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    🔬 Prescription by: {issue.expert_name || 'Dr. K. Venkat Rao (KVK)'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Selected Ticket Full Details & Prescription */}
        {selectedIssue ? (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header of selected ticket */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedIssue.title}</h3>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Crop: <strong>{selectedIssue.crop_name}</strong> • Sown by: <strong>{selectedIssue.farmer_name}</strong> ({selectedIssue.farmer_village})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => speakText(`Issue: ${selectedIssue.title}. ${selectedIssue.expert_diagnosis ? `Prescription: ${selectedIssue.expert_diagnosis}. Chemical: ${selectedIssue.chemical_treatment}. Organic: ${selectedIssue.organic_treatment}. Spray rules: ${selectedIssue.spray_instructions}` : selectedIssue.description}`)}
                  className="audio-readout-btn"
                  title="Listen to full advice aloud in regional language"
                >
                  <Volume2 size={15} />
                  <span>{t('readAloud')}</span>
                </button>

                {isExpertOrAdmin && (
                  <button
                    onClick={() => handleOpenExpertReview(selectedIssue)}
                    className="btn btn-primary btn-sm"
                  >
                    <FlaskConical size={14} />
                    <span>{selectedIssue.status === 'RESOLVED' ? 'Edit Prescription' : 'Write Prescription'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Farmer Observed Symptoms & Media */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedIssue.image_url ? '140px 1fr' : '1fr', gap: '16px' }}>
              {selectedIssue.image_url && (
                <img
                  src={selectedIssue.image_url}
                  alt="Crop symptoms"
                  style={{ width: '140px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              )}
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Farmer Symptom Log:
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {selectedIssue.description}
                </p>
                {selectedIssue.symptoms && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedIssue.symptoms.split(',').map((s, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Preliminary AI Advisory & Disclaimer Box */}
            <div className="disclaimer-box">
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block', marginBottom: '2px' }}>
                  {t('preliminaryAiAnalysis')}
                </strong>
                <div style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
                  {selectedIssue.preliminary_ai_advisory}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#78350f', fontStyle: 'italic', borderTop: '1px solid rgba(217, 119, 6, 0.25)', paddingTop: '4px' }}>
                  {selectedIssue.ai_disclaimer || t('preliminaryAiDisclaimer')}
                </div>
              </div>
            </div>

            {/* Verified Expert Prescription Card */}
            {selectedIssue.expert_diagnosis ? (
              <div style={{
                background: 'var(--primary-50)',
                border: '2px solid var(--primary-600)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(21, 128, 61, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} style={{ color: 'var(--primary-700)' }} />
                    <strong style={{ fontSize: '1rem', color: 'var(--primary-900)' }}>
                      {t('expertPrescription')}
                    </strong>
                  </div>
                  <span className="badge badge-success">
                    OFFICIAL KVK VERIFICATION
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                      {t('diagnosedBy')}:
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                      {selectedIssue.expert_name || 'Dr. K. Venkat Rao (Senior Agronomist, KVK Lam)'}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--primary-800)', marginTop: '2px' }}>
                      Diagnosis: <strong>{selectedIssue.expert_diagnosis}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    {/* Chemical Prescription */}
                    <div style={{ background: 'white', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🧪 {t('chemicalRemedy')}
                      </strong>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '4px' }}>
                        {selectedIssue.chemical_treatment}
                      </div>
                    </div>

                    {/* Organic / Bio Alternative */}
                    <div style={{ background: 'white', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🌿 {t('organicRemedy')}
                      </strong>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '4px' }}>
                        {selectedIssue.organic_treatment}
                      </div>
                    </div>
                  </div>

                  {/* Dosage & Spray Rules */}
                  <div style={{ background: 'white', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                      💧 <strong>{t('dosageInstructions')}:</strong> {selectedIssue.dosage}
                    </div>
                    <div style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                      ⏰ <strong>{t('sprayTiming')}:</strong> {selectedIssue.spray_instructions}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                      ⚠️ <strong>{t('safetyRules')}:</strong> {selectedIssue.safety_precautions}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Clock size={28} style={{ color: '#d97706', margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.96rem' }}>Ticket Queued for KVK Agricultural Scientist Review</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 0' }}>
                  Our designated agronomist will review leaf symptoms and issue verified chemical dosages and organic solutions shortly.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Report Crop Issue Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={20} style={{ color: '#d97706' }} />
                {t('reportIssueBtn')}
              </h3>
              <button className="btn-icon" onClick={() => setShowReportModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleReportIssue}>
              <div className="form-group">
                <label className="form-label">{t('selectCrop')}</label>
                <select
                  className="form-select"
                  value={issueForm.crop_id}
                  onChange={e => setIssueForm({ ...issueForm, crop_id: e.target.value })}
                >
                  <option value="">-- General Farm Observation --</option>
                  {allCrops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.crop_name} ({c.variety})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('issueTitle')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leaf curling and stunted growth in Chilli crop"
                  className="form-input"
                  value={issueForm.title}
                  onChange={e => setIssueForm({ ...issueForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('issueDescription')} *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe visible damage, color changes on leaf underside, flower drop, or pest presence..."
                  className="form-textarea"
                  value={issueForm.description}
                  onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('symptomsList')}</label>
                <input
                  type="text"
                  placeholder="e.g. Leaf curling, yellow veins, thrips, spots"
                  className="form-input"
                  value={issueForm.symptoms}
                  onChange={e => setIssueForm({ ...issueForm, symptoms: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('urgencyLevel')}</label>
                <select
                  className="form-select"
                  value={issueForm.urgency}
                  onChange={e => setIssueForm({ ...issueForm, urgency: e.target.value })}
                >
                  <option value="LOW">{t('urgencyLow')}</option>
                  <option value="MEDIUM">{t('urgencyMedium')}</option>
                  <option value="HIGH">{t('urgencyHigh')}</option>
                  <option value="CRITICAL">{t('urgencyCritical')}</option>
                </select>
              </div>

              <div className="disclaimer-box" style={{ fontSize: '0.78rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t('preliminaryAiDisclaimer')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit to Expert Queue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expert Review / Prescription Modal (AGRI_EXPERT) */}
      {showExpertReviewModal && (
        <div className="modal-overlay" onClick={() => setShowExpertReviewModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={20} style={{ color: 'var(--primary-600)' }} />
                {t('submitDiagnosis')}
              </h3>
              <button className="btn-icon" onClick={() => setShowExpertReviewModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitExpertReview}>
              <div className="form-group">
                <label className="form-label">Confirmed Scientific Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chilli Leaf Curl Begomovirus & Thrips vector complex"
                  className="form-input"
                  value={expertForm.expert_diagnosis}
                  onChange={e => setExpertForm({ ...expertForm, expert_diagnosis: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('chemicalRemedy')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diafenthiuron 50% WP @ 1.25 g/L OR Fipronil 5% SC @ 2.0 ml/L"
                  className="form-input"
                  value={expertForm.chemical_treatment}
                  onChange={e => setExpertForm({ ...expertForm, chemical_treatment: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('organicRemedy')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neem Oil 10,000 ppm @ 2.5 ml/L + Sticky Traps (20/acre)"
                  className="form-input"
                  value={expertForm.organic_treatment}
                  onChange={e => setExpertForm({ ...expertForm, organic_treatment: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('dosageInstructions')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 200 Litres water/acre"
                    className="form-input"
                    value={expertForm.dosage}
                    onChange={e => setExpertForm({ ...expertForm, dosage: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('sprayTiming')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Spray 4:30 PM - 6:30 PM, wind < 15km/h"
                    className="form-input"
                    value={expertForm.spray_instructions}
                    onChange={e => setExpertForm({ ...expertForm, spray_instructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('safetyRules')}</label>
                <input
                  type="text"
                  placeholder="e.g. Wear mask and gloves. PHI: 14 days before harvest"
                  className="form-input"
                  value={expertForm.safety_precautions}
                  onChange={e => setExpertForm({ ...expertForm, safety_precautions: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpertReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Sign & Issue Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
