-- 为数据导入设置RLS策略
-- 请在Supabase控制台的SQL编辑器中运行此脚本

-- 为supermarkets表添加INSERT权限（匿名用户）
CREATE POLICY "Enable insert for anon users on supermarkets"
ON public.supermarkets
FOR INSERT
TO anon
WITH CHECK (true);

-- 为products表添加INSERT权限（匿名用户）
CREATE POLICY "Enable insert for anon users on products"
ON public.products
FOR INSERT
TO anon
WITH CHECK (true);

-- 为user_favorites表添加INSERT权限（匿名用户）
CREATE POLICY "Enable insert for anon users on user_favorites"
ON public.user_favorites
FOR INSERT
TO anon
WITH CHECK (true);

-- 为price_history表添加INSERT权限（匿名用户）
CREATE POLICY "Enable insert for anon users on price_history"
ON public.price_history
FOR INSERT
TO anon
WITH CHECK (true);

-- 验证策略是否创建成功
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies 
WHERE tablename IN ('supermarkets', 'products', 'user_favorites', 'price_history')
AND policyname LIKE '%anon%';