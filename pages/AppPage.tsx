import React, { useEffect, useMemo, useRef, useState } from 'react';
import JobsQueue from '../components/JobsQueue';
import Navbar from '../components/layout/Navbar';
import OptimizationForm from '../components/OptimizationForm';
import ResultsView from '../components/ResultsView';
import StepIndicator from '../components/StepIndicator';
import { Button } from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { jobsService } from '../services/jobs';
import { uploadsService } from '../services/uploads';
import type { StepId } from '../translations';
import { useTranslations } from '../translations';
import type {
    JobQueueItem,
    JobRecord,
    JobSummary,
    LanguageCode,
    OptimizationResult,
    Session,
    ToastMessage,
} from '../types';

// --- MOCK DATA FOR DEMO ---
const mockCompleteJobResult: OptimizationResult = {
    id: `opt_mock_complete`,
    score: 88,
    missingKeywords: ['Agile', 'JIRA', 'Confluence', 'CI/CD'],
    coveredKeywords: ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Figma', 'Storybook'],
    changeLog: [
        'Rewrote summary to better align with senior-level expectations.',
        'Quantified achievements in project delivery bullets with metrics.',
        'Added a dedicated technical skills section for better keyword matching.',
        'Rephrased responsibilities to use more active, impactful language.'
    ],
    detectedResumeLang: 'en',
    detectedJobDescLang: 'en',
    extractedEntities: {
        skills: ['Frontend Architecture', 'Design Systems', 'Team Leadership', 'Performance Optimization'],
        tools: ['React', 'TypeScript', 'Storybook', 'Figma', 'Node.js', 'CI/CD', 'JIRA'],
        education: ['B.Sc. Computer Science — King Saud University (2015)'],
        experience: [
            {
                role: 'Lead Frontend Engineer',
                company: 'TechSolutions Inc.',
                duration: '2020–Present',
                highlights: [
                    'Architected a component-based design system adopted across 5 teams.',
                    'Mentored 4 junior developers and instituted code review standards.',
                    'Reduced initial page load time by 300ms through bundle trimming.'
                ]
            },
            {
                role: 'Senior Frontend Engineer',
                company: 'CreativeMinds',
                duration: '2017–2020',
                highlights: [
                    'Delivered UI modernization that increased conversion by 12%.',
                    'Introduced Storybook-driven development to improve design fidelity.'
                ]
            }
        ],
    },
    alignmentInsights: {
        matched: ['React', 'TypeScript', 'UI/UX Design', 'Design Systems'],
        missing: ['AWS', 'Observability tooling', 'Accessibility testing'],
        weak: ['CI/CD depth', 'Product metrics storytelling'],
        evidence: [
            {
                source: 'resume',
                snippet: 'Led the architecture and development of a new component-based design system in React and Storybook.',
                score: 0.82,
            },
            {
                source: 'job',
                snippet: 'Role requires driving CI/CD maturity and observability coverage.',
                score: 0.74,
                note: 'Add examples of deployment pipelines and monitoring.'
            },
            {
                source: 'retrieval',
                snippet: 'Experience with agile teams delivering UI/UX features with measurable impact.',
                score: 0.78,
            },
        ],
    },
    reliability: {
        invalidJsonRatePct: 1.2,
        lastRunValid: true,
        latencySeconds: 14,
        avgLatencySeconds: 12,
    },
    evaluation: {
        extractionAccuracy: 92,
        matchingPrecision: 88,
        retrievalRelevance: 90,
        feedbackQuality: 86,
    },
    retrievalContexts: [
        {
            source: 'resume',
            snippet: 'Component-based design system in React and Storybook improved developer efficiency by 40%.',
            score: 0.83,
        },
        {
            source: 'job',
            snippet: 'Looking for leaders who can mentor teams and drive UI/UX best practices with metrics.',
            score: 0.8,
        },
        {
            source: 'retrieval',
            snippet: 'CI/CD ownership and observability are required to stabilize releases.',
            score: 0.76,
        },
    ],
    translationNotes: [
        'Localized summary into Arabic while preserving English keywords for ATS parsing.',
        'Applied RTL-safe spacing for Arabic headings and ensured bilingual section ordering.',
    ],
    previewMarkdown: `# Your Name\n\n## Summary\n\nResults-driven Senior Frontend Engineer with over 8 years of experience building and scaling responsive web applications. Expert in React, TypeScript, and modern UI/UX principles, with a proven track record of leading teams to deliver high-quality software.\n\n## Experience\n\n**Lead Frontend Engineer** @ TechSolutions Inc. (2020-Present)\n\n*   Led the architecture and development of a new component-based design system in React and Storybook, improving developer efficiency by 40%.\n*   Mentored a team of 4 junior developers, resulting in a 25% increase in team velocity and a 50% reduction in bug reports.\n*   Engineered a performant state management solution using Redux Toolkit, decreasing initial page load time by 300ms.\n\n## Skills\n\n*   **Languages:** TypeScript, JavaScript (ESNext), HTML5, CSS3/SASS\n*   **Frameworks:** React, Next.js, Vue.js\n*   **Tools & Platforms:** Webpack, Vite, Docker, Git, Figma, JIRA`
};

