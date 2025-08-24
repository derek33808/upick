import { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Globe, 
  MapPin,
  TrendingUp,
  UserPlus,
  Activity,
  X,
  Filter,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Clock,
  Heart
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Database } from '../lib/supabase';
import { User, UserStats } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { language } = useApp();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const text = {
    en: {
      title: 'User Management Panel',
      subtitle: 'Manage and export user registration data',
      totalUsers: 'Total Users',
      newToday: 'New Today',
      newThisWeek: 'New This Week',
      newThisMonth: 'New This Month',
      searchPlaceholder: 'Search users by name, email, phone...',
      exportJSON: 'Export JSON',
      exportCSV: 'Export CSV',
      refresh: 'Refresh Data',
      dateFilter: 'Date Filter',
      all: 'All Time',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      usersByRegion: 'Users by Region',
      usersByLanguage: 'Users by Language',
      noUsers: 'No users found',
      searchResults: 'Search Results',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      region: 'Region',
      language: 'Language',
      favorites: 'Favorites',
      registered: 'Registered',
      lastLogin: 'Last Login',
      never: 'Never',
      accessDenied: 'Access Denied',
      adminOnly: 'This panel is only accessible to administrators',
      exportSuccess: 'Data exported successfully',
      dataRefreshed: 'Data refreshed successfully',
      deleteUser: 'Delete User',
      deleteConfirm: 'Delete Confirmation',
      deleteWarning: 'Are you sure you want to delete this user? This action cannot be undone.',
      deleteSuccess: 'User deleted successfully',
      deleteError: 'Failed to delete user',
      cancel: 'Cancel',
      delete: 'Delete',
      cannotDeleteSelf: 'Cannot delete your own account',
      cannotDeleteAdmin: 'Cannot delete administrator account'
    },
    zh: {
      title: '用户管理面板',
      subtitle: '管理和导出用户注册数据',
      totalUsers: '总用户数',
      newToday: '今日新增',
      newThisWeek: '本周新增',
      newThisMonth: '本月新增',
      searchPlaceholder: '按姓名、邮箱、电话搜索用户...',
      exportJSON: '导出JSON',
      exportCSV: '导出CSV',
      refresh: '刷新数据',
      dateFilter: '日期筛选',
      all: '全部时间',
      today: '今天',
      week: '本周',
      month: '本月',
      usersByRegion: '按地区分布',
      usersByLanguage: '按语言分布',
      noUsers: '未找到用户',
      searchResults: '搜索结果',
      name: '姓名',
      email: '邮箱',
      phone: '电话',
      region: '地区',
      language: '语言',
      favorites: '收藏',
      registered: '注册时间',
      lastLogin: '最后登录',
      never: '从未',
      accessDenied: '访问被拒绝',
      adminOnly: '此面板仅管理员可访问',
      exportSuccess: '数据导出成功',
      dataRefreshed: '数据刷新成功',
      deleteUser: '删除用户',
      deleteConfirm: '删除确认',
      deleteWarning: '确定要删除此用户吗？此操作无法撤销。',
      deleteSuccess: '用户删除成功',
      deleteError: '删除用户失败',
      cancel: '取消',
      delete: '删除',
      cannotDeleteSelf: '无法删除自己的账户',
      cannotDeleteAdmin: '无法删除管理员账户'
    }
  };

  const toggleUserExpansion = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Load data on component mount
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setIsLoading(true);
    try {
      loadUsers();
      loadUserStats();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // 直接从users表获取用户数据，避免admin权限问题
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 单独获取用户收藏数据
      let userFavoritesData: any[] = [];
      try {
        const { data: favoritesData, error: favError } = await supabase
          .from('user_favorites')
          .select('user_id, product_id');
        
        if (favError) {
          if (favError.code === 'PGRST205') {
            console.warn('⚠️ user_favorites table not found. Please run database migrations.');
          } else {
            console.warn('⚠️ Could not load user favorites:', favError.message);
          }
        } else {
          userFavoritesData = favoritesData || [];
        }
      } catch (favError) {
        console.warn('⚠️ User favorites table may not exist:', favError);
      }

      // 计算每个用户的收藏数量
      const favoritesCounts = userFavoritesData.reduce((acc: Record<string, number>, fav: any) => {
        acc[fav.user_id] = (acc[fav.user_id] || 0) + 1;
        return acc;
      }, {});

      const transformedUsers: User[] = data.map((dbUser: any) => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        region: dbUser.region,
        language: dbUser.language || 'en',
        avatar: dbUser.avatar_url,
        favoriteProducts: [], // 简化，不加载具体产品ID
        createdAt: dbUser.created_at,
        lastLoginAt: dbUser.last_login_at
      }));

      // 添加收藏数量信息到用户对象
      transformedUsers.forEach(user => {
        const favCount = favoritesCounts[user.id] || 0;
        user.favoriteProducts = new Array(favCount).fill(0).map((_, i) => i); // 用数字数组表示收藏数量
      });

      setUsers(transformedUsers);
      console.log('✅ 加载了', transformedUsers.length, '个用户');
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const newUsersToday = users.filter((user: any) => {
        const createdDate = new Date(user.created_at);
        return createdDate >= today;
      }).length;

      const newUsersThisWeek = users.filter((user: any) => {
        const createdDate = new Date(user.created_at);
        return createdDate >= weekAgo;
      }).length;

      const newUsersThisMonth = users.filter((user: any) => {
        const createdDate = new Date(user.created_at);
        return createdDate >= monthAgo;
      }).length;

      const usersByRegion = users.reduce((acc: Record<string, number>, user: any) => {
        const region = user.region || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const usersByLanguage = users.reduce((acc: Record<string, number>, user: any) => {
        const language = user.language || 'en';
        acc[language] = (acc[language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalUsers: users.length,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByRegion,
        usersByLanguage
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleRefresh = () => {
    loadData();
    console.log(text[language].dataRefreshed);
  };

  const handleExport = (format: 'json' | 'csv') => {
    try {
      downloadUserData(format);
      console.log(text[language].exportSuccess);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const downloadUserData = (format: 'json' | 'csv') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Email', 'Phone', 'Region', 'Language', 
        'Favorite Products Count', 'Created At', 'Last Login At'
      ];

      const csvRows = [
        headers.join(','),
        ...users.map(user => [
          user.id,
          `"${user.name}"`,
          user.email,
          user.phone || '',
          user.region || '',
          user.language,
          user.favoriteProducts.length,
          user.createdAt,
          user.lastLoginAt || ''
        ].join(','))
      ];

      content = csvRows.join('\n');
      filename = `upick-users-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      const exportData = {
        users,
        stats,
        exportDate: new Date().toISOString()
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `upick-users-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleDeleteUser = (userToDelete: User) => {
    // Prevent deleting self
    if (user && userToDelete.id === user.id) {
      alert(text[language].cannotDeleteSelf);
      return;
    }

    // Prevent deleting admin account
    if (userToDelete.email === 'admin@admin.com' || userToDelete.id === 1) {
      alert(text[language].cannotDeleteAdmin);
      return;
    }

    setUserToDelete(userToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      // 首先删除用户相关数据
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userToDelete.id.toString());

      await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', userToDelete.id.toString());

      // 然后删除用户资料
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id.toString());

      if (error) throw error;

      // 同时删除认证用户
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id.toString());
        if (authError) {
          console.warn('⚠️ Failed to delete auth user:', authError);
        }
      } catch (authError) {
        console.warn('⚠️ Failed to delete auth user:', authError);
      }

      loadData();
      setShowDeleteModal(false);
      setUserToDelete(null);
      console.log(text[language].deleteSuccess);
    } catch (error) {
      console.error('Delete error:', error);
      alert(text[language].deleteError);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const searchUsers = (query: string): User[] => {
    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.region && user.region.toLowerCase().includes(searchTerm))
    );
  };

  const filterUsersByDateRange = (startDate: Date, endDate: Date): User[] => {
    return users.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });
  };

  const getFilteredUsers = (): User[] => {
    let filteredUsers = users;

    // Apply search filter
    if (searchTerm) {
      filteredUsers = searchUsers(searchTerm);
    }

    // Apply date filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filteredUsers = filterUsersByDateRange(startDate, now);
    }

    return filteredUsers;
  };

  // Check if user is admin (for demo purposes, we'll check if email contains 'admin')
  const isAdmin = user?.email === 'admin@upick.life' || user?.email === 'admin@admin.com' || user?.name === 'Administrator' || user?.id === 1;

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].accessDenied}
            </h3>
            <p className={`text-gray-600 mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {text[language].adminOnly}
            </p>
            <button
              onClick={onClose}
              className={`bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className={`text-xl font-bold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].title}
              </h2>
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                      <div className={`text-xs sm:text-sm text-blue-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {text[language].totalUsers}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.newUsersToday}</div>
                      <div className={`text-xs sm:text-sm text-green-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {text[language].newToday}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.newUsersThisWeek}</div>
                      <div className={`text-xs sm:text-sm text-yellow-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {text[language].newThisWeek}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.newUsersThisMonth}</div>
                      <div className={`text-xs sm:text-sm text-purple-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {text[language].newThisMonth}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={text[language].searchPlaceholder}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value as any)}
                  className={`flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <option value="all">{text[language].all}</option>
                  <option value="today">{text[language].today}</option>
                  <option value="week">{text[language].week}</option>
                  <option value="month">{text[language].month}</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Download className="w-4 h-4" />
                  <span>{text[language].exportJSON}</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <Download className="w-4 h-4" />
                  <span>{text[language].exportCSV}</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{text[language].refresh}</span>
                </button>
              </div>
            </div>

            {/* User Statistics */}
            {stats && (
              <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
                {/* Users by Region */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 flex items-center ${language === 'zh' ? 'font-chinese' : ''}`}>
                    <MapPin className="w-5 h-5 mr-2" />
                    {text[language].usersByRegion}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                    {Object.entries(stats.usersByRegion).map(([region, count]) => (
                      <div key={region} className="flex justify-between items-center">
                        <span className={`text-sm text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {region}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users by Language */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 flex items-center ${language === 'zh' ? 'font-chinese' : ''}`}>
                    <Globe className="w-5 h-5 mr-2" />
                    {text[language].usersByLanguage}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                    {Object.entries(stats.usersByLanguage).map(([lang, count]) => (
                      <div key={lang} className="flex justify-between items-center">
                        <span className={`text-sm text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                          {lang === 'en' ? 'English' : '中文'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 sm:px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className={`text-base sm:text-lg font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {searchTerm ? text[language].searchResults : text[language].totalUsers} ({filteredUsers.length})
                </h3>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].noUsers}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="space-y-2">
                    {filteredUsers.map((user) => {
                      const isExpanded = expandedUsers.has(user.id);
                      return (
                        <div key={user.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Main user row */}
                          <div 
                            className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleUserExpansion(user.id)}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <button className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                              <img
                                src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
                                alt={user.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlKjmiLc8L3RleHQ+PC9zdmc+';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm sm:text-base font-medium text-gray-900 truncate ${language === 'zh' ? 'font-chinese' : ''}`}>
                                  {user.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className="text-right hidden sm:block">
                                <div className="text-xs text-gray-500">
                                  {user.language === 'en' ? 'EN' : '中文'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.region || '-'}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user);
                                }}
                                disabled={user.email === 'admin@upick.life' || user.email === 'admin@admin.com'}
                                className={`p-2 rounded-full transition-colors ${
                                  user.email === 'admin@upick.life' || user.email === 'admin@admin.com'
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                title={text[language].deleteUser}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Contact Info */}
                                <div className="space-y-2">
                                  <h4 className={`text-sm font-medium text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                                    {language === 'en' ? 'Contact Information' : '联系信息'}
                                  </h4>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600 truncate">{user.email}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">
                                      {user.phone || (language === 'en' ? 'Not provided' : '未提供')}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">
                                      {user.region || (language === 'en' ? 'Not provided' : '未提供')}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">
                                      {user.language === 'en' ? 'English' : '中文'}
                                    </span>
                                  </div>
                                </div>

                                {/* Activity Info */}
                                <div className="space-y-2">
                                  <h4 className={`text-sm font-medium text-gray-700 ${language === 'zh' ? 'font-chinese' : ''}`}>
                                    {language === 'en' ? 'Activity Information' : '活动信息'}
                                  </h4>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                      <span className="text-gray-500">
                                        {text[language].registered}:
                                      </span>
                                      <span className="text-gray-600 ml-1">
                                        {new Date(user.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-NZ')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                      <span className="text-gray-500">
                                        {text[language].lastLogin}:
                                      </span>
                                      <span className="text-gray-600 ml-1">
                                        {user.lastLoginAt 
                                          ? new Date(user.lastLoginAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-NZ')
                                          : text[language].never
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                    <Heart className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                      <span className="text-gray-500">
                                        {text[language].favorites}:
                                      </span>
                                      <span className="text-gray-600 ml-1">
                                        {user.favoriteProducts.length} {language === 'en' ? 'items' : '个商品'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
            <div className="bg-white rounded-2xl w-full max-w-[90vw] sm:max-w-md p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                    {text[language].deleteConfirm}
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <p className={`text-sm sm:text-base text-gray-600 mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {text[language].deleteWarning}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={userToDelete.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
                      alt={userToDelete.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlKjmiLc8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <div>
                      <div className={`text-sm sm:text-base font-medium text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {userToDelete.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">{userToDelete.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {text[language].cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${language === 'zh' ? 'font-chinese' : ''}`}
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="w-5 h-5 mr-2" />
                  )}
                  {text[language].delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}