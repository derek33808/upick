import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    preferred_language?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  setError: (error: string) => void;
  createDemoAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const setErrorMessage = (error: string) => {
    setError(error);
  };

  // 初始化认证状态
  useEffect(() => {
    checkInitialSession();
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('👤 User signed out, clearing state...');
          setUser(null);
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, maintaining current state');
          // 不重新加载profile，保持当前状态
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // 移除user依赖，避免循环

  const checkInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('👤 Found existing session, loading profile...');
        await loadUserProfileSafely(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  };

  const loadUserProfileSafely = async (userId: string) => {
    // 防止重复加载同一用户
    if (user && user.id === userId) {
      console.log('👤 User profile already loaded, skipping...');
      return;
    }
    
    try {
      console.log('👤 Loading user profile for:', userId);
      
      // 获取认证用户信息
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        console.error('❌ No authenticated user found');
        return;
      }
      
      // 尝试从数据库获取用户资料，但不阻塞登录流程
      let dbProfile = null;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .limit(1);
          
        if (!error && data && data.length > 0) {
          dbProfile = data[0];
        }
      } catch (dbError) {
        console.warn('⚠️ Could not load profile from database, using auth data');
      }

      // 使用数据库资料或认证用户信息
      const userName = dbProfile?.name || 
                      authUser.user.user_metadata?.name || 
                      authUser.user.email!.split('@')[0] || 
                      'User';
      const userPhone = dbProfile?.phone || authUser.user.user_metadata?.phone || null;
      const userRegion = dbProfile?.region || authUser.user.user_metadata?.region || 'Christchurch';
      const userLanguage = dbProfile?.language || authUser.user.user_metadata?.language || 'en';
      
      const userProfile: User = {
        id: authUser.user.id,
        name: userName,
        email: authUser.user.email!,
        phone: userPhone,
        region: userRegion,
        language: userLanguage,
        avatar: dbProfile?.avatar_url || null,
        favoriteProducts: [],
        createdAt: dbProfile?.created_at || authUser.user.created_at,
        lastLoginAt: dbProfile?.last_login_at || null
      };

      setUser(userProfile);
      setIsAuthenticated(true);
      console.log('✅ User profile loaded successfully:', userProfile.name);
    } catch (error) {
      console.error('Error in loadUserProfileSafely:', error);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log('🔑 Attempting login for:', credentials.email);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });


      if (authError) {
        console.error('❌ Login failed:', authError.message);
        
        if (authError.message.includes('Email logins are disabled') || 
            authError.message.includes('email_provider_disabled')) {
          setError('邮箱登录功能已被禁用。请联系管理员启用邮箱认证功能。\n\nEmail login is disabled. Please contact administrator to enable email authentication.');
        } else {
          setError(authError.message);
        }
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful, loading profile...');
        await loadUserProfileSafely(data.user.id);
      }

      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    preferred_language?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log('📝 Attempting registration for:', data.email);
      
      // 1. 创建认证用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // 禁用邮箱确认
          data: {
            full_name: data.full_name,
            phone: data.phone,
            city: data.city || 'Christchurch',
            address: data.address,
            postal_code: data.postal_code,
            preferred_language: data.preferred_language || 'en'
          }
        }
      });

      if (authError) {
        console.error('❌ Auth registration failed:', authError.message);
        
        if (authError.message.includes('Email signups are disabled') || 
            authError.message.includes('email_provider_disabled')) {
          setError('Email signup is disabled. Please contact administrator to enable email authentication.\n邮箱注册功能已被禁用。请联系管理员启用邮箱认证功能。');
        } else {
          setError(authError.message);
        }
        return false;
      }

      if (!authData.user) {
        setError('Registration failed - no user created\n注册失败 - 未创建用户');
        return false;
      }

      // 2. 等待用户认证完成，然后创建用户资料
      if (authData.user && authData.session) {
        try {
          console.log('👤 Creating user profile for:', authData.user.email);
          
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: authData.user.email!,
              name: data.full_name,
              phone: data.phone || null,
              region: data.city || 'Christchurch',
              language: data.preferred_language || 'en'
            }]);

          if (profileError) {
            console.warn('⚠️ Profile creation failed:', profileError.message);
            // 如果是重复键错误，说明用户已存在，这是正常的
            if (!profileError.message.includes('duplicate key') && !profileError.message.includes('already exists')) {
              console.error('❌ Unexpected profile creation error:', profileError);
            }
          } else {
            console.log('✅ User profile created successfully');
          }
        } catch (error) {
          console.warn('⚠️ Profile creation error:', error);
          // 不让profile创建失败阻止注册成功
        }
      }
      
      // 2. 显式创建用户资料
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: authData.user.email!,
            name: data.full_name,
            phone: data.phone,
            region: data.city || 'Christchurch',
            language: data.preferred_language || 'en'
          }]);

        if (profileError) {
          console.warn('⚠️ Profile creation failed:', profileError.message);
          // 不让profile创建失败阻止注册成功
        } else {
          console.log('✅ User profile created successfully');
        }
      } catch (error) {
        console.warn('⚠️ Profile creation error:', error);
        // 不让profile创建失败阻止注册成功
      }

      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    clearError();
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('✅ Logout successful');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    clearError();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          region: updates.region,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      // 更新本地用户状态
      setUser({ ...user, ...updates });
      console.log('✅ Profile updated successfully');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Update failed');
      setIsLoading(false);
      return false;
    }
  };

  const createDemoAccounts = async (): Promise<void> => {
    clearError();
    
    try {
      console.log('🎭 Creating demo accounts...');
      
      const demoAccounts = [
        {
          email: 'admin@upick.life',
          password: 'admin123',
          name: 'Administrator',
          region: 'Christchurch',
          language: 'en'
        },
        {
          email: 'user@upick.life',
          password: 'user123',
          name: 'Demo User',
          region: 'Christchurch',
          language: 'en'
        },
        {
          email: 'test@upick.life',
          password: 'test123',
          name: 'Test User',
          region: 'Auckland',
          language: 'en'
        }
      ];

      let successCount = 0;
      let errorCount = 0;
      const results = [];
      
      for (const account of demoAccounts) {
        try {
          console.log(`🎭 Creating account: ${account.email}`);
          
          // 尝试注册账户，设置5秒超时
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              emailRedirectTo: undefined,
              data: {
                name: account.name,
                region: account.region,
                language: account.language
              }
            }
          }).finally(() => clearTimeout(timeoutId));

          if (authError) {
            // 如果用户已存在，这是正常的
            if (authError.message.includes('already registered')) {
              console.log(`✅ Account ${account.email} already exists`);
              results.push(`✅ ${account.email} - 账户已存在`);
              successCount++;
              continue;
            }
            if (authError.message.includes('Email signups are disabled')) {
              console.warn(`⚠️ Email signups disabled for ${account.email}`);
              results.push(`⚠️ ${account.email} - 邮箱注册被禁用`);
              errorCount++;
              continue;
            }
            console.warn(`⚠️ Failed to create ${account.email}:`, authError.message);
            results.push(`❌ ${account.email} - ${authError.message}`);
            errorCount++;
            continue;
          }

          if (authData.user) {
            // 创建用户资料（可选，失败不影响账户创建）
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert([{
                  id: authData.user.id,
                  email: authData.user.email!,
                  name: account.name,
                  region: account.region,
                  language: account.language
                }]);

              if (profileError) {
                console.warn(`⚠️ Failed to create profile for ${account.email}:`, profileError.message);
                results.push(`⚠️ ${account.email} - 认证成功，资料创建失败`);
              } else {
                console.log(`✅ Successfully created ${account.email} with profile`);
                results.push(`✅ ${account.email} - 完全创建成功`);
              }
            } catch (profileError) {
              console.warn(`⚠️ Profile creation error for ${account.email}:`, profileError);
              results.push(`⚠️ ${account.email} - 认证成功，资料创建异常`);
            }
            successCount++;
          } else {
            results.push(`❌ ${account.email} - 认证用户创建失败`);
            errorCount++;
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`⚠️ Timeout creating ${account.email}`);
            results.push(`⏰ ${account.email} - 创建超时`);
          } else {
            console.warn(`⚠️ Error creating ${account.email}:`, error);
            results.push(`❌ ${account.email} - ${error}`);
          }
          errorCount++;
        }
      }

      console.log(`✅ Demo accounts process completed: ${successCount} success, ${errorCount} errors`);
      console.log('📋 Results:', results);
      
      if (errorCount > 0 && successCount === 0) {
        throw new Error('Failed to create any demo accounts. Please check Supabase email authentication settings.');
      }
      
      // 显示创建结果
      const resultMessage = results.join('\n');
      setError(`演示账户创建完成:\n\n${resultMessage}\n\n现在可以使用上面的凭据登录了！`);
    } catch (error) {
      console.error('❌ Error creating demo accounts:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      updateProfile,
      clearError,
      setError: setErrorMessage,
      createDemoAccounts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}