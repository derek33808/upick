import { Search } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useApp } from '../contexts/AppContext';
import { UserMenu } from './UserMenu';
import { RefreshCw } from 'lucide-react';

export function Header() {
  const { language, searchTerm, setSearchTerm, refreshData, cleanDuplicateData, reduceProductsByCategory, isLoading } = useApp();

  // 添加跳转到首页的函数
  const handleLogoClick = () => {
    // 触发自定义事件来通知App组件跳转到首页
    window.dispatchEvent(new CustomEvent('navigateToHome'));
  };

  const text = {
    en: {
      appName: 'Upick',
      placeholder: 'Search products...',
      refresh: 'Refresh Data',
      cleanDuplicates: 'Clean Duplicates',
      reduceProducts: 'Reduce Products'
    },
    zh: {
      appName: '优品',
      placeholder: '搜索商品...',
      refresh: '刷新数据',
      cleanDuplicates: '清除重复',
      reduceProducts: '精简商品'
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 手动刷新数据...');
    await refreshData();
    console.log('✅ 手动刷新完成');
  };

  const handleCleanDuplicates = async () => {
    console.log('Cleaning duplicate data...');
    const success = await cleanDuplicateData();
    if (success) {
      console.log('Duplicate data cleaned successfully');
      await refreshData(); // 重新加载数据
    } else {
      console.log('Failed to clean duplicate data');
    }
  };

  const handleReduceProducts = async () => {
    console.log('Reducing products to 2 per category...');
    const success = await reduceProductsByCategory();
    if (success) {
      console.log('Products reduced successfully');
      await refreshData(); // 重新加载数据
    } else {
      console.log('Failed to reduce products');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center relative overflow-hidden">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-white"
              >
                {/* 简洁的U字形状 */}
                <path 
                  d="M6 4v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V4" 
                  stroke="currentColor" 
                  strokeWidth="2.8" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className={`text-xl sm:text-2xl font-bold text-primary-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].appName}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={text[language].placeholder}
                className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${language === 'zh' ? 'font-chinese' : ''}`}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title={text[language].refresh}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCleanDuplicates}
              disabled={isLoading}
              className="hidden sm:block px-3 py-1 text-xs text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title={text[language].cleanDuplicates}
            >
              {text[language].cleanDuplicates}
            </button>
            <button
              onClick={handleReduceProducts}
              disabled={isLoading}
              className="hidden sm:block px-3 py-1 text-xs text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title={text[language].reduceProducts}
            >
              {text[language].reduceProducts}
            </button>
            <LanguageToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}