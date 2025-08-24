import { Carrot, Apple, Beef, Milk, Egg } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface CategoryGridProps {
  onCategoryClick: (category: string) => void;
}

const categories = [
  {
    id: 'vegetable',
    icon: Carrot,
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    id: 'fruit',
    icon: Apple,
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  {
    id: 'meat',
    icon: Beef,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    id: 'dairy',
    icon: Milk,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'seafood',
    icon: Egg,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
];

export function CategoryGrid({ onCategoryClick }: CategoryGridProps) {
  const { language, products } = useApp();

  const text = {
    en: {
      title: 'Shop by Category',
      subtitle: 'Find the best prices for your favorite products',
      vegetable: 'Vegetables',
      fruit: 'Fruits',
      meat: 'Meat',
      dairy: 'Dairy',
      seafood: 'Seafood',
      products: 'products'
    },
    zh: {
      title: '按分类购物',
      subtitle: '为您喜爱的商品找到最优价格',
      vegetable: '蔬菜',
      fruit: '水果',
      meat: '肉类',
      dairy: '乳制品',
      seafood: '海鲜',
      products: '种商品'
    }
  };

  // Count products in each category
  const getCategoryCount = (categoryId: string) => {
    const uniqueProducts = new Set();
    products
      .filter(product => product.category === categoryId)
      .forEach(product => {
        uniqueProducts.add(product.name_en.toLowerCase());
      });
    return uniqueProducts.size;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h1>
        <p className={`text-lg text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const count = getCategoryCount(category.id);
          
          return (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`${category.bgColor} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${category.textColor}`}>
                    {count}
                  </div>
                  <div className={`text-sm ${category.textColor} opacity-75 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].products}
                  </div>
                </div>
              </div>
              
              <h3 className={`text-xl font-bold ${category.textColor} mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language][category.id as keyof typeof text.en]}
              </h3>
              
              <div className={`text-sm ${category.textColor} opacity-75 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {language === 'en' ? 'Compare prices across stores' : '比较各超市价格'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="mt-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600">
              {new Set(products.map(p => p.name_en.toLowerCase())).size}
            </div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Unique Products' : '种商品'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {new Set(products.map(p => p.supermarket_id)).size}
            </div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Supermarkets' : '家超市'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {products.filter(p => p.isSpecial).length}
            </div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Special Offers' : '特价商品'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}