
import React from 'react';
import { Card } from './ui/Card';
import type { JobQueueItem } from '../types';
import { useTranslations } from '../translations';
import { useLanguage } from '../contexts/LanguageContext';
import JobListItem from './JobListItem';

interface JobsQueueProps {
    jobs: JobQueueItem[];
    onSelectJob: (jobId: string) => void;
    onDeleteJob?: (jobId: string) => void;
    onRenameJob?: (jobId: string, newTitle: string) => void;
}

const JobsQueue: React.FC<JobsQueueProps> = ({ jobs, onSelectJob, onDeleteJob, onRenameJob }) => {
    const t = useTranslations();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    if (jobs.length === 0) {
        return null;
    }

    return (
        <Card>
            <h2 className="text-lg font-semibold text-slate-100">{t.queueTitle}</h2>
            <div className="mt-4 flow-root">
                <ul role="list" className={`-my-4 divide-y divide-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {jobs.map(job => (
                        <JobListItem
                            key={job.id}
                            job={job}
                            disabled={job.status !== 'complete'}
                            onSelect={onSelectJob}
                            onDelete={onDeleteJob}
                            onRename={onRenameJob}
                            labels={{ processing: t.queueProcessing, complete: t.queueComplete }}
                            isRTL={isRTL}
                        />
                    ))}
                </ul>
            </div>
        </Card>
    );
};

export default JobsQueue;
