import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Landmark,
  CheckCircle2,
  FileText,
  Calculator,
  ExternalLink,
  Plus,
  X,
  ShieldCheck,
  Clock,
  AlertCircle
} from 'lucide-react';

export function SchemesView() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'tracker' | 'eligibility'
  const [loading, setLoading] = useState(true);

  // Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applyForm, setApplyForm] = useState({
    applicant_name: user?.name || '',
    aadhaar_last4: '5421',
    bank_account_last4: '9082',
    ifsc: 'SBIN0001234',
    land_passbook_no: 'AP-GNT-TN-1423',
    acres_applied: '4.5',
    documents_uploaded: 'Pattadar_Passbook.pdf, Aadhaar_Card.pdf, Bank_Passbook.pdf'
  });

  // Eligibility Calculator Form
  const [eligibilityForm, setEligibilityForm] = useState({
    land_acres: '3.5',
    state: user?.state || 'Andhra Pradesh',
    category: 'General',
    is_tenant: false
  });
  const [eligibilityResults, setEligibilityResults] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schRes, appRes] = await Promise.all([
        api.getSchemes(),
        api.getApplications()
      ]);
      setSchemes(schRes.schemes || []);
      setApplications(appRes.applications || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenApply = (scheme) => {
    setSelectedScheme(scheme);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedScheme) return;
    try {
      const res = await api.applyScheme({
        scheme_id: selectedScheme.id,
        applicant_name: applyForm.applicant_name,
        aadhaar_last4: applyForm.aadhaar_last4,
        bank_account_last4: applyForm.bank_account_last4,
        ifsc: applyForm.ifsc,
        land_passbook_no: applyForm.land_passbook_no,
        acres_applied: applyForm.acres_applied,
        documents_uploaded: applyForm.documents_uploaded
      });
      alert(res.message);
      setShowApplyModal(false);
      setActiveTab('tracker');
      loadData();
    } catch (err) {
      alert('Application failed: ' + err.message);
    }
  };

  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    try {
      const res = await api.checkEligibility({
        land_acres: parseFloat(eligibilityForm.land_acres),
        state: eligibilityForm.state,
        category: eligibilityForm.category,
        is_tenant: eligibilityForm.is_tenant
      });
      setEligibilityResults(res.results || []);
    } catch (err) {
      alert('Eligibility check error: ' + err.message);
    }
  };

  const handleVerifyApplication = async (appId, status) => {
    const notes = window.prompt('Enter verification remarks for village center records:', 'Physical land revenue inspection confirmed. Aadhaar NPCI seeding active.');
    if (notes === null) return;
    try {
      await api.verifyApplication(appId, status, notes);
      loadData();
    } catch (err) {
      alert('Verification update failed: ' + err.message);
    }
  };

  const isStaffOrAdmin = user && ['SERVICE_CENTER_STAFF', 'ADMIN'].includes(user.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Landmark size={24} style={{ color: 'var(--amber-600)' }} />
            {t('schemesTitle')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('schemesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('eligibility')}
          className="btn btn-primary"
        >
          <Calculator size={16} />
          <span>{t('checkEligibility')}</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            background: activeTab === 'directory' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'directory' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🏛️ Schemes Directory ({schemes.length})
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          style={{
            background: activeTab === 'tracker' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'tracker' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📑 {isStaffOrAdmin ? 'Service Center Verification Queue' : t('myApplications')} ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('eligibility')}
          style={{
            background: activeTab === 'eligibility' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'eligibility' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🧮 Interactive Eligibility Calculator
        </button>
      </div>

      {/* TAB 1: SCHEMES DIRECTORY */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {schemes.map(sch => {
            const schemeName = language === 'te' ? sch.name_te : language === 'hi' ? sch.name_hi : sch.name_en;
            const benefitSummary = language === 'te' ? sch.benefit_summary_te : language === 'hi' ? sch.benefit_summary_hi : sch.benefit_summary_en;
            const eligibilityText = language === 'te' ? sch.eligibility_te : language === 'hi' ? sch.eligibility_hi : sch.eligibility_en;

            return (
              <div key={sch.id} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-primary">{sch.level} SCHEME</span>
                      <span className="badge badge-success">{sch.category}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                      {schemeName}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {sch.department}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('maxBenefit')}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{sch.max_benefit_inr ? sch.max_benefit_inr.toLocaleString() : 'Variable'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--primary-50)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--primary-900)' }}>
                  <strong>Benefit:</strong> {benefitSummary}
                </div>

                <div className="grid-cols-2" style={{ marginBottom: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {t('eligibilityCriteria')}:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                      {eligibilityText}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {t('requiredDocs')}:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                      {sch.required_documents}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  {sch.official_portal_url && (
                    <a
                      href={sch.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.82rem', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Official Government Portal <ExternalLink size={13} />
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenApply(sch)}
                    className="btn btn-amber"
                  >
                    <span>{t('applyNow')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: APPLICATIONS TRACKER */}
      {activeTab === 'tracker' && (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Scheme Name</th>
                <th>Applicant</th>
                <th>Aadhaar / Bank</th>
                <th>Acreage</th>
                <th>Status</th>
                <th>Center Verification</th>
                {isStaffOrAdmin && <th>Staff Actions</th>}
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={isStaffOrAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '30px' }}>
                    No scheme applications filed yet. Click "Apply at Village Center" from the Directory tab.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <strong style={{ fontSize: '0.84rem' }}>{app.application_no}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(app.submission_date).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.scheme_name_en}</div>
                    </td>
                    <td>
                      <div>{app.applicant_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.farmer_village}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>XXXX-{app.aadhaar_last4}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>A/c: XXXX-{app.bank_account_last4} ({app.ifsc})</div>
                    </td>
                    <td>{app.acres_applied} Acres</td>
                    <td>
                      <span className={`badge ${
                        app.status === 'VERIFIED_BY_CENTER' ? 'badge-success' :
                        app.status === 'SANCTIONED' ? 'badge-primary' :
                        app.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {app.verification_notes || 'Pending physical inspection'}
                      </div>
                      {app.verified_by_name && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                          ✓ By: {app.verified_by_name}
                        </div>
                      )}
                    </td>
                    {isStaffOrAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleVerifyApplication(app.id, 'VERIFIED_BY_CENTER')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyApplication(app.id, 'REJECTED')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#dc2626' }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ELIGIBILITY CALCULATOR */}
      {activeTab === 'eligibility' && (
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Calculator size={22} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Agricultural Welfare Scheme Eligibility Calculator</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Input your land holding size, farmer status, and state to instantly discover all Central and State government schemes you are qualified to claim.
          </p>

          <form onSubmit={handleCheckEligibility} style={{ marginBottom: '24px' }}>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Total Land Holding (Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="form-input"
                  value={eligibilityForm.land_acres}
                  onChange={e => setEligibilityForm({ ...eligibilityForm, land_acres: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resident State *</label>
                <select
                  className="form-select"
                  value={eligibilityForm.state}
                  onChange={e => setEligibilityForm({ ...eligibilityForm, state: e.target.value })}
                >
                  <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
                  <option value="Telangana">Telangana (తెలంగాణ)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="Punjab">Punjab (पंजाब)</option>
                </select>
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Farmer Category</label>
                <select
                  className="form-select"
                  value={eligibilityForm.category}
                  onChange={e => setEligibilityForm({ ...eligibilityForm, category: e.target.value })}
                >
                  <option value="Small / Marginal (under 5 Acres)">Small / Marginal (Up to 5 Acres)</option>
                  <option value="Medium (5 - 10 Acres)">Medium (5 - 10 Acres)</option>
                  <option value="Large (Above 10 Acres)">Large (Above 10 Acres)</option>
                </select>
              </div>

              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '22px', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={eligibilityForm.is_tenant}
                    onChange={e => setEligibilityForm({ ...eligibilityForm, is_tenant: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                  />
                  <span>I am a Tenant Farmer (CCRC Cardholder)</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Calculate Eligible Subsidies & Benefits
            </button>
          </form>

          {/* Results Display */}
          {eligibilityResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Eligibility Assessment Results:
              </h4>
              {eligibilityResults.map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${r.is_eligible ? '#10b981' : '#fca5a5'}`,
                    background: r.is_eligible ? 'var(--primary-50)' : '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{r.name_en}</strong>
                      <span className={`badge ${r.is_eligible ? 'badge-success' : 'badge-danger'}`}>
                        {r.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.eligibility_reason}
                    </div>
                  </div>

                  {r.is_eligible && (
                    <button
                      onClick={() => handleOpenApply(r)}
                      className="btn btn-amber btn-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedScheme && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Apply for: {selectedScheme.name_en}</h3>
              <button className="btn-icon" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div style={{ background: 'var(--primary-50)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.84rem' }}>
                Nodal Dept: <strong>{selectedScheme.department}</strong> • Maximum Benefit: <strong>₹{selectedScheme.max_benefit_inr?.toLocaleString()}</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Applicant Name (As per Aadhaar) *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={applyForm.applicant_name}
                  onChange={e => setApplyForm({ ...applyForm, applicant_name: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Aadhaar Last 4 Digits *</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    className="form-input"
                    value={applyForm.aadhaar_last4}
                    onChange={e => setApplyForm({ ...applyForm, aadhaar_last4: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Account Last 4 Digits *</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    className="form-input"
                    value={applyForm.bank_account_last4}
                    onChange={e => setApplyForm({ ...applyForm, bank_account_last4: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Bank IFSC Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={applyForm.ifsc}
                    onChange={e => setApplyForm({ ...applyForm, ifsc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pattadar Passbook / 1-B No</label>
                  <input
                    type="text"
                    className="form-input"
                    value={applyForm.land_passbook_no}
                    onChange={e => setApplyForm({ ...applyForm, land_passbook_no: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Land Acreage Claimed</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={applyForm.acres_applied}
                  onChange={e => setApplyForm({ ...applyForm, acres_applied: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attached Document References</label>
                <input
                  type="text"
                  className="form-input"
                  value={applyForm.documents_uploaded}
                  onChange={e => setApplyForm({ ...applyForm, documents_uploaded: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
