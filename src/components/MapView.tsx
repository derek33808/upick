import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Zap, Tag, Plus, Minus, LocateFixed, Pause } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Supermarket } from '../types';

interface MapViewProps {
  selectedSupermarket?: Supermarket | null;
  onSupermarketSelect?: (supermarket: Supermarket) => void;
}

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export function MapView({ selectedSupermarket, onSupermarketSelect }: MapViewProps) {
  const { language, supermarkets, products } = useApp();
  const [showSpecialProducts, setShowSpecialProducts] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watching, setWatching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  // Debug: 检查超市数据
  useEffect(() => {
    console.log('🗺️ MapView - 超市数据:', supermarkets.length, '个超市');
    supermarkets.forEach((supermarket, index) => {
      console.log(`${index + 1}. ${supermarket.name_en} - 坐标: (${supermarket.lat}, ${supermarket.lng})`);
    });
  }, [supermarkets]);

  // Get special products for each supermarket
  const getSpecialProductsForSupermarket = (supermarketId: number) => {
    return products.filter(product => 
      product.supermarket_id === supermarketId && product.isSpecial
    );
  };

  const text = {
    en: {
      title: 'Supermarket Locations',
      subtitle: 'Find nearby stores in Christchurch',
      directions: 'Get Directions',
      call: 'Call Store',
      hours: 'Store Hours',
      rating: 'Rating',
      distance: 'Distance',
      openNow: 'Open Now',
      closed: 'Closed',
      allLocations: 'All Locations',
      viewOnMap: 'View on Map',
      mapLoadError: 'Failed to load map',
      retryLoad: 'Retry Loading',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      loading: 'Loading map...'
    },
    zh: {
      title: '超市位置',
      subtitle: '查找基督城附近商店',
      directions: '获取路线',
      call: '致电商店',
      hours: '营业时间',
      rating: '评分',
      distance: '距离',
      openNow: '营业中',
      closed: '已关闭',
      allLocations: '所有位置',
      viewOnMap: '在地图上查看',
      mapLoadError: '地图加载失败',
      retryLoad: '重新加载',
      zoomIn: '放大',
      zoomOut: '缩小',
      loading: '加载地图中...'
    }
  };

  const specialText = {
    en: {
      specialOffers: 'Special Offers',
      showSpecials: 'Show Special Products',
      hideSpecials: 'Hide Special Products',
      specialsAt: 'Special offers at',
      viewProduct: 'View Product'
    },
    zh: {
      specialOffers: '特价商品',
      showSpecials: '显示特价商品',
      hideSpecials: '隐藏特价商品',
      specialsAt: '特价商品在',
      viewProduct: '查看商品'
    }
  };

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          
          script.onload = () => {
            initializeMap();
          };
          
          script.onerror = () => {
            setMapError(true);
          };
          
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setMapError(true);
      }
    };

    loadLeaflet();

    return () => {
      // Stop geolocation watching
      if (watchIdRef.current !== null) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
        watchIdRef.current = null;
      }
      // Cleanup user layers first
      if (mapInstanceRef.current) {
        try {
          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
          }
          if (accuracyCircleRef.current) {
            mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
            accuracyCircleRef.current = null;
          }
        } catch {}
        // Cleanup map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Remove existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Center on Christchurch
      const center = [-43.5321, 172.6362]; // 基督城中心
      
      const map = window.L.map(mapRef.current, {
        center: center,
        zoom: 11, // 稍微缩小以显示更多超市
        zoomControl: false // We'll add custom zoom controls
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      
      // Add markers for supermarkets
      addMarkers(map);
      
      setMapLoaded(true);
      setMapError(false);
      
      console.log('✅ 地图初始化完成，准备添加', supermarkets.length, '个超市标记');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  // Add markers to map
  const addMarkers = (map: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];
    
    console.log('📍 开始添加超市标记，共', supermarkets.length, '个超市');

    supermarkets.forEach((supermarket) => {
      console.log(`📍 添加标记: ${supermarket.name_en} - 坐标: (${supermarket.lat}, ${supermarket.lng})`);
      
      const specialProducts = getSpecialProductsForSupermarket(supermarket.id);
      const hasSpecials = specialProducts.length > 0;

      // Create custom icon
      const iconHtml = `
        <div style="position: relative; width: 40px; height: 40px;">
          <img src="${supermarket.logo_url}" 
               style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); object-fit: cover;"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7otoXluILjgII8L3RleHQ+PC9zdmc+'" />
          ${showSpecialProducts && hasSpecials ? `
            <div style="position: absolute; top: -2px; right: -2px; width: 16px; height: 16px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      // 验证坐标有效性
      if (!supermarket.lat || !supermarket.lng || 
          isNaN(supermarket.lat) || isNaN(supermarket.lng)) {
        console.warn('⚠️ 无效坐标:', supermarket.name_en, supermarket.lat, supermarket.lng);
        return;
      }
      
      const marker = window.L.marker([supermarket.lat, supermarket.lng], {
        icon: customIcon
      }).addTo(map);
      
      console.log('✅ 成功添加标记:', supermarket.name_en);

      // Create popup content
      const createPopupContent = () => {
        const specialProductsHtml = showSpecialProducts && hasSpecials ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #dc2626; font-weight: 600; font-size: 14px;">⚡ ${specialText[language].specialOffers}</span>
            </div>
            <div style="max-height: 120px; overflow-y: auto;">
              ${specialProducts.slice(0, 3).map(product => `
                <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: #fef2f2; border-radius: 8px;">
                  <img src="${product.image}" alt="${language === 'en' ? product.name_en : product.name_zh}" 
                       style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; margin-right: 8px;"
                       onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzlmYTJhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vPC90ZXh0Pjwvc3ZnPg=='">
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 2px;">
                      ${language === 'en' ? product.name_en : product.name_zh}
                    </div>
                    <div style="display: flex; align-items: center;">
                      <span style="font-size: 12px; font-weight: bold; color: #dc2626;">$${product.price}</span>
                      ${product.originalPrice ? `<span style="font-size: 10px; color: #6b7280; text-decoration: line-through; margin-left: 4px;">$${product.originalPrice}</span>` : ''}
                      <span style="font-size: 10px; background: #dc2626; color: white; padding: 1px 4px; border-radius: 2px; margin-left: 4px;">
                        -${product.discount}%
                      </span>
                    </div>
                  </div>
                </div>
              `).join('')}
              ${specialProducts.length > 3 ? `
                <div style="text-align: center; font-size: 12px; color: #6b7280;">
                  +${specialProducts.length - 3} ${language === 'en' ? 'more specials' : '更多特价'}
                </div>
              ` : ''}
            </div>
          </div>
        ` : '';

        return `
          <div style="max-width: 300px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <img src="${supermarket.logo_url}" alt="${supermarket.name_en}" 
                   style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                  ${language === 'en' ? supermarket.name_en : supermarket.name_zh}
                </h3>
                <div style="display: flex; align-items: center; margin-top: 4px; color: #6b7280; font-size: 14px;">
                  📍 ${supermarket.location}
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 12px;">
              ${supermarket.rating ? `
                <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 14px;">
                  ⭐ ${supermarket.rating}/5
                </div>
              ` : ''}
              ${supermarket.hours ? `
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                  🕒 ${supermarket.hours}
                </div>
              ` : ''}
            </div>
            
            ${specialProductsHtml}
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${supermarket.lat},${supermarket.lng}', '_blank')"
                      style="flex: 1; background: #48b04a; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer;">
                🧭 ${text[language].directions}
              </button>
              ${supermarket.phone ? `
                <button onclick="window.open('tel:${supermarket.phone}', '_self')"
                        style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px; border-radius: 6px; cursor: pointer;">
                  📞
                </button>
              ` : ''}
            </div>
          </div>
        `;
      };

      // Bind popup
      marker.bindPopup(createPopupContent(), {
        maxWidth: 320,
        className: 'custom-popup'
      });

      // Add click listener
      marker.on('click', () => {
        onSupermarketSelect?.(supermarket);
      });

      markersRef.current.push(marker);
    });
    
    console.log('✅ 完成添加', markersRef.current.length, '个超市标记');
  };

  // Update markers when special products visibility changes
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      addMarkers(mapInstanceRef.current);
    }
  }, [showSpecialProducts, language]);

  // Update selected marker
  useEffect(() => {
    if (mapLoaded && selectedSupermarket && mapInstanceRef.current) {
      const supermarket = supermarkets.find(s => s.id === selectedSupermarket.id);
      if (supermarket) {
        mapInstanceRef.current.setView([supermarket.lat, supermarket.lng], 14);
      }
    }
  }, [selectedSupermarket, mapLoaded]);

  const handleGetDirections = (supermarket: Supermarket) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${supermarket.lat},${supermarket.lng}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewLocation = (supermarket: Supermarket) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${supermarket.lat},${supermarket.lng}`;
    window.open(url, '_blank');
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Distance helpers
  const getDistanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng));
    return R * c;
  };

  const formatDistance = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

  // User location rendering
  const showOrUpdateUserLocation = (lat: number, lng: number, accuracy?: number) => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;

    if (!userMarkerRef.current) {
      const icon = window.L.divIcon({
        className: 'user-location-icon',
        html: `
          <div class="user-dot"></div>
          <div class="user-pulse"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      userMarkerRef.current = window.L.marker([lat, lng], { icon }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
    }

    if (typeof accuracy === 'number') {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = window.L.circle([lat, lng], {
          radius: accuracy,
          color: '#3b82f6',
          weight: 1,
          fillColor: '#93c5fd',
          fillOpacity: 0.2
        }).addTo(map);
      } else {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }
  };

  const locateOnce = () => {
    if (!navigator.geolocation) {
      alert(language === 'zh' ? '当前浏览器不支持定位' : 'Geolocation not supported');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        showOrUpdateUserLocation(latitude, longitude, accuracy);
        if (mapInstanceRef.current) {
          const nextZoom = Math.max(14, mapInstanceRef.current.getZoom() || 11);
          mapInstanceRef.current.setView([latitude, longitude], nextZoom);
        }
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error', err);
        alert(err.code === 1 ? (language === 'zh' ? '定位权限被拒绝' : 'Permission denied') : (language === 'zh' ? '定位失败' : 'Failed to locate'));
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleTracking = () => {
    if (!navigator.geolocation) {
      alert(language === 'zh' ? '当前浏览器不支持定位' : 'Geolocation not supported');
      return;
    }
    if (watching) {
      if (watchIdRef.current !== null) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
        watchIdRef.current = null;
      }
      setWatching(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        showOrUpdateUserLocation(latitude, longitude, accuracy);
      },
      (err) => {
        console.error('watchPosition error', err);
        alert(err.code === 1 ? (language === 'zh' ? '定位权限被拒绝' : 'Permission denied') : (language === 'zh' ? '定位失败' : 'Failed to locate'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
    );
    watchIdRef.current = id;
    setWatching(true);
  };

  const retryLoadMap = () => {
    setMapError(false);
    setMapLoaded(false);
    // Remove existing Leaflet elements
    const existingLink = document.querySelector('link[href*="leaflet"]');
    const existingScript = document.querySelector('script[src*="leaflet"]');
    if (existingLink) existingLink.remove();
    if (existingScript) existingScript.remove();
    // Clear window.L
    if (window.L) {
      delete window.L;
    }
    // Reload
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className={`text-2xl font-bold text-gray-900 mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h2>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
        
        {/* Toggle for special products */}
        <div className="mt-4">
          <button
            onClick={() => setShowSpecialProducts(!showSpecialProducts)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showSpecialProducts
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${language === 'zh' ? 'font-chinese' : ''}`}
          >
            <Zap className="w-4 h-4" />
            <span>
              {showSpecialProducts ? specialText[language].hideSpecials : specialText[language].showSpecials}
            </span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 bg-gray-100 relative z-0"
          style={{ minHeight: '400px', zIndex: 0 }}
        />
        
        {/* Loading State */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].loading}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
                {text[language].mapLoadError}
              </h3>
              <button
                onClick={retryLoadMap}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {text[language].retryLoad}
              </button>
            </div>
          </div>
        )}

        {/* Custom Zoom Controls */}
        {mapLoaded && (
          <div className="absolute top-4 right-4 flex flex-col space-y-1" style={{ zIndex: 10 }}>
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg shadow-xl hover:bg-gray-50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 active:scale-95"
              title={text[language].zoomIn}
            >
              <Plus className="w-5 h-5 text-gray-700 font-bold" strokeWidth={3} />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg shadow-xl hover:bg-gray-50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 active:scale-95"
              title={text[language].zoomOut}
            >
              <Minus className="w-5 h-5 text-gray-700 font-bold" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Geolocation Controls */}
        {mapLoaded && (
          <div className="absolute top-4 left-4 flex flex-col space-y-1" style={{ zIndex: 10 }}>
            <button
              onClick={locateOnce}
              disabled={geoLoading}
              className={`w-10 h-10 ${geoLoading ? 'opacity-60' : ''} bg-white border-2 border-gray-300 rounded-lg shadow-xl hover:bg-gray-50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 active:scale-95`}
              title={language === 'zh' ? '定位到我' : 'Locate Me'}
            >
              <LocateFixed className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={toggleTracking}
              className={`w-10 h-10 ${watching ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'} border-2 rounded-lg shadow-xl hover:bg-gray-50 hover:border-primary-500 flex items-center justify-center transition-all duration-200 active:scale-95`}
              title={watching ? (language === 'zh' ? '停止跟踪' : 'Stop Tracking') : (language === 'zh' ? '开始跟踪' : 'Track Me')}
            >
              {watching ? <Pause className="w-5 h-5 text-blue-700" /> : <LocateFixed className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        )}
      </div>

      {/* Supermarket List */}
      <div className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].allLocations}
        </h3>
        <div className="space-y-3">
          {supermarkets.map((supermarket) => (
            <div
              key={supermarket.id}
              onClick={() => onSupermarketSelect?.(supermarket)}
              className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedSupermarket?.id === supermarket.id
                  ? 'border-primary-200 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="relative">
                <img
                  src={supermarket.logo_url}
                  alt={language === 'en' ? supermarket.name_en : supermarket.name_zh}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {selectedSupermarket?.id === supermarket.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                {showSpecialProducts && getSpecialProductsForSupermarket(supermarket.id).length > 0 && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Tag className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold text-gray-900 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {language === 'en' ? supermarket.name_en : supermarket.name_zh}
                </h4>
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{supermarket.location}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {supermarket.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{supermarket.rating}</span>
                    </div>
                  )}
                  {supermarket.hours && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-green-600 font-medium">
                        {text[language].openNow}
                      </span>
                    </div>
                  )}
                  {userLocation && Number.isFinite(supermarket.lat) && Number.isFinite(supermarket.lng) && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {text[language].distance}: {formatDistance(
                          getDistanceKm(
                            userLocation,
                            { lat: supermarket.lat, lng: supermarket.lng }
                          )
                        )}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Special products count */}
                {showSpecialProducts && (
                  <div className="mt-1">
                    {(() => {
                      const specialCount = getSpecialProductsForSupermarket(supermarket.id).length;
                      return specialCount > 0 ? (
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <Zap className="w-3 h-3" />
                          <span className={language === 'zh' ? 'font-chinese' : ''}>
                            {specialCount} {language === 'en' ? 'special offers' : '特价商品'}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* 新增：位置查看按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewLocation(supermarket);
                  }}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                  title={language === 'en' ? 'View on Google Maps' : '在Google地图中查看'}
                >
                  <MapPin className="w-5 h-5" />
                </button>
                
                {/* 现有：导航按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDirections(supermarket);
                  }}
                  className="p-2 text-primary-600 hover:bg-primary-100 rounded-full transition-colors"
                  title={text[language].directions}
                >
                  <Navigation className="w-5 h-5" />
                </button>
                
                {/* 现有：电话按钮 */}
                {supermarket.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(supermarket.phone!);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title={text[language].call}
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{supermarkets.length}</div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Total Stores' : '总店铺数'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.isSpecial).length}
            </div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Special Offers' : '特价商品'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.isSpecial).length > 0 
                ? Math.round(products.filter(p => p.isSpecial).reduce((acc, p) => acc + (p.discount || 0), 0) / products.filter(p => p.isSpecial).length)
                : 0}%
            </div>
            <div className={`text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Avg Discount' : '平均折扣'}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for map */}
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* User location styles */
        .user-location-icon { position: relative; width: 20px; height: 20px; }
        .user-location-icon .user-dot {
          position: absolute; width: 10px; height: 10px; border-radius: 50%;
          background: #2563eb; top: 5px; left: 5px; box-shadow: 0 0 0 2px #bfdbfe;
        }
        .user-location-icon .user-pulse {
          position: absolute; width: 20px; height: 20px; border-radius: 50%;
          background: rgba(59, 130, 246, 0.25); animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}