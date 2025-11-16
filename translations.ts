import { useLanguage } from './contexts/LanguageContext';

export type StepId = 'input' | 'processing' | 'results' | 'refine';

export type SupportedLanguage = 'en' | 'ar';

interface StepTranslation {
  label: string;
  title: string;
}

interface TranslationStrings {
  navTitle: string;
  resumeSectionTitle: string;
  resumeSectionDescription: string;
  uploadLabel: string;
  orDivider: string;
  resumePlaceholder: string;
  jobSectionTitle: string;
  jobSectionDescription: string;
  jobDescriptionPlaceholder: string;
  customSectionTitle: string;
  customSectionDescription: string;
  customPlaceholder: string;
  analyzeButton: string;
  contentLanguageLabel: string;
  languageEnglish: string;
  languageArabic: string;
  jobTitleLabel: string;
  jobTitlePlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  errorResumeMissing: string;
  errorJobMissing: string;
  queueTitle: string;
  queueProcessing: string;
  queueComplete: string;
  resultsHeading: string;
  backToDashboard: string;
  refineHeading: string;
  refineDescription: string;
  refinePlaceholder: string;
  refineButton: string;
  refiningButton: string;
  matchScoreLabel: string;
  keywordAnalysis: string;
  changeLog: string;
  optimizedPreview: string;
  copyMarkdown: string;
  copied: string;
  resultsGenerating: string;
  resultsGeneratingSub: string;
  instructionsError: string;
  steps: Record<StepId, StepTranslation>;
}

const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    navTitle: 'AI Resume Optimizer',
    resumeSectionTitle: '1. Your Resume',
    resumeSectionDescription: 'Upload a PDF/DOCX or paste your resume text below.',
    uploadLabel: 'Click to upload a file',
    orDivider: 'OR',
    resumePlaceholder: 'Paste your resume text here...',
    jobSectionTitle: '2. Job Description',
    jobSectionDescription: "Paste the job description you're applying for.",
    jobDescriptionPlaceholder: 'Paste the full job description here...',
    customSectionTitle: '3. Custom Instructions (Optional)',
    customSectionDescription: 'Guide the AI with specific requests for even better results.',
    customPlaceholder: "e.g., 'Make the summary more concise.' or 'Emphasize my project management skills.'",
    analyzeButton: 'Tailor my CV to this job',
    contentLanguageLabel: 'Content language',
    languageEnglish: 'English',
    languageArabic: 'Arabic',
    jobTitleLabel: 'Job title',
    jobTitlePlaceholder: 'Senior Product Manager',
    companyLabel: 'Company / Organization',
    companyPlaceholder: 'e.g., NoorTech, Riyadh',
    errorResumeMissing: 'Please upload a file or paste your resume text.',
    errorJobMissing: 'Please provide a job description.',
    queueTitle: 'Optimization Jobs',
    queueProcessing: 'Processing',
    queueComplete: 'Complete',
    resultsHeading: 'Optimization Results',
    backToDashboard: '← Back to Dashboard',
    refineHeading: 'Refine Your Result',
    refineDescription: 'Not quite right? Enter instructions below to have the AI make further tweaks to your resume.',
    refinePlaceholder: "e.g., 'Make the summary more formal.' or 'Add a bullet point about my experience with AWS.'",
    refineButton: 'Refine with AI',
    refiningButton: 'Refining...',
    matchScoreLabel: 'Overall Match Score',
    keywordAnalysis: 'Keyword Analysis',
    changeLog: 'Change Log',
    optimizedPreview: 'Optimized Resume Preview',
    copyMarkdown: 'Copy Markdown',
    copied: 'Copied!',
    resultsGenerating: 'Your results are being generated...',
    resultsGeneratingSub: 'This may take a moment.',
    instructionsError: 'Please provide refinement instructions.',
    steps: {
      input: { label: 'Step 1', title: 'Input Details' },
      processing: { label: 'Step 2', title: 'Processing' },
      results: { label: 'Step 3', title: 'Optimization Results' },
      refine: { label: 'Step 4', title: 'Refine with AI' },
    },
  },
  ar: {
    navTitle: 'منسق السيرة الذاتية بالذكاء الاصطناعي',
    resumeSectionTitle: '١. سيرتك الذاتية',
    resumeSectionDescription: 'قم بتحميل ملف PDF/DOCX أو الصق نص سيرتك الذاتية بالأسفل.',
    uploadLabel: 'انقر لرفع ملف',
    orDivider: 'أو',
    resumePlaceholder: 'الصق نص سيرتك الذاتية هنا...',
    jobSectionTitle: '٢. الوصف الوظيفي',
    jobSectionDescription: 'الصق هنا الوصف الوظيفي الخاص بالفرصة.',
    jobDescriptionPlaceholder: 'اكتب الوصف الوظيفي الكامل هنا...',
    customSectionTitle: '٣. تعليمات مخصصة (اختياري)',
    customSectionDescription: 'وجّه الذكاء الاصطناعي بطلبات محددة للحصول على نتائج أدق.',
    customPlaceholder: "مثلاً: \"اجعل الملخص أكثر رسمية\" أو \"أبرز خبرتي في إدارة المشاريع\".",
    analyzeButton: 'خصِّص سيرتي لهذه الوظيفة',
    contentLanguageLabel: 'لغة المحتوى',
    languageEnglish: 'الإنجليزية',
    languageArabic: 'العربية',
    jobTitleLabel: 'المسمى الوظيفي',
    jobTitlePlaceholder: 'مثلاً: مدير منتج أول',
    companyLabel: 'الشركة / الجهة',
    companyPlaceholder: 'مثلاً: نور تك، الرياض',
    errorResumeMissing: 'يرجى رفع ملف السيرة الذاتية أو لصقها.',
    errorJobMissing: 'يرجى إدخال الوصف الوظيفي.',
    queueTitle: 'طلبات التحسين',
    queueProcessing: 'جارٍ المعالجة',
    queueComplete: 'مكتمل',
    resultsHeading: 'نتائج التحسين',
    backToDashboard: '↪ العودة إلى لوحة التحكم',
    refineHeading: 'حسّن النتيجة',
    refineDescription: 'لم تصل بعد إلى الشكل المثالي؟ أضف تعليمات وسينفّذها الذكاء الاصطناعي.',
    refinePlaceholder: "مثلاً: \"اجعل الملخص أكثر رسمية\" أو \"أضف نقطة عن خبرتي مع AWS\".",
    refineButton: 'حسّن باستخدام الذكاء الاصطناعي',
    refiningButton: 'جارٍ التحسين...',
    matchScoreLabel: 'درجة التوافق العامة',
    keywordAnalysis: 'تحليل الكلمات المفتاحية',
    changeLog: 'سجل التعديلات',
    optimizedPreview: 'معاينة السيرة المحسّنة',
    copyMarkdown: 'نسخ Markdown',
    copied: 'تم النسخ!',
    resultsGenerating: 'يتم الآن إنشاء النتائج...',
    resultsGeneratingSub: 'قد يستغرق ذلك لحظات.',
    instructionsError: 'يرجى إدخال تعليمات التحسين.',
    steps: {
      input: { label: 'الخطوة ١', title: 'إدخال البيانات' },
      processing: { label: 'الخطوة ٢', title: 'جاري المعالجة' },
      results: { label: 'الخطوة ٣', title: 'نتائج التحسين' },
      refine: { label: 'الخطوة ٤', title: 'تحسين باستخدام الذكاء الاصطناعي' },
    },
  },
};

export const useTranslations = () => {
  const { language } = useLanguage();
  return translations[language];
};

export type Translations = TranslationStrings;
