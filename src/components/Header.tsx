import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useApp } from '../contexts/AppContext';
import { UserMenu } from './UserMenu';
import { SearchModal } from './SearchModal';

export function Header() {
  const { language, searchTerm, setSearchTerm } = useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // 添加跳转到首页的函数
  const handleLogoClick = () => {
    // 触发自定义事件来通知App组件跳转到首页
    window.dispatchEvent(new CustomEvent('navigateToHome'));
  };

  const text = {
    en: {
      appName: 'Upick',
      placeholder: 'Search products...',
      search: 'Search'
    },
    zh: {
      appName: '优品',
      placeholder: '搜索商品...',
      search: '搜索'
    }
  };

  // 搜索提交处理
  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      // 触发搜索事件，跳转到商品页面
      window.dispatchEvent(new CustomEvent('navigateToSearch', { 
        detail: { searchTerm: searchTerm.trim() } 
      }));
    }
  };

  // 处理搜索框的 Enter 键 - 使用 onKeyDown 提高移动设备兼容性
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 防止表单提交
      handleSearchSubmit();
    }
  };

  return (
    <>
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

            {/* Search Section */}
            <div className="flex-1 flex items-center justify-center mx-2 sm:mx-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label={text[language].search}
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Desktop Search Bar */}
              <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md">
                <div className="relative flex w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="search"
                      inputMode="search"
                      autoComplete="off"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={text[language].placeholder}
                      className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base ${language === 'zh' ? 'font-chinese' : ''}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleSearchSubmit();
                    }}
                    className="px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors border border-primary-600 active:bg-primary-800"
                    title={text[language].search}
                  >
                    <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <LanguageToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </>
  );
}