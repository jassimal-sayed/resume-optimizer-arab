import { useLanguage } from './contexts/LanguageContext';

export type StepId = 'input' | 'processing' | 'results' | 'refine';

export type SupportedLanguage = 'en' | 'ar';

interface StepTranslation {
  label: string;
  title: string;
}

export type RefineQuickActionId = 'moreFormal' | 'shorter' | 'moreTechnical' | 'arabicFirst';

interface RefineQuickAction {
  id: RefineQuickActionId;
  label: string;
  instruction: string;
}

interface TranslationStrings {
  navTitle: string;
  navSubtitle: string;
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
  resumeLanguageLabel: string;
  jobDescriptionLanguageLabel: string;
  desiredOutputLanguageLabel: string;
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
  errorInvalidFileType: string;
  errorFileTooLarge: string;
  recentAnalysesTitle: string;
  recentAnalysesSubtitle: string;
  viewAllAnalyses: string;
  analysisHistoryTitle: string;
  analysisHistorySubtitle: string;
  noAnalysesMessage: string;
  paginationLabel: string;
  paginationPrevious: string;
  paginationNext: string;
  analysisShow: string;
  analysisHide: string;
  structuredExtractionTitle: string;
  structuredExtractionSubtitle: string;
  groundedFeedbackTitle: string;
  matchedLabel: string;
  missingLabel: string;
  weakLabel: string;
  evidenceLabel: string;
  retrievalContextTitle: string;
  reliabilityTitle: string;
  invalidJsonRateLabel: string;
  latencyLabel: string;
  avgLatencyLabel: string;
  lastRunValidLabel: string;
  reliabilityTargets: string;
  evaluationTitle: string;
  translationTitle: string;
  translationNotesLabel: string;
  outputLanguageLabel: string;
  detectedResumeLabel: string;
  detectedJobLabel: string;
  skillsLabel: string;
  toolsLabel: string;
  educationLabel: string;
  experienceLabel: string;
  extractionAccuracyLabel: string;
  matchingPrecisionLabel: string;
  retrievalRelevanceLabel: string;
  feedbackQualityLabel: string;
  statusValid: string;
  statusInvalid: string;
  heroTitle: string;
  heroSubtitle: string;
  heroHighlights: string[];
  languageHelperTitle: string;
  languageHelperBody: string;
  refineQuickActionsTitle: string;
  refineQuickActionsDescription: string;
  refineQuickActions: RefineQuickAction[];
  steps: Record<StepId, StepTranslation>;
  // Chapter 5 additions
  tabPreviewLabel: string;
  tabProfileLabel: string;
  tabFeedbackLabel: string;
  extractedProfileTitle: string;
  contactLabel: string;
  alignmentFeedbackTitle: string;
  matchedSkillsLabel: string;
  missingSkillsLabel: string;
  weakAreasLabel: string;
  exportCSVLabel: string;
  exportTXTLabel: string;
  validOutputLabel: string;
  invalidRateLabel: string;
}

