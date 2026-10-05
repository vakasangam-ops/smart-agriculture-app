import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { voiceService } from '../services/voice.js';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, HelpCircle } from 'lucide-react';

export function VoiceAssistantModal({ isOpen, onClose, onNavigateTab }) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);

  // Pre-configured multi-lingual agricultural voice intents
  const sampleQueries = {
    te: [
      { q: 'నేడు మిరప మార్కెట్ ధర ఎంత?', a: 'గుంటూరు మార్కెట్ యార్డులో తేజ ఎండుమిర్చి సగటు ధర క్వింటాలుకు ₹19,400 వద్ద పెరుగుతోంది.', tab: 'market' },
      { q: 'ఈ రోజు మందులు పిచికారీ చేయవచ్చా?', a: 'గాలి వేగం 11 కిలోమీటర్లు, వర్ష సూచన లేదు. సాయంత్రం 4:30 తర్వాత పిచికారీ చేయడానికి వాతావరణం అత్యంత అనుకూలంగా ఉంది.', tab: 'weather' },
      { q: 'రైతు భరోసా పథకానికి ఎలా దరఖాస్తు చేయాలి?', a: 'రైతు భరోసా కింద ఏడాదికి ₹13,500 అందుతుంది. మీ పట్టాదారు పాస్ పుస్తకం మరియు ఆధార్‌తో గ్రామ రైతు భరోసా కేంద్రంలో దరఖాస్తు చేసుకోవచ్చు.', tab: 'schemes' },
      { q: 'మిరపలో ఆకు ముడుత తెగులు నివారణ ఏమిటి?', a: 'తామర పురుగుల నివారణకు ఎకరానికి 20 పసుపు, నీలి జిగురు అట్టలు పెట్టండి. వేప నూనె 2.5 మిల్లీలీటర్లు లేదా డయాఫెంథియురాన్ 1.25 గ్రాములు లీటరు నీటికి పిచికారీ చేయండి.', tab: 'issues' }
    ],
    hi: [
      { q: 'आज मिर्च और सोयाबीन का मंडी भाव क्या है?', a: 'गुंटूर मंडी में तेजा लाल मिर्च ₹19,400 प्रति क्विंटल और लातूर मंडी में सोयाबीन ₹4,560 प्रति क्विंटल चल रहा है।', tab: 'market' },
      { q: 'क्या आज कीटनाशक छिड़काव कर सकते हैं?', a: 'मौसम साफ है और हवा की गति 11 किमी प्रति घंटा है। छिड़काव के लिए शाम 4:30 के बाद का समय अनुकूल है।', tab: 'weather' },
      { q: 'पीएम किसान सम्मान निधि की पात्रता क्या है?', a: 'सभी भूमिधारक किसान परिवार पात्र हैं। आपके आधार से बैंक खाता लिंक और ई-केवाईसी पूर्ण होना आवश्यक है।', tab: 'schemes' },
      { q: 'धान में ब्लास्ट रोग के लक्षण और बचाव?', a: 'धान की पत्तियों पर धुरी आकार के कत्थई धब्बे ब्लास्ट के लक्षण हैं। ट्राइसाइक्लाजोल 0.6 ग्राम प्रति लीटर पानी का छिड़काव करें।', tab: 'issues' }
    ],
    en: [
      { q: "What is today's chilli market price?", a: 'At Guntur e-NAM APMC, Teja Dry Chilli modal price is ₹19,400 per quintal with a rising trend.', tab: 'market' },
      { q: 'Is it safe to spray foliar chemicals today?', a: 'Conditions are optimal: wind speed is 11 km/h with low rain probability. Evening 4:30 to 6:30 PM is best.', tab: 'weather' },
      { q: 'How much subsidy is available for tractor rental?', a: 'At the Village Service Center, small and marginal farmers get a 50% subsidy, bringing the rate to ₹225/hour.', tab: 'services' },
      { q: 'How to manage leaf curl virus?', a: 'Leaf curl is spread by thrips and whiteflies. Install yellow sticky traps and apply Diafenthiuron or Neem-oil biopesticide.', tab: 'issues' }
    ]
  };

  const currentSamples = sampleQueries[language] || sampleQueries.en;

  const handleStartListening = () => {
    if (!voiceService.isRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setIsListening(true);
    setTranscript('Listening to your voice...');
    voiceService.listen(
      language,
      (text) => {
        setTranscript(text);
        setIsListening(false);
        processVoiceInput(text);
      },
      (err) => {
        setIsListening(false);
        setTranscript(`Could not recognize speech (${err}). Try selecting a sample question.`);
      },
      () => setIsListening(false)
    );
  };

  const processVoiceInput = (text) => {
    const lower = text.toLowerCase();
    let found = currentSamples.find(s => lower.includes(s.q.toLowerCase().slice(0, 10)) || s.q.toLowerCase().includes(lower));

    if (!found) {
      if (lower.includes('price') || lower.includes('mandi') || lower.includes('ధర') || lower.includes('भाव')) {
        found = currentSamples[0];
      } else if (lower.includes('weather') || lower.includes('spray') || lower.includes('వాతావరణ') || lower.includes('छिड़काव')) {
        found = currentSamples[1];
      } else if (lower.includes('scheme') || lower.includes('kisan') || lower.includes('పథకం') || lower.includes('योजना')) {
        found = currentSamples[2];
      } else {
        found = currentSamples[3];
      }
    }

    setResponse(found.a);
    speakAnswer(found.a);
    if (found.tab && onNavigateTab) {
      onNavigateTab(found.tab);
    }
  };

  const handleSelectSample = (sample) => {
    setTranscript(sample.q);
    setResponse(sample.a);
    speakAnswer(sample.a);
    if (sample.tab && onNavigateTab) {
      onNavigateTab(sample.tab);
    }
  };

  const speakAnswer = (answerText) => {
    setIsSpeakingResponse(true);
    voiceService.speak(
      answerText,
      language,
      () => setIsSpeakingResponse(true),
      () => setIsSpeakingResponse(false)
    );
  };

  const handleStopSpeaking = () => {
    voiceService.stop();
    setIsSpeakingResponse(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>{t('voiceGuidance')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'te' ? 'మీ ప్రశ్నను తెలుగులో అడగండి' : language === 'hi' ? 'अपनी बात हिंदी में पूछें' : 'Ask any farming query in English, Telugu, or Hindi'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Central Mic Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px'
        }}>
          <button
            onClick={isListening ? () => setIsListening(false) : handleStartListening}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #15803d, #059669)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 10px rgba(239, 68, 68, 0.25)' : '0 8px 20px rgba(21, 128, 61, 0.35)',
              transition: 'all 0.2s ease',
              transform: isListening ? 'scale(1.08)' : 'scale(1)'
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <div style={{ marginTop: '14px', fontWeight: 600, fontSize: '0.9rem', color: isListening ? '#dc2626' : 'var(--text-main)' }}>
            {isListening ? (language === 'te' ? 'మీ మాట వింటున్నాము...' : language === 'hi' ? 'आपकी बात सुन रहे हैं...' : 'Listening now...') : (language === 'te' ? 'మాట్లాడటానికి మైక్ నొక్కండి' : language === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap mic to speak your question')}
          </div>

          {transcript && (
            <div style={{
              margin: '12px 20px 0',
              padding: '8px 16px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Audio Response Card */}
        {response && (
          <div style={{
            background: 'var(--primary-50)',
            border: '1.5px solid var(--primary-500)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-success">KRISHI SAHAYAK ADVISORY</span>
              <button
                onClick={isSpeakingResponse ? handleStopSpeaking : () => speakAnswer(response)}
                className="audio-readout-btn"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                {isSpeakingResponse ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isSpeakingResponse ? t('stopAudio') : t('readAloud')}</span>
              </button>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--primary-900)', lineHeight: '1.5' }}>
              {response}
            </p>
          </div>
        )}

        {/* Suggested Queries */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={14} />
            {language === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు (నొక్కండి):' : language === 'hi' ? 'सुझाए गए प्रश्न (क्लिक करें):' : 'Suggested questions (click to ask):'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentSamples.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(item)}
                style={{
                  textAlign: 'left',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                👉 {item.q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
