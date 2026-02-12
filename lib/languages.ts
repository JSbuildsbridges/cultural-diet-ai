// Cultures with multiple dialects/languages
export const cultureDialects: Record<string, { name: string; code: string }[]> = {
  chinese: [
    { name: 'Mandarin (Simplified)', code: 'zh-CN' },
    { name: 'Cantonese', code: 'zh-HK' },
    { name: 'Mandarin (Traditional/Taiwan)', code: 'zh-TW' },
  ],
  indian: [
    { name: 'Hindi', code: 'hi-IN' },
    { name: 'Tamil', code: 'ta-IN' },
    { name: 'Telugu', code: 'te-IN' },
    { name: 'Bengali', code: 'bn-IN' },
    { name: 'Gujarati', code: 'gu-IN' },
    { name: 'Marathi', code: 'mr-IN' },
    { name: 'Punjabi', code: 'pa-IN' },
    { name: 'Malayalam', code: 'ml-IN' },
    { name: 'Kannada', code: 'kn-IN' },
  ],
  filipino: [
    { name: 'Tagalog', code: 'tl-PH' },
    { name: 'Cebuano', code: 'ceb-PH' },
    { name: 'Ilocano', code: 'ilo-PH' },
  ],
  'middle eastern': [
    { name: 'Arabic', code: 'ar-SA' },
    { name: 'Farsi (Persian)', code: 'fa-IR' },
    { name: 'Hebrew', code: 'he-IL' },
    { name: 'Turkish', code: 'tr-TR' },
  ],
  spanish: [
    { name: 'Spanish (Spain)', code: 'es-ES' },
    { name: 'Spanish (Mexico)', code: 'es-MX' },
    { name: 'Spanish (Argentina)', code: 'es-AR' },
  ],
  portuguese: [
    { name: 'Portuguese (Brazil)', code: 'pt-BR' },
    { name: 'Portuguese (Portugal)', code: 'pt-PT' },
  ],
  african: [
    { name: 'Swahili', code: 'sw-KE' },
    { name: 'Amharic', code: 'am-ET' },
    { name: 'Yoruba', code: 'yo-NG' },
    { name: 'Zulu', code: 'zu-ZA' },
    { name: 'Hausa', code: 'ha-NG' },
  ],
};

// Default language codes for cultures without dialect options
export const defaultLanguageCodes: Record<string, string> = {
  korean: 'ko-KR',
  japanese: 'ja-JP',
  vietnamese: 'vi-VN',
  thai: 'th-TH',
  mexican: 'es-MX',
  italian: 'it-IT',
  french: 'fr-FR',
  german: 'de-DE',
  russian: 'ru-RU',
  greek: 'el-GR',
  polish: 'pl-PL',
  dutch: 'nl-NL',
  ethiopian: 'am-ET',
  indonesian: 'id-ID',
  malaysian: 'ms-MY',
  cambodian: 'km-KH',
  burmese: 'my-MM',
  nepali: 'ne-NP',
  mongolian: 'mn-MN',
  tibetan: 'bo-CN',
  ukrainian: 'uk-UA',
  czech: 'cs-CZ',
  hungarian: 'hu-HU',
  romanian: 'ro-RO',
  swedish: 'sv-SE',
  norwegian: 'no-NO',
  danish: 'da-DK',
  finnish: 'fi-FI',
};

export function getDialectsForCulture(culture: string): { name: string; code: string }[] | null {
  const normalized = culture.toLowerCase().trim();
  return cultureDialects[normalized] || null;
}

export function getDefaultLanguageCode(culture: string): string {
  const normalized = culture.toLowerCase().trim();
  return defaultLanguageCodes[normalized] || 'en-US';
}
