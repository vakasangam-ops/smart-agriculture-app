import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  Languages,
  UserCheck,
  Volume2,
  VolumeX,
  Mic,
  Moon,
  Sun,
  Shield,
  Briefcase,
  FlaskConical,
  Tractor,
  Menu,
  X
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenVoiceAssistant }) {
  const { user, switchRole, logout } = useAuth();
  const { language, setLanguage, t, isSpeaking, stopSpeaking } = useLanguage();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const roles = [
    { id: 'FARMER', label: t('roleFarmer'), icon: Tractor, desc: 'Crop logs, issues, equipment bookings, mandi prices' },
    { id: 'SERVICE_CENTER_STAFF', label: t('roleStaff'), icon: Briefcase, desc: 'Manage rentals, soil health tests, verify schemes' },
    { id: 'AGRI_EXPERT', label: t('roleExpert'), icon: FlaskConical, desc: 'Diagnose disease tickets, prescribe treatments' },
    { id: 'ADMIN', label: t('roleAdmin'), icon: Shield, desc: 'System KPIs, user directory, broadcast alerts' }
  ];

  return (
    <>
      <header style={{
        background: 'var(--bg-card-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #15803d, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(21, 128, 61, 0.35)'
            }}>
              <Sprout size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {t('appName')}
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                  {language === 'te' ? 'రైతు సేవ' : language === 'hi' ? 'किसान सेवा' : 'v1.0'}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('appSubtitle')}
              </div>
            </div>
          </div>

          {/* Center / Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Voice Assistant Launcher */}
            <button
              id="btn-voice-assistant"
              onClick={onOpenVoiceAssistant}
              className="btn btn-secondary btn-sm"
              title="Voice Guidance / Speech Assistant"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-700)' }}
            >
              <Mic size={16} />
              <span className="hide-mobile">{t('voiceGuidance')}</span>
            </button>

            {/* Read Aloud Controller */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="audio-readout-btn speaking"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <VolumeX size={15} />
                <span>{t('stopAudio')}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-card-subtle)', padding: '4px 6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Languages size={15} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
              <select
                id="select-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="en">English (US)</option>
              </select>
            </div>

            {/* Current Role & Switcher Button */}
            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1.5px solid var(--primary-600)',
                background: 'var(--primary-50)'
              }}
            >
              <UserCheck size={16} style={{ color: 'var(--primary-700)' }} />
              <span style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: '0.82rem' }}>
                {user ? user.role.replace('_', ' ') : 'Role'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title="Toggle Dark / Light Theme"
              style={{ cursor: 'pointer' }}
            >
              {isDarkMode ? <Sun size={17} style={{ color: '#f59e0b' }} /> : <Moon size={17} />}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn-icon show-mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Bar */}
        <nav style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'dashboard', label: t('navDashboard') },
            { id: 'farms', label: t('navFarms') },
            { id: 'issues', label: t('navIssues') },
            { id: 'services', label: t('navServices') },
            { id: 'schemes', label: t('navSchemes') },
            { id: 'market', label: t('navMarket') },
            { id: 'weather', label: t('navWeather') },
            { id: 'finances', label: t('navFinances') },
            ...(user && ['ADMIN', 'SERVICE_CENTER_STAFF', 'AGRI_EXPERT'].includes(user.role)
              ? [{ id: 'admin', label: t('navAdmin') }]
              : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 14px',
                fontSize: '0.88rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary-600)' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Role Switcher Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} style={{ color: 'var(--primary-600)' }} />
                  {t('switchRole')}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Experience Krishi Sahayak from each real-world stakeholder perspective.
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowRoleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roles.map(r => {
                const Icon = r.icon;
                const isCurrent = user?.role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      switchRole(r.id);
                      setShowRoleModal(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      background: isCurrent ? 'var(--primary-50)' : 'var(--bg-card-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isCurrent ? 'var(--primary-600)' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCurrent ? 'white' : 'var(--text-muted)'
                    }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.96rem' }}>{r.label}</strong>
                        {isCurrent && <span className="badge badge-success">ACTIVE</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {r.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
