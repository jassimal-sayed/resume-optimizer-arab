import React from 'react';
import type { JobQueueItem } from '../types';

interface JobListItemProps {
  job: JobQueueItem;
  disabled: boolean;
  onSelect: (jobId: string) => void;
  labels: {
    processing: string;
    complete: string;
  };
  isRTL?: boolean;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, disabled, onSelect, labels, isRTL }) => (
  <li className="py-4">
    <button
      onClick={() => !disabled && onSelect(job.id)}
      disabled={disabled}
      className={`flex items-center w-full space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'} disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 rounded-lg px-2 py-1 transition`}
    >
      <div className="flex-auto min-w-0">
        <p className="font-medium text-slate-200 truncate group-hover:text-primary-400 transition-colors">
          {job.title}
        </p>
        <p className="text-sm text-slate-400">
          {job.metadata?.company ? `${job.metadata.company} • ` : ''}ID: {job.id}
        </p>
      </div>
      {(job.status === 'processing' || job.status === 'queued') && (
        <div className="flex items-center space-x-2 text-yellow-400">
          <span className="text-sm font-medium">{labels.processing}</span>
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        </div>
      )}
      {job.status === 'complete' && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
          {labels.complete}
        </span>
      )}
    </button>
  </li>
);

export default JobListItem;
