import { Globe } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function LanguageToggle() {
  const { language, setLanguage } = useApp();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
    >
      <Globe className="w-4 h-4 text-gray-600" />
      <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap" style={{ fontFamily: language === 'zh' ? 'Arial, sans-serif' : 'inherit', letterSpacing: language === 'zh' ? '0.5px' : 'normal' }}>
        {language === 'en' ? '中文' : 'EN'}
      </span>
    </button>
  );
}