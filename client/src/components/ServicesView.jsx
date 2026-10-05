import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Tractor,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  Plus,
  X,
  Phone,
  Layers,
  FileCheck,
  ChevronRight,
  Sparkles,
  Droplets,
  DollarSign
} from 'lucide-react';

export function ServicesView() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'bookings' | 'soil'
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [soilRecords, setSoilRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time_slot: '07:00 AM - 10:00 AM',
    quantity: '2.0',
    farmer_notes: ''
  });

  // Soil Test Modal (for Staff / Expert)
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [soilForm, setSoilForm] = useState({
    farmer_id: user?.id || 'usr_farmer_1',
    farm_id: 'farm_1',
    sample_date: new Date().toISOString().split('T')[0],
    ph_level: '7.4',
    organic_carbon_pct: '0.45',
    nitrogen_kg_ha: '190',
    phosphorus_kg_ha: '35',
    potassium_kg_ha: '320',
    zinc_ppm: '0.52',
    iron_ppm: '4.8',
    electrical_conductivity: '0.38',
    recommendations: 'Organic carbon is low; incorporate 5 tonnes/acre Farm Yard Manure (FYM). Split nitrogen doses.',
    fertilizer_plan: 'Base dose: 50 kg DAP + 25 kg MOP + 10 kg ZnSO4. Top dressing: Urea in 3 splits.',
    lab_name: 'Village Rythu Bharosa Kendram Testing Unit'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [srvRes, bkRes, soilRes] = await Promise.all([
        api.getServices(),
        api.getBookings(),
        api.getSoilHealthRecords()
      ]);
      setServices(srvRes.services || []);
      setBookings(bkRes.bookings || []);
      setSoilRecords(soilRes.records || []);
    } catch (err) {
      console.error('Failed to load services data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenBookModal = (service) => {
    setSelectedService(service);
    setShowBookModal(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await api.bookService({
        service_id: selectedService.id,
        booking_date: bookingForm.booking_date,
        time_slot: bookingForm.time_slot,
        quantity: parseFloat(bookingForm.quantity) || 1,
        farmer_notes: bookingForm.farmer_notes
      });
      setShowBookModal(false);
      setActiveTab('bookings');
      loadData();
    } catch (err) {
      alert('Failed to book service: ' + err.message);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.updateBookingStatus(id, status, 'Confirmed by Village Center Operator');
      loadData();
    } catch (err) {
      alert('Failed to update booking status: ' + err.message);
    }
  };

  const handleAddSoilTest = async (e) => {
    e.preventDefault();
    try {
      await api.addSoilTest(soilForm);
      setShowSoilModal(false);
      loadData();
    } catch (err) {
      alert('Failed to add soil test: ' + err.message);
    }
  };

  const isStaffOrAdmin = user && ['SERVICE_CENTER_STAFF', 'ADMIN', 'AGRI_EXPERT'].includes(user.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tractor size={24} style={{ color: 'var(--primary-600)' }} />
            {t('serviceCenterTitle')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('serviceCenterDesc')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isStaffOrAdmin && activeTab === 'soil' && (
            <button className="btn btn-primary" onClick={() => setShowSoilModal(true)}>
              <Plus size={16} />
              <span>Record Soil Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: activeTab === 'catalog' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'catalog' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🚜 Equipment & Services Catalog ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            background: activeTab === 'bookings' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'bookings' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📋 {isStaffOrAdmin ? 'Village Center Rental Requests' : 'My Bookings'} ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('soil')}
          style={{
            background: activeTab === 'soil' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'soil' ? 'var(--primary-800)' : 'var(--text-muted)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🌱 Soil Health Cards & Tests ({soilRecords.length})
        </button>
      </div>

      {/* TAB 1: SERVICES CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid-cols-auto">
          {services.map(srv => {
            const hasSubsidy = srv.subsidy_applicable && srv.subsidy_pct > 0;
            const subsidizedRate = hasSubsidy
              ? srv.rate_inr * (1 - srv.subsidy_pct / 100)
              : srv.rate_inr;

            return (
              <div
                key={srv.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{srv.category.replace('_', ' ')}</span>
                    {hasSubsidy && (
                      <span className="badge badge-success">
                        {srv.subsidy_pct}% GOVT SUBSIDY
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.08rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    {srv.name}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '14px' }}>
                    {srv.description}
                  </p>

                  <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        ₹{subsidizedRate}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        / {srv.unit.replace('PER_', '').toLowerCase()}
                      </span>
                      {hasSubsidy && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                          ₹{srv.rate_inr}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📍 {srv.center_name} ({srv.village})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {srv.contact_phone}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBookModal(srv)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Calendar size={15} />
                  <span>{t('bookService')}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Service Name</th>
                <th>Farmer Name</th>
                <th>Date & Slot</th>
                <th>Qty / Duration</th>
                <th>Amount</th>
                <th>Status</th>
                {isStaffOrAdmin && <th>Center Actions</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={isStaffOrAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '30px' }}>
                    No bookings logged yet.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ fontSize: '0.82rem' }}>{b.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.service_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.center_name}</div>
                    </td>
                    <td>
                      <div>{b.farmer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.farmer_phone} ({b.farmer_village})</div>
                    </td>
                    <td>
                      <div>{b.booking_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.time_slot}</div>
                    </td>
                    <td>{b.quantity}</td>
                    <td>
                      <strong style={{ color: 'var(--primary-700)' }}>₹{b.total_amount_inr}</strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        b.status === 'CONFIRMED' ? 'badge-success' :
                        b.status === 'COMPLETED' ? 'badge-info' :
                        b.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    {isStaffOrAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            >
                              Complete
                            </button>
                          )}
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

      {/* TAB 3: SOIL HEALTH CARDS */}
      {activeTab === 'soil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {soilRecords.map(rec => (
            <div key={rec.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Soil Health Card: {rec.farm_name}</h3>
                    <span className="badge badge-success">Official ICAR / KVK Test</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Farmer: <strong>{rec.farmer_name}</strong> • Tested by: <strong>{rec.tested_by_name}</strong> • Sample Date: {rec.sample_date}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  🏛️ {rec.lab_name}
                </div>
              </div>

              {/* Chemical & Nutrient Parameter Grid */}
              <div className="grid-cols-4" style={{ marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('phLevel')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: rec.ph_level > 8 ? '#d97706' : '#10b981' }}>
                    {rec.ph_level}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {rec.ph_level > 7.5 ? 'Moderately Alkaline' : 'Normal Neutral'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('organicCarbon')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: rec.organic_carbon_pct < 0.5 ? '#dc2626' : '#10b981' }}>
                    {rec.organic_carbon_pct}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: rec.organic_carbon_pct < 0.5 ? '#dc2626' : '#10b981', fontWeight: 600 }}>
                    {rec.organic_carbon_pct < 0.5 ? 'Low (<0.5%)' : 'Sufficient'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('nitrogen')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: rec.nitrogen_kg_ha < 280 ? '#dc2626' : '#10b981' }}>
                    {rec.nitrogen_kg_ha} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>kg/ha</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: rec.nitrogen_kg_ha < 280 ? '#dc2626' : '#10b981', fontWeight: 600 }}>
                    {rec.nitrogen_kg_ha < 280 ? 'Deficient' : 'Optimal'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('phosphorus')} & {t('potassium')}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    P: {rec.phosphorus_kg_ha} | K: {rec.potassium_kg_ha}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    kg/ha (Available)
                  </div>
                </div>
              </div>

              {/* Fertilizer Plan & Expert Recommendations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--primary-50)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-500)' }}>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--primary-900)', display: 'block', marginBottom: '4px' }}>
                    🌿 {t('fertilizerRecommendation')}
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--primary-800)', margin: 0, lineHeight: '1.45' }}>
                    {rec.fertilizer_plan}
                  </p>
                </div>

                <div style={{ background: '#fffbeb', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #f59e0b' }}>
                  <strong style={{ fontSize: '0.84rem', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                    💡 Soil Amendment Advice
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: '1.45' }}>
                    {rec.recommendations}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Service Modal */}
      {showBookModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book: {selectedService.name}</h3>
              <button className="btn-icon" onClick={() => setShowBookModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleBookSubmit}>
              <div style={{ background: 'var(--primary-50)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.86rem' }}>
                <div>Center: <strong>{selectedService.center_name}</strong></div>
                <div>Subsidized Rate: <strong>₹{selectedService.subsidy_applicable ? selectedService.rate_inr * (1 - selectedService.subsidy_pct / 100) : selectedService.rate_inr}</strong> / {selectedService.unit.replace('PER_', '').toLowerCase()}</div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Booking Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={bookingForm.booking_date}
                    onChange={e => setBookingForm({ ...bookingForm, booking_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time Slot *</label>
                  <select
                    className="form-select"
                    value={bookingForm.time_slot}
                    onChange={e => setBookingForm({ ...bookingForm, time_slot: e.target.value })}
                  >
                    <option value="06:00 AM - 09:00 AM">Early Morning (06:00 AM - 09:00 AM)</option>
                    <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                    <option value="05:00 PM - 07:00 PM">Evening Spray (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estimated Quantity / Duration ({selectedService.unit.replace('PER_', '').toLowerCase()})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="form-input"
                  value={bookingForm.quantity}
                  onChange={e => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Farmer Field Notes / Plot Location</label>
                <textarea
                  rows={3}
                  placeholder="Mention field landmark, survey number, or target crop..."
                  className="form-textarea"
                  value={bookingForm.farmer_notes}
                  onChange={e => setBookingForm({ ...bookingForm, farmer_notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Soil Test Modal (Staff / Expert) */}
      {showSoilModal && (
        <div className="modal-overlay" onClick={() => setShowSoilModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>Record Soil Health Card Report</h3>
              <button className="btn-icon" onClick={() => setShowSoilModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSoilTest}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Soil pH (0 - 14) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-input"
                    value={soilForm.ph_level}
                    onChange={e => setSoilForm({ ...soilForm, ph_level: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organic Carbon (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={soilForm.organic_carbon_pct}
                    onChange={e => setSoilForm({ ...soilForm, organic_carbon_pct: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Available N (kg/ha)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={soilForm.nitrogen_kg_ha}
                    onChange={e => setSoilForm({ ...soilForm, nitrogen_kg_ha: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available P (kg/ha)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={soilForm.phosphorus_kg_ha}
                    onChange={e => setSoilForm({ ...soilForm, phosphorus_kg_ha: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available K (kg/ha)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={soilForm.potassium_kg_ha}
                    onChange={e => setSoilForm({ ...soilForm, potassium_kg_ha: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fertilizer Application Plan</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={soilForm.fertilizer_plan}
                  onChange={e => setSoilForm({ ...soilForm, fertilizer_plan: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organic Amendment Recommendations</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={soilForm.recommendations}
                  onChange={e => setSoilForm({ ...soilForm, recommendations: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSoilModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Soil Health Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
