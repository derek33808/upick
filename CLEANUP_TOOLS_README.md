# 数据库清理工具包

## 📋 概述

这个工具包提供了完整的解决方案来清理Supabase数据库中的重复数据，包括重复的超市和商品信息。工具包包含自动化脚本、详细分析、安全备份和验证功能。

## 🛠️ 工具清单

### 核心清理工具

| 文件 | 用途 | 类型 |
|------|------|------|
| `supabase/migrations/20250129000000_cleanup_duplicate_data.sql` | 主要清理脚本 | SQL |
| `scripts/cleanup_database.sh` | 自动化执行脚本 | Bash |

### 分析和验证工具

| 文件 | 用途 | 类型 |
|------|------|------|
| `scripts/demo_cleanup.sql` | 演示清理效果（只读） | SQL |
| `scripts/verify_database.sql` | 验证清理结果 | SQL |

### 文档

| 文件 | 用途 |
|------|------|
| `DATABASE_CLEANUP_GUIDE.md` | 详细使用指南 |
| `CLEANUP_TOOLS_README.md` | 工具包说明（本文件） |

## 🚀 快速开始

### 1. 评估当前状态

```bash
# 连接到数据库并分析重复数据
psql "your_database_url" -f scripts/demo_cleanup.sql
```

### 2. 执行清理（推荐方式）

```bash
# 运行自动化脚本
./scripts/cleanup_database.sh
```

### 3. 验证结果

```bash
# 验证清理效果
psql "your_database_url" -f scripts/verify_database.sql
```

## 📊 清理内容

### 重复数据类型

1. **重复超市**
   - 相同名称和位置的超市
   - 示例：多个"Countdown Riccarton"记录

2. **重复商品**
   - 带Store后缀的商品名称
   - 示例：`Fresh Tomatoes`, `Fresh Tomatoes (Store 2)`

### 清理策略

- ✅ **超市去重**: 保留ID最小的记录
- ✅ **商品去重**: 保留价格最低的记录
- ✅ **名称标准化**: 移除"(Store X)"后缀
- ✅ **约束添加**: 防止未来重复

## 🛡️ 安全特性

### 数据保护
- 🔄 **事务保护**: 失败自动回滚
- 💾 **自动备份**: 清理前创建备份
- 📋 **详细日志**: 记录所有操作

### 验证机制
- ✅ **连接测试**: 执行前验证数据库连接
- 🔍 **重复检查**: 清理后验证无重复数据
- 📊 **完整性验证**: 检查外键和约束

## 📈 性能优化

### 索引优化
```sql
-- 新增的性能索引
idx_products_name_category     -- 商品名称和类别
idx_products_price            -- 商品价格
idx_supermarkets_coordinates  -- 超市坐标
```

### 约束优化
```sql
-- 防重复约束
unique_supermarket_name_location  -- 超市唯一性
unique_product_per_supermarket    -- 商品唯一性
```

## 🔧 高级使用

### 自定义清理

如果需要自定义清理逻辑，可以修改核心SQL脚本：

```sql
-- 修改商品去重策略（例如按更新时间）
ORDER BY price ASC, updated_at DESC, id ASC
```

### 分步执行

```bash
# 只分析，不执行清理
psql "your_db_url" -c "\\i scripts/demo_cleanup.sql"

# 只备份
pg_dump "your_db_url" > backup.sql

# 只执行清理（危险，建议先备份）
psql "your_db_url" -f supabase/migrations/20250129000000_cleanup_duplicate_data.sql
```

## 📋 清理检查清单

执行前检查：
- [ ] 数据库已备份
- [ ] 确认有足够权限
- [ ] 在低流量时段执行
- [ ] 已阅读完整使用指南

执行后验证：
- [ ] 运行验证脚本
- [ ] 检查前端功能正常
- [ ] 确认数据一致性
- [ ] 性能是否提升

## 🚨 故障排除

### 常见问题

1. **权限不足**
   ```
   ERROR: permission denied for table supermarkets
   ```
   解决：确保数据库用户有足够权限

2. **连接失败**
   ```
   psql: connection to server failed
   ```
   解决：检查连接字符串和网络

3. **约束冲突**
   ```
   ERROR: duplicate key value violates unique constraint
   ```
   解决：可能有新的重复数据，重新运行分析

### 回滚操作

如果需要回滚：
```bash
# 使用备份恢复
psql "your_database_url" < backups/backup_YYYYMMDD_HHMMSS.sql
```

## 📞 技术支持

### 日志分析
```bash
# 查看脚本输出
./scripts/cleanup_database.sh 2>&1 | tee cleanup.log

# 分析错误
grep -i error cleanup.log
```

### 联系信息
- 查看 `DATABASE_CLEANUP_GUIDE.md` 获取详细故障排除
- 检查 `scripts/verify_database.sql` 验证数据状态

## 🔄 定期维护

### 监控脚本
```sql
-- 定期检查重复数据
SELECT 
  COUNT(*) as duplicate_supermarkets
FROM (
  SELECT name_en, location, COUNT(*) 
  FROM supermarkets 
  GROUP BY name_en, location 
  HAVING COUNT(*) > 1
) t;
```

### 自动化建议
可以设置cron任务定期运行验证脚本：
```bash
# 每周验证数据质量
0 2 * * 0 psql "your_db_url" -f /path/to/verify_database.sql
```

---

**⚠️ 重要提醒**: 
- 在生产环境执行前，请在测试环境充分验证
- 确保有完整的数据备份
- 建议在业务低峰期执行

