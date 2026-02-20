
import React from 'react';
import { supabase } from '../../services/supabase';
import { LogoIcon, LogoutIcon } from '../ui/Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';

interface NavbarProps {
    userEmail: string | undefined;
}

const Navbar: React.FC<NavbarProps> = ({ userEmail }) => {
    const { language, setLanguage } = useLanguage();
    const t = useTranslations();
    const isRTL = language === 'ar';
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="bg-gray-800 shadow-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <LogoIcon className="w-8 h-8 text-primary-500"/>
                        <div className={`flex flex-col ${isRTL ? 'items-end text-right' : ''}`}>
                            <span
                                className={`font-semibold text-slate-100 leading-tight ${
                                    isRTL ? 'text-lg sm:text-xl' : 'text-xl'
                                }`}
                            >
                                {t.navTitle}
                            </span>
                            <span
                                className={`text-slate-400 leading-tight ${
                                    isRTL ? 'text-[10px] sm:text-xs' : 'text-xs'
                                }`}
                            >
                                {t.navSubtitle}
                            </span>
                        </div>
                    </div>
                    <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className="hidden text-sm text-slate-300 sm:block">{userEmail}</div>
                        <div className="flex items-center rounded-full bg-gray-700 text-xs font-semibold text-slate-300">
                            {(['en', 'ar'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setLanguage(lang)}
                                    className={`px-3 py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                                        language === lang ? 'bg-primary-500 text-white' : 'text-slate-300'
                                    }`}
                                >
                                    {lang === 'en' ? 'EN' : 'العربية'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
