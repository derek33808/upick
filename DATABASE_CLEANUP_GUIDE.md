# 数据库清理指南

## 概述

本指南帮助您清理Supabase数据库中的重复数据，包括重复的超市和商品信息。前端已经在处理这些重复数据，但清理后端数据将提高性能并确保数据一致性。

## 问题分析

### 重复数据的来源
1. **多次migration**: 多个migration文件插入了相同的超市数据
2. **商品名称带后缀**: 存在类似"Fresh Tomatoes"和"Fresh Tomatoes (Store 2)"的重复商品
3. **缺乏唯一约束**: 数据库缺少防止重复数据的约束

### 前端处理方式
前端通过`SubCategoryView.tsx`中的`cleanProductName`函数处理重复数据：
```typescript
const cleanProductName = (name: string) => {
  return name.replace(/\s*\(Store\s+\d+\)\s*$/i, '').trim();
};
```

## 清理方案

### 🎯 目标
- ✅ 删除重复的超市数据
- ✅ 删除重复的商品数据（保留最低价格）
- ✅ 标准化商品名称（移除Store后缀）
- ✅ 添加唯一约束防止未来重复
- ✅ 保持数据完整性和一致性

### 🛡️ 安全措施
- 自动备份数据
- 事务保护（失败自动回滚）
- 详细的操作日志
- 验证清理结果

## 使用方法

### 方法1: 使用自动化脚本（推荐）

```bash
# 进入项目目录
cd /path/to/your/project

# 运行清理脚本
./scripts/cleanup_database.sh
```

脚本会引导您：
1. 输入数据库连接信息
2. 分析重复数据
3. 创建备份
4. 执行清理
5. 验证结果

### 方法2: 手动执行SQL

如果您更喜欢手动控制，可以直接执行SQL脚本：

```bash
# 使用psql连接数据库
psql "postgresql://username:password@host:port/database"

# 执行清理脚本
\i supabase/migrations/20250129000000_cleanup_duplicate_data.sql
```

## 清理内容详解

### 1. 超市数据去重
- **标准**: 按`name_en`和`location`去重
- **保留策略**: 保留ID最小的记录
- **约束**: 添加`unique_supermarket_name_location`约束

### 2. 商品数据去重
- **清理**: 移除商品名称中的"(Store X)"后缀
- **分组**: 按清理后的名称和类别分组
- **保留策略**: 保留每组中价格最低的商品
- **约束**: 添加`unique_product_per_supermarket`约束

### 3. 自动化防护
- **触发器**: 自动清理新插入商品的名称
- **唯一约束**: 防止未来插入重复数据
- **索引优化**: 提高查询性能

## 预期结果

### 清理前
```
超市数据:
- Belfast Woolworths (ID: 1)
- Belfast Woolworths (ID: 15) ← 重复
- Riccarton Countdown (ID: 2)
- Riccarton Countdown (ID: 18) ← 重复

商品数据:
- Fresh Tomatoes (Store 1) - $2.99
- Fresh Tomatoes (Store 2) - $3.49 ← 重复
- Fresh Tomatoes (Store 3) - $3.20 ← 重复
```

### 清理后
```
超市数据:
- Belfast Woolworths (ID: 1) ✅
- Riccarton Countdown (ID: 2) ✅

商品数据:
- Fresh Tomatoes - $2.99 ✅ (保留最低价)
```

## 验证清理结果

清理完成后，脚本会自动验证：

```sql
-- 检查超市重复
SELECT name_en, location, COUNT(*) 
FROM supermarkets 
GROUP BY name_en, location 
HAVING COUNT(*) > 1;
-- 应该返回0行

-- 检查商品重复
SELECT name_en, category, supermarket_id, COUNT(*) 
FROM products 
GROUP BY name_en, category, supermarket_id 
HAVING COUNT(*) > 1;
-- 应该返回0行
```

## 回滚操作

如果需要回滚到清理前的状态：

```bash
# 使用备份文件恢复
psql "your_database_url" < backups/backup_YYYYMMDD_HHMMSS.sql
```

## 性能优化

清理脚本还会优化数据库性能：

### 新增索引
- `idx_products_name_category`: 商品名称和类别
- `idx_products_price`: 商品价格
- `idx_supermarkets_coordinates`: 超市坐标

### 约束优化
- 唯一约束防止重复
- 外键约束保证数据完整性

## 常见问题

### Q: 会丢失数据吗？
A: 不会。重复数据会被备份到`deleted_*_backup`表中，且整个过程在事务中进行。

### Q: 前端需要修改吗？
A: 不需要。前端的重复数据处理逻辑可以保留作为额外保护。

### Q: 如何防止未来重复？
A: 脚本添加了唯一约束和触发器，自动防止和清理重复数据。

### Q: 清理需要多长时间？
A: 通常几分钟内完成，具体取决于数据量。

## 联系支持

如果遇到问题：
1. 查看脚本输出的错误信息
2. 检查备份文件是否创建成功
3. 确认数据库连接权限
4. 如需帮助，请提供错误日志

---

**⚠️ 重要提醒**: 
- 建议在非生产环境先测试
- 确保有数据库的完整备份
- 在低流量时段执行清理操作

