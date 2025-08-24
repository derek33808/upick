import { Home, Zap, BarChart3, Heart, MapPin } from 'lucide-react';
import { ShoppingCart, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { language } = useApp();

  const tabs = [
    {
      id: 'home',
      icon: Home,
      label: { en: 'Home', zh: '首页' }
    },
    {
      id: 'favorites',
      icon: Heart,
      label: { en: 'Watchlist', zh: '关注' }
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      label: { en: 'Cart', zh: '购物车' }
    },
    {
      id: 'map',
      icon: MapPin,
      label: { en: 'Map', zh: '地图' }
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 w-full max-w-full pb-safe">
      <div className="w-full lg:max-w-7xl lg:mx-auto">
        <div className="flex items-center justify-around py-3 lg:justify-center lg:space-x-6 w-full max-w-full overflow-x-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors min-w-0 lg:min-w-[100px] ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 shadow-sm'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 mb-1 lg:w-7 lg:h-7" />
                <span className={`text-xs font-medium leading-none lg:text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {tab.label[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}