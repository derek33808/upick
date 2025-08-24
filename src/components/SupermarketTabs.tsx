import { useApp } from '../contexts/AppContext';
import { Store, Check, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function SupermarketTabs() {
  const { language, supermarkets, selectedSupermarkets, setSelectedSupermarkets } = useApp();
  const [showModal, setShowModal] = useState(false);

  const text = {
    en: { 
      all: 'All Stores',
      selected: 'stores selected',
      clearAll: 'Clear All',
      selectAll: 'Select All',
      selectStores: 'Select Stores',
      done: 'Done',
      cancel: 'Cancel'
    },
    zh: { 
      all: '所有超市',
      selected: '个超市已选',
      clearAll: '清除全部',
      selectAll: '全选',
      selectStores: '选择超市',
      done: '完成',
      cancel: '取消'
    }
  };

  const isSelected = (supermarketId: number) => {
    return selectedSupermarkets.includes(supermarketId);
  };

  const handleToggleSelect = (supermarketId: number) => {
    if (isSelected(supermarketId)) {
      setSelectedSupermarkets(selectedSupermarkets.filter(id => id !== supermarketId));
    } else {
      setSelectedSupermarkets([...selectedSupermarkets, supermarketId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSupermarkets.length === supermarkets.length) {
      setSelectedSupermarkets([]);
    } else {
      setSelectedSupermarkets(supermarkets.map(s => s.id));
    }
  };

  const handleClearAll = () => {
    setSelectedSupermarkets([]);
  };

  const handleDone = () => {
    setShowModal(false);
  };

  const getDisplayText = () => {
    if (selectedSupermarkets.length === 0) {
      return text[language].all;
    } else if (selectedSupermarkets.length === supermarkets.length) {
      return text[language].all;
    } else {
      return `${selectedSupermarkets.length} ${text[language].selected}`;
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="py-3">
            {/* 移动端：显示触发按钮 */}
            <div className="block lg:hidden">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-gray-500" />
                  <span className={`text-sm font-medium text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {getDisplayText()}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 桌面端：显示水平滚动 */}
            <div className="hidden lg:block">
              {/* 控制按钮行 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Store className="w-5 h-5 text-gray-500" />
                  <span className={`text-sm font-medium text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {selectedSupermarkets.length === 0 ? text[language].all : `${selectedSupermarkets.length} ${text[language].selected}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${language === 'zh' ? 'font-chinese' : ''} ${
                      selectedSupermarkets.length === supermarkets.length 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedSupermarkets.length === supermarkets.length ? text[language].clearAll : text[language].selectAll}
                  </button>
                  {selectedSupermarkets.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className={`px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      {text[language].clearAll}
                    </button>
                  )}
                </div>
              </div>

              {/* 水平滚动的超市选择 */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                  {supermarkets.map((supermarket) => (
                    <button
                      key={supermarket.id}
                      onClick={() => handleToggleSelect(supermarket.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        isSelected(supermarket.id)
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                          : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-700'
                      } ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected(supermarket.id) 
                          ? 'border-primary-500 bg-primary-500' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected(supermarket.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <img
                        src={supermarket.logo_url}
                        alt={language === 'en' ? supermarket.name_en : supermarket.name_zh}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="text-sm font-medium">
                        {language === 'en' ? supermarket.name_en : supermarket.name_zh}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端弹出模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center lg:hidden" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-hidden">
            {/* 模态框头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h3 className={`text-lg font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].selectStores}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 控制按钮 */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {selectedSupermarkets.length === 0 ? text[language].all : `${selectedSupermarkets.length} ${text[language].selected}`}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'zh' ? 'font-chinese' : ''} ${
                      selectedSupermarkets.length === supermarkets.length 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {selectedSupermarkets.length === supermarkets.length ? text[language].clearAll : text[language].selectAll}
                  </button>
                  {selectedSupermarkets.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className={`px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                    >
                      {text[language].clearAll}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 超市列表 */}
            <div className="overflow-y-auto max-h-96">
              <div className="p-4 space-y-3">
                {supermarkets.map((supermarket) => (
                  <button
                    key={supermarket.id}
                    onClick={() => handleToggleSelect(supermarket.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected(supermarket.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected(supermarket.id) 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected(supermarket.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <img
                      src={supermarket.logo_url}
                      alt={language === 'en' ? supermarket.name_en : supermarket.name_zh}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {language === 'en' ? supermarket.name_en : supermarket.name_zh}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supermarket.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={handleDone}
                className={`w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                {text[language].done}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}