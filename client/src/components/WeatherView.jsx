import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  CloudSun,
  Droplets,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Calendar,
  CloudRain,
  Sun,
  ShieldAlert,
  Compass
} from 'lucide-react';

export function WeatherView() {
  const { t, language, speakText } = useLanguage();

  const [zone, setZone] = useState('guntur');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWeather = async (targetZone) => {
    try {
      setLoading(true);
      const res = await api.getWeatherForecast(targetZone);
      setWeather(res);
    } catch (err) {
      console.error('Weather load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(zone);
  }, [zone]);

  const handleReadWeather = () => {
    if (!weather) return;
    const cond = language === 'te' ? weather.current.condition_te : language === 'hi' ? weather.current.condition_hi : weather.current.condition_en;
    const sprayAdv = language === 'te' ? weather.spray_advisor.advice_te : language === 'hi' ? weather.spray_advisor.advice_hi : weather.spray_advisor.advice_en;
    const text = `${weather.location}. Temperature: ${weather.current.temp}°C, ${cond}. Wind speed: ${weather.current.wind_speed} km/h, Humidity: ${weather.current.humidity}%. Spray Advisory: ${sprayAdv}`;
    speakText(text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudSun size={26} style={{ color: '#0284c7' }} />
              {t('weatherTitle')}
            </h2>
            <span className="verified-tag">
              <CheckCircle2 size={13} />
              {t('realSatelliteData')}
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time agro-meteorological monitoring and chemical spray advisory index.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Zone Selector */}
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            className="form-select"
            style={{ minWidth: '220px', padding: '8px 12px', fontWeight: 600 }}
          >
            <option value="guntur">Guntur / Tenali (Andhra Pradesh)</option>
            <option value="warangal">Warangal (Telangana)</option>
            <option value="pune">Baramati / Pune (Maharashtra)</option>
            <option value="varanasi">Varanasi (Uttar Pradesh)</option>
            <option value="ludhiana">Ludhiana (Punjab)</option>
          </select>

          <button onClick={handleReadWeather} className="audio-readout-btn">
            <Volume2 size={15} />
            <span>{t('readAloud')}</span>
          </button>
        </div>
      </div>

      {loading && !weather ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          Loading satellite meteorological feed...
        </div>
      ) : weather ? (
        <>
          {/* Current Conditions & Spray Suitability Major Panel */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              {/* Temperature & Condition */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)'
                }}>
                  <Sun size={38} />
                </div>
                <div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>
                    {weather.current.temp}°C
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    {language === 'te' ? weather.current.condition_te : language === 'hi' ? weather.current.condition_hi : weather.current.condition_en}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Feels like {weather.current.feels_like}°C • Coordinates: {weather.lat}°, {weather.lon}°
                  </div>
                </div>
              </div>

              {/* Spray Suitability Hero Card */}
              <div style={{
                background: weather.spray_advisor.status === 'OPTIMAL' ? 'var(--primary-50)' : '#fffbeb',
                border: `2px solid ${weather.spray_advisor.status === 'OPTIMAL' ? 'var(--primary-600)' : '#f59e0b'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    SPRAY SUITABILITY INDEX
                  </span>
                  <span className={`badge ${weather.spray_advisor.status === 'OPTIMAL' ? 'badge-success' : 'badge-warning'}`}>
                    {language === 'te' ? weather.spray_advisor.label_te : language === 'hi' ? weather.spray_advisor.label_hi : weather.spray_advisor.label_en}
                  </span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: '1.5', margin: 0 }}>
                  {language === 'te' ? weather.spray_advisor.advice_te : language === 'hi' ? weather.spray_advisor.advice_hi : weather.spray_advisor.advice_en}
                </p>
              </div>

              {/* Meteorological Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={14} style={{ color: '#0284c7' }} />
                    {t('humidity')}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {weather.current.humidity}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wind size={14} style={{ color: '#10b981' }} />
                    {t('windSpeed')}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {weather.current.wind_speed} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>km/h</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CloudRain size={14} style={{ color: '#6366f1' }} />
                    Current Rain
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {weather.current.precipitation} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mm</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Compass size={14} style={{ color: '#f59e0b' }} />
                    Wind Direction
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {weather.current.wind_dir}°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary-600)' }} />
              {t('sevenDayForecast')}
            </h3>

            <div className="grid-cols-auto">
              {weather.daily.map((day, idx) => {
                const condition = language === 'te' ? day.condition_te : language === 'hi' ? day.condition_hi : day.condition_en;
                const isRainy = day.rain_prob > 35;

                return (
                  <div
                    key={day.date}
                    className="glass-panel"
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: idx === 0 ? 'var(--primary-50)' : 'var(--bg-card)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '0.9rem' }}>
                          {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </strong>
                        {idx === 0 && <span className="badge badge-success">Now</span>}
                      </div>

                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {condition}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{day.temp_max}°</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {day.temp_min}°C</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CloudRain size={12} style={{ color: isRainy ? '#0284c7' : 'inherit' }} />
                          <span>Rain Chance: <strong style={{ color: isRainy ? '#0284c7' : 'inherit' }}>{day.rain_prob}%</strong> ({day.precip_mm}mm)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wind size={12} />
                          <span>Max Wind: {day.wind_max} km/h</span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: day.rain_prob > 40 ? '#fef2f2' : 'var(--bg-card-subtle)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: day.rain_prob > 40 ? '#b91c1c' : 'var(--primary-700)',
                      textAlign: 'center'
                    }}>
                      {day.rain_prob > 40 ? '⚠️ Rain Risk (No Spray)' : '✓ Safe for Field Work'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
