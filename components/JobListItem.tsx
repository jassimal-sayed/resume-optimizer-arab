import React, { useState, useRef, useEffect } from 'react';
import type { JobQueueItem } from '../types';

interface JobListItemProps {
  job: JobQueueItem;
  disabled: boolean;
  onSelect: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onRename?: (jobId: string, newTitle: string) => void;
  labels: {
    processing: string;
    complete: string;
  };
  isRTL?: boolean;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, disabled, onSelect, onDelete, onRename, labels, isRTL }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(job.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== job.title && onRename) {
      onRename(job.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(job.title);
      setEditing(false);
    }
  };

  return (
    <li className="py-4 group/item">
      <div className={`flex items-center w-full space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'} px-2 py-1`}>
        <button
          onClick={() => !disabled && onSelect(job.id)}
          disabled={disabled}
          className="flex-auto min-w-0 text-left disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 rounded-lg transition"
        >
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={e => e.stopPropagation()}
              className="w-full bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ) : (
            <p className="font-medium text-slate-200 truncate group-hover:text-primary-400 transition-colors">
              {job.title}
            </p>
          )}
          <p className="text-sm text-slate-400">
            {job.metadata?.company ? `${job.metadata.company} • ` : ''}ID: {job.id}
          </p>
        </button>

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

        <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
          {onRename && !editing && (
            <button
              onClick={e => { e.stopPropagation(); setEditValue(job.title); setEditing(true); }}
              className="p-1 text-slate-400 hover:text-primary-400 transition-colors rounded"
              title="Rename"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); if (confirm('Delete this job?')) onDelete(job.id); }}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default JobListItem;
