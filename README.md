# Upick - 优品 🛒

一个现代化的杂货价格比较应用，帮助用户在基督城的不同超市之间比较商品价格。

## 🌟 功能特性

### 🔐 用户认证系统
- **用户注册/登录** - 支持邮箱密码认证
- **用户资料管理** - 个人信息、偏好设置
- **收藏功能** - 保存喜欢的商品
- **多语言支持** - 中英文切换

### 🛍️ 商品比价功能
- **实时价格比较** - 跨超市价格对比
- **特价商品展示** - 限时优惠信息
- **分类浏览** - 按商品类别筛选
- **搜索功能** - 快速查找商品
- **价格历史** - 价格变化趋势

### 🗺️ 地图功能
- **超市位置** - 交互式地图显示
- **路线导航** - 一键获取导航
- **联系信息** - 电话、营业时间
- **特价提醒** - 地图上显示特价商品

### 📱 移动端优化
- **响应式设计** - 适配各种屏幕尺寸
- **触摸友好** - 优化的移动端交互
- **离线支持** - PWA 功能
- **快速加载** - 优化的性能

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 实用优先的CSS框架
- **Vite** - 快速的构建工具
- **Leaflet** - 交互式地图组件

### 后端技术栈
- **Supabase** - 开源的Firebase替代方案
- **PostgreSQL** - 强大的关系型数据库
- **Row Level Security** - 数据安全保护
- **Real-time subscriptions** - 实时数据更新

### 部署与托管
- **Netlify** - 静态网站托管
- **Supabase Cloud** - 数据库托管
- **CDN** - 全球内容分发

## 📊 数据库设计

### 核心表结构

#### 用户表 (users)
```sql
- id (uuid, 主键)
- email (text, 唯一)
- name (text)
- phone (text, 可选)
- region (text, 可选)
- language (text, 默认 'en')
- avatar_url (text, 可选)
- created_at (timestamp)
- updated_at (timestamp)
- last_login_at (timestamp, 可选)
```

#### 超市表 (supermarkets)
```sql
- id (bigint, 主键)
- name_en (text, 英文名称)
- name_zh (text, 中文名称)
- location (text, 位置)
- logo_url (text, Logo URL)
- latitude (decimal, 纬度)
- longitude (decimal, 经度)
- phone (text, 可选)
- hours (text, 营业时间)
- rating (decimal, 评分)
```

#### 商品表 (products)
```sql
- id (bigint, 主键)
- name_en (text, 英文名称)
- name_zh (text, 中文名称)
- image_url (text, 商品图片)
- price (decimal, 当前价格)
- original_price (decimal, 原价，可选)
- unit (text, 单位)
- supermarket_id (bigint, 外键)
- category (text, 分类)
- is_special (boolean, 是否特价)
- special_end_date (date, 特价结束日期)
- discount_percentage (integer, 折扣百分比)
```

#### 用户收藏表 (user_favorites)
```sql
- id (bigint, 主键)
- user_id (uuid, 外键)
- product_id (bigint, 外键)
- created_at (timestamp)
```

#### 价格历史表 (price_history)
```sql
- id (bigint, 主键)
- product_id (bigint, 外键)
- price (decimal, 价格)
- original_price (decimal, 原价)
- is_special (boolean, 是否特价)
- recorded_at (timestamp, 记录时间)
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账户 (需要启用邮箱认证)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd upick-grocery-app
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **重要：启用 Supabase 邮箱认证**
```
⚠️  在继续之前，请确保在 Supabase 控制台中启用了邮箱认证：

1. 登录 Supabase 控制台
2. 选择你的项目
3. 导航到 Authentication > Settings
4. 在 "Auth Providers" 部分找到 "Email"
5. 确保 "Enable email provider" 开关已打开
6. 点击 "Save" 保存设置

