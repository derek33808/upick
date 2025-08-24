import { Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function FilterSort() {
  const { language, sortBy, setSortBy } = useApp();

  const text = {
    en: {
      sortBy: 'Sort by',
      price_asc: 'Price: Low to High',
      price_desc: 'Price: High to Low',
      updated: 'Recently Updated',
      name: 'Name A-Z'
    },
    zh: {
      sortBy: '排序',
      price_asc: '价格: 低到高',
      price_desc: '价格: 高到低',
      updated: '最近更新',
      name: '名称 A-Z'
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3 w-full overflow-x-hidden relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].sortBy}:
            </span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              language === 'zh' ? 'font-chinese' : ''
            }`}
          >
            <option value="updated">{text[language].updated}</option>
            <option value="price_asc">{text[language].price_asc}</option>
            <option value="price_desc">{text[language].price_desc}</option>
            <option value="name">{text[language].name}</option>
          </select>
        </div>
      </div>
    </div>
  );
}