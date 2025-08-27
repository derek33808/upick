#!/bin/bash

# 数据库清理执行脚本
# 用于安全地执行数据库重复数据清理

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log "检查依赖..."
    
    if ! command -v psql &> /dev/null; then
        error "psql 未安装。请安装 PostgreSQL 客户端。"
        exit 1
    fi
    
    if [ ! -f "../supabase/migrations/20250129000000_cleanup_duplicate_data.sql" ]; then
        error "清理脚本文件不存在。"
        exit 1
    fi
    
    success "依赖检查通过"
}

# 读取数据库连接信息
read_db_config() {
    log "请输入数据库连接信息..."
    
    read -p "数据库主机 (默认: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "数据库端口 (默认: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "数据库名称: " DB_NAME
    if [ -z "$DB_NAME" ]; then
        error "数据库名称不能为空"
        exit 1
    fi
    
    read -p "用户名: " DB_USER
    if [ -z "$DB_USER" ]; then
        error "用户名不能为空"
        exit 1
    fi
    
    read -s -p "密码: " DB_PASSWORD
    echo
    
    # 构建连接字符串
    export PGPASSWORD="$DB_PASSWORD"
    DB_URL="postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
}

# 测试数据库连接
test_connection() {
    log "测试数据库连接..."
    
    if psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
        success "数据库连接成功"
    else
        error "数据库连接失败。请检查连接信息。"
        exit 1
    fi
}

# 创建备份
create_backup() {
    log "创建数据库备份..."
    
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump "$DB_URL" > "$BACKUP_FILE"; then
        success "备份已创建: $BACKUP_FILE"
        BACKUP_CREATED="$BACKUP_FILE"
    else
        error "备份创建失败"
        exit 1
    fi
}

# 分析重复数据
analyze_duplicates() {
    log "分析重复数据..."
    
    cat << 'EOF' | psql "$DB_URL" -t -A
-- 分析重复超市
SELECT '=== 重复超市分析 ===' as analysis;
WITH duplicates AS (
  SELECT name_en, location, COUNT(*) as count
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  '超市: ' || d.name_en || ' 位置: ' || d.location || ' 重复数量: ' || d.count
FROM duplicates d
ORDER BY d.count DESC;

-- 分析重复商品
SELECT '=== 重复商品分析 ===' as analysis;
CREATE OR REPLACE FUNCTION clean_product_name_temp(product_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN TRIM(REGEXP_REPLACE(product_name, '\s*\(Store\s+\d+\)\s*$', '', 'i'));
END;
$$ LANGUAGE plpgsql;

WITH cleaned_products AS (
  SELECT 
    clean_product_name_temp(name_en) as cleaned_name,
    category,
    COUNT(*) as duplicate_count,
    MIN(price) as min_price,
    MAX(price) as max_price
  FROM products
  GROUP BY clean_product_name_temp(name_en), category
  HAVING COUNT(*) > 1
)
SELECT 
  '商品: ' || cleaned_name || ' 类别: ' || category || ' 重复数量: ' || duplicate_count || ' 价格范围: $' || min_price || ' - $' || max_price
FROM cleaned_products
ORDER BY duplicate_count DESC
LIMIT 20;

DROP FUNCTION IF EXISTS clean_product_name_temp(TEXT);

-- 统计汇总
SELECT '=== 统计汇总 ===' as analysis;
SELECT '总超市数: ' || COUNT(*) FROM supermarkets;
SELECT '总商品数: ' || COUNT(*) FROM products;
EOF
}

# 执行清理脚本
execute_cleanup() {
    log "执行数据库清理..."
    
    warn "⚠️  即将执行数据库清理操作，这将："
    warn "   - 删除重复的超市和商品数据"
    warn "   - 修改现有数据结构"
    warn "   - 添加新的约束条件"
    echo
    
    read -p "确认执行清理操作？(yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        log "操作已取消"
        exit 0
    fi
    
    log "开始执行清理脚本..."
    
    if psql "$DB_URL" -f "../supabase/migrations/20250129000000_cleanup_duplicate_data.sql"; then
        success "✅ 数据库清理完成！"
    else
        error "❌ 清理脚本执行失败"
        warn "可以使用备份文件恢复数据库: $BACKUP_CREATED"
        exit 1
    fi
}

# 验证清理结果
verify_cleanup() {
    log "验证清理结果..."
    
    cat << 'EOF' | psql "$DB_URL" -t -A
-- 验证重复数据清理
SELECT '=== 清理结果验证 ===' as verification;

-- 检查超市重复
WITH supermarket_duplicates AS (
  SELECT name_en, location, COUNT(*) as count
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  CASE WHEN COUNT(*) = 0 
    THEN '✅ 超市数据: 无重复记录'
    ELSE '❌ 超市数据: 仍有 ' || COUNT(*) || ' 组重复记录'
  END as result
FROM supermarket_duplicates;

-- 检查商品重复
WITH product_duplicates AS (
  SELECT name_en, category, supermarket_id, COUNT(*) as count
  FROM products
  GROUP BY name_en, category, supermarket_id
  HAVING COUNT(*) > 1
)
SELECT 
  CASE WHEN COUNT(*) = 0 
    THEN '✅ 商品数据: 无重复记录'
    ELSE '❌ 商品数据: 仍有 ' || COUNT(*) || ' 组重复记录'
  END as result
FROM product_duplicates;

-- 显示最终统计
SELECT '=== 最终统计 ===' as stats;
SELECT '超市总数: ' || COUNT(*) FROM supermarkets;
SELECT '商品总数: ' || COUNT(*) FROM products;
SELECT '特价商品数: ' || COUNT(*) FROM products WHERE is_special = true;

-- 显示类别分布
SELECT '=== 商品类别分布 ===' as category_stats;
SELECT 
  category || ': ' || COUNT(*) || ' 个商品 (平均价格: $' || ROUND(AVG(price), 2) || ')'
FROM products
GROUP BY category
ORDER BY COUNT(*) DESC;
EOF
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "         Upick 数据库清理工具"
    echo "================================================"
    echo -e "${NC}"
    
    # 检查依赖
    check_dependencies
    
    # 读取配置
    read_db_config
    
    # 测试连接
    test_connection
    
    # 分析重复数据
    analyze_duplicates
    
    echo
    warn "请仔细查看上述分析结果，确认需要清理的重复数据。"
    read -p "继续执行清理操作？(yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        log "操作已取消"
        exit 0
    fi
    
    # 创建备份
    create_backup
    
    # 执行清理
    execute_cleanup
    
    # 验证结果
    verify_cleanup
    
    echo
    success "🎉 数据库清理完成！"
    log "备份文件: $BACKUP_CREATED"
    log "如有问题，可使用以下命令恢复:"
    log "psql \"$DB_URL\" < $BACKUP_CREATED"
}

# 执行主函数
main "$@"
