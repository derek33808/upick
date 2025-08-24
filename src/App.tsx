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
import { MapView } from './components/MapView';
import { FavoritesView } from './components/FavoritesView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { UserProfile } from './components/UserProfile';
import { Product } from './types';

function AppContent() {
  const { isLoading, connectionStatus } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 监听logo点击事件，跳转到首页
  useEffect(() => {
    const handleNavigateToHome = () => {
      setActiveTab('home');
      setSelectedCategory(null);
      setSelectedProductName(null);
      setSelectedProduct(null);
    };
    
    const handleNavigateToFavorites = () => {
      setActiveTab('favorites');
      setSelectedCategory(null);
      setSelectedProductName(null);
      setSelectedProduct(null);
    };
    
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };

    window.addEventListener('navigateToHome', handleNavigateToHome);
    window.addEventListener('navigateToFavorites', handleNavigateToFavorites);
    window.addEventListener('showLoginModal', handleShowLoginModal);
    
    return () => {
      window.removeEventListener('navigateToHome', handleNavigateToHome);
      window.removeEventListener('navigateToFavorites', handleNavigateToFavorites);
      window.removeEventListener('showLoginModal', handleShowLoginModal);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setSelectedProductName(null);
  };

  const handleProductNameClick = (productName: string) => {
    setSelectedProductName(productName);
  };

  const handleBackToCategory = () => {
    setSelectedProductName(null);
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
      case 'map':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <MapView />
          </div>
        );
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

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
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