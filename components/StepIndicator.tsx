import React from 'react';
import { useTranslations, StepId } from '../translations';
import { useLanguage } from '../contexts/LanguageContext';

interface StepIndicatorProps {
  current: StepId;
}

const steps: StepId[] = ['input', 'processing', 'results', 'refine'];

const StepIndicator: React.FC<StepIndicatorProps> = ({ current }) => {
  const { language } = useLanguage();
  const t = useTranslations();
  const isRTL = language === 'ar';

  return (
    <div className={`flex flex-wrap items-center gap-4 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = steps.indexOf(current) === index;
        const completed = steps.indexOf(current) > index;
        const textSpacing = isRTL ? 'mr-3 text-right' : 'ml-3 text-left';
        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border ${
                active
                  ? 'bg-primary-500 text-white border-primary-500'
                  : completed
                  ? 'bg-primary-800/40 text-primary-200 border-primary-700/70'
                  : 'bg-gray-800 text-slate-400 border-gray-600'
              }`}
            >
              {stepNumber}
            </div>
            <div className={textSpacing}>
              <p className="text-xs uppercase tracking-wide text-slate-400">{t.steps[step].label}</p>
              <p className="text-sm font-medium text-slate-100">{t.steps[step].title}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-3 h-px w-10 ${completed ? 'bg-primary-500' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