const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    navTitle: 'AI Resume Analyzer',
    navSubtitle: 'Bilingual, ATS-friendly CV analysis',
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
    analyzeButton: 'Analyze my CV against this job',
    contentLanguageLabel: 'Content language',
    resumeLanguageLabel: 'Resume language',
    jobDescriptionLanguageLabel: 'Job description language',
    desiredOutputLanguageLabel: 'Desired output language',
    languageEnglish: 'English',
    languageArabic: 'Arabic',
    jobTitleLabel: 'Job title',
    jobTitlePlaceholder: 'Senior Product Manager',
    companyLabel: 'Company / Organization',
    companyPlaceholder: 'e.g., NoorTech, Riyadh',
    errorResumeMissing: 'Please upload a file or paste your resume text.',
    errorJobMissing: 'Please provide a job description.',
    errorInvalidFileType: 'Upload a PDF, DOCX, or TXT file.',
    errorFileTooLarge: 'File must be smaller than 5MB.',
    recentAnalysesTitle: 'Recent analyses',
    recentAnalysesSubtitle: 'Completed runs appear here so you can quickly reopen results.',
    viewAllAnalyses: 'View all',
    analysisHistoryTitle: 'All analyses',
    analysisHistorySubtitle: 'Browse your completed analysis history.',
    noAnalysesMessage: 'No completed analyses yet.',
    paginationLabel: 'Page {current} of {total}',
    paginationPrevious: 'Previous',
    paginationNext: 'Next',
    queueTitle: 'Analysis Runs',
    queueProcessing: 'Processing',
    queueComplete: 'Complete',
    resultsHeading: 'Analysis Results',
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
    resultsGenerating: 'Your analysis is running...',
    resultsGeneratingSub: 'This may take a moment.',
    instructionsError: 'Please provide refinement instructions.',
    analysisShow: 'View detailed analysis',
    analysisHide: 'Hide detailed analysis',
    structuredExtractionTitle: 'Structured extraction (LLM JSON)',
    structuredExtractionSubtitle: 'Schema-constrained entities validated for reliability.',
    groundedFeedbackTitle: 'Grounded match analysis',
    matchedLabel: 'Matched',
    missingLabel: 'Missing',
    weakLabel: 'Weak',
    evidenceLabel: 'Evidence',
    retrievalContextTitle: 'Retrieval context (embeddings)',
    reliabilityTitle: 'Reliability & performance',
    invalidJsonRateLabel: 'Invalid JSON rate',
    latencyLabel: 'Latest latency',
    avgLatencyLabel: 'Avg latency (target ≤20s)',
    lastRunValidLabel: 'Last run valid',
    reliabilityTargets: 'Targets: invalid JSON ≤2%, response time ≤20s.',
    evaluationTitle: 'Evaluation scores',
    translationTitle: 'Localization & translation',
    translationNotesLabel: 'Translation notes',
    outputLanguageLabel: 'Output language',
    detectedResumeLabel: 'Resume detected',
    detectedJobLabel: 'Job detected',
    skillsLabel: 'Skills',
    toolsLabel: 'Tools',
    educationLabel: 'Education',
    experienceLabel: 'Experience',
    extractionAccuracyLabel: 'Extraction accuracy',
    matchingPrecisionLabel: 'Matching precision',
    retrievalRelevanceLabel: 'Retrieval relevance',
    feedbackQualityLabel: 'Feedback quality',
    statusValid: 'Valid',
    statusInvalid: 'Invalid',
    heroTitle: 'Own every interview—Arabic or English',
    heroSubtitle: 'Analyze ATS alignment for Arabic and English resumes in one workflow.',
    heroHighlights: [
      'Audit Arabic-first sections while keeping English accomplishments aligned.',
      'Surface ATS risks and RTL layout issues before you apply.',
      'Provide bilingual storytelling cues so recruiters see your regional impact.',
    ],
    languageHelperTitle: 'Language tip',
    languageHelperBody: 'Select the languages that reflect your source materials and the market you are targeting. We automatically adapt formatting for Arabic RTL sections and highlight English summaries when needed.',
    refineQuickActionsTitle: 'Quick refinement suggestions',
    refineQuickActionsDescription: 'Click a suggestion to append it to your instructions.',
    refineQuickActions: [
      { id: 'moreFormal', label: 'More formal tone', instruction: 'Make the resume read with a more formal and polished tone.' },
      { id: 'shorter', label: 'Shorter', instruction: 'Tighten the summary and bullet points so the content is more concise.' },
      { id: 'moreTechnical', label: 'More technical', instruction: 'Add technical depth and highlight specific tools, frameworks, or metrics.' },
      { id: 'arabicFirst', label: 'Arabic-first CV', instruction: 'Prioritize Arabic headings and ensure the Arabic content appears first.' },
    ],
    steps: {
      input: { label: 'Step 1', title: 'Input Details' },
      processing: { label: 'Step 2', title: 'Processing' },
      results: { label: 'Step 3', title: 'Analysis Results' },
      refine: { label: 'Step 4', title: 'Refine with AI' },
    },
    // Chapter 5 additions
    tabPreviewLabel: 'Optimized Resume',
    tabProfileLabel: 'Extracted Profile',
    tabFeedbackLabel: 'Alignment Feedback',
    extractedProfileTitle: 'Extracted Profile',
    contactLabel: 'Contact',
    alignmentFeedbackTitle: 'Alignment Feedback',
    matchedSkillsLabel: 'Matched Requirements',
    missingSkillsLabel: 'Missing Requirements',
    weakAreasLabel: 'Needs Improvement',
    exportCSVLabel: 'Export CSV',
    exportTXTLabel: 'Export TXT',
    validOutputLabel: 'Valid Output',
    invalidRateLabel: 'Invalid Rate',
  },
  ar: {
    navTitle: 'محلل السيرة الذاتية بالذكاء الاصطناعي',
    navSubtitle: 'تحليل ثنائي اللغة ومتوافق مع أنظمة التتبع',
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
    analyzeButton: 'حلّل سيرتي مقابل هذه الوظيفة',
    contentLanguageLabel: 'لغة المحتوى',
    resumeLanguageLabel: 'لغة السيرة الذاتية',
    jobDescriptionLanguageLabel: 'لغة الوصف الوظيفي',
    desiredOutputLanguageLabel: 'لغة الإخراج المطلوبة',
    languageEnglish: 'الإنجليزية',
    languageArabic: 'العربية',
    jobTitleLabel: 'المسمى الوظيفي',
    jobTitlePlaceholder: 'مثلاً: مدير منتج أول',
    companyLabel: 'الشركة / الجهة',
    companyPlaceholder: 'مثلاً: نور تك، الرياض',
    errorResumeMissing: 'يرجى رفع ملف السيرة الذاتية أو لصقها.',
    errorJobMissing: 'يرجى إدخال الوصف الوظيفي.',
    errorInvalidFileType: 'يجب رفع ملف بصيغة PDF أو DOCX أو TXT.',
    errorFileTooLarge: 'يجب ألا يتجاوز حجم الملف ٥ ميجابايت.',
    recentAnalysesTitle: 'أحدث التحليلات',
    recentAnalysesSubtitle: 'تظهر هنا النتائج المكتملة لإعادة فتحها بسرعة.',
    viewAllAnalyses: 'عرض الكل',
    analysisHistoryTitle: 'كل التحليلات',
    analysisHistorySubtitle: 'استعرض سجل التحليلات المكتملة.',
    noAnalysesMessage: 'لا توجد تحليلات مكتملة حتى الآن.',
    paginationLabel: 'الصفحة {current} من {total}',
    paginationPrevious: 'السابق',
    paginationNext: 'التالي',
    queueTitle: 'طلبات التحليل',
    queueProcessing: 'جارٍ المعالجة',
    queueComplete: 'مكتمل',
    resultsHeading: 'نتائج التحليل',
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
    resultsGenerating: 'يتم الآن تشغيل التحليل...',
    resultsGeneratingSub: 'قد يستغرق ذلك لحظات.',
    instructionsError: 'يرجى إدخال تعليمات التحسين.',
    analysisShow: 'عرض تحليل التوافق التفصيلي',
    analysisHide: 'إخفاء التحليل التفصيلي',
    structuredExtractionTitle: 'استخراج منظم (JSON مقيد المخطط)',
    structuredExtractionSubtitle: 'كيانات مستخرجة من خلال LLM مع تحقق للبنية.',
    groundedFeedbackTitle: 'تحليل توافق مستند إلى أدلة',
    matchedLabel: 'متوافق',
    missingLabel: 'ناقص',
    weakLabel: 'ضعيف',
    evidenceLabel: 'الأدلة',
    retrievalContextTitle: 'سياق الاسترجاع (التضمين)',
    reliabilityTitle: 'الموثوقية والأداء',
    invalidJsonRateLabel: 'معدل JSON غير صالح',
    latencyLabel: 'الزمن المستغرق الأخير',
    avgLatencyLabel: 'متوسط الزمن (الهدف ≤ ٢٠ ثانية)',
    lastRunValidLabel: 'آخر تشغيل صالح',
    reliabilityTargets: 'الأهداف: JSON غير صالح ≤٢٪، زمن استجابة ≤٢٠ ثانية.',
    evaluationTitle: 'درجات التقييم',
    translationTitle: 'التعريب والترجمة',
    translationNotesLabel: 'ملاحظات الترجمة',
    outputLanguageLabel: 'لغة الإخراج',
    detectedResumeLabel: 'لغة السيرة المكتشفة',
    detectedJobLabel: 'لغة الوصف المكتشفة',
    skillsLabel: 'المهارات',
    toolsLabel: 'الأدوات',
    educationLabel: 'التعليم',
    experienceLabel: 'الخبرات',
    extractionAccuracyLabel: 'دقة الاستخراج',
    matchingPrecisionLabel: 'دقة المطابقة',
    retrievalRelevanceLabel: 'ملاءمة الاسترجاع',
    feedbackQualityLabel: 'جودة التغذية الراجعة',
    statusValid: 'صالح',
    statusInvalid: 'غير صالح',
    heroTitle: 'تميّز في أسواق العمل العربية والإنجليزية',
    heroSubtitle: 'حلّل توافق سيرتك مع الوظائف بالعربية والإنجليزية من مكان واحد.',
    heroHighlights: [
      'راجع الأقسام العربية أولاً مع إبقاء الإنجازات الإنجليزية في سياقها.',
      'اكشف مخاطر ATS والتنسيق من اليمين لليسار قبل التقديم.',
      'احصل على إرشادات لسرد ثنائي اللغة يوضح تأثيرك المحلي للمجندين الدوليين.',
    ],
    languageHelperTitle: 'ملاحظة حول اللغة',
    languageHelperBody: 'اختر اللغات التي تعكس سيرتك الأصلية والسوق المستهدف. سنضبط الاتجاه تلقائيًا للنصوص العربية ونُبرز الملخصات الإنجليزية عند الحاجة.',
    refineQuickActionsTitle: 'اقتراحات سريعة',
    refineQuickActionsDescription: 'انقر على أي اقتراح لإضافته إلى التعليمات.',
    refineQuickActions: [
      { id: 'moreFormal', label: 'صيغة أكثر رسمية', instruction: 'اجعل النبرة أكثر رسمية ومهنية في جميع الأقسام.' },
      { id: 'shorter', label: 'اختصر المحتوى', instruction: 'قلّل طول الملخص والنقاط مع الحفاظ على أهم النتائج.' },
      { id: 'moreTechnical', label: 'تفاصيل تقنية أكثر', instruction: 'أضف تفاصيل تقنية إضافية واذكر الأدوات والأطر المرتبطة بالدور.' },
      { id: 'arabicFirst', label: 'سيرة عربية أولاً', instruction: 'قدّم المحتوى العربي أولاً وتأكد من أن العناوين الأساسية باللغة العربية.' },
    ],
    steps: {
      input: { label: 'الخطوة ١', title: 'إدخال البيانات' },
      processing: { label: 'الخطوة ٢', title: 'جاري المعالجة' },
      results: { label: 'الخطوة ٣', title: 'نتائج التحليل' },
      refine: { label: 'الخطوة ٤', title: 'تحسين باستخدام الذكاء الاصطناعي' },
    },
    // Chapter 5 additions
    tabPreviewLabel: 'السيرة المُحسّنة',
    tabProfileLabel: 'الملف الشخصي المستخرج',
    tabFeedbackLabel: 'تحليل التوافق',
    extractedProfileTitle: 'الملف الشخصي المستخرج',
    contactLabel: 'معلومات الاتصال',
    alignmentFeedbackTitle: 'تحليل التوافق',
    matchedSkillsLabel: 'المتطلبات المتوفرة',
    missingSkillsLabel: 'المتطلبات الناقصة',
    weakAreasLabel: 'تحتاج تحسين',
    exportCSVLabel: 'تصدير CSV',
    exportTXTLabel: 'تصدير TXT',
    validOutputLabel: 'مخرج صالح',
    invalidRateLabel: 'نسبة الأخطاء',
  },
};

export const useTranslations = () => {
  const { language } = useLanguage();
  return translations[language];
};

export type Translations = TranslationStrings;
