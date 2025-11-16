import React, { useState } from 'react';
import type { Session, ToastMessage, JobQueueItem, OptimizationResult } from '../types';
import Navbar from '../components/layout/Navbar';
import Toast from '../components/ui/Toast';
import OptimizationForm from '../components/OptimizationForm';
import JobsQueue from '../components/JobsQueue';
import ResultsView from '../components/ResultsView';
import StepIndicator from '../components/StepIndicator';
import { useLanguage } from '../contexts/LanguageContext';
import type { StepId } from '../translations';

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
    previewMarkdown: `# Your Name\n\n## Summary\n\nResults-driven Senior Frontend Engineer with over 8 years of experience building and scaling responsive web applications. Expert in React, TypeScript, and modern UI/UX principles, with a proven track record of leading teams to deliver high-quality software.\n\n## Experience\n\n**Lead Frontend Engineer** @ TechSolutions Inc. (2020-Present)\n\n*   Led the architecture and development of a new component-based design system in React and Storybook, improving developer efficiency by 40%.\n*   Mentored a team of 4 junior developers, resulting in a 25% increase in team velocity and a 50% reduction in bug reports.\n*   Engineered a performant state management solution using Redux Toolkit, decreasing initial page load time by 300ms.\n\n## Skills\n\n*   **Languages:** TypeScript, JavaScript (ESNext), HTML5, CSS3/SASS\n*   **Frameworks:** React, Next.js, Vue.js\n*   **Tools & Platforms:** Webpack, Vite, Docker, Git, Figma, JIRA`
};

const mockJobsInQueue: JobQueueItem[] = [
    { id: 'job_1', title: 'Senior Frontend Developer @ TechCorp...', status: 'complete', result: mockCompleteJobResult },
    { id: 'job_2', title: 'UI/UX Engineer @ CreativeMinds...', status: 'processing', result: null },
];

const mockSelectedJob: JobQueueItem = mockJobsInQueue[0];

type PreviewState = 'dashboard' | 'queue' | 'results';


// Main Application Page
const AppPage: React.FC<{ session: Session }> = ({ session }) => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [jobsQueue, setJobsQueue] = useState<JobQueueItem[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    
    // State for developer preview
    const [previewState, setPreviewState] = useState<PreviewState>('dashboard');


    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleStartOptimization = async (data: {
        resumeFile: File | null;
        resumeText: string;
        jobDescription: string;
        customInstructions: string;
        jobTitle: string;
        companyName: string;
        contentLanguage: 'en' | 'ar';
    }) => {
        const jobId = `job_${Date.now()}`;
        const jobTitle = data.jobTitle || data.jobDescription.split('\n')[0].substring(0, 50) + '...';

        const newJob: JobQueueItem = {
            id: jobId,
            title: jobTitle,
            status: 'processing',
            result: null,
            metadata: {
                company: data.companyName,
                contentLanguage: data.contentLanguage,
            },
        };
        setJobsQueue(prev => [newJob, ...prev]);

        // --- MOCK BACKEND PROCESSING ---
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));

            setJobsQueue(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: 'complete', result: mockCompleteJobResult } : job
            ));
            showToast('Optimization complete!', 'success');
        } catch (error) {
            console.error(error);
            setJobsQueue(prev => prev.filter(job => job.id !== jobId));
            showToast('An error occurred during optimization.', 'error');
        }
    };

    const handleRefine = async (jobId: string, instructions: string) => {
        setJobsQueue(prev => prev.map(job =>
            job.id === jobId ? { ...job, status: 'processing' } : job
        ));
        
        // --- MOCK BACKEND REFINEMENT ---
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const existingJob = jobsQueue.find(j => j.id === jobId);
            if (!existingJob || !existingJob.result) throw new Error("Job not found");

            const refinedResult: OptimizationResult = {
                ...existingJob.result,
                score: Math.min(existingJob.result.score + 5, 100), // Increase score slightly
                previewMarkdown: existingJob.result.previewMarkdown + `\n\n## Refinement Notes\n\nBased on the instruction: *"${instructions}"*, further adjustments were made to emphasize project management skills.`,
                changeLog: [...existingJob.result.changeLog, `Refined based on user feedback: "${instructions}"`]
            };

            setJobsQueue(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: 'complete', result: refinedResult } : job
            ));
            showToast('Resume refined!', 'success');
        } catch (error) {
             console.error(error);
             showToast('An error occurred during refinement.', 'error');
             setJobsQueue(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: 'complete' } : job // Revert status
            ));
        }
    }
    
    const DevPreviewControls = () => (
      <div className="p-4 mb-8 border border-dashed rounded-lg bg-yellow-900/20 border-yellow-500/30">
          <h3 className="font-semibold text-yellow-300">Developer Preview Controls</h3>
          <p className="text-sm text-yellow-400/80">Use these buttons to navigate between different UI states for screenshots.</p>
          <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => setPreviewState('dashboard')} className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600">Dashboard</button>
              <button onClick={() => setPreviewState('queue')} className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600">Queue (Processing)</button>
              <button onClick={() => setPreviewState('results')} className="px-3 py-1 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600">Results Page</button>
          </div>
      </div>
    );
    
    const renderContent = () => {
        if (previewState === 'results') {
             return <ResultsView
                        job={mockSelectedJob}
                        onBack={() => setPreviewState('dashboard')}
                        onRefine={async () => {
                            showToast('This is a mock refinement!', 'success');
                        }}
                    />
        }
        
        if (previewState === 'queue') {
            return (
                 <div className="flex flex-col max-w-3xl mx-auto space-y-8">
                    <JobsQueue jobs={mockJobsInQueue} onSelectJob={() => setPreviewState('results')} />
                </div>
            )
        }
        
        // Default: dashboard
        return (
            <div className="flex flex-col max-w-3xl mx-auto space-y-8">
                <OptimizationForm onStartOptimization={handleStartOptimization} />
                <JobsQueue jobs={jobsQueue} onSelectJob={setSelectedJobId} />
            </div>
        );
    }
    
    // Fallback logic for actual interaction
    const selectedJob = jobsQueue.find(job => job.id === selectedJobId);
    const determineCurrentStep = (): StepId => {
        if (selectedJob) {
            return selectedJob.status === 'processing' ? 'processing' : 'results';
        }
        if (previewState === 'results') return 'results';
        if (previewState === 'queue') return 'processing';
        if (jobsQueue.some(job => job.status === 'processing')) return 'processing';
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
                        onBack={() => setSelectedJobId(null)}
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
                <DevPreviewControls />
                {renderContent()}
            </main>
        </div>
    );
};

export default AppPage;