const mockJobsInQueue: JobQueueItem[] = [
    {
        id: 'job_1',
        title: 'Senior Frontend Developer @ TechCorp...',
        status: 'complete',
        result: mockCompleteJobResult,
        metadata: {
            company: 'TechCorp',
            resumeLang: 'en',
            jobDescriptionLang: 'en',
            desiredOutputLang: 'ar',
        },
    },
    {
        id: 'job_2',
        title: 'UI/UX Engineer @ CreativeMinds...',
        status: 'processing',
        result: null,
        metadata: {
            company: 'CreativeMinds',
            resumeLang: 'en',
            jobDescriptionLang: 'en',
            desiredOutputLang: 'en',
        },
    },
];

const RESUME_EXTRACTION_ERROR = 'resume_extraction_failed';

const getFileExtension = (file: File) => file.name.split('.').pop()?.toLowerCase();

const isPlainTextFile = (file: File) =>
    file.type === 'text/plain' || getFileExtension(file) === 'txt';

const JOB_POLL_INTERVAL = 2500;
const JOB_POLL_MAX_ATTEMPTS = 20;
const RECENT_ANALYSES_LIMIT = 10;
const HISTORY_PAGE_SIZE = 10;

const mapJobToQueueItem = (job: JobSummary | JobRecord): JobQueueItem => ({
    id: job.id,
    title: job.title,
    status: job.status,
    result: job.result,
    metadata: {
        company: job.company ?? undefined,
        resumeLang: job.resumeLang,
        jobDescriptionLang: job.jdLang,
        desiredOutputLang: job.desiredOutputLang,
    },
});

const cloneQueueItem = (job: JobQueueItem): JobQueueItem => ({
    ...job,
    result: job.result
        ? {
            ...job.result,
            changeLog: [...job.result.changeLog],
            coveredKeywords: [...job.result.coveredKeywords],
            missingKeywords: [...job.result.missingKeywords],
        }
        : null,
    metadata: job.metadata ? { ...job.metadata } : undefined,
});

const deriveJobTitle = (jobTitle: string, jobDescription: string) => {
    if (jobTitle.trim()) {
        return jobTitle.trim();
    }
    const fallback = jobDescription
        .split('\n')
        .map(line => line.trim())
        .find(Boolean);
    if (!fallback) {
        return 'Analysis Job';
    }
    return fallback.length > 80 ? `${fallback.slice(0, 80)}…` : fallback;
};

