import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Zap, Tag, Plus, Minus, LocateFixed, Pause, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Supermarket } from '../types';

interface MapViewProps {
  selectedSupermarket?: Supermarket | null;
  onSupermarketSelect?: (supermarket: Supermarket | null) => void;
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

  // Supermarket grouping state
  const [expandedBrands, setExpandedBrands] = useState<string[]>(['Woolworths (Countdown)', 'New World']); // 默认展开前两个

  // Debug: 检查超市数据（仅开发环境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ MapView - 超市数据:', supermarkets.length, '个超市');
    supermarkets.forEach((supermarket, index) => {
      console.log(`${index + 1}. ${supermarket.name_en} - 坐标: (${supermarket.lat}, ${supermarket.lng})`);
    });
    }
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
    console.log('🎯 [ADDMARKERS] Current selectedSupermarket:', selectedSupermarket?.name_en || 'None', 'ID:', selectedSupermarket?.id || 'None');

    supermarkets.forEach((supermarket) => {
      console.log(`📍 添加标记: ${supermarket.name_en} - 坐标: (${supermarket.lat}, ${supermarket.lng})`);
      
      const specialProducts = getSpecialProductsForSupermarket(supermarket.id);
      const hasSpecials = specialProducts.length > 0;

      const isSelected = selectedSupermarket?.id === supermarket.id;
      
      // Create custom icon with enhanced selection state
      const originalSize = 32; // Base reference size
      const unselectedSize = Math.round(originalSize * 0.4); // 40% of original (13px)
      const selectedSize = originalSize * 4; // 4x larger when selected (128px)
      const hasSelection = selectedSupermarket !== null && selectedSupermarket !== undefined;
      
      // If there's a selection, make unselected markers much smaller
      let currentSize;
      if (hasSelection) {
        currentSize = isSelected ? selectedSize : unselectedSize; // Dramatic size difference
      } else {
        currentSize = originalSize; // Normal size when nothing is selected
      }
      
      console.log(`📏 [MARKER] ${supermarket.name_en}: size=${currentSize}px, selected=${isSelected}, hasSelection=${hasSelection}, selectedId=${selectedSupermarket?.id}, thisId=${supermarket.id}`);
      
      const iconHtml = `
        <div class="marker-container ${isSelected ? 'selected' : ''}" style="position: relative; width: ${currentSize}px; height: ${currentSize}px; z-index: ${isSelected ? 1000 : 100};">
          <!-- Selection ring for selected marker -->
          ${isSelected ? `
            <div style="position: absolute; top: -${Math.round(currentSize * 0.1)}px; left: -${Math.round(currentSize * 0.1)}px; right: -${Math.round(currentSize * 0.1)}px; bottom: -${Math.round(currentSize * 0.1)}px; border: ${Math.max(3, Math.round(currentSize * 0.03))}px solid #3b82f6; border-radius: 50%; animation: selectedPulse 2s infinite; background: rgba(59, 130, 246, 0.1);"></div>
            <div style="position: absolute; top: -${Math.round(currentSize * 0.2)}px; left: -${Math.round(currentSize * 0.2)}px; right: -${Math.round(currentSize * 0.2)}px; bottom: -${Math.round(currentSize * 0.2)}px; border: ${Math.max(2, Math.round(currentSize * 0.02))}px solid #3b82f6; border-radius: 50%; animation: selectedPulse 2s infinite 0.5s; opacity: 0.5;"></div>
          ` : ''}
          
                    <!-- Main marker image -->
          <div style="position: relative; width: ${currentSize}px; height: ${currentSize}px; transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'}; transition: all 0.4s ease; opacity: ${hasSelection && !isSelected ? '0.3' : '1'};">
          <img src="${supermarket.logo_url}" 
                 style="width: ${currentSize}px; height: ${currentSize}px; border-radius: 50%; border: ${isSelected ? `${Math.max(4, Math.round(currentSize * 0.04))}px solid #3b82f6` : hasSelection ? `${Math.max(1, Math.round(currentSize * 0.08))}px solid rgba(255,255,255,0.6)` : `${Math.max(2, Math.round(currentSize * 0.08))}px solid white`}; box-shadow: ${isSelected ? `0 ${Math.round(currentSize * 0.08)}px ${Math.round(currentSize * 0.2)}px rgba(59, 130, 246, 0.6), 0 ${Math.round(currentSize * 0.04)}px ${Math.round(currentSize * 0.1)}px rgba(0, 0, 0, 0.3)` : hasSelection && !isSelected ? `0 ${Math.round(currentSize * 0.2)}px ${Math.round(currentSize * 0.4)}px rgba(0,0,0,0.15)` : `0 ${Math.round(currentSize * 0.12)}px ${Math.round(currentSize * 0.35)}px rgba(0,0,0,0.3)`}; object-fit: cover; background: white; filter: ${hasSelection && !isSelected ? 'brightness(0.4) saturate(0.3) blur(0.5px)' : 'none'};"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzQ4YjA0YSIgcng9IjIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7otoXluILjgII8L3RleHQ+PC9zdmc+'" />
            
                                                <!-- Special offer indicator -->
          ${showSpecialProducts && hasSpecials ? `
              <div style="position: absolute; top: -${Math.round(currentSize * 0.1)}px; right: -${Math.round(currentSize * 0.1)}px; width: ${Math.max(12, Math.round(currentSize * 0.35))}px; height: ${Math.max(12, Math.round(currentSize * 0.35))}px; background: #ef4444; border: ${Math.max(1, Math.round(currentSize * 0.02))}px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite; z-index: 10; opacity: ${hasSelection && !isSelected ? '0.4' : '1'};">
                <svg width="${Math.max(6, Math.round(currentSize * 0.2))}" height="${Math.max(6, Math.round(currentSize * 0.2))}" viewBox="0 0 24 24" fill="white">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            ` : ''}
          </div>
          
          <!-- Selection indicator badge -->
          ${isSelected ? `
            <div style="position: absolute; top: -${Math.round(currentSize * 0.15)}px; left: -${Math.round(currentSize * 0.15)}px; width: ${Math.max(16, Math.round(currentSize * 0.25))}px; height: ${Math.max(16, Math.round(currentSize * 0.25))}px; background: #3b82f6; border: ${Math.max(2, Math.round(currentSize * 0.025))}px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 20; animation: bounce 1s ease-in-out infinite alternate;">
              <svg width="${Math.max(8, Math.round(currentSize * 0.12))}" height="${Math.max(8, Math.round(currentSize * 0.12))}" viewBox="0 0 24 24" fill="white">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
              </svg>
            </div>
          ` : ''}
        </div>
      `;

      // Calculate padding based on current size for effects
      const padding = Math.round(currentSize * 0.4);
      const totalSize = currentSize + padding;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [totalSize, totalSize], // Dynamic size with padding
        iconAnchor: [totalSize / 2, totalSize / 2], // Center anchor point
        popupAnchor: [0, -(currentSize / 2 + padding / 4)] // Popup position relative to marker
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

  // Update markers when special products visibility changes (selection is handled separately)
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      addMarkers(mapInstanceRef.current);
    }
  }, [showSpecialProducts, language]);

  // Update selected marker with enhanced animation and popup
  useEffect(() => {
    console.log('🎯 [USEEFFECT] selectedSupermarket changed:', selectedSupermarket?.name_en || 'None', 'ID:', selectedSupermarket?.id || 'None');
    if (mapLoaded && mapInstanceRef.current) {
      if (selectedSupermarket) {
      const supermarket = supermarkets.find(s => s.id === selectedSupermarket.id);
        if (supermarket && Number.isFinite(supermarket.lat) && Number.isFinite(supermarket.lng)) {
          console.log('🎯 [MAP] Focusing on supermarket:', supermarket.name_en, 'at coordinates:', supermarket.lat, supermarket.lng);
          
          // Force a higher zoom level for better visibility
          const targetZoom = 16; // Fixed zoom level for consistency
          
          // Smooth animation to the target location
          mapInstanceRef.current.flyTo([supermarket.lat, supermarket.lng], targetZoom, {
            duration: 1.2, // Slightly faster animation
            easeLinearity: 0.2
          });
          
          // Update markers to reflect selection state immediately
          console.log('🔄 [MAP] Updating markers for selection state, selectedSupermarket:', selectedSupermarket.name_en);
          addMarkers(mapInstanceRef.current);
          console.log('✅ [MAP] Markers updated after selection');
          
          // Find and open the popup for this marker after animation
          setTimeout(() => {
            const targetMarker = markersRef.current.find(marker => {
              const markerLatLng = marker.getLatLng();
              const latMatch = Math.abs(markerLatLng.lat - supermarket.lat) < 0.0001;
              const lngMatch = Math.abs(markerLatLng.lng - supermarket.lng) < 0.0001;
              console.log('🔍 [MAP] Checking marker:', markerLatLng.lat, markerLatLng.lng, 'matches:', latMatch && lngMatch);
              return latMatch && lngMatch;
            });
            
            if (targetMarker && targetMarker.getPopup()) {
              targetMarker.openPopup();
              console.log('🔥 [MAP] Opened popup for selected supermarket');
            } else {
              console.warn('⚠️ [MAP] Could not find marker for selected supermarket');
            }
          }, 600); // Reduced delay
        }
      } else {
        // No supermarket selected, reset to default view
        console.log('🔄 [MAP] Resetting to default view (no selection)');
        const center = [-43.5321, 172.6362]; // 基督城中心
        mapInstanceRef.current.flyTo(center, 11, {
          duration: 1.0,
          easeLinearity: 0.2
        });
        
        // Close any open popups
        mapInstanceRef.current.closePopup();
        
        // Update markers to clear selection state
        console.log('🔄 [MAP] Updating markers to clear selection state');
        addMarkers(mapInstanceRef.current);
        console.log('✅ [MAP] Markers updated after clearing selection');
      }
    }
  }, [selectedSupermarket, mapLoaded, supermarkets]);

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

  // 定义品牌分类逻辑
  const getBrandFromName = (name: string): string => {
    if (name.includes('Woolworths') || name.includes('Countdown')) return 'Woolworths (Countdown)';
    if (name.includes('New World')) return 'New World';
    if (name.includes('Pak\'nSave') || name.includes('PAK\'nSAVE')) return 'Pak\'nSave';
    if (name.includes('FreshChoice')) return 'FreshChoice';
    // 将所有亚洲相关超市归类为"亚洲超市"
    if (name.includes('大华') || name.includes('Lucky') || name.includes('China Town') || name.includes('华人') || 
        name.includes('Tai Wah') || name.includes('Big T Asian') || name.includes('Korean') || 
        name.includes('韩国') || name.includes('Ken\'s Mart') || name.includes('Asian') || 
        name.includes('亚洲') || name.includes('Basics Asian')) return 'Asian Supermarkets';
    // Four Square和其他未分类的超市都归入"其他超市"
    return '其他超市';
  };

  // 按品牌分组超市
  const brandGroups = supermarkets.reduce((acc, supermarket) => {
    const brand = getBrandFromName(supermarket.name_en);
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(supermarket);
    return acc;
  }, {} as Record<string, Supermarket[]>);

  // 定义品牌颜色和图标
  const brandStyles: Record<string, {color: string; bgColor: string; icon: string}> = {
    'Woolworths (Countdown)': { color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: '🛒' },
    'New World': { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: '🌍' },
    'Pak\'nSave': { color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: '💰' },
    'FreshChoice': { color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200', icon: '🥬' },
    'Asian Supermarkets': { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: '🍜' },
    '其他超市': { color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: '🏪' }
  };

  // 品牌名称多语言支持
  const getBrandDisplayName = (brand: string): string => {
    const brandNames: Record<string, Record<string, string>> = {
      'Woolworths (Countdown)': { en: 'Woolworths (Countdown)', zh: 'Woolworths (Countdown)' },
      'New World': { en: 'New World', zh: 'New World' },
      'Pak\'nSave': { en: 'Pak\'nSave', zh: 'Pak\'nSave' },
      'FreshChoice': { en: 'FreshChoice', zh: 'FreshChoice' },
      'Asian Supermarkets': { en: 'Asian Supermarkets', zh: '亚洲超市' },
      '其他超市': { en: 'Other Stores', zh: '其他超市' }
    };
    return brandNames[brand]?.[language] || brand;
  };

  // 定义品牌排序顺序，其他超市放最后
  const brandOrder = ['Woolworths (Countdown)', 'New World', 'Pak\'nSave', 'FreshChoice', 'Asian Supermarkets', '其他超市'];

  const sortedBrandEntries = Object.entries(brandGroups).sort(([a], [b]) => {
    const indexA = brandOrder.indexOf(a);
    const indexB = brandOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const toggleBrand = (brand: string) => {
    setExpandedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

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
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].title}
        </h2>
        <p className={`text-sm sm:text-base text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
        
        {/* Toggle for special products */}
        <div className="mt-4">
          <button
            onClick={() => setShowSpecialProducts(!showSpecialProducts)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              showSpecialProducts
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${language === 'zh' ? 'font-chinese' : ''}`}
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              {showSpecialProducts ? specialText[language].hideSpecials : specialText[language].showSpecials}
            </span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" id="map-container">
        <div 
          ref={mapRef} 
          className="w-full h-64 sm:h-96 bg-gray-100 relative z-0"
          style={{ minHeight: '300px', zIndex: 0 }}
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

      {/* Supermarket List with Brand Grouping */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].allLocations}
        </h3>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className={language === 'zh' ? 'font-chinese' : ''}>
              {language === 'en' ? 'Click to focus on map' : '点击卡片聚焦地图'}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {sortedBrandEntries.map(([brand, stores]) => {
            const isExpanded = expandedBrands.includes(brand);
            const style = brandStyles[brand] || brandStyles['其他超市'];
            
            return (
              <div key={brand} className={`${style.bgColor} rounded-xl border-2 overflow-hidden transition-all duration-300`}>
                {/* 品牌头部 */}
                <button
                  onClick={() => toggleBrand(brand)}
                  className={`w-full p-3 sm:p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-200 ${style.color}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl sm:text-2xl">{style.icon}</span>
                    <div className="text-left">
                      <h3 className={`text-sm sm:text-lg font-semibold ${language === 'zh' ? 'font-chinese' : ''}`}>
                        {getBrandDisplayName(brand)}
                      </h3>
                      <p className="text-xs sm:text-sm opacity-75">
                        {stores.length} {language === 'en' ? 'locations' : '家门店'}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? 
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                </button>

                {/* 超市列表 */}
                {isExpanded && (
                  <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                    <div className="space-y-2">
                      {stores.map((supermarket) => (
                        <SupermarketCard 
              key={supermarket.id}
                          supermarket={supermarket} 
                          language={language}
                          selectedSupermarket={selectedSupermarket}
                          onSupermarketSelect={onSupermarketSelect}
                          showSpecialProducts={showSpecialProducts}
                          getSpecialProductsForSupermarket={getSpecialProductsForSupermarket}
                          userLocation={userLocation}
                          formatDistance={formatDistance}
                          getDistanceKm={getDistanceKm}
                          handleViewLocation={handleViewLocation}
                          handleGetDirections={handleGetDirections}
                          handleCall={handleCall}
                          text={text}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary-600">{supermarkets.length}</div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Total Stores' : '总店铺数'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {products.filter(p => p.isSpecial).length}
            </div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Special Offers' : '特价商品'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {products.filter(p => p.isSpecial).length > 0 
                ? Math.round(products.filter(p => p.isSpecial).reduce((acc, p) => acc + (p.discount || 0), 0) / products.filter(p => p.isSpecial).length)
                : 0}%
            </div>
            <div className={`text-xs sm:text-sm text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
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

        @keyframes selectedPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        @keyframes bounce {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-6px);
          }
        }

        /* Enhanced marker styles */
        .custom-marker {
          background: transparent !important;
          border: none !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .marker-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .marker-container.selected {
          z-index: 1000 !important;
        }
        
        /* Smooth scaling animation for unselected markers */
        .marker-container:not(.selected) {
          transform-origin: center center;
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

// 超市卡片组件
function SupermarketCard({ 
  supermarket, 
  language, 
  selectedSupermarket, 
  onSupermarketSelect, 
  showSpecialProducts, 
  getSpecialProductsForSupermarket, 
  userLocation, 
  formatDistance, 
  getDistanceKm, 
  handleViewLocation, 
  handleGetDirections, 
  handleCall, 
  text 
}: {
  supermarket: Supermarket;
  language: 'en' | 'zh';
  selectedSupermarket?: Supermarket | null;
  onSupermarketSelect?: (supermarket: Supermarket | null) => void;
  showSpecialProducts: boolean;
  getSpecialProductsForSupermarket: (id: number) => any[];
  userLocation: { lat: number; lng: number } | null;
  formatDistance: (km: number) => string;
  getDistanceKm: (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => number;
  handleViewLocation: (supermarket: Supermarket) => void;
  handleGetDirections: (supermarket: Supermarket) => void;
  handleCall: (phone: string) => void;
  text: any;
}) {
  const { isAuthenticated, user } = useAuth();
  const { checkIsStoreFavorite, addToStoreFavorites, removeFromStoreFavorites } = useUser();
  const [saving, setSaving] = useState(false);
  
  const saved = checkIsStoreFavorite(supermarket.id);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('showLoginModal'));
      return;
    }
    
    if (saving) return;
    
    setSaving(true);
    
    try {
      let result = false;
      if (saved) {
        result = await removeFromStoreFavorites(supermarket.id);
      } else {
        result = await addToStoreFavorites(supermarket.id);
      }
      
      if (result) {
        window.dispatchEvent(new CustomEvent('storeFavoritesUpdated'));
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = () => {
    console.log('🔄 [CARD] Clicked supermarket:', supermarket.name_en, 'ID:', supermarket.id);
    console.log('🔄 [CARD] Current selectedSupermarket:', selectedSupermarket?.name_en || 'None', 'ID:', selectedSupermarket?.id || 'None');
    
    // If clicking the same supermarket, deselect it
    if (selectedSupermarket?.id === supermarket.id) {
      console.log('🔄 [CARD] Deselecting current supermarket');
      console.log('🔄 [CARD] Calling onSupermarketSelect with null');
      onSupermarketSelect?.(null);
    } else {
      console.log('🔄 [CARD] Selecting new supermarket');
      console.log('🔄 [CARD] Calling onSupermarketSelect with:', supermarket.name_en);
      onSupermarketSelect?.(supermarket);
    }
    
    // Scroll to map on mobile for better UX
    if (window.innerWidth < 768) { // Mobile breakpoint
      setTimeout(() => {
        const mapElement = document.getElementById('map-container');
        if (mapElement) {
          mapElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-lg border cursor-pointer transition-all duration-300 p-3 sm:p-4 transform hover:scale-[1.02] ${
                selectedSupermarket?.id === supermarket.id
          ? 'border-primary-300 bg-primary-50 shadow-lg ring-2 ring-primary-200 ring-opacity-50'
          : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
                <img
                  src={supermarket.logo_url}
                  alt={language === 'en' ? supermarket.name_en : supermarket.name_zh}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgcng9IjIwIi8+Cjxzdmcgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIxMCIgeT0iMTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNNiAyTDMgNnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNmwtMy00eiIvPgo8cGF0aCBkPSJtOCA2IDQgNCIvPgo8L3N2Zz4KPC9zdmc+';
            }}
                />
                {selectedSupermarket?.id === supermarket.id && (
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary-500 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                )}
                {showSpecialProducts && getSpecialProductsForSupermarket(supermarket.id).length > 0 && (
            <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
              <Tag className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>
              
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-gray-900 text-sm sm:text-base mb-1 ${language === 'zh' ? 'font-chinese' : ''}`}>
                  {language === 'en' ? supermarket.name_en : supermarket.name_zh}
                </h4>
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 mb-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{supermarket.location}</span>
                </div>
          
          {/* Stats row - 移动端优化 */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                  {supermarket.rating && (
                    <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                      <span>{supermarket.rating}</span>
                    </div>
                  )}
                  {supermarket.hours && (
                    <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-green-600 font-medium">
                        {text[language].openNow}
                      </span>
                    </div>
                  )}
                  {userLocation && Number.isFinite(supermarket.lat) && Number.isFinite(supermarket.lng) && (
                    <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                  {formatDistance(
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

        {/* Action buttons - 移动端优化 */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* 收藏按钮 */}
          <button
            onClick={handleSaveClick}
            className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
              saved 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            } ${
              saving 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-110 active:scale-95'
            }`}
            disabled={saving}
            title={saved ? (language === 'en' ? 'Remove from favorites' : '取消收藏') : (language === 'en' ? 'Add to favorites' : '添加收藏')}
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${saved ? 'fill-current text-blue-600' : 'text-gray-500'}`} />
          </button>
          
          {/* 位置查看按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewLocation(supermarket);
                  }}
            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                  title={language === 'en' ? 'View on Google Maps' : '在Google地图中查看'}
                >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                
          {/* 导航按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDirections(supermarket);
                  }}
            className="p-1.5 sm:p-2 text-primary-600 hover:bg-primary-100 rounded-full transition-colors"
                  title={text[language].directions}
                >
            <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                
          {/* 电话按钮 */}
                {supermarket.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(supermarket.phone!);
                    }}
              className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title={text[language].call}
                  >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
    </div>
  );
}