import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  Volume2,
  Plus,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

export function MarketPricesView() {
  const { user } = useAuth();
  const { t, language, speakText } = useLanguage();

  const [prices, setPrices] = useState([]);
  const [states, setStates] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Price Modal (Staff / Admin)
  const [showAddModal, setShowAddModal] = useState(false);
  const [priceForm, setPriceForm] = useState({
    commodity_en: 'Chilli (Dry Red)',
    commodity_te: 'ఎండు మిర్చి (తేజ)',
    commodity_hi: 'लाल मिर्च (तेजा)',
    variety: 'Teja Grade A',
    market_center: 'Guntur e-NAM Agriculture Market Yard',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    modal_price: '19800',
    min_price: '17200',
    max_price: '22100',
    trend: 'RISING'
  });

  const loadPrices = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketPrices(selectedState, selectedCommodity, search);
      setPrices(res.prices || []);
      if (res.metadata) {
        setStates(res.metadata.states || []);
        setCommodities(res.metadata.commodities || []);
      }
    } catch (err) {
      console.error('Failed to load mandi prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedState, selectedCommodity, search]);

  const handleAddPrice = async (e) => {
    e.preventDefault();
    try {
      await api.createMarketPrice?.(priceForm) || await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('krishi_token')}` },
        body: JSON.stringify(priceForm)
      });
      setShowAddModal(false);
      loadPrices();
    } catch (err) {
      alert('Failed to save market price: ' + err.message);
    }
  };

  const handleReadPrices = () => {
    if (prices.length === 0) return;
    const topThree = prices.slice(0, 3).map(p => {
      const commName = language === 'te' ? p.commodity_te : language === 'hi' ? p.commodity_hi : p.commodity_en;
      return `${commName} at ${p.market_center}: ₹${p.modal_price} per quintal`;
    }).join('. ');
    speakText(`Today's Mandi Market Rates: ${topThree}`);
  };

  const isStaffOrAdmin = user && ['SERVICE_CENTER_STAFF', 'ADMIN'].includes(user.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} style={{ color: 'var(--primary-600)' }} />
              {t('mandiTitle')}
            </h2>
            <span className="verified-tag">
              <CheckCircle2 size={13} />
              {t('verifiedMandiNotice')}
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('mandiSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReadPrices} className="audio-readout-btn">
            <Volume2 size={15} />
            <span>{t('readAloud')}</span>
          </button>
          {isStaffOrAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Update Mandi Rate</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '6px 12px', minWidth: '220px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search commodity or mandi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.86rem', color: 'var(--text-main)', width: '100%' }}
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.84rem' }}
          >
            <option value="ALL">All States (అన్ని రాష్ట్రాలు)</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Commodity Filter */}
          <select
            value={selectedCommodity}
            onChange={e => setSelectedCommodity(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.84rem' }}
          >
            <option value="ALL">All Commodities (అన్ని పంటలు)</option>
            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {prices.length} Market Yards
        </div>
      </div>

      {/* Mandi Prices Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>{t('commodity')}</th>
              <th>{t('marketYard')}</th>
              <th>Location</th>
              <th>{t('minPrice')}</th>
              <th>{t('maxPrice')}</th>
              <th>{t('modalPrice')}</th>
              <th>{t('priceTrend')}</th>
              <th>Feed Status</th>
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                  No market prices found for selected filter criteria.
                </td>
              </tr>
            ) : (
              prices.map(p => {
                const commName = language === 'te' ? p.commodity_te : language === 'hi' ? p.commodity_hi : p.commodity_en;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {commName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.variety}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.86rem' }}>{p.market_center}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{p.district}, {p.state}</div>
                    </td>
                    <td>₹{p.min_price?.toLocaleString()}</td>
                    <td>₹{p.max_price?.toLocaleString()}</td>
                    <td>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        ₹{p.modal_price?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per {p.unit}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.trend === 'RISING' ? 'badge-success' :
                        p.trend === 'FALLING' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {p.trend === 'RISING' ? <ArrowUpRight size={13} /> : p.trend === 'FALLING' ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                        {p.trend === 'RISING' ? t('trendRising') : p.trend === 'FALLING' ? t('trendFalling') : t('trendStable')}
                      </span>
                    </td>
                    <td>
                      <span className="verified-tag" style={{ fontSize: '0.72rem' }}>
                        ✓ e-NAM Live
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Price Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update APMC Mandi Rate</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddPrice}>
              <div className="form-group">
                <label className="form-label">Commodity Name (English) *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={priceForm.commodity_en}
                  onChange={e => setPriceForm({ ...priceForm, commodity_en: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Telugu Name (తెలుగు)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={priceForm.commodity_te}
                    onChange={e => setPriceForm({ ...priceForm, commodity_te: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hindi Name (हिन्दी)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={priceForm.commodity_hi}
                    onChange={e => setPriceForm({ ...priceForm, commodity_hi: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Market Yard / Mandi *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={priceForm.market_center}
                    onChange={e => setPriceForm({ ...priceForm, market_center: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Modal Price (₹ / Quintal) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={priceForm.modal_price}
                    onChange={e => setPriceForm({ ...priceForm, modal_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price Trend</label>
                <select
                  className="form-select"
                  value={priceForm.trend}
                  onChange={e => setPriceForm({ ...priceForm, trend: e.target.value })}
                >
                  <option value="RISING">Rising (ధర పెరుగుతోంది)</option>
                  <option value="STABLE">Stable (స్థిరంగా ఉంది)</option>
                  <option value="FALLING">Falling (ధర తగ్గుతోంది)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Price Feed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
