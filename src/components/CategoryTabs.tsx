import { Carrot, Apple, Beef, Fish, Milk, LayoutGrid } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const categories = [
  { id: 'all', icon: LayoutGrid },
  { id: 'vegetable', icon: Carrot },
  { id: 'fruit', icon: Apple },
  { id: 'meat', icon: Beef },
  { id: 'seafood', icon: Fish },
  { id: 'dairy', icon: Milk }
];

export function CategoryTabs() {
  const { language, selectedCategory, setSelectedCategory } = useApp();

  const text = {
    en: {
      all: 'All',
      vegetable: 'Vegetables',
      fruit: 'Fruits',
      meat: 'Meat',
      seafood: 'Seafood',
      dairy: 'Dairy'
    },
    zh: {
      all: '全部',
      vegetable: '蔬菜',
      fruit: '水果',
      meat: '肉类',
      seafood: '海鲜',
      dairy: '乳制品'
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="py-2 sm:py-3">
          <div className="flex justify-center gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors min-w-0 flex-shrink-0 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                  <span className={`text-xs font-medium text-center leading-none whitespace-nowrap ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language][category.id as keyof typeof text.en]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}