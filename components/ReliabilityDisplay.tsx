import React from 'react';
import { useTranslations } from '../translations';
import type { OptimizationResult } from '../types';

interface ReliabilityDisplayProps {
    result: OptimizationResult | null;
    className?: string;
}

/**
 * Displays reliability metrics: latency, validity rate.
 * Corresponds to Chapter 5, Section 5.5.
 */
const ReliabilityDisplay: React.FC<ReliabilityDisplayProps> = ({ result, className }) => {
    const t = useTranslations();

    if (!result?.reliability) {
        return null;
    }

    const { latencySeconds, invalidJsonRatePct, lastRunValid, avgLatencySeconds } = result.reliability;

    const MetricCard: React.FC<{ label: string; value: string; status?: 'good' | 'warning' | 'bad' }> =
        ({ label, value, status }) => {
            const statusColors = {
                good: 'text-green-400',
                warning: 'text-yellow-400',
                bad: 'text-red-400',
            };
            const valueColor = status ? statusColors[status] : 'text-slate-200';

            return (
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
                </div>
            );
        };

    // Determine status based on Chapter 5 thresholds
    const latencyStatus = latencySeconds && latencySeconds <= 20 ? 'good' : 'warning';
    const validityStatus = lastRunValid ? 'good' : 'bad';
    const invalidRateStatus = invalidJsonRatePct !== undefined && invalidJsonRatePct < 2 ? 'good' : 'warning';

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className || ''}`}>
            {latencySeconds !== undefined && (
                <MetricCard
                    label={t.latencyLabel || 'Latency'}
                    value={`${latencySeconds.toFixed(2)}s`}
                    status={latencyStatus}
                />
            )}

            {avgLatencySeconds !== undefined && (
                <MetricCard
                    label={t.avgLatencyLabel || 'Avg Latency'}
                    value={`${avgLatencySeconds.toFixed(2)}s`}
                />
            )}

            {lastRunValid !== undefined && (
                <MetricCard
                    label={t.validOutputLabel || 'Valid Output'}
                    value={lastRunValid ? '✓ Yes' : '✗ No'}
                    status={validityStatus}
                />
            )}

            {invalidJsonRatePct !== undefined && (
                <MetricCard
                    label={t.invalidRateLabel || 'Invalid Rate'}
                    value={`${invalidJsonRatePct.toFixed(1)}%`}
                    status={invalidRateStatus}
                />
            )}
        </div>
    );
};

export default ReliabilityDisplay;
