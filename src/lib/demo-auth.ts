// Demo authentication for testing when Supabase is not available
import { User } from '../types';

const DEMO_USERS = [
  {
    id: 'demo-admin-001',
    email: 'admin@upick.life',
    password: 'admin123',
    name: 'Administrator',
    phone: '+64 21 123 4567',
    region: 'Christchurch',
    language: 'en',
    avatar: null,
    favoriteProducts: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  },
  {
    id: 'demo-user-001',
    email: 'user@upick.life',
    password: 'user123',
    name: 'Demo User',
    phone: '+64 21 987 6543',
    region: 'Christchurch',
    language: 'en',
    avatar: null,
    favoriteProducts: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  },
  {
    id: 'demo-test-001',
    email: 'test@upick.life',
    password: 'test123',
    name: 'Test User',
    phone: '+64 21 555 0123',
    region: 'Auckland',
    language: 'en',
    avatar: null,
    favoriteProducts: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  },
  {
    id: 'demo-chinese-001',
    email: '17032590@qq.com',
    password: '123456',
    name: '测试用户',
    phone: '+64 21 666 8888',
    region: 'Wellington',
    language: 'zh',
    avatar: null,
    favoriteProducts: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  }
];

export class DemoAuth {
  private static currentUser: User | null = null;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;
    
    // Try to restore session from localStorage
    const savedUser = localStorage.getItem('demo-user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log('🎭 [DEMO] Restored user session:', this.currentUser?.email);
      } catch (error) {
        console.warn('🎭 [DEMO] Failed to restore session:', error);
        localStorage.removeItem('demo-user');
      }
    }
    
    this.isInitialized = true;
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    console.log('🎭 [DEMO] Attempting demo login for:', email);
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.log('🎭 [DEMO] Login failed: Invalid credentials');
      return { 
        success: false, 
        error: '邮箱或密码错误。请使用演示账户进行测试。\n\nInvalid email or password. Please use demo accounts for testing.' 
      };
    }

    // Convert demo user to User type
    const authenticatedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      region: user.region,
      language: user.language as 'en' | 'zh',
      avatar: user.avatar,
      favoriteProducts: user.favoriteProducts,
      createdAt: user.createdAt,
      lastLoginAt: new Date().toISOString()
    };

    this.currentUser = authenticatedUser;
    localStorage.setItem('demo-user', JSON.stringify(authenticatedUser));
    
    console.log('✅ [DEMO] Login successful:', user.email);
    return { success: true, user: authenticatedUser };
  }

  static async register(data: {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    city?: string;
    preferred_language?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    console.log('🎭 [DEMO] Attempting demo registration for:', data.email);

    // Check if user already exists
    const existingUser = DEMO_USERS.find(u => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        error: '该邮箱已被注册，请使用其他邮箱或直接登录。\n\nThis email is already registered. Please use a different email or log in directly.'
      };
    }

    // Validate password match
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        error: '密码不匹配\n\nPasswords do not match'
      };
    }

    // Create new user
    const newUser: User = {
      id: `demo-${Date.now()}`,
      name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      region: data.city || 'Christchurch',
      language: (data.preferred_language as 'en' | 'zh') || 'en',
      avatar: null,
      favoriteProducts: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Add to demo users (for this session)
    DEMO_USERS.push({
      ...newUser,
      password: data.password,
      favoriteProducts: []
    });

    this.currentUser = newUser;
    localStorage.setItem('demo-user', JSON.stringify(newUser));

    console.log('✅ [DEMO] Registration successful:', data.email);
    return { success: true, user: newUser };
  }

  static async logout(): Promise<{ success: boolean; error?: string }> {
    console.log('🎭 [DEMO] Logging out user:', this.currentUser?.email);
    
    this.currentUser = null;
    localStorage.removeItem('demo-user');
    
    return { success: true };
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  static async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    const updatedUser = { ...this.currentUser, ...updates };
    this.currentUser = updatedUser;
    localStorage.setItem('demo-user', JSON.stringify(updatedUser));

    console.log('✅ [DEMO] Profile updated successfully');
    return { success: true, user: updatedUser };
  }

  static getDemoUsers() {
    return DEMO_USERS.map(u => ({
      email: u.email,
      password: u.password,
      name: u.name
    }));
  }
}

// Initialize demo auth
DemoAuth.initialize();
