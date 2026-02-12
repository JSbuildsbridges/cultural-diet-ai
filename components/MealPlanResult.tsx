'use client';

import { useState, useEffect } from 'react';

interface MealPlanResultProps {
  mealPlan: string;
  culture: string;
  languageCode: string;
  languageName: string;
}

export default function MealPlanResult({ mealPlan, culture, languageCode, languageName }: MealPlanResultProps) {
  const [copied, setCopied] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedPlan, setTranslatedPlan] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'native'>('en');

  // Stop speech when component unmounts or meal plan changes
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [mealPlan]);

  const copyToClipboard = async () => {
    const textToCopy = showTranslated && translatedPlan ? translatedPlan : mealPlan;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    const content = showTranslated && translatedPlan ? translatedPlan : mealPlan;

    // Convert markdown-style text to HTML for printing
    const htmlContent = content
      .split('\n')
      .map(line => {
        if (line.startsWith('## ')) {
          return `<h2 style="font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #065f46;">${line.replace('## ', '')}</h2>`;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<h3 style="font-size: 16px; font-weight: 600; margin-top: 12px; margin-bottom: 6px; color: #047857;">${line.replace(/\*\*/g, '')}</h3>`;
        }
        if (line.includes('**')) {
          const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return `<p style="margin-bottom: 6px; color: #374151;">${formatted}</p>`;
        }
        if (/^\d+\./.test(line)) {
          return `<p style="margin-bottom: 6px; margin-left: 16px; color: #374151;">${line}</p>`;
        }
        if (!line.trim()) {
          return '<div style="height: 8px;"></div>';
        }
        return `<p style="margin-bottom: 6px; color: #374151;">${line}</p>`;
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download the meal plan');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${culture} Meal Plan - Low-Residue Diet</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              font-size: 14px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #059669;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 22px;
              color: #065f46;
              margin: 0 0 8px 0;
            }
            .header p {
              color: #6b7280;
              margin: 0;
              font-size: 13px;
            }
            .content {
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #d1d5db;
              font-size: 11px;
              color: #6b7280;
            }
            .disclaimer {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 12px;
              border-radius: 6px;
              margin-top: 16px;
              font-size: 12px;
              color: #92400e;
            }
            .about {
              background: #ecfdf5;
              border: 1px solid #059669;
              padding: 12px;
              border-radius: 6px;
              margin-top: 16px;
              font-size: 12px;
              color: #065f46;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${culture} Low-Residue Meal Plan</h1>
            <p>For Colonoscopy/Endoscopy Preparation</p>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="about">
            This meal plan was generated using the Multilingual Low-Residue Diet Checker, part of <strong>SpeechMED+GI's</strong> work to improve colonoscopy preparation through plain-language, multilingual, and caregiver-friendly support. Learn more about SpeechMED+GI at <strong>speechmed.com</strong>
          </div>
          <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> This provides general dietary suggestions based on standard low-residue diet guidelines. Always follow your doctor's specific instructions for your procedure.
          </div>
          <div class="footer">
            ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleTranslate = async () => {
    if (translatedPlan) {
      setShowTranslated(!showTranslated);
      return;
    }

    setTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mealPlan, languageName }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslatedPlan(data.translatedText);
      setShowTranslated(true);
    } catch (err) {
      console.error('Failed to translate:', err);
    } finally {
      setTranslating(false);
    }
  };

  const checkVoiceAvailable = (langCode: string): boolean => {
    const voices = window.speechSynthesis.getVoices();
    return voices.some(voice => voice.lang.startsWith(langCode.split('-')[0]));
  };

  const speakText = (lang: 'en' | 'native') => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    const targetLangCode = lang === 'native' ? languageCode : 'en-US';

    // Check if voice is available for native language
    if (lang === 'native' && targetLangCode === 'en-US') {
      alert(`Sorry, text-to-speech for ${languageName} is not available. The translation is still shown above.`);
      return;
    }

    if (lang === 'native' && !checkVoiceAvailable(targetLangCode)) {
      alert(`Sorry, text-to-speech for ${languageName} (${targetLangCode}) is not available in your browser. Try using Google Chrome for more language support, or use the translation text above.`);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const textToSpeak = lang === 'native' && translatedPlan ? translatedPlan : mealPlan;
    // Clean up markdown for better speech
    const cleanText = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLangCode;
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setSpeaking(true);
      setCurrentLang(lang);
    };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  // Simple markdown-like rendering
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-emerald-800">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-emerald-700">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-2 text-gray-700">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
              }
              if (part.includes('*(') && part.includes(')*')) {
                const italicParts = part.split(/(\*\(.*?\)\*)/g);
                return italicParts.map((ip, j) => {
                  if (ip.startsWith('*(') && ip.endsWith(')*')) {
                    return (
                      <span key={j} className="text-emerald-600 italic text-sm">
                        {ip.replace(/\*\(|\)\*/g, '(')}
                      </span>
                    );
                  }
                  return ip;
                });
              }
              return part;
            })}
          </p>
        );
      }
      if (/^\d+\./.test(line)) {
        return (
          <p key={index} className="mb-2 ml-4 text-gray-700">
            {line}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="mb-2 text-gray-700">
          {line}
        </p>
      );
    });
  };

  const displayedContent = showTranslated && translatedPlan ? translatedPlan : mealPlan;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header with buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-emerald-800">
          Your {culture} Meal Plan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Language & Audio Controls */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
        {/* Language Toggle */}
        <button
          onClick={handleTranslate}
          disabled={translating}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            showTranslated
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {translating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {showTranslated ? 'Show English' : `Show in ${languageName}`}
            </>
          )}
        </button>

        {/* Speak English */}
        <button
          onClick={() => speaking && currentLang === 'en' ? stopSpeaking() : speakText('en')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            speaking && currentLang === 'en'
              ? 'bg-red-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          {speaking && currentLang === 'en' ? 'Stop' : 'Read in English'}
        </button>

        {/* Speak Native Language */}
        <button
          onClick={() => {
            if (speaking && currentLang === 'native') {
              stopSpeaking();
            } else {
              if (!translatedPlan) {
                handleTranslate().then(() => speakText('native'));
              } else {
                speakText('native');
              }
            }
          }}
          disabled={translating}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            speaking && currentLang === 'native'
              ? 'bg-red-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          {speaking && currentLang === 'native' ? 'Stop' : `Read in ${languageName}`}
        </button>
      </div>

      {/* Meal Plan Content */}
      <div className="prose max-w-none">
        {formatContent(displayedContent)}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <p className="text-sm text-emerald-700">
          <strong>Tip:</strong> Print or save this meal plan and share it with family members who might be helping you prepare food during your prep period.
        </p>
      </div>
    </div>
  );
}