// Main Application Page
const AppPage: React.FC<{ session: Session }> = ({ session }) => {
    const { language } = useLanguage();
    const t = useTranslations();
    const isRTL = language === 'ar';
    const [jobsQueue, setJobsQueue] = useState<JobQueueItem[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [appView, setAppView] = useState<'dashboard' | 'queue' | 'results' | 'history'>('dashboard');
    const [historyPage, setHistoryPage] = useState(1);
    const isDemoMode = useMemo(() => import.meta.env.VITE_DEMO_MODE === 'true', []);
    const completedJobs = useMemo(
        () => jobsQueue.filter(job => job.status === 'complete'),
        [jobsQueue]
    );
    const recentCompletedJobs = useMemo(
        () => completedJobs.slice(0, RECENT_ANALYSES_LIMIT),
        [completedJobs]
    );
    const totalHistoryPages = Math.max(1, Math.ceil(completedJobs.length / HISTORY_PAGE_SIZE));
    const clampedHistoryPage = Math.min(historyPage, totalHistoryPages);
    const historySliceStart = (clampedHistoryPage - 1) * HISTORY_PAGE_SIZE;
    const historyJobs = completedJobs.slice(historySliceStart, historySliceStart + HISTORY_PAGE_SIZE);

    useEffect(() => {
        if (historyPage !== clampedHistoryPage) {
            setHistoryPage(clampedHistoryPage);
        }
    }, [clampedHistoryPage, historyPage]);

    // State for developer preview (demo mode only)
    const [previewState, setPreviewState] = useState<'dashboard' | 'queue' | 'results'>('dashboard');
    const [previewEnabled, setPreviewEnabled] = useState<boolean>(isDemoMode);
    const pollTimeouts = useRef<Record<string, number>>({});


    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    useEffect(() => {
        return () => {
            Object.values(pollTimeouts.current).forEach(timeoutId => {
                clearTimeout(timeoutId as number);
            });
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const bootstrapJobs = async () => {
            try {
                const jobs = await jobsService.listJobs({ accessToken: session.access_token });
                if (!isMounted) {
                    return;
                }
                setJobsQueue(jobs.map(mapJobToQueueItem));
            } catch (error) {
                console.error(error);
                showToast('Unable to load recent jobs.', 'error');
            }
        };
        bootstrapJobs();
        return () => {
            isMounted = false;
        };
    }, [session.access_token]);

    useEffect(() => {
        if (appView === 'queue' && jobsQueue.length > 0 && jobsQueue.every(job => job.status === 'complete')) {
            setAppView('dashboard');
        }
    }, [appView, jobsQueue]);

    const syncJobToQueue = (jobData: JobSummary | JobRecord, options: { prepend?: boolean } = {}) => {
        const item = mapJobToQueueItem(jobData);
        setJobsQueue(prev => {
            const existingIndex = prev.findIndex(job => job.id === item.id);
            if (existingIndex === -1) {
                return options.prepend ? [item, ...prev] : [...prev, item];
            }
            return prev.map(job => (job.id === item.id ? { ...job, ...item } : job));
        });
    };

    const pollJobStatus = (jobId: string, successMessage?: string, attempt = 0) => {
        const runPoll = async () => {
            try {
                const job = await jobsService.getJob(jobId, { accessToken: session.access_token });
                syncJobToQueue(job);
                if (job.status === 'complete') {
                    if (successMessage) {
                        showToast(successMessage, 'success');
                    }
                    return false;
                }
                if (job.status === 'failed') {
                    showToast('Job failed during processing.', 'error');
                    return false;
                }
                return true;
            } catch (error) {
                console.error(error);
                showToast('Unable to refresh job status.', 'error');
                return false;
            }
        };

        runPoll().then(shouldContinue => {
            if (shouldContinue && attempt < JOB_POLL_MAX_ATTEMPTS) {
                const timeoutId = window.setTimeout(() => {
                    pollJobStatus(jobId, successMessage, attempt + 1);
                }, JOB_POLL_INTERVAL);
                pollTimeouts.current[jobId] = timeoutId;
            } else if (pollTimeouts.current[jobId]) {
                clearTimeout(pollTimeouts.current[jobId]);
                delete pollTimeouts.current[jobId];
            }
        });
    };

    const handleJobSelect = (jobId: string) => {
        setSelectedJobId(jobId);
        setAppView('results');
        jobsService
            .getJob(jobId, { accessToken: session.access_token })
            .then(job => {
                syncJobToQueue(job);
            })
            .catch(error => {
                console.error(error);
                showToast('Unable to load job details.', 'error');
            });
    };

    const handleViewAllAnalyses = () => {
        setHistoryPage(1);
        setAppView('history');
    };

    const resolveResumeText = async (file: File): Promise<string> => {
        if (isPlainTextFile(file)) {
            return file.text();
        }

        try {
            const extracted = await uploadsService.extractResumeText(file, {
                accessToken: session.access_token,
            });
            return extracted.text?.trim() ?? '';
        } catch (error) {
            console.error(error);
            throw new Error(RESUME_EXTRACTION_ERROR);
        }
    };

    const handleStartOptimization = async (data: {
        resumeFile: File | null;
        resumeText: string;
        jobDescription: string;
        customInstructions: string;
        jobTitle: string;
        companyName: string;
        resumeLang: LanguageCode;
        jobDescriptionLang: LanguageCode;
        desiredOutputLang: LanguageCode;
    }) => {
        const optimisticId = `temp_${Date.now()}`;
        const fallbackTitle = deriveJobTitle(data.jobTitle, data.jobDescription);
        const optimisticJob: JobQueueItem = {
            id: optimisticId,
            title: fallbackTitle,
            status: 'queued',
            result: null,
            metadata: {
                company: data.companyName || undefined,
                resumeLang: data.resumeLang,
                jobDescriptionLang: data.jobDescriptionLang,
                desiredOutputLang: data.desiredOutputLang,
            },
        };
        setJobsQueue(prev => [optimisticJob, ...prev]);
        setSelectedJobId(null);
        setAppView('queue');

        try {
            const resumePayloadText = data.resumeFile
                ? await resolveResumeText(data.resumeFile)
                : data.resumeText;
            if (!resumePayloadText.trim()) {
                throw new Error(RESUME_EXTRACTION_ERROR);
            }
            const job = await jobsService.createJob(
                {
                    title: data.jobTitle,
                    company: data.companyName || undefined,
                    resumeText: resumePayloadText,
                    jobDescription: data.jobDescription,
                    customInstructions: data.customInstructions || undefined,
                    resumeLang: data.resumeLang,
                    jdLang: data.jobDescriptionLang,
                    desiredOutputLang: data.desiredOutputLang,
                },
                { accessToken: session.access_token }
            );
            setJobsQueue(prev => prev.filter(queueJob => queueJob.id !== optimisticId));
            syncJobToQueue(job, { prepend: true });
            pollJobStatus(job.id, 'Analysis complete!');
        } catch (error) {
            console.error(error);
            setJobsQueue(prev => prev.filter(queueJob => queueJob.id !== optimisticId));
            const errorMessage =
                error instanceof Error && error.message === RESUME_EXTRACTION_ERROR
                    ? 'Unable to extract resume text from the uploaded file.'
                    : 'An error occurred during optimization.';
            showToast(errorMessage, 'error');
        }
    };

    const handleRefine = async (jobId: string, instructions: string) => {
        const previousJob = jobsQueue.find(job => job.id === jobId);
        const previousSnapshot = previousJob ? cloneQueueItem(previousJob) : null;
        setJobsQueue(prev => prev.map(job =>
            job.id === jobId ? { ...job, status: 'processing' } : job
        ));

        try {
            const updated = await jobsService.refineJob(
                jobId,
                { instructions },
                { accessToken: session.access_token }
            );
            syncJobToQueue(updated);
            pollJobStatus(jobId, 'Refinement complete!');
        } catch (error) {
            console.error(error);
            if (previousSnapshot) {
                setJobsQueue(prev => prev.map(job => (job.id === jobId ? previousSnapshot : job)));
            } else {
                setJobsQueue(prev => prev.map(job =>
                    job.id === jobId ? { ...job, status: 'complete' } : job
                ));
            }
            showToast('An error occurred during refinement.', 'error');
        }
    };

    /*
    const DevPreviewControls = () => (
        <div className="p-4 mb-8 border border-dashed rounded-lg bg-yellow-900/20 border-yellow-500/30">
            <h3 className="font-semibold text-yellow-300">Developer Preview Controls</h3>
            <p className="text-sm text-yellow-400/80">
                Toggle preview states for screenshots. In production, these use mock data.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    onClick={() => { setPreviewEnabled(true); setPreviewState('dashboard'); }}
                    className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600"
                >
                    Dashboard
                </button>
                <button
                    onClick={() => { setPreviewEnabled(true); setPreviewState('queue'); }}
                    className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600"
                >
                    Queue (Processing)
                </button>
                <button
                    onClick={() => { setPreviewEnabled(true); setPreviewState('results'); }}
                    className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600"
                >
                    Results Page
                </button>
            </div>
        </div>
    );
    */

    const renderContent = () => {
        if (previewEnabled && previewState !== 'dashboard') {
            if (previewState === 'results') {
                return (
                    <ResultsView
                        job={mockJobsInQueue[0]}
                        onBack={() => setPreviewState('dashboard')}
                        onRefine={async () => showToast('This is a mock refinement!', 'success')}
                    />
                );
            }
            if (previewState === 'queue') {
                return (
                    <div className="flex flex-col max-w-3xl mx-auto space-y-8">
                        <JobsQueue jobs={mockJobsInQueue} onSelectJob={() => setPreviewState('results')} />
                    </div>
                );
            }
        }

        if (appView === 'queue') {
            return (
                <div className="flex flex-col max-w-4xl mx-auto space-y-6">
                    <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                        <p className="text-base font-medium text-slate-100">Your analysis is processing</p>
                        <p className="text-sm text-slate-400 mt-1">
                            We’re analyzing your resume against the job description. You can follow the status below and open the insights once they’re ready.
                        </p>
                    </div>
                    <JobsQueue jobs={jobsQueue} onSelectJob={handleJobSelect} />
                </div>
            );
        }

        if (appView === 'history') {
            const totalHistoryCount = completedJobs.length;
            const showPagination = totalHistoryCount > HISTORY_PAGE_SIZE;
            return (
                <div className="flex flex-col max-w-5xl mx-auto space-y-6">
                    <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-100">{t.analysisHistoryTitle}</h2>
                            <p className="text-sm text-slate-400">{t.analysisHistorySubtitle}</p>
                        </div>
                        <Button variant="secondary" onClick={() => setAppView('dashboard')}>
                            {t.backToDashboard}
                        </Button>
                    </div>
                    {totalHistoryCount === 0 ? (
                        <div className="p-6 rounded-2xl border border-gray-700 bg-gray-800 text-sm text-slate-300">
                            {t.noAnalysesMessage}
                        </div>
                    ) : (
                        <JobsQueue jobs={historyJobs} onSelectJob={handleJobSelect} />
                    )}
                    {showPagination && (
                        <div className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-xs text-slate-400">
                                {t.paginationLabel
                                    .replace('{current}', String(clampedHistoryPage))
                                    .replace('{total}', String(totalHistoryPages))}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                                    disabled={clampedHistoryPage <= 1}
                                >
                                    {t.paginationPrevious}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                                    disabled={clampedHistoryPage >= totalHistoryPages}
                                >
                                    {t.paginationNext}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="grid gap-8 max-w-5xl mx-auto lg:grid-cols-[2fr,1fr]">
                <div className="order-2 lg:order-1">
                    <OptimizationForm onStartOptimization={handleStartOptimization} />
                </div>
                <div className="order-1 lg:order-2">
                    <div className="sticky top-8">
                        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-xl">
                            <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div>
                                    <p className="text-sm text-slate-300">{t.recentAnalysesTitle}</p>
                                    <p className="text-xs text-slate-400">{t.recentAnalysesSubtitle}</p>
                                </div>
                                {completedJobs.length > RECENT_ANALYSES_LIMIT && (
                                    <Button variant="secondary" onClick={handleViewAllAnalyses}>
                                        {t.viewAllAnalyses}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <JobsQueue jobs={recentCompletedJobs} onSelectJob={handleJobSelect} />
                    </div>
                </div>
            </div>
        );
    };

    // Fallback logic for actual interaction
    const selectedJob = jobsQueue.find(job => job.id === selectedJobId);
    const determineCurrentStep = (): StepId => {
        if (selectedJob || appView === 'results' || (isDemoMode && previewState === 'results')) {
            return 'results';
        }
        if (
            appView === 'queue' ||
            jobsQueue.some(job => job.status === 'processing' || job.status === 'queued') ||
            (isDemoMode && previewState === 'queue')
        ) {
            return 'processing';
        }
        return 'input';
    };
    const currentStep = determineCurrentStep();
    const containerClasses = `min-h-screen bg-gray-900 ${isRTL ? 'text-right' : 'text-left'}`;
    const direction = isRTL ? 'rtl' : 'ltr';

    if (selectedJob) {
        return (
            <div className={containerClasses} dir={direction}>
                <Navbar userEmail={session.user.email} />
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
                <main className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
                    <StepIndicator current={currentStep} />
                    <ResultsView
                        job={selectedJob}
                        onBack={() => { setSelectedJobId(null); setAppView('dashboard'); }}
                        onRefine={handleRefine}
                    />
                </main>
            </div>
        )
    }

    return (
        <div className={containerClasses} dir={direction}>
            <Navbar userEmail={session.user.email} />
            {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

            <main className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
                <StepIndicator current={currentStep} />
                {!selectedJob && (
                    <section className="mb-8 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg">
                        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-primary-500/10 text-primary-300">
                                {t.navSubtitle}
                            </span>
                            <h1 className="mt-4 text-2xl font-semibold text-slate-100 sm:text-3xl">
                                {t.heroTitle}
                            </h1>
                            <p className="mt-2 text-sm text-slate-300 sm:text-base">
                                {t.heroSubtitle}
                            </p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {t.heroHighlights.map((highlight, index) => (
                                <div
                                    key={`${highlight}-${index}`}
                                    className={`flex items-start space-x-2 rounded-xl bg-gray-900/40 p-3 text-sm text-slate-200 border border-gray-800 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : ''}`}
                                >
                                    <span className="text-primary-400" aria-hidden="true">
                                        ✓
                                    </span>
                                    <span>{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* <DevPreviewControls /> */}
                {renderContent()}
            </main>
        </div>
    );
};

export default AppPage;
