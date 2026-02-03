import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import type { OptimizationResult } from '../types';
import { Card } from './ui/Card';

interface ExtractedProfileProps {
    result: OptimizationResult | null;
}

/**
 * Displays extracted resume entities (skills, education, experience).
 * Corresponds to Chapter 5, Figure 5.3.
 */
const ExtractedProfile: React.FC<ExtractedProfileProps> = ({ result }) => {
    const t = useTranslations();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    if (!result?.extractedEntities) {
        return null;
    }

    const { skills, tools, education, experience, contact } = result.extractedEntities;

    const sectionClasses = `space-y-2 ${isRTL ? 'text-right' : 'text-left'}`;
    const tagClasses = 'inline-block px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-300 mr-2 mb-2';

    return (
        <Card>
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className="text-lg font-semibold text-slate-100 border-b border-gray-700 pb-2">
                    {t.extractedProfileTitle || 'Extracted Profile'}
                </h2>

                {/* Contact Info */}
                {contact && (
                    <div className={sectionClasses}>
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.contactLabel || 'Contact'}
                        </h3>
                        <div className="text-sm text-slate-400 space-y-1">
                            {contact.email && <p>📧 {contact.email}</p>}
                            {contact.phone && <p>📞 {contact.phone}</p>}
                            {contact.linkedin && <p>🔗 {contact.linkedin}</p>}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <div className={sectionClasses}>
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.skillsLabel || 'Skills'}
                        </h3>
                        <div className="flex flex-wrap">
                            {skills.map((skill, idx) => (
                                <span key={idx} className={tagClasses}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tools */}
                {tools && tools.length > 0 && (
                    <div className={sectionClasses}>
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.toolsLabel || 'Tools & Technologies'}
                        </h3>
                        <div className="flex flex-wrap">
                            {tools.map((tool, idx) => (
                                <span key={idx} className={`${tagClasses} bg-blue-500/20 text-blue-300`}>{tool}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <div className={sectionClasses}>
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.educationLabel || 'Education'}
                        </h3>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                            {education.map((edu, idx) => (
                                <li key={idx}>{edu}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <div className={sectionClasses}>
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t.experienceLabel || 'Experience'}
                        </h3>
                        <div className="space-y-4">
                            {experience.map((exp, idx) => (
                                <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                                    <p className="font-medium text-slate-200">{exp.role}</p>
                                    {exp.company && <p className="text-sm text-slate-400">{exp.company}</p>}
                                    {exp.duration && <p className="text-xs text-slate-500">{exp.duration}</p>}
                                    {exp.highlights && exp.highlights.length > 0 && (
                                        <ul className="mt-2 list-disc list-inside text-sm text-slate-400">
                                            {exp.highlights.map((h, hIdx) => (
                                                <li key={hIdx}>{h}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ExtractedProfile;
