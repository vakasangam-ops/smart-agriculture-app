import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Tractor,
  Sprout,
  AlertTriangle,
  Calendar,
  CloudSun,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Volume2,
  DollarSign,
  Droplets,
  Wind,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function DashboardView({ onNavigateTab }) {
  const { user } = useAuth();
  const { t, language, speakText, isSpeaking } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [issues, setIssues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [farmsRes, issuesRes, bookingsRes, weatherRes, alertsRes] = await Promise.all([
          api.getFarms(),
          api.getIssues(),
          api.getBookings(),
          api.getWeatherForecast('guntur'),
          api.getAlerts()
        ]);
        setFarms(farmsRes.farms || []);
        setIssues(issuesRes.issues || []);
        setBookings(bookingsRes.bookings || []);
        setWeather(weatherRes);
        setAlerts(alertsRes.alerts || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const totalAcreage = farms.reduce((acc, f) => acc + (parseFloat(f.area_acres) || 0), 0);
  const activeCropsCount = farms.reduce((acc, f) => acc + (f.crops ? f.crops.length : 0), 0);
  const openIssuesCount = issues.filter(i => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;

  const handleReadSummary = () => {
    const weatherSummary = weather
      ? `${t('weatherTitle')}: ${weather.current.temp}°C, ${weather.spray_advisor.label_en}. ${weather.spray_advisor.advice_en}`
      : '';
    const alertSummary = alerts.length > 0 ? `Alert: ${alerts[0].title}. ${alerts[0].message}` : '';
    const textToRead = `${t('welcomeBack')}, ${user?.name}. ${weatherSummary} ${alertSummary}`;
    speakText(textToRead);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Agricultural Alerts Bar */}
      {alerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
          border: '1.5px solid #fecdd3',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fee2e2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.92rem' }}>
                {alerts[0].title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#881337', marginTop: '2px' }}>
                {alerts[0].message}
              </div>
            </div>
          </div>
          <button
            onClick={() => speakText(`${alerts[0].title}. ${alerts[0].message}`)}
            className="audio-readout-btn"
            style={{ padding: '6px 12px', fontSize: '0.78rem', flexShrink: 0 }}
          >
            <Volume2 size={14} />
            <span>{t('readAloud')}</span>
          </button>
        </div>
      )}

      {/* Hero Banner with Agro Landscape Motif */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Subtle background circles */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}>
              {user?.role ? user.role.replace('_', ' ') : 'FARMER PORTAL'}
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              📍 {user?.village || 'Tenali'}, {user?.district || 'Guntur'}
            </span>
          </div>

          <h1 style={{ color: 'white', fontSize: '1.9rem', marginBottom: '10px', fontWeight: 800 }}>
            {t('welcomeBack')}, {user?.name || 'Farmer'}! 🌾
          </h1>
          <p style={{ color: '#d1fae5', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '22px' }}>
            {t('heroDesc')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => onNavigateTab('issues')}
              className="btn btn-amber"
              style={{ padding: '10px 18px' }}
            >
              <AlertTriangle size={17} />
              <span>{t('reportIssueBtn')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('services')}
              className="btn btn-secondary"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <Tractor size={17} />
              <span>{t('bookService')}</span>
            </button>
            <button
              onClick={handleReadSummary}
              className="btn btn-secondary"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <Volume2 size={17} />
              <span>{t('readAloud')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-cols-4">
        {/* Acreage */}
        <div className="glass-card-interactive" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => onNavigateTab('farms')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statTotalAcreage')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalAcreage} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Acres</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)', marginTop: '4px', fontWeight: 600 }}>
            {farms.length} Plots Registered
          </div>
        </div>

        {/* Standing Crops */}
        <div className="glass-card-interactive" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => onNavigateTab('farms')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statActiveCrops')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {activeCropsCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Crops</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            Chilli, Paddy & Soybean
          </div>
        </div>

        {/* Disease / Health Tickets */}
        <div className="glass-card-interactive" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => onNavigateTab('issues')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statOpenIssues')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {openIssuesCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
            {issues.length - openIssuesCount} Resolved with Prescription
          </div>
        </div>

        {/* Service Bookings */}
        <div className="glass-card-interactive" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => onNavigateTab('services')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('statBookings')}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tractor size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {activeBookingsCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
            Subsidized Village Equipments
          </div>
        </div>
      </div>

      {/* Weather Snapshot + Spray Suitability Bar */}
      {weather && (
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudSun size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '1.15rem' }}>{t('weatherTitle')}</h3>
                <span className="verified-tag">
                  <CheckCircle2 size={12} />
                  {t('realSatelliteData')}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {weather.location} • Real-time satellite & agro-climatic readings
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('weather')}
              className="btn btn-outline btn-sm"
            >
              <span>{t('sevenDayForecast')}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Temp & Condition */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {weather.current.temp}°C
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {language === 'te' ? weather.current.condition_te : language === 'hi' ? weather.current.condition_hi : weather.current.condition_en}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Feels like {weather.current.feels_like}°C
                </div>
              </div>
            </div>

            {/* Spray Suitability Card */}
            <div style={{
              background: weather.spray_advisor.status === 'OPTIMAL' ? 'var(--primary-50)' : '#fffbeb',
              border: `1.5px solid ${weather.spray_advisor.status === 'OPTIMAL' ? 'var(--primary-500)' : '#f59e0b'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  SPRAY SUITABILITY
                </span>
                <span className={`badge ${weather.spray_advisor.status === 'OPTIMAL' ? 'badge-success' : 'badge-warning'}`}>
                  {language === 'te' ? weather.spray_advisor.label_te : language === 'hi' ? weather.spray_advisor.label_hi : weather.spray_advisor.label_en}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0 }}>
                {language === 'te' ? weather.spray_advisor.advice_te : language === 'hi' ? weather.spray_advisor.advice_hi : weather.spray_advisor.advice_en}
              </p>
            </div>

            {/* Humidity & Wind */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Droplets size={13} style={{ color: '#0284c7' }} />
                  {t('humidity')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {weather.current.humidity}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wind size={13} style={{ color: '#10b981' }} />
                  {t('windSpeed')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {weather.current.wind_speed} km/h
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Disease Tickets & Service Bookings */}
      <div className="grid-cols-2">
        {/* Recent Disease Tickets */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('cropIssuesTitle')}</h3>
            <button
              onClick={() => onNavigateTab('issues')}
              className="btn btn-outline btn-sm"
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {issues.slice(0, 3).map(iss => (
              <div
                key={iss.id}
                onClick={() => onNavigateTab('issues')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{iss.crop_name}</span>
                  <span className={`badge ${iss.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                    {iss.status === 'RESOLVED' ? t('statusResolved') : t('statusOpen')}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineClamp: 2 }}>
                  {iss.title}
                </div>
                {iss.expert_diagnosis && (
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    ✓ Prescribed by: {iss.expert_name || 'KVK Agronomist'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Government Schemes Highlight */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} style={{ color: 'var(--amber-600)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>{t('schemesTitle')}</h3>
            </div>
            <button
              onClick={() => onNavigateTab('schemes')}
              className="btn btn-outline btn-sm"
            >
              {t('checkEligibility')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { code: 'PM-KISAN', name: 'PM-KISAN Samman Nidhi', benefit: '₹6,000 / year', tag: 'Direct DBT Transfer' },
              { code: 'YSR-RB', name: 'Rythu Bharosa Input Subsidy', benefit: '₹13,500 / year', tag: 'State & Central Combined' },
              { code: 'SMAM-SUBSIDY', name: 'Farm Mechanization Subsidy', benefit: '40% - 50% Subsidy', tag: 'Tractors & Drones' }
            ].map(sch => (
              <div
                key={sch.code}
                onClick={() => onNavigateTab('schemes')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sch.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sch.tag}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-primary">{sch.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