如果不启用邮箱认证，用户将无法注册和登录！
```

5. **设置数据库**
```bash
# 运行数据库迁移
npx supabase db push
```

6. **启动开发服务器**
```bash
npm run dev
```

7. **构建生产版本**
```bash
npm run build
```

## 🔧 Supabase 配置

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API Key

### 2. 运行数据库迁移
项目包含完整的数据库迁移文件：
- `20250802095220_polished_grass.sql` - 用户表
- `20250802095229_proud_coast.sql` - 超市表
- `20250802095244_broken_valley.sql` - 商品表
- `20250802095254_bitter_fountain.sql` - 用户收藏表
- `20250802095258_turquoise_water.sql` - 价格历史表
- `20250802095304_super_coast.sql` - 示例数据

### 3. 配置认证
在 Supabase 控制台中：
1. **启用邮箱认证** (重要!)
   - 进入 Supabase 项目控制台
   - 导航到 Authentication > Settings
   - 在 Auth Providers 部分找到 Email
   - 确保 "Enable email provider" 开关已打开
   - 如果需要，可以禁用 "Confirm email" 选项以简化注册流程
2. 配置邮件模板
3. 设置重定向 URL

### 4. 配置存储（可选）
如果需要上传用户头像：
1. 创建存储桶
2. 配置访问策略
3. 更新环境变量

## 🎨 设计系统

### 颜色方案
- **主色调**: `#48b04a` (绿色)
- **辅助色**: `#FFD700` (金色)
- **中性色**: 灰色系列
- **状态色**: 红色(错误)、绿色(成功)、橙色(警告)

### 字体系统
- **英文**: Inter
- **中文**: HarmonyOS Sans
- **等宽**: Monaco, Consolas

### 响应式断点
- **移动端**: < 640px
- **平板**: 640px - 1024px
- **桌面**: > 1024px

## 📱 PWA 功能

应用支持 Progressive Web App 功能：
- **离线访问** - 缓存关键资源
- **安装到主屏幕** - 原生应用体验
- **推送通知** - 特价提醒（计划中）
- **后台同步** - 数据自动更新

## 🔒 安全特性

### 数据安全
- **Row Level Security** - 数据行级权限控制
- **JWT 认证** - 安全的用户认证
- **HTTPS 强制** - 加密数据传输
- **输入验证** - 防止 SQL 注入

### 隐私保护
- **最小数据收集** - 只收集必要信息
- **数据加密** - 敏感数据加密存储
- **访问日志** - 记录数据访问
- **用户控制** - 用户可删除自己的数据

## 🚀 部署指南

### Netlify 部署
1. 连接 GitHub 仓库
2. 配置构建命令: `npm run build`
3. 设置发布目录: `dist`
4. 添加环境变量
5. 启用自动部署

### 自定义域名
1. 在 Netlify 中添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS
4. 设置重定向规则

## 🧪 测试

### 单元测试
```bash
npm run test
```

### E2E 测试
```bash
npm run test:e2e
```

### 类型检查
```bash
npm run type-check
```

## 📈 性能优化

### 前端优化
- **代码分割** - 按需加载组件
- **图片优化** - WebP 格式、懒加载
- **缓存策略** - 浏览器缓存、CDN
- **Bundle 分析** - 优化包大小

### 数据库优化
- **索引优化** - 查询性能提升
- **连接池** - 数据库连接管理
- **查询优化** - 减少 N+1 查询
- **缓存层** - Redis 缓存（计划中）

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 代码审查
6. 合并代码

### 代码规范
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型安全
- **Conventional Commits** - 提交信息规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面框架
- [Supabase](https://supabase.com/) - 后端即服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Leaflet](https://leafletjs.com/) - 地图组件
- [Lucide](https://lucide.dev/) - 图标库

## 📞 联系我们

- **项目主页**: https://tamxupick.netlify.app
- **问题反馈**: GitHub Issues
- **功能建议**: GitHub Discussions

---

**Upick - 让购物更智能，让比价更简单！** 🛒✨