import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Shield,
  Users,
  AlertTriangle,
  Send,
  Trash2,
  TrendingUp,
  Landmark,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

export function AdminView() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Alert Modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    severity: 'CRITICAL_PEST',
    district: user?.district || 'Guntur',
    state: user?.state || 'Andhra Pradesh'
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, alertsRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(),
        api.getAlerts()
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!alertForm.title || !alertForm.message) return;
    try {
      await api.broadcastAlert(alertForm);
      setShowAlertModal(false);
      setAlertForm({
        title: '',
        message: '',
        severity: 'CRITICAL_PEST',
        district: user?.district || 'Guntur',
        state: user?.state || 'Andhra Pradesh'
      });
      loadAdminData();
    } catch (err) {
      alert('Broadcast failed: ' + err.message);
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Dismiss this broadcast alert?')) return;
    try {
      await api.deleteAlert(id);
      loadAdminData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err) {
      alert('Role update failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} style={{ color: 'var(--primary-600)' }} />
            {t('adminTitle')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Village command center analytics, user governance, and agricultural alert broadcasting.
          </p>
        </div>

        <button onClick={() => setShowAlertModal(true)} className="btn btn-amber">
          <Send size={16} />
          <span>{t('broadcastAlert')}</span>
        </button>
      </div>

      {/* High-Level System Metrics */}
      {stats && (
        <div className="grid-cols-4">
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Farmers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {stats.total_farmers}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)', marginTop: '4px' }}>
              Total Area: <strong>{stats.total_acreage} Acres</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Disease Resolution Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {stats.crop_issues.resolution_rate_pct}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.crop_issues.resolved} resolved of {stats.crop_issues.total} tickets
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Village Center Machinery</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
              {stats.service_bookings.total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.service_bookings.completed} completed jobs
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Welfare Schemes Claimed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
              {stats.schemes.total_applications}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px' }}>
              {stats.schemes.verified_by_center} verified & sanctioned
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Alerts Management */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: '#dc2626' }} />
          <span>{t('recentBroadcasts')}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>No active broadcast alerts.</p>
          ) : (
            alerts.map(alt => (
              <div
                key={alt.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-danger">{alt.severity.replace(/_/g, ' ')}</span>
                    <strong style={{ fontSize: '0.92rem' }}>{alt.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    {alt.message}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Broadcast by: {alt.broadcast_by_name} • District: {alt.district} • Active until: {alt.active_until}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alt.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  title="Dismiss Alert"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Users & Stakeholder Directory */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--primary-600)' }} />
          <span>{t('usersDirectory')}</span>
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone / Email</th>
                <th>Location</th>
                <th>Assigned Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>
                    <div>{u.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    {u.village}, {u.district}
                  </td>
                  <td>
                    <span className="badge badge-primary">{u.role.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                    >
                      <option value="FARMER">Farmer</option>
                      <option value="SERVICE_CENTER_STAFF">Service Center Staff</option>
                      <option value="AGRI_EXPERT">Agri Expert</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: '#dc2626' }} />
                <span>{t('broadcastAlert')}</span>
              </h3>
              <button className="btn-icon" onClick={() => setShowAlertModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleBroadcastAlert}>
              <div className="form-group">
                <label className="form-label">{t('alertTitle')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Pest Alert: Fall Armyworm outbreak in Guntur district"
                  className="form-input"
                  value={alertForm.title}
                  onChange={e => setAlertForm({ ...alertForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('alertMessage')} *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide immediate instructions, chemical/organic preventive measures, and precautions..."
                  className="form-textarea"
                  value={alertForm.message}
                  onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('severity')}</label>
                  <select
                    className="form-select"
                    value={alertForm.severity}
                    onChange={e => setAlertForm({ ...alertForm, severity: e.target.value })}
                  >
                    <option value="CRITICAL_PEST">Critical Pest Outbreak</option>
                    <option value="WEATHER_ALERT">Severe Weather Warning</option>
                    <option value="WARNING">General Advisory Warning</option>
                    <option value="INFO">Informational Broadcast</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target District</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={alertForm.district}
                    onChange={e => setAlertForm({ ...alertForm, district: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAlertModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#dc2626' }}>Broadcast Immediately</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
