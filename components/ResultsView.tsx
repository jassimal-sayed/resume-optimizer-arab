import React, { useState, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import MarkdownRenderer from './MarkdownRenderer';
import { CopyIcon, CheckIcon } from './ui/Icons';
import type { JobQueueItem, OptimizationResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';

interface ResultsViewProps {
    job: JobQueueItem;
    onBack: () => void;
    onRefine: (jobId: string, instructions: string) => Promise<void>;
}

const ResultsContent: React.FC<{ result: OptimizationResult; isRTL: boolean; t: ReturnType<typeof useTranslations> }> = ({ result, isRTL, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (result?.previewMarkdown) {
            navigator.clipboard.writeText(result.previewMarkdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [result]);
    const copyLabelSpacing = isRTL ? 'mr-2' : 'ml-2';

    return (
        <div className={`space-y-6 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{t.steps.results.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{t.steps.results.title}</h3>
            </div>

            <div className="p-4 text-center bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-primary-700">{t.matchScoreLabel}</p>
                <p className="text-5xl font-bold text-primary-600">{result.score}<span className="text-3xl">%</span></p>
            </div>

            <div>
                <h4 className="font-semibold text-slate-800">{t.keywordAnalysis}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                    {result.coveredKeywords.map(k => <span key={k} className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">{k}</span>)}
                    {result.missingKeywords.map(k => <span key={k} className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">{k}</span>)}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-800">{t.changeLog}</h4>
                <ul className="mt-2 text-sm list-disc list-inside text-slate-600 space-y-1">
                    {result.changeLog.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>

            <div className="relative pt-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{t.optimizedPreview}</h4>
                     <button onClick={handleCopy} className="inline-flex items-center px-2 py-1 text-xs border rounded-md text-slate-600 border-slate-300 hover:bg-slate-100">
                        {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                        <span className={copyLabelSpacing}>{copied ? t.copied : t.copyMarkdown}</span>
                    </button>
                </div>
                <div
                    className={`p-6 bg-white border border-slate-200 max-h-[60vh] overflow-y-auto rounded-md prose prose-sm ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <MarkdownRenderer content={result.previewMarkdown} />
                </div>
            </div>
        </div>
    );
};


const ResultsView: React.FC<ResultsViewProps> = ({ job, onBack, onRefine }) => {
    const { language } = useLanguage();
    const t = useTranslations();
    const isRTL = language === 'ar';
    const [refineInstructions, setRefineInstructions] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                        <ResultsContent result={job.result} isRTL={isRTL} t={t} />
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
