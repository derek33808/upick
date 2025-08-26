import { supabase } from '../lib/supabase';
import { Supermarket } from '../types';

export class SupermarketService {
  /**
   * 获取所有超市数据
   */
  static async getAllSupermarkets(): Promise<Supermarket[]> {
    try {
      const { data, error } = await supabase
        .from('supermarkets')
        .select('*')
        .order('name_en', { ascending: true });

      if (error) {
        console.error('获取超市数据失败:', error);
        throw error;
      }

      // 转换数据库字段名到前端类型
      return (data || []).map(item => ({
        id: item.id,
        name_en: item.name_en,
        name_zh: item.name_zh,
        location: item.location,
        logo_url: this.generateLogoUrl(item.name_en),
        lat: item.latitude,
        lng: item.longitude,
        phone: item.phone,
        hours: item.hours,
        rating: item.rating
      }));
    } catch (error) {
      console.error('SupermarketService.getAllSupermarkets 错误:', error);
      return [];
    }
  }

  /**
   * 根据超市名称生成默认logo URL
   */
  private static generateLogoUrl(name: string): string {
    if (name.toLowerCase().includes('countdown') || name.toLowerCase().includes('woolworths')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBDb3VudGRvd24gR3JlZW4gQXBwbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQwKSI+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIi8+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIiBvcGFjaXR5PSIwLjQiLz4KPHBhdGggZD0iTTYwIDYwQzY2IDI4IDEwNCA2IDExNiAzNkMxMDQgNjYgNjAgNjBaIiBmaWxsPSIjOEVDNDREIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMDggNjAgMTE2IDM2IDExNiAzNkMxMDQgNiA2NiAyOCA2MCA2MFoiIGZpbGw9IiM2OEE1M0UiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0VGMzIzQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyMiI+Y291bnRkb3duPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4QTUzRSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5zaG9wIHNtYXJ0ZXI8L3RleHQ+Cjwvc3ZnPg==";
    }
    
    if (name.toLowerCase().includes('new world')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBOZXcgV29ybGQgRGlhbW9uZCBMb2dvIC0tPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1MCwgNDApIj4KPHBhdGggZD0iTTUwIDIwTDgwIDUwTDUwIDgwTDIwIDUwWiIgZmlsbD0iI0VEMzEzQyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiLz4KPHBhdGggZD0iTTI4IDQyTDcyIDQyTDUwIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMjggNThMNzIgNThMNTAgODBaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yMCA1MEw0MiA1MEw1MCAyOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTU4IDUwTDgwIDUwTDUwIDI4WiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMjAgNTBMNDIgNTBMNTAgNzJaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik01OCA1MEw4MCA1MEw1MCA3MloiIGZpbGw9IiNGRkZGRkYiLz4KPGVsbGlwc2UgY3g9IjUwIiBjeT0iNTAiIHJ4PSIxNCIgcnk9IjE0IiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNFRDMxM0MiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTYiPk5XPC90ZXh0Pgo8L2c+Cjx0ZXh0IHg9IjEwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRUQzMTNDIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4Ij5ORVcgV09STEQ8L3RleHQ+Cjwvc3ZnPg==";
    }
    
    if (name.toLowerCase().includes('pak') && name.toLowerCase().includes('save')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZEQjAwIiByeD0iMTAiLz4KPHJlY3QgeD0iNDAiIHk9IjcwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDAwMDAwIiByeD0iNCIvPgo8dGV4dCB4PSIxMDAiIHk9Ijk0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZEQjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4Ij5QQUtuU0FWRTY8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTA5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjEyIj5QQUsnblNBVkU8L3RleHQ+Cjwvc3ZnPg==";
    }
    
    if (name.toLowerCase().includes('freshchoice')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA5NEY0IiByeD0iMTAiLz4KPCEtLSBGcmVzaENob2ljZSBDb2xvcmZ1bCBDaXJjbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQ1KSI+CjxwYXRoIGQ9Ik0zNSA1NUMzNSAzNSA1NSAzNSA3NSA1NVM3NSA3NSA1NSA3NVMzNSA3NSAzNSA1NVoiIGZpbGw9IiNGRkVEMDAiLz4KPHBhdGggZD0iTTM1IDU1QzM1IDM1IDU1IDM1IDc1IDU1UzEwMCA3NSA4MCA3NVM1NSA3NSAzNSA1NVoiIGZpbGw9IiNGRkI5MDAiLz4KPHBhdGggZD0iTTc1IDU1QzEwMCA1NSAxMDAgNzUgODAgNzVTNTUgNzUgNzUgNTVaIiBmaWxsPSIjRkY2OTAwIi8+CjxwYXRoIGQ9Ik01NSA1NUMzNSAzNSA1NSAzNSA3NSA1NVMxMDAgNzUgODAgNzVTNTUgNzUgNTUgNTVaIiBmaWxsPSIjNEZCRTQyIi8+CjxwYXRoIGQ9Ik02MCA1NUMzNSAzNSA1NSAzNSA3NSA1NVMxMDAgNzUgODAgNzVTNjAgNzUgNjAgNTVaIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjEzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0ibm9ybWFsIj5mcmVzaDwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSIxNTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiPmNob2ljZTwvdGV4dD4KPC9zdmc+";
    }
    
    if (name.toLowerCase().includes('four square')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA3RkZGIiByeD0iMTAiLz4KPCEtLSBGb3VyIFNxdWFyZSBHZW9tZXRyaWMgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsIDUwKSI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iNTUiIHk9IjAiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iMCIgeT0iNTUiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iNTUiIHk9IjU1IiB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIGZpbGw9IiNGRkZGRkYiIHJ4PSI1Ii8+CjwvZz4KPHRleHQgeD0iMTAwIiB5PSIxNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTYiPkZPVVI8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE2Ij5TUVVBUkU8L3RleHQ+Cjwvc3ZnPg==";
    }
    
    // 亚洲超市使用通用亚洲超市logo
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkYwMDUwIiByeD0iMTAiLz4KPCEtLSBBc2lhIE1hcnQgRGVzaWduIC0tPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNDApIj4KPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNDAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGMDA1MCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Ik0zNSA2MEg4NU01MCAzNUw2MCA2MEw3MCA4NU01MCA4NUw2MCA2MEw3MCAzNSIgc3Ryb2tlPSIjRkYwMDUwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxOCI+QVNJQTwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSIxNjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+TUFSVDU8L3RleHQ+Cjwvc3ZnPg==";
  }

