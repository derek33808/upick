import { useState } from 'react';
import { User, LogIn, Settings, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { LoginModal } from './LoginModal';
import { UserProfile } from './UserProfile';
import { AdminPanel } from './AdminPanel';

export function UserMenu() {
  const { language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const text = {
    en: {
      login: 'Login',
      profile: 'My Profile',
      favorites: 'My Favorites',
      settings: 'Settings',
      welcome: 'Welcome',
      admin: 'Admin Panel'
    },
    zh: {
      login: '登录',
      profile: '我的资料',
      favorites: '我的收藏',
      settings: '设置',
      welcome: '欢迎',
      admin: '管理面板'
    }
  };

  // Check if user is admin (for demo purposes, we'll check if email contains 'admin' or user ID is 1)
  const isAdmin = user?.email === 'admin@upick.life' || user?.email === 'admin@admin.com' || user?.name === 'Administrator';

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  const handleFavoritesClick = () => {
    // 触发导航到收藏页面
    window.dispatchEvent(new CustomEvent('navigateToFavorites'));
    setShowDropdown(false);
  };

  const handleAdminClick = () => {
    setShowAdminPanel(true);
    setShowDropdown(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex-shrink-0 ${language === 'zh' ? 'font-chinese' : ''}`}
        >
          <LogIn className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{text[language].login}</span>
        </button>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
            alt={user?.name}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlKjmiLc8L3RleHQ+PC9zdmc+';
            }}
          />
          <div className="hidden sm:block text-left">
            <div className={`text-xs text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].welcome}
            </div>
            <div className={`text-xs font-medium text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {user?.name}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className={`text-xs sm:text-sm font-medium text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {user?.name}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>

            <button
              onClick={handleProfileClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700">{text[language].profile}</span>
            </button>

            <button
              onClick={handleFavoritesClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              <Heart className="w-4 h-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700">{text[language].favorites}</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-700">{text[language].admin}</span>
              </button>
            )}

            <button
              onClick={() => setShowDropdown(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700">{text[language].settings}</span>
            </button>
          </div>
        )}

        {/* Backdrop */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      <UserProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </>
  );
}