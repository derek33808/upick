# 超市数据更新指南

## 🎯 更新概览

本次更新将前台应用从使用mock数据改为直接从Supabase数据库读取超市数据，并导入了67家新的超市数据。

## 📋 已完成的更改

### 1. 数据库迁移文件 ✅
- **文件**: `supabase/migrations/20250126000000_import_supermarkets_data.sql`
- **内容**: 包含67家超市的完整数据，包括地址、坐标、电话、营业时间等
- **功能**: 清空现有数据并导入新数据

### 2. 超市数据服务 ✅
- **文件**: `src/services/SupermarketService.ts`
- **功能**: 提供从数据库获取超市数据的API接口
- **特性**: 包含错误处理和类型转换

### 3. 应用上下文更新 ✅
- **文件**: `src/contexts/AppContext.tsx`
- **更改**: 
  - 集成SupermarketService
  - 简化数据加载逻辑
  - 保留mock数据作为后备方案

### 4. 数据库测试组件 ✅
- **文件**: `src/components/DatabaseTest.tsx`
- **功能**: 
  - 可视化显示数据库连接状态
  - 展示所有超市数据
  - 提供数据刷新功能
- **访问**: 浏览器中访问 `#database-test`

### 5. 环境检查脚本 ✅
- **文件**: `scripts/check-supabase-env.js`
- **功能**: 检查Supabase配置和迁移文件状态

## 🚀 下一步操作

### 1. 执行数据库迁移（必需）
```bash
# 方法1: 在Supabase Dashboard的SQL编辑器中运行
# 复制 supabase/migrations/20250126000000_import_supermarkets_data.sql 的内容并执行

# 方法2: 如果有Supabase CLI
supabase db reset
```

### 2. 启动应用测试
```bash
npm run dev
```

### 3. 验证数据导入
访问以下URL测试：
- 首页超市显示: `http://localhost:5173`
- 地图页面: `http://localhost:5173#map`
- 数据库测试页面: `http://localhost:5173#database-test`

## 📊 数据结构

### 超市数据字段
```typescript
interface Supermarket {
  id: number;
  name_en: string;      // 英文名称
  name_zh: string;      // 中文名称
  location: string;     // 地址
  lat: number;          // 纬度
  lng: number;          // 经度
  phone?: string;       // 电话
  hours?: string;       // 营业时间
  rating?: number;      // 评分
}
```

### 导入的超市类型
- Woolworths (Countdown) 连锁超市
- PAK'nSAVE 连锁超市
- New World 连锁超市
- Four Square 连锁超市
- FreshChoice 连锁超市
- 华人超市 (如大华超市、Lucky超市等)
- 韩国超市
- 其他亚洲超市

## ⚠️ 注意事项

1. **数据库连接**: 确保 `.env` 文件中的Supabase配置正确
2. **迁移执行**: 必须执行数据库迁移才能看到新数据
3. **数据回退**: 如果数据库连接失败，应用会自动使用mock数据
4. **权限设置**: 确保Supabase表的RLS策略允许匿名访问

## 🔧 故障排除

### 数据库连接失败
1. 检查环境变量配置: `node scripts/check-supabase-env.js`
2. 验证Supabase项目状态
3. 检查网络连接

### 数据显示异常
1. 访问数据库测试页面: `#database-test`
2. 查看浏览器控制台错误信息
3. 确认迁移是否已执行

### 性能问题
1. 检查数据库查询索引
2. 监控API响应时间
3. 考虑添加缓存机制

## 📈 后续优化建议

1. **图片优化**: 为每个超市添加logo图片
2. **搜索功能**: 添加超市名称和地址搜索
3. **缓存策略**: 实现超市数据本地缓存
4. **实时更新**: 添加数据自动同步机制
5. **用户体验**: 优化加载状态和错误处理

## 📞 支持

如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求状态
3. Supabase Dashboard中的表数据
4. 运行环境检查脚本获取详细状态