  /**
   * 获取按品牌分组的超市数据
   */
  static async getSupermarketsByBrand(): Promise<Record<string, Supermarket[]>> {
    const supermarkets = await this.getAllSupermarkets();
    const grouped: Record<string, Supermarket[]> = {};

    supermarkets.forEach(supermarket => {
      let brand = 'Other';
      
      if (supermarket.name_en.toLowerCase().includes('countdown') || 
          supermarket.name_en.toLowerCase().includes('woolworths')) {
        brand = 'Woolworths/Countdown';
      } else if (supermarket.name_en.toLowerCase().includes('new world')) {
        brand = 'New World';
      } else if (supermarket.name_en.toLowerCase().includes('pak') && 
                 supermarket.name_en.toLowerCase().includes('save')) {
        brand = "Pak'nSave";
      } else if (supermarket.name_en.toLowerCase().includes('freshchoice')) {
        brand = 'FreshChoice';
      } else if (supermarket.name_en.toLowerCase().includes('four square')) {
        brand = 'Four Square';
      } else if (supermarket.name_en.toLowerCase().includes('asian') ||
                 supermarket.name_en.toLowerCase().includes('sunson') ||
                 supermarket.name_en.toLowerCase().includes('kosco') ||
                 supermarket.name_en.toLowerCase().includes('metromart') ||
                 supermarket.name_zh.includes('亚洲') ||
                 supermarket.name_zh.includes('超市')) {
        brand = 'Asian Markets';
      }

      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(supermarket);
    });

    return grouped;
  }

  /**
   * 根据位置搜索附近的超市
   */
  static async getSupermarketsNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Supermarket[]> {
    const supermarkets = await this.getAllSupermarkets();
    
    return supermarkets.filter(supermarket => {
      const distance = this.calculateDistance(lat, lng, supermarket.lat, supermarket.lng);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(lat, lng, a.lat, a.lng);
      const distanceB = this.calculateDistance(lat, lng, b.lat, b.lng);
      return distanceA - distanceB;
    });
  }

  /**
   * 计算两点间距离（公里）
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}


