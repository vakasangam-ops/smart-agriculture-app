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
  X,
  LogIn,
  LogOut,
  UserPlus,
  User,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenVoiceAssistant }) {
  const { user, login, register, switchRole, logout } = useAuth();
  const { language, setLanguage, t, isSpeaking, stopSpeaking } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('profile'); // 'login' | 'register' | 'roles' | 'profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'FARMER',
    village: 'Tenali',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    language: 'en'
  });
  const [authMsg, setAuthMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: '', type: '' });
    if (!loginPhone || !loginPassword) {
      setAuthMsg({ text: 'Please enter phone/email and password', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await login(loginPhone, loginPassword);
      setAuthMsg({ text: 'Logged in successfully!', type: 'success' });
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthMsg({ text: '', type: '' });
      }, 1000);
    } catch (err) {
      setAuthMsg({ text: err.message || 'Login failed. Please verify credentials.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: '', type: '' });
    if (!regData.name || !regData.phone || !regData.password) {
      setAuthMsg({ text: 'Name, phone number, and password are required', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await register({ ...regData, language });
      setAuthMsg({ text: 'Account registered & logged in!', type: 'success' });
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthMsg({ text: '', type: '' });
      }, 1000);
    } catch (err) {
      setAuthMsg({ text: err.message || 'Registration failed. Try a different phone number.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthTab('login');
    setAuthMsg({ text: 'Logged out successfully.', type: 'success' });
  };

  const roles = [
    { id: 'FARMER', label: t('roleFarmer'), icon: Tractor, desc: 'Crop logs, issues, equipment bookings, mandi prices' },
    { id: 'SERVICE_CENTER_STAFF', label: t('roleStaff'), icon: Briefcase, desc: 'Manage rentals, soil health tests, verify schemes' },
    { id: 'AGRI_EXPERT', label: t('roleExpert'), icon: FlaskConical, desc: 'Diagnose disease tickets, prescribe treatments' },
    { id: 'ADMIN', label: t('roleAdmin'), icon: Shield, desc: 'System KPIs, user directory, broadcast alerts' }
  ];

  const openModal = (tab = 'profile') => {
    setAuthTab(user ? tab : 'login');
    setAuthMsg({ text: '', type: '' });
    setShowAuthModal(true);
  };

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

            {/* Account & Role Switcher Button */}
            <button
              id="btn-auth-account"
              onClick={() => openModal(user ? 'profile' : 'login')}
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
                {user ? `${user.name.split(' ')[0]} (${user.role.replace('_', ' ')})` : 'Sign In / Roles'}
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

      {/* Unified Auth & Role Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sprout size={22} style={{ color: 'var(--primary-600)' }} />
                  {authTab === 'login' && 'Sign In to Krishi Sahayak'}
                  {authTab === 'register' && 'Farmer Registration'}
                  {authTab === 'roles' && 'Quick Role Switcher'}
                  {authTab === 'profile' && 'User Account Profile'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Secure agricultural access across web and mobile
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowAuthModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Tab navigation within modal */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              {user && (
                <button
                  className={`btn btn-sm ${authTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAuthTab('profile')}
                >
                  <User size={14} style={{ marginRight: '4px' }} /> Profile
                </button>
              )}
              <button
                className={`btn btn-sm ${authTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAuthTab('roles')}
              >
                <UserCheck size={14} style={{ marginRight: '4px' }} /> Demo Roles
              </button>
              <button
                className={`btn btn-sm ${authTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAuthTab('login')}
              >
                <LogIn size={14} style={{ marginRight: '4px' }} /> Sign In
              </button>
              <button
                className={`btn btn-sm ${authTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAuthTab('register')}
              >
                <UserPlus size={14} style={{ marginRight: '4px' }} /> Register
              </button>
            </div>

            {/* Alert banner */}
            {authMsg.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                background: authMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: authMsg.type === 'success' ? '#047857' : '#b91c1c',
                border: `1px solid ${authMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {authMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{authMsg.text}</span>
              </div>
            )}

            {/* PROFILE TAB */}
            {authTab === 'profile' && user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 800
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {user.phone} {user.email ? `• ${user.email}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span className="badge badge-success">{user.role}</span>
                      <span className="badge badge-info">{user.village}, {user.district}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setAuthTab('roles')}
                  >
                    Switch Stakeholder Role
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} style={{ marginRight: '6px' }} /> Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN TAB */}
            {authTab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Phone Number or Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 9876543210 or demo@krishi.org"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password (e.g. Farmer@123)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Demo Accounts: <code>9876543210</code> / <code>Farmer@123</code> or switch to <b>Demo Roles</b> tab.
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '6px' }}>
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* REGISTER TAB */}
            {authTab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Venkata Rao"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit mobile"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create password"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-control"
                      value={regData.role}
                      onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                    >
                      <option value="FARMER">Farmer (రైతు)</option>
                      <option value="SERVICE_CENTER_STAFF">Service Center Staff</option>
                      <option value="AGRI_EXPERT">Agriculture Expert</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Village / Mandal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regData.village}
                      onChange={(e) => setRegData({ ...regData, village: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regData.district}
                      onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
                  {submitting ? 'Registering Account...' : 'Complete Registration & Sign In'}
                </button>
              </form>
            )}

            {/* DEMO ROLES TAB */}
            {authTab === 'roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roles.map(r => {
                  const Icon = r.icon;
                  const isCurrent = user?.role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setShowAuthModal(false);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                        background: isCurrent ? 'var(--primary-50)' : 'var(--bg-card-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isCurrent ? 'var(--primary-600)' : 'var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrent ? 'white' : 'var(--text-muted)'
                      }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>{r.label}</strong>
                          {isCurrent && <span className="badge badge-success">ACTIVE</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {r.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

