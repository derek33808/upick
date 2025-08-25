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
<stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
<stop offset="100%" style="stop-color:#33B36B;stop-opacity:1" />
</linearGradient>
</defs>
<rect width="${size}" height="${size}" fill="url(#${uniqueId})" rx="8"/>
<svg width="${size/2}" height="${size/2}" x="${size/4}" y="${size/4}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M22 12h-4l-3-9-3 9h-4l2 5h10z"/>
<circle cx="12" cy="5" r="3"/>
</svg>
<text x="${size/2}" y="${size * 0.83}" font-family="Arial, sans-serif" font-size="${size/6}" fill="white" text-anchor="middle" font-weight="bold">PRODUCT</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
