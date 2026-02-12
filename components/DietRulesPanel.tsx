import { dietRules } from '@/lib/diet-rules';

export default function DietRulesPanel() {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3">Low-Residue Diet Guidelines</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Allowed Foods */}
        <div>
          <h4 className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Allowed Foods
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {dietRules.allowed.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to Avoid */}
        <div>
          <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Foods to Avoid
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {dietRules.avoid.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-blue-700 mb-2">Helpful Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {dietRules.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
