import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/index.js';
import { voiceService } from '../services/voice.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('krishi_lang') || 'en';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('krishi_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const speakText = (text) => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    voiceService.speak(
      text,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const stopSpeaking = () => {
    voiceService.stop();
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speakText, stopSpeaking, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
