import { Zap, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface SpecialOffersProps {
  onProductClick: (product: Product) => void;
}

export function SpecialOffers({ onProductClick }: SpecialOffersProps) {
  const { language, products, isLoading } = useApp();
  
  const specialProducts = products.filter(product => product.isSpecial);

  const text = {
    en: {
      title: 'Today\'s Special Offers',
      subtitle: 'Limited time deals ending soon',
      noSpecials: 'No special offers available right now'
    },
    zh: {
      title: '今日特价商品',
      subtitle: '限时优惠，即将结束',
      noSpecials: '暂无特价商品'
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 ml-8 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (specialProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {language === 'en' ? 'No special offers available - check database' : '暂无特价商品 - 请检查数据库'}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-6 h-6 text-accent-yellow" />
          <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].title}
          </h2>
        </div>
        <div className="flex items-center space-x-1 text-orange-600 ml-8">
          <Clock className="w-4 h-4" />
          <span className={`text-sm font-medium ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].subtitle}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {specialProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
}