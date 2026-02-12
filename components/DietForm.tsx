'use client';

import { useState, useEffect } from 'react';
import MealPlanResult from './MealPlanResult';
import DietRulesPanel from './DietRulesPanel';
import { getDialectsForCulture, getDefaultLanguageCode } from '@/lib/languages';

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
  const [culture, setCulture] = useState('');
  const [dialect, setDialect] = useState<{ name: string; code: string } | null>(null);
  const [availableDialects, setAvailableDialects] = useState<{ name: string; code: string }[] | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [mealPlan, setMealPlan] = useState('');
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
    return culture;
  };

  const handleGenerate = async () => {
    if (!culture.trim()) {
      setError('Please enter your cultural background');
      return;
    }

    setLoading(true);
    setError('');
    setMealPlan('');

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

    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <img
          src="/speechmed-logo.png"
          alt="SpeechMED+GI Logo"
          className="h-20 mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-2 text-emerald-800">Multilingual Low-Residue Diet Checker for Colonoscopy Prep</h1>
        <p className="text-gray-600 text-lg">
          Culturally relevant meal suggestions for your colonoscopy or endoscopy prep
        </p>
        <p className="text-sm text-gray-600 mt-4 max-w-2xl mx-auto text-left">
          Confusion about what foods are allowed during a low-residue diet in the 3–5 days before a colonoscopy is a common barrier to successful preparation, particularly for patients with limited English proficiency. With food insecurity affecting many patients, this multilingual, AI-powered diet checker is designed to meet people where they are by allowing patients and caregivers to look up foods and receive plain-language guidance on whether they are appropriate before a colonoscopy. The tool supports patient understanding, reduces diet-related errors, and helps improve screening completion. Patients and caregivers are encouraged to print the accompanying guide and keep it in the kitchen as a daily reference during preparation.
        </p>
        <p className="text-sm text-gray-600 mt-3 max-w-2xl mx-auto text-left">
          This tool is part of <strong>SpeechMED+GI&apos;s</strong> work to improve colonoscopy preparation through plain-language, multilingual, and caregiver-friendly support.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Culture Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            What is your cultural background?
          </label>
          <input
            type="text"
            value={culture}
            onChange={(e) => setCulture(e.target.value)}
            placeholder="e.g., Korean, South Indian, Mexican, Nigerian..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
          {/* Quick Select */}
          <div className="mt-3 flex flex-wrap gap-2">
            {popularCultures.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCultureSelect(c)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
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
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Preferred language for translation & audio
            </label>
            <select
              value={dialect?.code || ''}
              onChange={(e) => {
                const selected = availableDialects.find(d => d.code === e.target.value);
                setDialect(selected || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

        {/* Dietary Restrictions */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Any additional dietary restrictions? (optional)
          </label>
          <input
            type="text"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g., vegetarian, lactose intolerant, halal, no shellfish..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {loading ? 'Generating Your Meal Plan...' : 'Generate Culturally Relevant Meals'}
        </button>

        {/* Diet Rules Toggle */}
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full mt-4 py-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          {showRules ? 'Hide' : 'Show'} Low-Residue Diet Rules
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
        />
      )}

      {/* About this resource */}
      <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-emerald-800 font-semibold mb-2">About this resource</p>
        <p className="text-sm text-emerald-700">
          This tool was developed by <strong>SpeechMED+GI</strong> to help patients and caregivers navigate colonoscopy preparation with greater clarity and confidence.
        </p>
        <a
          href="https://www.speechmed.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-emerald-600 hover:text-emerald-800 underline"
        >
          Learn more about SpeechMED+GI
        </a>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Medical Disclaimer:</strong> This tool provides general dietary suggestions based on standard low-residue diet guidelines. Always follow your doctor's specific instructions for your procedure. Individual requirements may vary.
        </p>
      </div>
    </div>
  );
}
