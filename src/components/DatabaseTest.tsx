import React, { useState, useEffect } from 'react';
import { SupermarketService } from '../services/SupermarketService';
import { Supermarket } from '../types';
import { Database, RefreshCw, MapPin, Phone, Clock, Star } from 'lucide-react';

export function DatabaseTest() {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadSupermarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 测试组件 - 开始加载超市数据...');
      const data = await SupermarketService.getAllSupermarkets();
      setSupermarkets(data);
      setLastUpdated(new Date());
      console.log('✅ 测试组件 - 成功加载', data.length, '个超市');
    } catch (err) {
      console.error('❌ 测试组件 - 加载超市数据失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupermarkets();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">数据库连接测试</h2>
            <p className="text-gray-600">验证超市数据是否正确导入</p>
          </div>
        </div>
        <button
          onClick={loadSupermarkets}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 状态信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">超市总数</div>
          <div className="text-2xl font-bold text-gray-900">{supermarkets.length}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">连接状态</div>
          <div className={`text-lg font-semibold ${error ? 'text-red-600' : loading ? 'text-yellow-600' : 'text-green-600'}`}>
            {error ? '连接失败' : loading ? '加载中...' : '连接成功'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">最后更新</div>
          <div className="text-lg font-semibold text-gray-900">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-red-600 font-medium">错误信息:</div>
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* 超市列表 */}
      {supermarkets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            超市列表 ({supermarkets.length} 个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supermarkets.map((supermarket) => (
              <div key={supermarket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <img
                    src={supermarket.logo_url}
                    alt={supermarket.name_en}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {supermarket.name_en}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {supermarket.name_zh}
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{supermarket.location}</span>
                      </div>
                      
                      {supermarket.phone && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{supermarket.phone}</span>
                        </div>
                      )}
                      
                      {supermarket.hours && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{supermarket.hours}</span>
                        </div>
                      )}
                      
                      {supermarket.rating && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Star className="w-3 h-3" />
                          <span>{supermarket.rating}/5</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        坐标: ({supermarket.lat.toFixed(3)}, {supermarket.lng.toFixed(3)})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && supermarkets.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无超市数据</h3>
          <p className="text-gray-600">请检查数据库连接或重新导入数据</p>
        </div>
      )}
    </div>
  );
}


