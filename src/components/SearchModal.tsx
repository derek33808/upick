import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { language, searchTerm, setSearchTerm } = useApp();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = {
    en: {
      placeholder: 'Search products...',
      search: 'Search',
      cancel: 'Cancel',
      clear: 'Clear',
      noResults: 'No search suggestions',
      recentSearches: 'Recent Searches'
    },
    zh: {
      placeholder: '搜索商品...',
      search: '搜索',
      cancel: '取消',
      clear: '清除',
      noResults: '暂无搜索建议',
      recentSearches: '最近搜索'
    }
  };

  // 自动聚焦输入框和阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
      
      // 延迟聚焦以确保弹窗完全显示
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      // 恢复背景滚动
      document.body.style.overflow = '';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 同步全局搜索词
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // 处理搜索提交
  const handleSearchSubmit = () => {
    if (localSearchTerm.trim()) {
      setSearchTerm(localSearchTerm.trim());
      // 触发搜索事件，跳转到商品页面
      window.dispatchEvent(new CustomEvent('navigateToSearch', { 
        detail: { searchTerm: localSearchTerm.trim() } 
      }));
      // 保存到本地搜索历史
      saveToSearchHistory(localSearchTerm.trim());
      onClose();
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // 清除搜索框
  const handleClear = () => {
    setLocalSearchTerm('');
    inputRef.current?.focus();
  };

  // 搜索历史管理
  const getSearchHistory = (): string[] => {
    try {
      const history = localStorage.getItem('upick_search_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  };

  const saveToSearchHistory = (term: string) => {
    try {
      const history = getSearchHistory();
      const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 10);
      localStorage.setItem('upick_search_history', JSON.stringify(newHistory));
    } catch {
      // 忽略存储错误
    }
  };

  const clearSearchHistory = () => {
    try {
      localStorage.removeItem('upick_search_history');
    } catch {
      // 忽略存储错误
    }
  };

  const searchHistory = getSearchHistory();

  // 处理历史搜索点击
  const handleHistoryClick = (term: string) => {
    setLocalSearchTerm(term);
    setSearchTerm(term);
    window.dispatchEvent(new CustomEvent('navigateToSearch', { 
      detail: { searchTerm: term } 
    }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center bg-white border-b border-gray-200 px-4 py-3 safe-area-top">
        <button
          onClick={onClose}
          className="mr-3 p-2 -m-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={text[language].cancel}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              autoComplete="off"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={text[language].placeholder}
              className={`w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${language === 'zh' ? 'font-chinese' : ''}`}
            />
            {localSearchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={text[language].clear}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleSearchSubmit}
          disabled={!localSearchTerm.trim()}
          className={`ml-3 px-4 py-3 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''} ${
            localSearchTerm.trim()
              ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {text[language].search}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-safe">
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium text-gray-500 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].recentSearches}
              </h3>
              <button
                onClick={clearSearchHistory}
                className={`text-sm text-primary-600 hover:text-primary-700 ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                {text[language].clear}
              </button>
            </div>
            <div className="space-y-2">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchHistory.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={`text-gray-500 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].noResults}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
