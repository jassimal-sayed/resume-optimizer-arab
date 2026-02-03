import React from 'react';
import { useTranslations } from '../translations';
import type { JobRecord, OptimizationResult } from '../types';
import { Button } from './ui/Button';

interface ExportButtonProps {
    job: JobRecord | null;
    result: OptimizationResult | null;
    className?: string;
}

/**
 * Export feedback report as downloadable file.
 * Supports CSV and TXT formats.
 */
const ExportButton: React.FC<ExportButtonProps> = ({ job, result, className }) => {
    const t = useTranslations();

    const handleExport = (format: 'csv' | 'txt') => {
        if (!job || !result) return;

        let content = '';
        let filename = '';
        let mimeType = '';

        if (format === 'csv') {
            // CSV format for spreadsheet import
            const rows = [
                ['Resume Optimization Report'],
                [''],
                ['Job Title', job.title || 'N/A'],
                ['Company', job.company || 'N/A'],
                ['Match Score', result.score.toString()],
                [''],
                ['Covered Keywords', result.coveredKeywords.join(', ')],
                ['Missing Keywords', result.missingKeywords.join(', ')],
                [''],
                ['Changes Made'],
                ...result.changeLog.map(change => [change]),
            ];

            // Add alignment insights if available
            if (result.alignmentInsights) {
                rows.push(['']);
                rows.push(['Matched Requirements', result.alignmentInsights.matched?.join(', ') || '']);
                rows.push(['Missing Requirements', result.alignmentInsights.missing?.join(', ') || '']);
                rows.push(['Needs Improvement', result.alignmentInsights.weak?.join(', ') || '']);
            }

            // Add reliability metrics if available
            if (result.reliability) {
                rows.push(['']);
                rows.push(['Latency (seconds)', result.reliability.latencySeconds?.toString() || 'N/A']);
            }

            content = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            filename = `resume-report-${job.id.slice(0, 8)}.csv`;
            mimeType = 'text/csv';

        } else {
            // Plain text format
            const lines = [
                '=== RESUME OPTIMIZATION REPORT ===',
                '',
                `Job Title: ${job.title || 'N/A'}`,
                `Company: ${job.company || 'N/A'}`,
                `Match Score: ${result.score}/100`,
                '',
                '--- COVERED KEYWORDS ---',
                result.coveredKeywords.join(', ') || '(none)',
                '',
                '--- MISSING KEYWORDS ---',
                result.missingKeywords.join(', ') || '(none)',
                '',
                '--- CHANGES MADE ---',
                ...result.changeLog.map((c, i) => `${i + 1}. ${c}`),
            ];

            if (result.alignmentInsights) {
                lines.push('');
                lines.push('--- ALIGNMENT INSIGHTS ---');
                lines.push(`Matched: ${result.alignmentInsights.matched?.join(', ') || '(none)'}`);
                lines.push(`Missing: ${result.alignmentInsights.missing?.join(', ') || '(none)'}`);
                lines.push(`Weak: ${result.alignmentInsights.weak?.join(', ') || '(none)'}`);
            }

            if (result.reliability) {
                lines.push('');
                lines.push('--- PERFORMANCE ---');
                lines.push(`Latency: ${result.reliability.latencySeconds?.toFixed(2) || 'N/A'} seconds`);
            }

            lines.push('');
            lines.push('--- OPTIMIZED RESUME ---');
            lines.push(result.previewMarkdown);

            content = lines.join('\n');
            filename = `resume-report-${job.id.slice(0, 8)}.txt`;
            mimeType = 'text/plain';
        }

        // Create and trigger download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!job || !result) return null;

    return (
        <div className={`flex gap-2 ${className || ''}`}>
            <Button
                onClick={() => handleExport('csv')}
                variant="secondary"
                size="sm"
            >
                📊 {t.exportCSVLabel || 'Export CSV'}
            </Button>
            <Button
                onClick={() => handleExport('txt')}
                variant="secondary"
                size="sm"
            >
                📄 {t.exportTXTLabel || 'Export TXT'}
            </Button>
        </div>
    );
};

export default ExportButton;
