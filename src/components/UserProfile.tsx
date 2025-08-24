import { useState } from 'react';
import { User, Edit3, Mail, Phone, MapPin, Calendar, Clock, Camera, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { language } = useApp();
  const { user, updateProfile, logout, error, clearError, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    region: user?.region || '',
    avatar: user?.avatar || ''
  });

  const text = {
    en: {
      profile: 'My Profile',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      logout: 'Logout',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      region: 'Region',
      memberSince: 'Member Since',
      lastLogin: 'Last Login',
      favoriteProducts: 'Favorite Products',
      changeAvatar: 'Change Avatar',
      namePlaceholder: 'Enter your full name',
      phonePlaceholder: '+64 21 123 4567',
      regionPlaceholder: 'Select your region',
      updateSuccess: 'Profile updated successfully',
      logoutConfirm: 'Are you sure you want to logout?',
      christchurch: 'Christchurch',
      auckland: 'Auckland',
      wellington: 'Wellington',
      hamilton: 'Hamilton',
      tauranga: 'Tauranga',
      dunedin: 'Dunedin'
    },
    zh: {
      profile: '我的资料',
      edit: '编辑资料',
      save: '保存更改',
      cancel: '取消',
      logout: '退出登录',
      name: '姓名',
      email: '邮箱',
      phone: '电话号码',
      region: '地区',
      memberSince: '注册时间',
      lastLogin: '最后登录',
      favoriteProducts: '收藏商品',
      changeAvatar: '更换头像',
      namePlaceholder: '请输入姓名',
      phonePlaceholder: '+64 21 123 4567',
      regionPlaceholder: '选择地区',
      updateSuccess: '资料更新成功',
      logoutConfirm: '确定要退出登录吗？',
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
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      region: user?.region || '',
      avatar: user?.avatar || ''
    });
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    clearError();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      region: user?.region || '',
      avatar: user?.avatar || ''
    });
    clearError();
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      setError(language === 'en' ? 'Name is required' : '姓名不能为空');
      return;
    }
    
    const success = await updateProfile(editData);
    if (success) {
      setIsEditing(false);
      clearError();
      // 触发全局状态更新
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));
    }
  };

  const handleLogout = () => {
    if (window.confirm(text[language].logoutConfirm)) {
      logout();
      handleClose();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For demo purposes, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData({ ...editData, avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
            {text[language].profile}
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
              <p className={`text-red-600 text-sm ${language === 'zh' ? 'font-chinese' : ''}`}>
                {typeof error === 'string' ? error : error?.message || 'An error occurred'}
              </p>
            </div>
          )}

          {/* Avatar Section */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={editData.avatar || user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjQ4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlKjmiLc8L3RleHQ+PC9zdmc+';
                }}
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h3 className={`text-xl font-bold text-gray-900 mt-3 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {isEditing ? editData.name : user.name}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].name}
              </label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder={text[language].namePlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className={`text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {user.name}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].email}
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].phone}
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder={text[language].phonePlaceholder}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">
                    {user.phone || (language === 'en' ? 'Not provided' : '未提供')}
                  </span>
                </div>
              )}
            </div>

            {/* Region */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].region}
              </label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={editData.region}
                    onChange={(e) => setEditData({ ...editData, region: e.target.value })}
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
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className={`text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {user.region ? regions.find(r => r.value === user.region)?.label || user.region : (language === 'en' ? 'Not provided' : '未提供')}
                  </span>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].memberSince}
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-NZ')}
                </span>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLoginAt && (
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].lastLogin}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">
                    {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )}

            {/* Favorite Products Count */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].favoriteProducts}
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">❤️</span>
                <span className="text-gray-900">
                  {user.favoriteProducts.length} {language === 'en' ? 'products' : '个商品'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {text[language].save}
                </button>
                <button
                  onClick={handleCancel}
                  className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <X className="w-5 h-5 mr-2" />
                  {text[language].cancel}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className={`w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${language === 'zh' ? 'font-chinese' : ''}`}
              >
                <Edit3 className="w-5 h-5 mr-2" />
                {text[language].edit}
              </button>
            )}

            <button
              onClick={handleLogout}
              className={`w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              {text[language].logout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}