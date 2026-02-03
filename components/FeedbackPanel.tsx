import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import type { OptimizationResult } from '../types';
import { Card } from './ui/Card';

interface FeedbackPanelProps {
    result: OptimizationResult | null;
}

/**
 * Displays alignment insights: matched, missing, and weak skills.
 * Corresponds to Chapter 5, Figures 5.21-5.22.
 */
const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ result }) => {
    const t = useTranslations();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    if (!result?.alignmentInsights) {
        return null;
    }

    const { matched, missing, weak, evidence } = result.alignmentInsights;

    const SectionHeader: React.FC<{ title: string; count: number; color: string }> = ({ title, count, color }) => (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">{title}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${color}`}>{count}</span>
        </div>
    );

    const tagBase = 'inline-block px-2 py-1 text-xs rounded-full mr-2 mb-2';

    return (
        <Card>
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className="text-lg font-semibold text-slate-100 border-b border-gray-700 pb-2">
                    {t.alignmentFeedbackTitle || 'Alignment Feedback'}
                </h2>

                {/* Matched Skills */}
                {matched && matched.length > 0 && (
                    <div className="space-y-2">
                        <SectionHeader
                            title={t.matchedSkillsLabel || 'Matched Requirements'}
                            count={matched.length}
                            color="bg-green-500/20 text-green-400"
                        />
                        <div className="flex flex-wrap">
                            {matched.map((item, idx) => (
                                <span key={idx} className={`${tagBase} bg-green-500/20 text-green-300`}>
                                    ✓ {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Skills */}
                {missing && missing.length > 0 && (
                    <div className="space-y-2">
                        <SectionHeader
                            title={t.missingSkillsLabel || 'Missing Requirements'}
                            count={missing.length}
                            color="bg-red-500/20 text-red-400"
                        />
                        <div className="flex flex-wrap">
                            {missing.map((item, idx) => (
                                <span key={idx} className={`${tagBase} bg-red-500/20 text-red-300`}>
                                    ✗ {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weak Areas */}
                {weak && weak.length > 0 && (
                    <div className="space-y-2">
                        <SectionHeader
                            title={t.weakAreasLabel || 'Needs Improvement'}
                            count={weak.length}
                            color="bg-yellow-500/20 text-yellow-400"
                        />
                        <div className="flex flex-wrap">
                            {weak.map((item, idx) => (
                                <span key={idx} className={`${tagBase} bg-yellow-500/20 text-yellow-300`}>
                                    ⚠ {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Evidence Snippets */}
                {evidence && evidence.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.evidenceLabel || 'Supporting Evidence'}
                        </h3>
                        <div className="space-y-3">
                            {evidence.map((item, idx) => (
                                <div key={idx} className="bg-gray-800/50 rounded-lg p-3 border-l-2 border-primary-500">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs uppercase px-2 py-0.5 rounded ${item.source === 'resume' ? 'bg-blue-500/20 text-blue-300' :
                                                item.source === 'job' ? 'bg-purple-500/20 text-purple-300' :
                                                    'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {item.source}
                                        </span>
                                        {item.score && (
                                            <span className="text-xs text-slate-500">
                                                Score: {(item.score * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 italic">"{item.snippet}"</p>
                                    {item.note && (
                                        <p className="text-xs text-slate-500 mt-1">{item.note}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default FeedbackPanel;
