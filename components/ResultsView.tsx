import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { JobQueueItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import ResultsSummaryPanel from './ResultsSummaryPanel';
import ResumePreviewPanel from './ResumePreviewPanel';

const ResultsView: React.FC<{
    job: JobQueueItem;
    onBack: () => void;
    onRefine: (jobId: string, instructions: string) => Promise<void>;
}> = ({ job, onBack, onRefine }) => {
    const { language } = useLanguage();
    const t = useTranslations();
    const isRTL = language === 'ar';
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const handleRefineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!refineInstructions.trim()) {
            setError(t.instructionsError);
            return;
        }
        setError(null);
        setIsRefining(true);
        await onRefine(job.id, refineInstructions);
        setIsRefining(false);
        setRefineInstructions('');
    };

    return (
        <div className={`flex flex-col space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div>
                <Button onClick={onBack} variant="secondary">
                    {t.backToDashboard}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:items-start">
                {/* Left Panel - Refine */}
                <Card className="sticky md:col-span-2 top-8">
                    <form onSubmit={handleRefineSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">{t.steps.refine.label}</p>
                            <h2 className="text-lg font-semibold text-slate-100">{t.steps.refine.title}</h2>
                        </div>
                        <p className="text-sm text-slate-400">
                            {t.refineDescription}
                        </p>
                        <textarea
                            value={refineInstructions}
                            onChange={e => { setRefineInstructions(e.target.value); setError(null); }}
                            rows={5}
                            placeholder={t.refinePlaceholder}
                            className="block w-full text-sm bg-gray-700 text-slate-200 border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
                            required
                        />
                         {error && <p className="text-sm text-red-400">{error}</p>}
                        <Button
                            type="submit"
                            isLoading={isRefining || job.status === 'processing'}
                            className="w-full"
                        >
                           {job.status === 'processing' ? t.refiningButton : t.refineButton}
                        </Button>
                    </form>
                </Card>

                {/* Right Panel - Results Document */}
                <div className="md:col-span-3 p-8 bg-white rounded-lg shadow-lg">
                    {job.result ? (
                        <div className="space-y-6">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{t.steps.results.label}</p>
                                    <h3 className="text-2xl font-semibold text-slate-900">{t.steps.results.title}</h3>
                                </div>
                                <div className="px-4 py-2 bg-primary-50 rounded-lg text-primary-700 font-semibold">
                                    {t.matchScoreLabel}: {job.result.score}%
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAnalysis(prev => !prev)}
                                    className="px-4 py-2 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    {showAnalysis ? t.analysisHide : t.analysisShow}
                                </button>
                            </div>
                            {showAnalysis && (
                                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                                    <ResultsSummaryPanel result={job.result} isRTL={isRTL} t={t} />
                                </div>
                            )}
                            <ResumePreviewPanel result={job.result} isRTL={isRTL} t={t} />
                        </div>
                    ) : (
                         <div className="py-24 text-center text-slate-500">
                             <p className="font-semibold">{t.resultsGenerating}</p>
                             <p className="text-sm">{t.resultsGeneratingSub}</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsView;
