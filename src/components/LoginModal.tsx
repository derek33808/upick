import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { language } = useApp();
  const { login, register, error, clearError, isLoading, createDemoAccounts } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isCreatingDemoAccounts, setIsCreatingDemoAccounts] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    address: '',
    postal_code: ''
  });

  const text = {
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      phone: 'Phone Number',
      region: 'Region',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      switchToRegister: "Don't have an account? Register",
      switchToLogin: 'Already have an account? Login',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
      namePlaceholder: 'Enter your full name',
      phonePlaceholder: '+64 21 123 4567',
      regionPlaceholder: 'Select your region',
      optional: '(Optional)',
      christchurch: 'Christchurch',
      auckland: 'Auckland',
      wellington: 'Wellington',
      hamilton: 'Hamilton',
      tauranga: 'Tauranga',
      dunedin: 'Dunedin'
    },
    zh: {
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      name: '姓名',
      phone: '电话号码',
      region: '地区',
      loginButton: '登录',
      registerButton: '创建账户',
      switchToRegister: '没有账户？立即注册',
      switchToLogin: '已有账户？立即登录',
      emailPlaceholder: '请输入邮箱',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请确认密码',
      namePlaceholder: '请输入姓名',
      phonePlaceholder: '+64 21 123 4567',
      regionPlaceholder: '选择地区',
      optional: '（可选）',
      christchurch: '基督城',
      auckland: '奥克兰',
      wellington: '惠灵顿',
      hamilton: '汉密尔顿',
      tauranga: '陶朗加',
      dunedin: '但尼丁'
    }
  };

  const regions = [
    { value: 'Christchurch', label: text[language].christchurch },
    { value: 'Auckland', label: text[language].auckland },
    { value: 'Wellington', label: text[language].wellington },
    { value: 'Hamilton', label: text[language].hamilton },
    { value: 'Tauranga', label: text[language].tauranga },
    { value: 'Dunedin', label: text[language].dunedin }
  ];

  const handleClose = () => {
    clearError();
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '', phone: '', region: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!loginData.email || !loginData.password) {
      setError(language === 'en' ? 'Please fill in all required fields' : '请填写所有必填字段');
      return;
    }
    
    const success = await login(loginData);
    if (success) {
      handleClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Client-side validation with proper language access
    if (!registerData.full_name.trim()) {
      setError(language === 'en' ? 'Name is required' : '姓名不能为空');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : '密码不匹配');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters' : '密码至少需要6个字符');
      return;
    }
    
    const result = await register({
      email: registerData.email,
      password: registerData.password,
      full_name: registerData.full_name,
      phone: registerData.phone,
      address: registerData.address,
      city: registerData.city || 'Christchurch',
      postal_code: registerData.postal_code,
      preferred_language: language
    });
    
    if (result) {
      // 注册成功，检查是否已自动登录
      // 稍等一下让认证状态更新
      setTimeout(() => {
        if (isAuthenticated) {
          // 如果已自动登录，直接关闭模态框
          handleClose();
        } else {
          // 如果没有自动登录，切换到登录模式并预填邮箱
          setIsLoginMode(true);
          setLoginData({ email: registerData.email, password: '' });
          setRegisterData({ full_name: '', email: '', password: '', confirmPassword: '', phone: '', city: '', address: '', postal_code: '' });
          
          // 显示成功提示
          setError(language === 'en' 
            ? '✅ Registration successful! Please login with your credentials.' 
            : '✅ 注册成功！请使用您的凭据登录。'
          );
          
          // 3秒后清除成功提示
          setTimeout(() => {
            clearError();
          }, 3000);
        }
      }, 500);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    clearError();
    setLoginData({ email: '', password: '' });
    setRegisterData({ full_name: '', email: '', password: '', confirmPassword: '', phone: '', city: '', address: '', postal_code: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {isLoginMode ? text[language].login : text[language].register}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className={`text-red-600 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                {typeof error === 'string' ? (
                  error.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p>{error?.message || 'An error occurred'}</p>
                )}
              </div>
            </div>
          )}

          {isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder={text[language].emailPlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder={text[language].passwordPlaceholder}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {text[language].loginButton}
                  </div>
                ) : (
                  text[language].loginButton
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].name}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    placeholder={text[language].namePlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder={text[language].emailPlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder={text[language].passwordPlaceholder}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder={text[language].confirmPasswordPlaceholder}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].phone} <span className="text-gray-400">{text[language].optional}</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder={text[language].phonePlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              </div>

              {/* Region (Optional) */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].region} <span className="text-gray-400">{text[language].optional}</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  >
                    <option value="">{text[language].regionPlaceholder}</option>
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {text[language].registerButton}
                  </div>
                ) : (
                  text[language].registerButton
                )}
              </button>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className={`text-primary-600 hover:text-primary-700 font-medium ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              {isLoginMode ? text[language].switchToRegister : text[language].switchToLogin}
            </button>
          </div>

          {/* Demo Accounts Section */}
          {isLoginMode && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-blue-900 font-medium mb-3 text-sm">
                {language === 'en' ? 'Demo Accounts:' : '演示账户：'}
              </h4>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-blue-800">
                    {language === 'en' ? 'Administrator:' : '管理员：'}
                  </div>
                  <div className="text-blue-600">admin@upick.life / admin123</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-blue-800">
                    {language === 'en' ? 'Demo User:' : '演示用户：'}
                  </div>
                  <div className="text-blue-600">user@upick.life / user123</div>
                </div>
                
                <div className="text-blue-600 mt-3 p-2 bg-blue-100 rounded text-center">
                  {language === 'en' 
                    ? '⚠️ If accounts don\'t exist, create them first'
                    : '⚠️ 如果账户不存在，请先创建'
                  }
                </div>
                
                {/* Create Demo Accounts Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsCreatingDemoAccounts(true);
                    try {
                      await createDemoAccounts();
                      // createDemoAccounts 会设置自己的错误信息
                    } catch (error) {
                      console.error('❌ 创建演示账户失败:', error);
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                      // Note: setError is not available here, error handling is done in createDemoAccounts
                      console.error(
                        (language === 'en' 
                          ? '❌ Failed to create demo accounts: ' 
                          : '❌ 创建演示账户失败：') + errorMessage +
                        '\n\n' +
                        (language === 'en'
                          ? 'Please ensure email authentication is enabled in Supabase console.'
                          : '请确保在Supabase控制台中启用了邮箱认证。')
                      );
                    } finally {
                      setIsCreatingDemoAccounts(false);
                    }
                  }}
                  disabled={isCreatingDemoAccounts}
                  className={`w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-xs font-medium transition-colors disabled:opacity-50 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isCreatingDemoAccounts ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                      {language === 'en' ? 'Creating...' : '创建中...'}
                    </div>
                  ) : (
                    language === 'en' ? '🎭 Create Demo Accounts' : '🎭 创建演示账户'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}