
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadIcon } from './ui/Icons';
import { useTranslations } from '../translations';
import { useLanguage } from '../contexts/LanguageContext';
import type { LanguageCode } from '../types';

const ACCEPTED_FILE_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);
const ACCEPTED_FILE_SUFFIXES = ['pdf', 'docx', 'txt'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TEXT_LENGTH = 12000;

const hasValidFileType = (file: File) => {
    if (file.type && ACCEPTED_FILE_MIME_TYPES.has(file.type)) {
        return true;
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    return !!extension && ACCEPTED_FILE_SUFFIXES.includes(extension);
};

interface OptimizationFormProps {
    onStartOptimization: (data: {
        resumeFile: File | null;
        resumeText: string;
        jobDescription: string;
        customInstructions: string;
        jobTitle: string;
        companyName: string;
        resumeLang: LanguageCode;
        jobDescriptionLang: LanguageCode;
        desiredOutputLang: LanguageCode;
    }) => Promise<void>;
}

const OptimizationForm: React.FC<OptimizationFormProps> = ({ onStartOptimization }) => {
    const t = useTranslations();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [resumeLanguage, setResumeLanguage] = useState<LanguageCode>(language);
    const [jobDescriptionLanguage, setJobDescriptionLanguage] = useState<LanguageCode>(language);
    const [desiredOutputLanguage, setDesiredOutputLanguage] = useState<LanguageCode>(language);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!hasValidFileType(file)) {
                setFormError(t.errorInvalidFileType);
                setResumeFile(null);
                e.target.value = '';
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setFormError(t.errorFileTooLarge);
                setResumeFile(null);
                e.target.value = '';
                return;
            }
            setResumeFile(file);
            setResumeText('');
            setFormError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (resumeFile) {
            if (!hasValidFileType(resumeFile)) {
                setFormError(t.errorInvalidFileType);
                return;
            }
            if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
                setFormError(t.errorFileTooLarge);
                return;
            }
        }
        if (!resumeFile && !resumeText.trim()) {
            setFormError(t.errorResumeMissing);
            return;
        }
        if (!jobDescription.trim()) {
            setFormError(t.errorJobMissing);
            return;
        }

        setIsLoading(true);
        await onStartOptimization({
            resumeFile,
            resumeText,
            jobDescription,
            customInstructions,
            jobTitle,
            companyName,
            resumeLang: resumeLanguage,
            jobDescriptionLang: jobDescriptionLanguage,
            desiredOutputLang: desiredOutputLanguage,
        });
        setIsLoading(false);
    };
    
    const baseTextareaClasses = 'block w-full text-sm bg-gray-700 text-slate-100 border border-gray-500 rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 placeholder:text-gray-300';
    const getTextareaClasses = (contentLang?: LanguageCode) => {
        const rtl = isRTL || contentLang === 'ar';
        return `${baseTextareaClasses} ${rtl ? 'text-right' : 'text-left'}`;
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Language Preferences --- */}
                <div className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-medium text-slate-100">{t.contentLanguageLabel}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            { label: t.resumeLanguageLabel, value: resumeLanguage, setter: setResumeLanguage },
                            { label: t.jobDescriptionLanguageLabel, value: jobDescriptionLanguage, setter: setJobDescriptionLanguage },
                            { label: t.desiredOutputLanguageLabel, value: desiredOutputLanguage, setter: setDesiredOutputLanguage },
                        ].map(({ label, value, setter }) => (
                            <div key={label} className="space-y-2">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</span>
                                <div className="flex rounded-md bg-gray-700 p-1">
                                    {(['en', 'ar'] as LanguageCode[]).map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setter(lang)}
                                            className={`flex-1 py-2 text-sm rounded-md transition ${
                                                value === lang ? 'bg-primary-500 text-white' : 'text-slate-300'
                                            }`}
                                        >
                                            {lang === 'en' ? t.languageEnglish : t.languageArabic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Job Meta --- */}
                <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-100">{t.jobTitleLabel}</label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder={t.jobTitlePlaceholder}
                            className="block w-full px-3 py-2 text-sm bg-gray-700 text-slate-200 border border-gray-600 rounded-md placeholder:text-gray-400 focus:ring-primary-500 focus:border-primary-500"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-100">{t.companyLabel}</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder={t.companyPlaceholder}
                            className="block w-full px-3 py-2 text-sm bg-gray-700 text-slate-200 border border-gray-600 rounded-md placeholder:text-gray-400 focus:ring-primary-500 focus:border-primary-500"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                </div>

                {/* --- 1. Resume --- */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-100">{t.resumeSectionTitle}</h2>
                    <p className="text-sm text-slate-400">{t.resumeSectionDescription}</p>
                     <label className="block w-full px-12 py-6 text-center border-2 border-dashed rounded-md cursor-pointer border-gray-600 hover:border-primary-400 bg-gray-900/50">
                        <UploadIcon className="w-8 h-8 mx-auto text-slate-500" />
                        <span className="mt-2 block text-sm font-medium text-slate-300">
                            {resumeFile ? resumeFile.name : t.uploadLabel}
                        </span>
                        <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,text/plain" />
                    </label>
                    <div className="flex items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="px-2 text-sm text-slate-400">{t.orDivider}</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <textarea
                        value={resumeText}
                        onChange={e => { setResumeText(e.target.value); setResumeFile(null); setFormError(null); }}
                        rows={8}
                        placeholder={t.resumePlaceholder}
                        className={`${getTextareaClasses(resumeLanguage)} min-h-[180px] sm:min-h-[220px]`}
                        maxLength={MAX_TEXT_LENGTH}
                    />
                </div>

                {/* --- 2. Job Description --- */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-100">{t.jobSectionTitle}</h2>
                    <p className="text-sm text-slate-400">{t.jobSectionDescription}</p>
                    <textarea
                        value={jobDescription}
                        onChange={e => { setJobDescription(e.target.value); setFormError(null); }}
                        rows={10}
                        placeholder={t.jobDescriptionPlaceholder}
                        className={`${getTextareaClasses(jobDescriptionLanguage)} min-h-[200px] sm:min-h-[260px]`}
                        required
                        maxLength={MAX_TEXT_LENGTH}
                    />
                </div>
                
                {/* --- 3. Custom Instructions --- */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-100">{t.customSectionTitle}</h2>
                    <p className="text-sm text-slate-400">{t.customSectionDescription}</p>
                    <textarea
                        value={customInstructions}
                        onChange={e => { setCustomInstructions(e.target.value); setFormError(null); }}
                        rows={4}
                        placeholder={t.customPlaceholder}
                        className={`${getTextareaClasses(desiredOutputLanguage)} min-h-[120px]`}
                        maxLength={MAX_TEXT_LENGTH}
                    />
                </div>

                {/* --- Submit --- */}
                <div>
                     {formError && <p className="mb-4 text-sm text-center text-red-400">{formError}</p>}
                    <Button type="submit" isLoading={isLoading} className="w-full text-base py-3">
                        {t.analyzeButton}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default OptimizationForm;
