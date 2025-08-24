import React from 'react';
import { X, MapPin, Phone, Clock, Star, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  storeProducts: any[];
  language: 'en' | 'zh';
}

export function StoreDetailModal({ isOpen, onClose, store, storeProducts, language }: StoreDetailModalProps) {
  if (!isOpen || !store) return null;

  const totalProducts = storeProducts.length;
  const avgPrice = totalProducts > 0 
    ? storeProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts 
    : 0;
  const cheapestProduct = storeProducts.reduce((min, p) => p.price < min.price ? p : min, storeProducts[0]);
  const mostExpensiveProduct = storeProducts.reduce((max, p) => p.price > max.price ? p : max, storeProducts[0]);

  // 按分类整理商品
  const productsByCategory = storeProducts.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <img 
                src={store.logo_url} 
                alt={store.name_en}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjgiIi8+Cjxzdmcgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB4PSIxMiIgeT0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMiA3YzAgLjYwMy42OSAxIDEuMjI3IDFhMS4xIDEuMSAwIDAgMCAxLjA3OC0uNiA0LjggMCAwIDAgMS4wMy0uOEw4IDNNMjAgN0g4djAzLjM4Ni0uODY2YS41LjUgMCAwIDEgLjUtLjVIQXY0LjZhMiAyIDAgMSAxIDQgMHYtMk05IDcuNXY0Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                }}
              />
            </div>
            
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {language === 'zh' ? store.name_zh : store.name_en}
              </h1>
              
              <div className="space-y-1 text-blue-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{store.location}</span>
                </div>
                
                {store.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{store.phone}</span>
                  </div>
                )}
                
                {store.hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{store.hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Statistics */}
          <div className="p-6 border-b border-gray-200">
            <h2 className={`text-lg font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Store Statistics' : '店铺统计'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Products' : '商品数量'}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">${avgPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Avg Price' : '平均价格'}
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">${cheapestProduct?.price?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Lowest Price' : '最低价格'}
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">${mostExpensiveProduct?.price?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Highest Price' : '最高价格'}
                </div>
              </div>
            </div>
          </div>

          {/* Products by Category */}
          <div className="p-6">
            <h2 className={`text-lg font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Products by Category' : '分类商品'}
            </h2>
            
            <div className="space-y-6">
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className={`font-medium text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                      {category} ({products.length} {language === 'en' ? 'items' : '件'})
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                          <img 
                            src={product.image_url} 
                            alt={product.name_en}
                            className="w-12 h-12 rounded-lg object-cover bg-gradient-to-br from-green-100 to-blue-100"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjgiIi8+Cjxzdmcgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB4PSIxMiIgeT0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LTggczMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPgo8cGF0aCBkPSJNMTIgNkM4LjY5IDYgNiA4LjY5IDYgMTJzMi42OSA2IDYgNiA2LTIuNjkgNi02LTIuNjkgNi02IDZ6Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                            }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">
                              {language === 'zh' ? product.name_zh : product.name_en}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              ${product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
