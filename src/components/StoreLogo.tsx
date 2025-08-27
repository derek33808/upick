import { generateStorePlaceholder } from '../lib/imageUtils';

interface StoreLogoProps {
  supermarket?: {
    id: number;
    name_en: string;
    name_zh: string;
    logo_url: string;
    location?: string;
  };
  supermarketId: number;
  size?: number;
  className?: string;
  language: 'en' | 'zh';
  showDebugInfo?: boolean;
}

export function StoreLogo({ 
  supermarket, 
  supermarketId, 
  size = 80, 
  className = "", 
  language,
  showDebugInfo = false
}: StoreLogoProps) {
  // 确定店铺基本信息
  const storeId = supermarket?.id || supermarketId;
  const storeName = supermarket?.name_en || `Store ${supermarketId}`;
  const storeDisplayName = language === 'en' 
    ? (supermarket?.name_en || `Store ${supermarketId}`)
    : (supermarket?.name_zh || `超市${supermarketId}`);

  // 生成可靠的图片源
  const fallbackSrc = generateStorePlaceholder(storeId, size);
  const hasValidLogoUrl = supermarket?.logo_url && supermarket.logo_url.trim() !== "";
  const imgSrc = hasValidLogoUrl ? supermarket.logo_url : fallbackSrc;

  // 调试信息（可选）
  if (showDebugInfo) {
    console.log(`🏪 [StoreLogo] 渲染店铺Logo:`, {
      storeId,
      storeName,
      hasValidLogoUrl,
      imgSrc: imgSrc.substring(0, 50) + '...',
      size,
      language
    });
  }

  return (
    <div className="relative flex-shrink-0">
      <img
        src={imgSrc}
        alt={storeDisplayName}
        className={`object-cover rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gray-200 ${className}`}
        style={{ width: size, height: size }}
        onLoad={() => {
          if (showDebugInfo) {
            console.log(`✅ [StoreLogo] 图片加载成功: ${storeName}`);
          }
        }}
        onError={(e) => {
          if (showDebugInfo) {
            console.warn(`❌ [StoreLogo] 图片加载失败: ${storeName}, 原URL: ${e.currentTarget.src}`);
          }
          
          // 只有当前不是占位图片时才切换
          if (e.currentTarget.src !== fallbackSrc) {
            if (showDebugInfo) {
              console.log(`🔄 [StoreLogo] 切换到占位图片: ${storeName}`);
            }
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />
      
      {/* 可选的状态指示器 */}
      {!hasValidLogoUrl && showDebugInfo && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" 
             title="使用占位图片" />
      )}
    </div>
  );
}

export default StoreLogo;
