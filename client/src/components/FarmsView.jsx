import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Sprout,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Droplet,
  MapPin,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export function FarmsView({ onReportIssueForCrop }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  // New Farm Form
  const [farmForm, setFarmForm] = useState({
    farm_name: '',
    survey_no: '',
    area_acres: '',
    soil_type: 'Black Cotton Soil (నల్లరేగడి నేల)',
    irrigation_type: 'Canal & Borewell (కాలువ & బోరు)',
    village: user?.village || 'Tenali',
    district: user?.district || 'Guntur'
  });

  // New Crop Form
  const [cropForm, setCropForm] = useState({
    crop_name: 'Guntur Teja Chilli (మిరప)',
    variety: 'LCA-334 / Teja Super',
    season: 'Kharif',
    sowing_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: '',
    stage: 'Vegetative',
    area_acres: ''
  });

  const loadFarms = async () => {
    try {
      setLoading(true);
      const res = await api.getFarms();
      setFarms(res.farms || []);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [user]);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!farmForm.farm_name || !farmForm.area_acres) return;
    try {
      await api.createFarm(farmForm);
      setShowAddFarmModal(false);
      setFarmForm({
        farm_name: '',
        survey_no: '',
        area_acres: '',
        soil_type: 'Black Cotton Soil (నల్లరేగడి నేల)',
        irrigation_type: 'Canal & Borewell (కాలువ & బోరు)',
        village: user?.village || 'Tenali',
        district: user?.district || 'Guntur'
      });
      loadFarms();
    } catch (err) {
      alert('Failed to register farm: ' + err.message);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    if (!selectedFarmId || !cropForm.crop_name || !cropForm.sowing_date) return;
    try {
      await api.addCrop(selectedFarmId, cropForm);
      setShowAddCropModal(false);
      loadFarms();
    } catch (err) {
      alert('Failed to add crop: ' + err.message);
    }
  };

  const handleDeleteFarm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm plot? Associated crops will be removed.')) return;
    try {
      await api.deleteFarm(id);
      loadFarms();
    } catch (err) {
      alert('Failed to delete farm: ' + err.message);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Remove this crop record?')) return;
    try {
      await api.deleteCrop(cropId);
      loadFarms();
    } catch (err) {
      alert('Failed to remove crop: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sprout size={24} style={{ color: 'var(--primary-600)' }} />
            {t('myFarms')}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage surveyed agricultural plots, soil classifications, and standing crop life-cycles.
          </p>
        </div>

        <button
          onClick={() => setShowAddFarmModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>{t('addFarm')}</span>
        </button>
      </div>

      {/* Farms List */}
      {farms.length === 0 && !loading && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No farm plots registered yet. Click "Register New Farm Plot" to begin.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {farms.map(farm => (
          <div key={farm.id} className="glass-panel" style={{ padding: '24px' }}>
            {/* Plot Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{farm.farm_name}</h3>
                  <span className="badge badge-primary">{farm.area_acres} {t('acres')}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>📋 <strong>{t('surveyNumber')}:</strong> {farm.survey_no}</span>
                  <span>🌱 <strong>{t('soilType')}:</strong> {farm.soil_type}</span>
                  <span>💧 <strong>{t('irrigationType')}:</strong> {farm.irrigation_type}</span>
                  <span>📍 <strong>Location:</strong> {farm.village}, {farm.district}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setSelectedFarmId(farm.id);
                    setCropForm({ ...cropForm, area_acres: farm.area_acres });
                    setShowAddCropModal(true);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} />
                  <span>{t('addCrop')}</span>
                </button>
                <button
                  onClick={() => handleDeleteFarm(farm.id)}
                  className="btn-icon"
                  title="Delete Plot"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Standing Crops Grid */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} />
                <span>{t('cropsUnderFarm')} ({farm.crops ? farm.crops.length : 0})</span>
              </div>

              {(!farm.crops || farm.crops.length === 0) ? (
                <div style={{ padding: '16px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  No standing crops currently recorded. Click "Add Sown Crop" to track stage, irrigation, and diseases.
                </div>
              ) : (
                <div className="grid-cols-auto">
                  {farm.crops.map(crop => (
                    <div
                      key={crop.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>{crop.crop_name}</strong>
                          <span className={`badge ${crop.health_status === 'Healthy' ? 'badge-success' : 'badge-warning'}`}>
                            {crop.health_status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong>{t('variety')}:</strong> {crop.variety}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <strong>{t('season')}:</strong> {crop.season} ({crop.area_acres || farm.area_acres} Acres)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <Calendar size={13} />
                          <span>Sown: {crop.sowing_date}</span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>
                            Stage: {crop.stage}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={() => onReportIssueForCrop?.(crop)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                        >
                          <AlertTriangle size={13} />
                          <span>Report Issue</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(crop.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                          title="Remove Crop"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Farm Modal */}
      {showAddFarmModal && (
        <div className="modal-overlay" onClick={() => setShowAddFarmModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('addFarm')}</h3>
              <button className="btn-icon" onClick={() => setShowAddFarmModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateFarm}>
              <div className="form-group">
                <label className="form-label">{t('farmName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Lakshmi Chenu (శ్రీ లక్ష్మి చేను)"
                  className="form-input"
                  value={farmForm.farm_name}
                  onChange={e => setFarmForm({ ...farmForm, farm_name: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('surveyNumber')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 142/3B"
                    className="form-input"
                    value={farmForm.survey_no}
                    onChange={e => setFarmForm({ ...farmForm, survey_no: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('acres')} *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 4.5"
                    className="form-input"
                    value={farmForm.area_acres}
                    onChange={e => setFarmForm({ ...farmForm, area_acres: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('soilType')}</label>
                <select
                  className="form-select"
                  value={farmForm.soil_type}
                  onChange={e => setFarmForm({ ...farmForm, soil_type: e.target.value })}
                >
                  <option value="Black Cotton Soil (నల్లరేగడి నేల)">Black Cotton Soil (నల్లరేగడి / काली मिट्टी)</option>
                  <option value="Red Sandy Loam (ఎర్ర నేల)">Red Sandy Loam (ఎర్ర నేల / लाल बलुई मिट्टी)</option>
                  <option value="Alluvial Loam (ఒండ్రు నేల)">Alluvial Loam (ఒండ్రు నేల / जलोढ़ दोमट)</option>
                  <option value="Clayey Loam (బంకమట్టి నేల)">Clayey Loam (బంకమట్టి / चिकनी दोमट)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('irrigationType')}</label>
                <select
                  className="form-select"
                  value={farmForm.irrigation_type}
                  onChange={e => setFarmForm({ ...farmForm, irrigation_type: e.target.value })}
                >
                  <option value="Canal & Borewell (కాలువ & బోరు)">Canal & Borewell (నది కాలువ & బోరు బావి)</option>
                  <option value="Drip Irrigation (బిందు సేద్యం)">Drip Irrigation (బిందు సేద్యం / ड्रिप)</option>
                  <option value="Borewell with Sprinklers">Borewell with Sprinklers (స్ప్రింక్లర్లు)</option>
                  <option value="Rainfed (వర్షాధారం)">Rainfed (వర్షాధార సాగు / वर्षा आधारित)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddFarmModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="modal-overlay" onClick={() => setShowAddCropModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('addCrop')}</h3>
              <button className="btn-icon" onClick={() => setShowAddCropModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCrop}>
              <div className="form-group">
                <label className="form-label">{t('cropName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chilli (మిరప / मिर्च), Paddy (వరి / धान)"
                  className="form-input"
                  value={cropForm.crop_name}
                  onChange={e => setCropForm({ ...cropForm, crop_name: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('variety')}</label>
                  <input
                    type="text"
                    placeholder="e.g. LCA-334, BPT-5204"
                    className="form-input"
                    value={cropForm.variety}
                    onChange={e => setCropForm({ ...cropForm, variety: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('season')}</label>
                  <select
                    className="form-select"
                    value={cropForm.season}
                    onChange={e => setCropForm({ ...cropForm, season: e.target.value })}
                  >
                    <option value="Kharif">Kharif (Monsoon / వర్షాకాలం)</option>
                    <option value="Rabi">Rabi (Winter / శీతాకాలం)</option>
                    <option value="Zaid">Zaid (Summer / వేసవి)</option>
                    <option value="Perennial">Perennial (బహువార్షిక)</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">{t('sowingDate')} *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={cropForm.sowing_date}
                    onChange={e => setCropForm({ ...cropForm, sowing_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('expectedHarvest')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={cropForm.expected_harvest_date}
                    onChange={e => setCropForm({ ...cropForm, expected_harvest_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('cropStage')}</label>
                <select
                  className="form-select"
                  value={cropForm.stage}
                  onChange={e => setCropForm({ ...cropForm, stage: e.target.value })}
                >
                  <option value="Nursery / Sowing">Nursery / Sowing (విత్తనం / నారుమడి)</option>
                  <option value="Vegetative">Vegetative (శాకీయ పెరుగుదల దశ)</option>
                  <option value="Flowering & Fruit Setting">Flowering & Fruit Setting (పూత & పిందె దశ)</option>
                  <option value="Grain Filling / Pod Maturity">Grain Filling / Pod Maturity (గింజ పాలుపోసుకునే దశ)</option>
                  <option value="Harvest Ready">Harvest Ready (కోత దశ)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCropModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Crop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
