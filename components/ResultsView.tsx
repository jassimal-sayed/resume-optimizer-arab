import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import type { JobQueueItem, JobRecord } from '../types';
import ExportButton from './ExportButton';
import ExtractedProfile from './ExtractedProfile';
import FeedbackPanel from './FeedbackPanel';
import ReliabilityDisplay from './ReliabilityDisplay';
import ResultsSummaryPanel from './ResultsSummaryPanel';
import ResumePreviewPanel from './ResumePreviewPanel';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const ResultsView: React.FC<{
    job: JobQueueItem;
    onBack: () => void;
    onRefine: (jobId: string, instructions: string) => Promise<void>;
}> = ({ job, onBack, onRefine }) => {
    const showRefineCard = true;
    const { language } = useLanguage();
    const t = useTranslations();
    const isRTL = language === 'ar';
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'profile' | 'feedback'>('preview');
    const gridColumns = showRefineCard ? 'md:grid-cols-5' : 'md:grid-cols-1';
    const resultsColSpan = showRefineCard ? 'md:col-span-3' : 'md:col-span-1';

    const handleQuickActionSelect = (instruction: string) => {
        setRefineInstructions(prev => {
            if (!prev.trim()) {
                return instruction;
            }

            const needsSeparator = !prev.endsWith('\n');
            return `${prev}${needsSeparator ? '\n' : ''}${instruction}`;
        });
        setError(null);
    };

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

    // Create a mock JobRecord for ExportButton compatibility
    const jobRecord: JobRecord | null = job ? {
        id: job.id,
        title: job.title,
        status: job.status,
        result: job.result,
        company: job.metadata?.company || null,
        resumeLang: job.metadata?.resumeLang || 'en',
        jdLang: job.metadata?.jobDescriptionLang || 'en',
        desiredOutputLang: job.metadata?.desiredOutputLang || 'en',
    } as unknown as JobRecord : null;

    const TabButton: React.FC<{ tab: typeof activeTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === tab
                    ? 'bg-white text-slate-900 border-b-2 border-primary-500'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className={`flex flex-col space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <Button onClick={onBack} variant="secondary">
                    {t.backToDashboard}
                </Button>
                {job.result && <ExportButton job={jobRecord} result={job.result} />}
            </div>

            {/* Reliability Metrics */}
            {job.result && <ReliabilityDisplay result={job.result} />}

            <div className={`grid grid-cols-1 gap-8 ${gridColumns} md:items-start`}>
                {/* Left Panel - Refine (commented out for now; set showRefineCard=true to restore) */}
                {showRefineCard && (
                    <Card className="sticky md:col-span-2 top-8">
                        <form onSubmit={handleRefineSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-slate-400">{t.steps.refine.label}</p>
                                <h2 className="text-lg font-semibold text-slate-100">{t.steps.refine.title}</h2>
                            </div>
                            <p className="text-sm text-slate-400">
                                {t.refineDescription}
                            </p>
                            {t.refineQuickActions.length > 0 && (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{t.refineQuickActionsTitle}</p>
                                        <p className="text-xs text-slate-400">{t.refineQuickActionsDescription}</p>
                                    </div>
                                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                                        {t.refineQuickActions.map(action => (
                                            <button
                                                key={action.id}
                                                type="button"
                                                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-600 text-slate-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                                                onClick={() => handleQuickActionSelect(action.instruction)}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                isLoading={isRefining || job.status === 'processing' || job.status === 'queued'}
                                className="w-full"
                            >
                                {(job.status === 'processing' || job.status === 'queued') ? t.refiningButton : t.refineButton}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Right Panel - Results Document */}
                <div className={`${resultsColSpan} p-8 bg-white rounded-lg shadow-lg`}>
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

                            {/* Tab Navigation */}
                            <div className="flex gap-2 border-b border-slate-200">
                                <TabButton tab="preview" label={t.tabPreviewLabel || 'Optimized Resume'} />
                                <TabButton tab="profile" label={t.tabProfileLabel || 'Extracted Profile'} />
                                <TabButton tab="feedback" label={t.tabFeedbackLabel || 'Alignment Feedback'} />
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'preview' && (
                                <>
                                    {showAnalysis && (
                                        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                                            <ResultsSummaryPanel
                                                result={job.result}
                                                isRTL={isRTL}
                                                t={t}
                                                desiredOutputLang={job.metadata?.desiredOutputLang}
                                                resumeLang={job.metadata?.resumeLang}
                                                jobDescriptionLang={job.metadata?.jobDescriptionLang}
                                            />
                                        </div>
                                    )}
                                    <ResumePreviewPanel result={job.result} isRTL={isRTL} t={t} />
                                </>
                            )}

                            {activeTab === 'profile' && (
                                <ExtractedProfile result={job.result} />
                            )}

                            {activeTab === 'feedback' && (
                                <FeedbackPanel result={job.result} />
                            )}
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
