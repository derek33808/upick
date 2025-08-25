/**
 * 生成唯一的产品图片占位符 SVG
 * @param productId - 产品ID，用于生成唯一的渐变ID
 * @param size - 图片尺寸，默认48px
 * @returns Base64 编码的 SVG 数据 URL
 */
export function generateProductPlaceholder(productId: number | string, size: number = 48): string {
  const uniqueId = `productGradient_${productId}_${Date.now()}`;
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
<stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
</linearGradient>
</defs>
<rect width="${size}" height="${size}" fill="url(#${uniqueId})" rx="12"/>
<svg width="${size * 0.4}" height="${size * 0.4}" x="${size * 0.3}" y="${size * 0.25}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
<text x="${size/2}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size/8}" fill="white" text-anchor="middle" font-weight="600">PRODUCT</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * 预加载图片，如果失败则返回占位符
 * @param imageUrl - 图片URL
 * @param fallbackId - 用于生成占位符的ID
 * @param size - 占位符尺寸
 * @returns Promise<string> - 成功时返回原URL，失败时返回占位符
 */
export function preloadImageWithFallback(
  imageUrl: string, 
  fallbackId: number | string, 
  size: number = 300
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(imageUrl);
    img.onerror = () => resolve(generateProductPlaceholder(fallbackId, size));
    img.src = imageUrl;
    
    // 设置超时，防止长时间等待
    setTimeout(() => {
      if (!img.complete) {
        resolve(generateProductPlaceholder(fallbackId, size));
      }
    }, 5000); // 5秒超时
  });
}

/**
 * 生成唯一的店铺 Logo 占位符 SVG
 * @param storeId - 店铺ID，用于生成唯一的渐变ID
 * @param size - 图片尺寸，默认80px
 * @returns Base64 编码的 SVG 数据 URL
 */
export function generateStorePlaceholder(storeId: number | string, size: number = 80): string {
  const uniqueId = `storeGradient_${storeId}_${Date.now()}`;
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
<stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
</linearGradient>
</defs>
<rect width="${size}" height="${size}" fill="url(#${uniqueId})" rx="8"/>
<svg width="${size/2}" height="${size/2}" x="${size/4}" y="${size/4}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M2 7c0 .603.69 1 1.227 1a1.1 1.1 0 0 0 1.078-.6 4.8 0 0 0 1.03-.8L8 3M20 7H8v03.386-.866a.5.5 0 0 1 .5-.5HAv4.6a2 2 0 1 1 4 0v-2M9 7.5v4"/>
</svg>
<text x="${size/2}" y="${size * 0.83}" font-family="Arial, sans-serif" font-size="${size/8}" fill="white" text-anchor="middle" font-weight="bold">STORE</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
