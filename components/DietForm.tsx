'use client';

import { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import MealPlanResult from './MealPlanResult';
import DietRulesPanel from './DietRulesPanel';
import { getDialectsForCulture, getDefaultLanguageCode, getLanguageDisplayName } from '@/lib/languages';

const popularCultures = [
  'Korean',
  'Indian',
  'Mexican',
  'Chinese',
  'Filipino',
  'Vietnamese',
  'Japanese',
  'Middle Eastern',
  'Italian',
  'Ethiopian',
];

export default function DietForm() {
  const posthog = usePostHog();
  const [culture, setCulture] = useState('');
  const [dialect, setDialect] = useState<{ name: string; code: string } | null>(null);
  const [availableDialects, setAvailableDialects] = useState<{ name: string; code: string }[] | null>(null);
  const [userRole, setUserRole] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [referenceKey, setReferenceKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  // Check for dialects when culture changes
  useEffect(() => {
    const dialects = getDialectsForCulture(culture);
    setAvailableDialects(dialects);
    if (dialects && dialects.length > 0) {
      setDialect(dialects[0]); // Default to first dialect
    } else {
      setDialect(null);
    }
  }, [culture]);

  const handleCultureSelect = (c: string) => {
    setCulture(c);
    posthog.capture('culture_selected', { culture: c, method: 'quick-select' });
  };

  const getLanguageCode = (): string => {
    if (dialect) {
      return dialect.code;
    }
    return getDefaultLanguageCode(culture);
  };

  const getLanguageName = (): string => {
    if (dialect) {
      return dialect.name;
    }
    const code = getDefaultLanguageCode(culture);
    return getLanguageDisplayName(code, culture);
  };

  const handleGenerate = async () => {
    if (!culture.trim()) {
      setError('Please enter your cultural background');
      return;
    }

    setLoading(true);
    setError('');
    setMealPlan('');

    // Track culture as typed if not from quick-select
    if (!popularCultures.some(c => c.toLowerCase() === culture.toLowerCase())) {
      posthog.capture('culture_selected', { culture, method: 'typed' });
    }

    try {
      const response = await fetch('/api/generate-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culture,
          dietaryRestrictions,
          languageName: getLanguageName(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      setMealPlan(data.mealPlan);
      setReferenceKey(data.referenceKey ?? '');
      posthog.capture('meal_plan_generated', {
        culture,
        language_name: getLanguageName(),
        language_code: getLanguageCode(),
        dietary_restrictions: dietaryRestrictions || null,
        has_restrictions: !!dietaryRestrictions.trim(),
        user_role: userRole || null,
      });

    } catch (err) {
      setError('Something went wrong. Please try again.');
      posthog.capture('meal_plan_generation_error', { culture, error: String(err) });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
      {/* Compact Header */}
      <div className="text-center mb-4 sm:mb-6">
        <a href="https://speechmed.com/language/en/home-2/" target="_blank" rel="noopener noreferrer">
          <img
            src="/speechmed-logo.png"
            alt="SpeechMED+GI Logo"
            className="h-12 sm:h-16 mx-auto mb-2 sm:mb-3"
          />
        </a>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-800 leading-tight">
          Multilingual Low-Fiber Low-Residue Diet Checker (Beta)
        </h1>
        <p className="text-emerald-600 font-medium text-base sm:text-lg mt-1">
          for Colonoscopy Prep
        </p>
        <p className="text-gray-500 text-sm mt-1">
          ⚠️ Beta version — If a suggested food looks wrong or unsafe, please{' '}
          <a href="https://forms.gle/bkERVwZaCK4xiAd39" target="_blank" rel="noopener noreferrer" className="underline">fill out our feedback form</a>
        </p>
        <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl mx-auto leading-relaxed">
          Find culturally relevant low-residue meal ideas for the 3–5 days before colonoscopy or endoscopy — in the language and dialect you&apos;re most comfortable with.
        </p>

        {/* Feature Icons */}
        <div className="flex justify-center gap-4 sm:gap-6 mt-3 text-xs sm:text-sm text-gray-500">
          <span>🌎 Multiple languages</span>
          <span>🥗 Cultural meals</span>
          <span>🖨️ Printable guide</span>
        </div>

        {/* Micro Trust Line */}
        <p className="text-xs text-gray-400 mt-2">
          Educational guidance only. No personal information collected. Always follow your care team&apos;s instructions.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 mb-6">
        {/* Culture Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            What is your cultural background?
          </label>
          <input
            type="text"
            value={culture}
            onChange={(e) => setCulture(e.target.value)}
            placeholder="e.g., Korean, South Indian, Mexican, Nigerian..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            disabled={loading}
          />
          {/* Quick Select */}
          <div className="mt-3 flex flex-wrap gap-2">
            {popularCultures.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCultureSelect(c)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  culture.toLowerCase() === c.toLowerCase()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Dialect Selection - Only shows when culture has multiple dialects */}
        {availableDialects && availableDialects.length > 0 && (
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Preferred language for translation & audio
            </label>
            <select
              value={dialect?.code || ''}
              onChange={(e) => {
                const selected = availableDialects.find(d => d.code === e.target.value);
                setDialect(selected || null);
                if (selected) {
                  posthog.capture('dialect_selected', {
                    culture,
                    dialect_name: selected.name,
                    dialect_code: selected.code,
                  });
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              disabled={loading}
            >
              {availableDialects.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This will be used for translating the meal plan and text-to-speech
            </p>
          </div>
        )}

        {/* User Role */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Are you using this for yourself or to help someone else? (optional)
          </label>
          <div className="flex gap-3">
            {[
              { value: 'self', label: 'For myself' },
              { value: 'caregiver', label: 'For a family member/caregiver role' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUserRole(userRole === option.value ? '' : option.value)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  userRole === option.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Any additional dietary restrictions? (optional)
          </label>
          <input
            type="text"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g., vegetarian, lactose intolerant, halal, no shellfish..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button - taller for thumb comfort */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-base sm:text-lg transition-all ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? 'Generating Your Meal Plan...' : 'Generate Culturally Relevant Meals'}
        </button>

        {/* Diet Rules Toggle */}
        <button
          onClick={() => {
            posthog.capture('diet_rules_toggled', { showing: !showRules });
            setShowRules(!showRules);
          }}
          className="w-full mt-3 py-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          {showRules ? 'Hide' : 'Show'} Low-Fiber Low-Residue Diet Rules
        </button>

        {showRules && <DietRulesPanel />}
      </div>

      {/* Results */}
      {mealPlan && (
        <MealPlanResult
          mealPlan={mealPlan}
          culture={culture}
          languageCode={getLanguageCode()}
          languageName={getLanguageName()}
          referenceKey={referenceKey}
        />
      )}

      {/* Why This Tool Exists - Collapsible */}
      <details className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <summary className="px-5 py-4 text-sm font-semibold text-emerald-800 cursor-pointer hover:bg-gray-50 rounded-xl">
          Why this tool exists
        </summary>
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3">
          <p>
            Confusion about what foods are allowed during a low-residue diet in the 3–5 days before a colonoscopy is a common barrier to successful preparation, particularly for patients with limited English proficiency. With food insecurity affecting many patients, this multilingual, AI-powered diet checker is designed to meet people where they are by allowing patients and caregivers to look up foods and receive plain-language guidance on whether they are appropriate before a colonoscopy.
          </p>
          <p>
            The tool supports patient understanding, reduces diet-related errors, and helps improve screening completion. Patients and caregivers are encouraged to print the accompanying guide and keep it in the kitchen as a daily reference during preparation.
          </p>
          <p>
            This tool is part of <strong>SpeechMED+GI&apos;s</strong> work to improve colonoscopy preparation through plain-language, multilingual, and caregiver-friendly support. Learn more at <a href="https://www.speechmed.com" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700 hover:text-emerald-900">speechmed.com</a> or contact us at <a href="mailto:GI@speechmed.com" className="underline text-emerald-700 hover:text-emerald-900">GI@speechmed.com</a>.
          </p>
        </div>
      </details>

      {/* About this resource */}
      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <p className="text-sm text-emerald-800 font-semibold mb-1">About this resource</p>
        <p className="text-sm text-emerald-700">
          Developed by <strong>SpeechMED+GI</strong> to help patients and caregivers navigate colonoscopy preparation with greater clarity and confidence. Does a food suggestion look wrong for your culture or diet?{' '}
          <a href="https://forms.gle/bkERVwZaCK4xiAd39" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 underline">Fill out our feedback form</a>{' '}
          and include your Reference code. We review every report.
        </p>
        <a
          href="https://www.speechmed.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-emerald-600 hover:text-emerald-800 underline"
        >
          Learn more about SpeechMED+GI
        </a>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Medical Disclaimer:</strong> This tool provides general dietary suggestions based on standard low-fiber low-residue diet guidelines for 3-5 days before your colonoscopy or endoscopy. After this phase, switch to clear liquids only on the day before your procedure. Always follow your doctor&apos;s specific instructions and prep schedule. Individual requirements may vary.
        </p>
      </div>
    </div>
  );
}
