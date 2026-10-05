import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FarmsView } from './components/FarmsView';
import { CropIssuesView } from './components/CropIssuesView';
import { ServicesView } from './components/ServicesView';
import { SchemesView } from './components/SchemesView';
import { MarketPricesView } from './components/MarketPricesView';
import { WeatherView } from './components/WeatherView';
import { FinancesView } from './components/FinancesView';
import { AdminView } from './components/AdminView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import {
  Mic,
  Home,
  Sprout,
  AlertTriangle,
  Tractor,
  TrendingUp,
  CloudSun,
  DollarSign
} from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [targetCropForIssue, setTargetCropForIssue] = useState(null);

  const handleReportIssueForCrop = (crop) => {
    setTargetCropForIssue(crop);
    setActiveTab('issues');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVoiceAssistant={() => setVoiceModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px 80px',
        flex: 1
      }}>
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'farms' && (
          <FarmsView onReportIssueForCrop={handleReportIssueForCrop} />
        )}
        {activeTab === 'issues' && (
          <CropIssuesView initialCrop={targetCropForIssue} />
        )}
        {activeTab === 'services' && (
          <ServicesView />
        )}
        {activeTab === 'schemes' && (
          <SchemesView />
        )}
        {activeTab === 'market' && (
          <MarketPricesView />
        )}
        {activeTab === 'weather' && (
          <WeatherView />
        )}
        {activeTab === 'finances' && (
          <FinancesView />
        )}
        {activeTab === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* Interactive Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setVoiceModalOpen(false);
        }}
      />

      {/* Floating Rural Voice Assistant Button for Illiterate/Low-Literacy Farmers */}
      <button
        id="floating-voice-button"
        onClick={() => setVoiceModalOpen(true)}
        aria-label="Launch Voice Guidance Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transition: 'all 0.2s ease',
          animation: 'pulse-speaking 2.5s infinite ease-in-out'
        }}
        title="Open Voice Guidance (శబ్ద మార్గదర్శి / वॉयस गाइड)"
      >
        <Mic size={28} />
      </button>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-card-subtle)',
        borderTop: '1px solid var(--border-color)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <strong>{t('appName')}</strong> — {t('appSubtitle')}
          </div>
          <div>
            Built with React, Node.js & PostgreSQL • Verified data feeds from e-NAM & Open-Meteo
          </div>
          <div>
            Disclaimers: Automated preliminary disease screenings are non-guaranteed AI tools. Final prescriptions must follow qualified agronomists.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
