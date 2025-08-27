import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { Header } from './components/Header';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { SubCategoryView } from './components/SubCategoryView';
import { ProductDetail } from './components/ProductDetail';
import { LoginModal } from './components/LoginModal';
import { BottomNavigation } from './components/BottomNavigation';
import { WatchlistView } from './components/WatchlistView';
import { ShoppingCartView } from './components/ShoppingCartView';
import { CompareView } from './components/CompareView';
import { ProductCompareView } from './components/ProductCompareView';
import { ProductGrid } from './components/ProductGrid';
import { MapView } from './components/MapView';
import { FavoritesView } from './components/FavoritesView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { UserProfile } from './components/UserProfile';
import { DatabaseTest } from './components/DatabaseTest';

import { Product } from './types';

function AppContent() {
  const { isLoading, connectionStatus } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 推送当前状态到浏览器历史
  const pushStateToHistory = (state: any) => {
    const url = new URL(window.location.href);
    url.hash = `#${state.activeTab}`;
    
    if (state.selectedCategory) {
      url.hash += `/${state.selectedCategory}`;
    }
    if (state.selectedProductName) {
      url.hash += `/${encodeURIComponent(state.selectedProductName)}`;
    }
    
    window.history.pushState(state, '', url.toString());
  };

  // 从URL hash解析状态
  const parseStateFromHash = () => {
    const hash = window.location.hash.slice(1); // 移除 #
    if (!hash) return { activeTab: 'home' };
    
    const parts = hash.split('/');
    const state: any = { activeTab: parts[0] || 'home' };
    
    if (parts[1]) state.selectedCategory = parts[1];
    if (parts[2]) state.selectedProductName = decodeURIComponent(parts[2]);
    
    return state;
  };

  // 监听浏览器返回/前进按钮
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state || parseStateFromHash();
      
      setActiveTab(state.activeTab || 'home');
      setSelectedCategory(state.selectedCategory || null);
      setSelectedProductName(state.selectedProductName || null);
      
      // 只有当状态中没有showProductDetail时才关闭产品详情
      if (!state.showProductDetail) {
        setSelectedProduct(null);
      }
      setShowLoginModal(false); // 关闭登录模态框
    };

    // 初始化状态
    const initialState = parseStateFromHash();
    if (initialState.activeTab !== 'home' || initialState.selectedCategory || initialState.selectedProductName) {
      setActiveTab(initialState.activeTab);
      setSelectedCategory(initialState.selectedCategory || null);
      setSelectedProductName(initialState.selectedProductName || null);
    } else {
      // 确保首页有历史状态
      window.history.replaceState({ activeTab: 'home' }, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 监听logo点击事件，跳转到首页
  useEffect(() => {
    const handleNavigateToHome = () => {
      const newState = { 
        activeTab: 'home',
        selectedCategory: null,
        selectedProductName: null 
      };
      
      setActiveTab('home');
      setSelectedCategory(null);
      setSelectedProductName(null);
      setSelectedProduct(null);
      
      pushStateToHistory(newState);
    };
    
    const handleNavigateToFavorites = () => {
      const newState = { 
        activeTab: 'favorites',
        selectedCategory: null,
        selectedProductName: null 
      };
      
      setActiveTab('favorites');
      setSelectedCategory(null);
      setSelectedProductName(null);
      setSelectedProduct(null);
      
      pushStateToHistory(newState);
    };
    
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };

    const handleNavigateToSearch = (event: any) => {
      const newState = { 
        activeTab: 'products',
        selectedCategory: null,
        selectedProductName: null 
      };
      
      setActiveTab('products');
      setSelectedCategory(null);
      setSelectedProductName(null);
      setSelectedProduct(null);
      
      pushStateToHistory(newState);
    };

    window.addEventListener('navigateToHome', handleNavigateToHome);
    window.addEventListener('navigateToFavorites', handleNavigateToFavorites);
    window.addEventListener('navigateToSearch', handleNavigateToSearch);
    window.addEventListener('showLoginModal', handleShowLoginModal);
    
    return () => {
      window.removeEventListener('navigateToHome', handleNavigateToHome);
      window.removeEventListener('navigateToFavorites', handleNavigateToFavorites);
      window.removeEventListener('navigateToSearch', handleNavigateToSearch);
      window.removeEventListener('showLoginModal', handleShowLoginModal);
    };
  }, []);

  // Handle navigation from ProductGrid to comparison view
  useEffect(() => {
    const handleNavigateToProductComparison = (event: any) => {
      const { productName } = event.detail;
      
      // Switch to home tab and set product name for comparison
      const newState = { 
        activeTab: 'home',
        selectedCategory: null,
        selectedProductName: productName 
      };
      
      setActiveTab('home');
      setSelectedCategory(null);
      setSelectedProductName(productName);
      setSelectedProduct(null);
      
      pushStateToHistory(newState);
    };

    window.addEventListener('navigateToProductComparison', handleNavigateToProductComparison);
    
    return () => {
      window.removeEventListener('navigateToProductComparison', handleNavigateToProductComparison);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    // 产品详情是模态框，不需要改变URL，但要添加到历史中以便返回
    const currentState = { activeTab, selectedCategory, selectedProductName };
    window.history.pushState({ ...currentState, showProductDetail: true }, '');
  };

  const handleCategoryClick = (category: string) => {
    const newState = { 
      activeTab,
      selectedCategory: category,
      selectedProductName: null 
    };
    
    setSelectedCategory(category);
    setSelectedProductName(null);
    pushStateToHistory(newState);
  };

  const handleBackToHome = () => {
    const newState = { 
      activeTab,
      selectedCategory: null,
      selectedProductName: null 
    };
    
    setSelectedCategory(null);
    setSelectedProductName(null);
    pushStateToHistory(newState);
  };

  const handleProductNameClick = (productName: string) => {
    const newState = { 
      activeTab,
      selectedCategory,
      selectedProductName: productName 
    };
    
    setSelectedProductName(productName);
    pushStateToHistory(newState);
  };

  const handleBackToCategory = () => {
    const newState = { 
      activeTab,
      selectedCategory,
      selectedProductName: null 
    };
    
    setSelectedProductName(null);
    pushStateToHistory(newState);
  };
  
  if (isLoading) {
    return <LoadingSpinner connectionStatus={connectionStatus} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        if (selectedProductName) {
          return (
            <div className="pb-24">
              <ProductCompareView
                productName={selectedProductName}
                onBack={handleBackToCategory}
                onProductClick={handleProductClick}
              />
            </div>
          );
        } else if (selectedCategory) {
          return (
            <div className="pb-24">
              <SubCategoryView
                category={selectedCategory}
                onBack={handleBackToHome}
                onProductNameClick={handleProductNameClick}
              />
            </div>
          );
        } else {
          return (
            <div className="pb-24">
              <CategoryGrid onCategoryClick={handleCategoryClick} />
            </div>
          );
        }
      case 'specials':
        return (
          <div className="pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Special offers content can be added here */}
            </div>
          </div>
        );
      case 'compare':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <CompareView />
          </div>
        );
      case 'favorites':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <FavoritesView 
              onProductClick={handleProductClick}
              onLoginClick={() => setShowLoginModal(true)}
            />
          </div>
        );
      case 'cart':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <ShoppingCartView />
          </div>
        );
      case 'products':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <ProductGrid />
          </div>
        );
      case 'map':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <MapView />
          </div>
        );
      case 'database-test':
        // 只在开发环境显示数据库测试页面
        if (process.env.NODE_ENV === 'development') {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
              <DatabaseTest />
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <Header />
      
      {renderContent()}

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          const newState = { 
            activeTab: tab,
            selectedCategory: null,
            selectedProductName: null 
          };
          
          setActiveTab(tab);
          setSelectedCategory(null);
          setSelectedProductName(null);
          setSelectedProduct(null);
          pushStateToHistory(newState);
        }} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;