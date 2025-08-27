import { Carrot, Apple, Beef, Milk, Egg, Heart, ChevronDown, ChevronUp, MapPin, Info, Tag } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import { StoreDetailModal } from './StoreDetailModal';
import { Supermarket } from '../types';

interface CategoryGridProps {
  onCategoryClick: (category: string) => void;
}

const categories = [
  {
    id: 'special',
    icon: Tag,
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
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
  const { language, products, supermarkets } = useApp();
  
  // 店铺详情模态窗口状态
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Supermarket | null>(null);

  const text = {
    en: {
      title: 'Shop by Category',
      subtitle: 'Find the best prices for your favorite products',
      special: 'Special Offers',
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
      special: '特价商品',
      vegetable: '蔬菜',
      fruit: '水果',
      meat: '肉类',
      dairy: '乳制品',
      seafood: '海鲜',
      products: '种商品'
    }
  };

  // Helper function to clean product names by removing store suffixes
  const cleanProductName = (name: string) => {
    return name.replace(/\s*\(Store\s+\d+\)\s*$/i, '').trim();
  };

  // Count products in each category (using cleaned names for consistency)
  const getCategoryCount = (categoryId: string) => {
    const uniqueProducts = new Set();
    
    if (categoryId === 'special') {
      // For special category, count all products with isSpecial = true
      products
        .filter(product => product.isSpecial)
        .forEach(product => {
          const cleanedName = cleanProductName(product.name_en);
          uniqueProducts.add(cleanedName.toLowerCase());
        });
    } else {
      // For regular categories, filter by category
      products
        .filter(product => product.category === categoryId)
        .forEach(product => {
          const cleanedName = cleanProductName(product.name_en);
          uniqueProducts.add(cleanedName.toLowerCase());
        });
    }
    
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
              {supermarkets.length}
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

      {/* Supermarket groups with favorites */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className={`text-2xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {language === 'en' ? 'Browse by Supermarket' : '按超市浏览'}
          </h2>
        </div>
        <SupermarketBrandGroups 
          supermarkets={supermarkets} 
          language={language} 
          onStoreDetailClick={(store) => {
            setSelectedStore(store);
            setIsStoreModalOpen(true);
          }}
        />
      </div>
      
      {/* 店铺详情模态窗口 */}
      {isStoreModalOpen && selectedStore && (
        <StoreDetailModal
          isOpen={isStoreModalOpen}
          onClose={() => {
            setIsStoreModalOpen(false);
            setSelectedStore(null);
          }}
          store={selectedStore}
          storeProducts={products.filter(p => p.supermarket_id === selectedStore.id)}
          language={language}
        />
      )}
    </div>
  );
}

// 超市品牌分组组件
function SupermarketBrandGroups({ 
  supermarkets, 
  language, 
  onStoreDetailClick 
}: { 
  supermarkets: any[]; 
  language: 'en' | 'zh';
  onStoreDetailClick: (store: Supermarket) => void;
}) {
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]); // 默认全部关闭

  // 定义品牌分类逻辑
  const getBrandFromName = (name: string): string => {
    if (name.includes('Woolworths') || name.includes('Countdown')) return 'Woolworths (Countdown)';
    if (name.includes('New World')) return 'New World';
    if (name.includes('Pak\'nSave') || name.includes('PAK\'nSAVE')) return 'Pak\'nSave';
    if (name.includes('FreshChoice')) return 'FreshChoice';
    // 将所有亚洲相关超市归类为"亚洲超市"
    if (name.includes('大华') || name.includes('Lucky') || name.includes('China Town') || name.includes('华人') || 
        name.includes('Tai Wah') || name.includes('Big T Asian') || name.includes('Korean') || 
        name.includes('韩国') || name.includes('Ken\'s Mart') || name.includes('Asian') || 
        name.includes('亚洲') || name.includes('Basics Asian')) return 'Asian Supermarkets';
    // Four Square和其他未分类的超市都归入"其他超市"
    return '其他超市';
  };

  // 按品牌分组超市
  const brandGroups = supermarkets.reduce((acc, supermarket) => {
    const brand = getBrandFromName(supermarket.name_en);
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(supermarket);
    return acc;
  }, {} as Record<string, any[]>);

  // 定义品牌颜色和图标
  const brandStyles: Record<string, {color: string; bgColor: string; icon: string}> = {
    'Woolworths (Countdown)': { color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: '🛒' },
    'New World': { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: '🌍' },
    'Pak\'nSave': { color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: '💰' },
    'FreshChoice': { color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200', icon: '🥬' },
    'Asian Supermarkets': { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: '🍜' },
    '其他超市': { color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: '🏪' }
  };

  // 品牌名称多语言支持
  const getBrandDisplayName = (brand: string): string => {
    const brandNames: Record<string, Record<string, string>> = {
      'Woolworths (Countdown)': { en: 'Woolworths (Countdown)', zh: 'Woolworths (Countdown)' },
      'New World': { en: 'New World', zh: 'New World' },
      'Pak\'nSave': { en: 'Pak\'nSave', zh: 'Pak\'nSave' },
      'FreshChoice': { en: 'FreshChoice', zh: 'FreshChoice' },
      'Asian Supermarkets': { en: 'Asian Supermarkets', zh: '亚洲超市' },
      '其他超市': { en: 'Other Stores', zh: '其他超市' }
    };
    return brandNames[brand]?.[language] || brand;
  };

  // 定义品牌排序顺序，其他超市放最后
  const brandOrder = ['Woolworths (Countdown)', 'New World', 'Pak\'nSave', 'FreshChoice', 'Asian Supermarkets', '其他超市'];

  const sortedBrandEntries = Object.entries(brandGroups).sort(([a], [b]) => {
    const indexA = brandOrder.indexOf(a);
    const indexB = brandOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const toggleBrand = (brand: string) => {
    setExpandedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="space-y-4">
      {sortedBrandEntries.map(([brand, stores]) => {
        const isExpanded = expandedBrands.includes(brand);
        const style = brandStyles[brand] || brandStyles['其他超市'];
        
        return (
          <div key={brand} className={`${style.bgColor} rounded-2xl border-2 overflow-hidden transition-all duration-300`}>
            {/* 品牌头部 */}
            <button
              onClick={() => toggleBrand(brand)}
              className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-200 ${style.color}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{style.icon}</span>
                <div className="text-left">
                  <h3 className={`text-lg font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {getBrandDisplayName(brand)}
                  </h3>
                  <p className="text-sm opacity-75">
                    {(stores as any[]).length} {language === 'en' ? 'locations' : '家门店'}
                  </p>
                </div>
              </div>
              {isExpanded ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>

            {/* 超市列表 */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(stores as any[]).map((supermarket: any) => (
                    <SupermarketCard 
                      key={supermarket.id} 
                      supermarket={supermarket} 
                      language={language}
                      onStoreDetailClick={onStoreDetailClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Google地图位置查看按钮组件
function LocationButton({ supermarket, language }: { supermarket: any; language: 'en' | 'zh' }) {
  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (supermarket.lat && supermarket.lng) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${supermarket.lat},${supermarket.lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocationClick}
      className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-200 hover:scale-110 active:scale-95"
      title={language === 'en' ? 'View on Google Maps' : '在Google地图中查看'}
    >
      <MapPin className="w-4 h-4" />
    </button>
  );
}

// 超市卡片组件
function SupermarketCard({ 
  supermarket, 
  language, 
  onStoreDetailClick 
}: { 
  supermarket: any; 
  language: 'en' | 'zh';
  onStoreDetailClick: (store: Supermarket) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start space-x-3">
        <img 
          src={supermarket.logo_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjIwIi8+Cjxzdmcgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIxMCIgeT0iMTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNNiAyTDMgNnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNmwtMy00eiIvPgo8cGF0aCBkPSJtOCA2IDQgNCIvPgo8L3N2Zz4KPC9zdmc+'} 
          alt={language === 'en' ? supermarket.name_en : supermarket.name_zh}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjIwIi8+Cjxzdmcgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIxMCIgeT0iMTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNNiAyTDMgNnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNmwtMy00eiIvPgo8cGF0aCBkPSJtOCA2IDQgNCIvPgo8L3N2Zz4KPC9zdmc+';
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-gray-900 text-sm mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {language === 'en' ? supermarket.name_en : supermarket.name_zh}
          </h4>
          <div className="text-xs text-gray-600 leading-relaxed mb-2 break-words">
            {supermarket.location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {supermarket.rating && (
                <span className="text-yellow-600">⭐ {supermarket.rating}</span>
              )}
              {supermarket.phone && (
                <span className="text-gray-400">📞</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <LocationButton supermarket={supermarket} language={language} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStoreDetailClick(supermarket);
                }}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                title={language === 'en' ? 'View store details' : '查看店铺详情'}
              >
                <Info className="w-4 h-4" />
              </button>
              <StoreSaveButton storeId={supermarket.id} language={language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreSaveButton({ storeId, language }: { storeId: number; language: 'en' | 'zh' }) {
  const { isAuthenticated, user } = useAuth();
  const { checkIsStoreFavorite, addToStoreFavorites, removeFromStoreFavorites } = useUser();
  const [saving, setSaving] = useState(false);
  
  // 直接计算当前收藏状态，避免状态同步问题
  const saved = checkIsStoreFavorite(storeId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }
    
    if (saving) return;
    
    setSaving(true);
    
    try {
      let result = false;
      if (saved) {
        result = await removeFromStoreFavorites(storeId);
      } else {
        result = await addToStoreFavorites(storeId);
      }
      
      if (result) {
        window.dispatchEvent(new CustomEvent('storeFavoritesUpdated'));
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-1.5 rounded-full transition-all duration-200 ${
        saved 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${
        saving 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-110 active:scale-95'
      }`}
      disabled={saving}
      title={saved ? (language === 'en' ? 'Remove from favorites' : '取消收藏') : (language === 'en' ? 'Add to favorites' : '添加收藏')}
    >
      <Heart className={`w-4 h-4 transition-all ${saved ? 'fill-current text-blue-600' : 'text-gray-500'}`} />
    </button>
  );
}