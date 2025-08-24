import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, AlertCircle, Heart, ShoppingCart, User, LogIn } from 'lucide-react';

export function FunctionalityTest() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { 
    addToFavorites, 
    removeFromFavorites, 
    checkIsFavorite,
    addToCart,
    removeFromCart,
    checkIsInCart,
    favorites,
    cart,
    isLoading: userLoading
  } = useUser();
  const { language, products } = useApp();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const text = {
    en: {
      title: 'Functionality Test',
      runTests: 'Run All Tests',
      testing: 'Testing...',
      loginTest: 'Login Test',
      favoritesTest: 'Favorites Test',
      cartTest: 'Shopping Cart Test',
      passed: 'Passed',
      failed: 'Failed',
      notRun: 'Not Run',
      loginRequired: 'Please login first',
      testProduct: 'Test Product',
      addingToFavorites: 'Adding to favorites...',
      removingFromFavorites: 'Removing from favorites...',
      addingToCart: 'Adding to cart...',
      removingFromCart: 'Removing from cart...',
      allTestsPassed: 'All tests passed!',
      someTestsFailed: 'Some tests failed. Check console for details.',
      currentUser: 'Current User',
      favoritesCount: 'Favorites Count',
      cartItemsCount: 'Cart Items Count'
    },
    zh: {
      title: '功能测试',
      runTests: '运行所有测试',
      testing: '测试中...',
      loginTest: '登录测试',
      favoritesTest: '收藏测试',
      cartTest: '购物车测试',
      passed: '通过',
      failed: '失败',
      notRun: '未运行',
      loginRequired: '请先登录',
      testProduct: '测试商品',
      addingToFavorites: '添加到收藏...',
      removingFromFavorites: '从收藏移除...',
      addingToCart: '添加到购物车...',
      removingFromCart: '从购物车移除...',
      allTestsPassed: '所有测试通过！',
      someTestsFailed: '部分测试失败。请检查控制台了解详情。',
      currentUser: '当前用户',
      favoritesCount: '收藏数量',
      cartItemsCount: '购物车商品数量'
    }
  };

  const runAllTests = async () => {
    if (!isAuthenticated || !user) {
      alert(text[language].loginRequired);
      return;
    }

    setIsRunningTests(true);
    setTestResults({});

    const testProduct = products[0]; // Use first product for testing
    if (!testProduct) {
      console.error('No products available for testing');
      setIsRunningTests(false);
      return;
    }

    const results: Record<string, boolean> = {};

    try {
      // Test 1: Favorites functionality
      console.log('🧪 Testing favorites functionality...');
      
      // Check initial state
      const initialFavoriteState = checkIsFavorite(testProduct.id);
      console.log('Initial favorite state:', initialFavoriteState);

      // Add to favorites
      const addResult = await addToFavorites(testProduct.id);
      const afterAddState = checkIsFavorite(testProduct.id);
      
      // Remove from favorites
      const removeResult = await removeFromFavorites(testProduct.id);
      const afterRemoveState = checkIsFavorite(testProduct.id);

      results.favoritesTest = addResult && removeResult && afterAddState && !afterRemoveState;
      console.log('Favorites test result:', results.favoritesTest);

      // Test 2: Cart functionality
      console.log('🧪 Testing cart functionality...');
      
      // Check initial cart state
      const initialCartState = checkIsInCart(testProduct.id);
      console.log('Initial cart state:', initialCartState);

      // Add to cart
      const cartAddResult = await addToCart(testProduct.id, 1);
      const afterCartAddState = checkIsInCart(testProduct.id);
      
      // Remove from cart
      const cartRemoveResult = await removeFromCart(testProduct.id);
      const afterCartRemoveState = checkIsInCart(testProduct.id);

      results.cartTest = cartAddResult && cartRemoveResult && afterCartAddState.inCart && !afterCartRemoveState.inCart;
      console.log('Cart test result:', results.cartTest);

      // Test 3: Login state
      results.loginTest = isAuthenticated && !!user;

    } catch (error) {
      console.error('Test error:', error);
      results.favoritesTest = false;
      results.cartTest = false;
      results.loginTest = false;
    }

    setTestResults(results);
    setIsRunningTests(false);

    // Show summary
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    if (passedTests === totalTests) {
      console.log('✅ All tests passed!');
    } else {
      console.log(`❌ ${passedTests}/${totalTests} tests passed`);
    }
  };

  const getTestStatusIcon = (testName: string) => {
    if (isRunningTests) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
    }
    
    if (!(testName in testResults)) {
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
    
    return testResults[testName] ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getTestStatusText = (testName: string) => {
    if (isRunningTests) return text[language].testing;
    if (!(testName in testResults)) return text[language].notRun;
    return testResults[testName] ? text[language].passed : text[language].failed;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{text[language].title}</h2>
        <button
          onClick={runAllTests}
          disabled={isRunningTests || !isAuthenticated}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunningTests ? text[language].testing : text[language].runTests}
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">{text[language].currentUser}</span>
          </div>
          <div className="text-sm text-gray-600">
            {isAuthenticated ? user?.name || user?.email : text[language].loginRequired}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">{text[language].favoritesCount}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {favorites.length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">{text[language].cartItemsCount}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {cart.length}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LogIn className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">{text[language].loginTest}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTestStatusIcon('loginTest')}
              <span className="text-sm text-gray-600">
                {getTestStatusText('loginTest')}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-red-600" />
              <span className="font-medium text-gray-900">{text[language].favoritesTest}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTestStatusIcon('favoritesTest')}
              <span className="text-sm text-gray-600">
                {getTestStatusText('favoritesTest')}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">{text[language].cartTest}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTestStatusIcon('cartTest')}
              <span className="text-sm text-gray-600">
                {getTestStatusText('cartTest')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{text[language].loginRequired}</span>
          </div>
        </div>
      )}
    </div>
  );
}
