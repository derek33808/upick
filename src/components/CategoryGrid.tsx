import { Carrot, Apple, Beef, Milk, Egg, Store, Heart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';

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

      {/* Supermarket groups with favorites */}
      <div className="mt-12">
        <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {language === 'en' ? 'Browse by Supermarket' : '按超市浏览'}
        </h2>
        {/* 预计算唯一超市列表（避免在渲染中调用 hooks） */}
        {(() => {
          const list = products.map(p => p.supermarket).filter(Boolean) as any[];
          const uniqueStores = Array.from(new Map(list.map(s => [s.id, s])).values());
          const regions: Array<{key:'north'|'south'; name:string; stores:any[]}> = [
            { key: 'north', name: language==='en'?'North Area':'北区', stores: uniqueStores.filter((s: any) => s.lat > -43.5) },
            { key: 'south', name: language==='en'?'South Area':'南区', stores: uniqueStores.filter((s: any) => s.lat <= -43.5) }
          ];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {regions.map(({key, name, stores}) => {
                const regionKey = key;
                const regionStores = stores;
                const regionName = name;
            return (
              <div key={regionKey} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center mb-3">
                  <Store className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className={`text-lg font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>{regionName}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {regionStores.map((s: any) => {
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border hover:shadow-sm">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={s.logo_url} 
                            alt={language==='en'? s.name_en : s.name_zh}
                            className="w-8 h-8 rounded-full object-cover bg-gradient-to-br from-blue-500 to-purple-600"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjE2Ii8+Cjxzdmcgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB4PSI4IiB5PSI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KPHBhdGggZD0iTTIgN2MwIC42MDMuNjkgMSAxLjIyNyAxYTEuMSAxLjEgMCAwIDAgMS4wNzgtLjYgNC44IDAgMCAwIDEuMDMtLjhMOCAzTTIwIDdIOHYwMy4zODYtLjg2NmEuNS41IDAgMCAxIC41LS41SDl2NC42YTIgMiAwIDEgMSA0IDB2LTJNOSA3LjV2NCIvPgo8L3N2Zz4KPC9zdmc+';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{language==='en'? s.name_en : s.name_zh}</div>
                            <div className="text-xs text-gray-500">{s.location}</div>
                          </div>
                        </div>
                        <StoreSaveButton storeId={s.id} language={language} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
              })}
            </div>
          );
        })()}
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

  // 减少日志输出，避免控制台过多信息

  const handleClick = async (e: React.MouseEvent) => {
    console.log(`[StoreSaveButton] 🔥 按钮被点击! storeId=${storeId}, saved=${saved}, saving=${saving}`);
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      console.log(`[StoreSaveButton] ❌ 用户未登录，显示登录弹窗`);
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }
    
    if (saving) {
      console.log(`[StoreSaveButton] ⏳ 正在保存中，忽略点击`);
      return;
    }
    
    console.log(`[StoreSaveButton] 🚀 开始保存操作...`);
    setSaving(true);
    
    try {
      let result = false;
      if (saved) {
        console.log(`[StoreSaveButton] 🗑️ 调用 removeFromStoreFavorites(${storeId})`);
        result = await removeFromStoreFavorites(storeId);
      } else {
        console.log(`[StoreSaveButton] ➕ 调用 addToStoreFavorites(${storeId})`);
        result = await addToStoreFavorites(storeId);
      }
      console.log(`[StoreSaveButton] 📋 操作结果: ${result ? '✅ 成功' : '❌ 失败'}`);
      
      if (result) {
        // 强制刷新店铺收藏状态
        console.log(`[StoreSaveButton] 🔄 强制刷新店铺收藏状态...`);
        // 触发全局状态更新
        window.dispatchEvent(new CustomEvent('storeFavoritesUpdated'));
        // 强制组件重新渲染来显示最新状态
        setSaving(false);
        setSaving(true);
        setTimeout(() => setSaving(false), 100);
      }
    } catch (error) {
      console.error(`[StoreSaveButton] 💥 操作异常:`, error);
    } finally {
      setSaving(false);
      console.log(`[StoreSaveButton] 🏁 操作完成`);
    }
  };

  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        saved 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${
        saving 
          ? 'opacity-50 cursor-not-allowed animate-pulse' 
          : 'hover:scale-110 active:scale-95'
      }`}
      disabled={saving}
      title={saved ? (language === 'en' ? 'Remove from favorites' : '取消收藏') : (language === 'en' ? 'Add to favorites' : '添加收藏')}
    >
      <Heart className={`w-5 h-5 transition-all ${saved ? 'fill-current text-blue-600' : 'text-gray-500'}`} />
    </button>
  );
}