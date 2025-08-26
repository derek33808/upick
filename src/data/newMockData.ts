import { Product, Supermarket } from '../types';

// 基于超市_修正版本.md文件更新的超市数据
export const newMockSupermarkets: Supermarket[] = [
  // Woolworths (Countdown) 连锁超市
  {
    id: 1,
    name_en: "Woolworths (Countdown) Belfast",
    name_zh: "Woolworths (Countdown)（Belfast）",
    location: "1 Radcliffe Rd, Belfast",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBDb3VudGRvd24gR3JlZW4gQXBwbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQwKSI+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIi8+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIiBvcGFjaXR5PSIwLjQiLz4KPHBhdGggZD0iTTYwIDYwQzY2IDI4IDEwNCA2IDExNiAzNkMxMDQgNjYgNjAgNjBaIiBmaWxsPSIjOEVDNDREIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMDggNjAgMTE2IDM2IDExNiAzNkMxMDQgNiA2NiAyOCA2MCA2MFoiIGZpbGw9IiM2OEE1M0UiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0VGMzIzQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyMiI+Y291bnRkb3duPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4QTUzRSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5zaG9wIHNtYXJ0ZXI8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.469,
    lng: 172.639,
    phone: "+64 3 383 4200",
    hours: "6:00 AM - 12:00 AM",
    rating: 4.1
  },
  {
    id: 2,
    name_en: "Woolworths (Countdown) Avonhead",
    name_zh: "Woolworths (Countdown)（Avonhead）",
    location: "Corner Withells Rd & Merrin St, Avonhead",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBDb3VudGRvd24gR3JlZW4gQXBwbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQwKSI+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIi8+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIiBvcGFjaXR5PSIwLjQiLz4KPHBhdGggZD0iTTYwIDYwQzY2IDI4IDEwNCA2IDExNiAzNkMxMDQgNjYgNjAgNjBaIiBmaWxsPSIjOEVDNDREIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMDggNjAgMTE2IDM2IDExNiAzNkMxMDQgNiA2NiAyOCA2MCA2MFoiIGZpbGw9IiM2OEE1M0UiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0VGMzIzQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyMiI+Y291bnRkb3duPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4QTUzRSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5zaG9wIHNtYXJ0ZXI8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.518,
    lng: 172.564,
    phone: "+64 3 348 8000",
    hours: "6:00 AM - 12:00 AM",
    rating: 4.0
  },
  {
    id: 3,
    name_en: "Woolworths (Countdown) Airport",
    name_zh: "Woolworths (Countdown)（Airport）",
    location: "544 Memorial Ave, Christchurch Airport",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBDb3VudGRvd24gR3JlZW4gQXBwbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQwKSI+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIi8+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIiBvcGFjaXR5PSIwLjQiLz4KPHBhdGggZD0iTTYwIDYwQzY2IDI4IDEwNCA2IDExNiAzNkMxMDQgNjYgNjAgNjBaIiBmaWxsPSIjOEVDNDREIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMDggNjAgMTE2IDM2IDExNiAzNkMxMDQgNiA2NiAyOCA2MCA2MFoiIGZpbGw9IiM2OEE1M0UiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0VGMzIzQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyMiI+Y291bnRkb3duPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4QTUzRSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5zaG9wIHNtYXJ0ZXI8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.483,
    lng: 172.533,
    phone: "+64 3 358 4400",
    hours: "6:00 AM - 12:00 AM",
    rating: 4.2
  },
  {
    id: 4,
    name_en: "Woolworths (Countdown) Riccarton",
    name_zh: "Woolworths (Countdown)（Riccarton）",
    location: "Cnr Riccarton Rd & Hansons Lane, Riccarton",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBDb3VudGRvd24gR3JlZW4gQXBwbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQwKSI+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIi8+CjxwYXRoIGQ9Ik02MCA2MEMzMCA2MCA2IDM0IDM2IDRDNjYgMzQgOTAgNjAgNjBaIiBmaWxsPSIjNzNCNTFFIiBvcGFjaXR5PSIwLjQiLz4KPHBhdGggZD0iTTYwIDYwQzY2IDI4IDEwNCA2IDExNiAzNkMxMDQgNjYgNjAgNjBaIiBmaWxsPSIjOEVDNDREIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMDggNjAgMTE2IDM2IDExNiAzNkMxMDQgNiA2NiAyOCA2MCA2MFoiIGZpbGw9IiM2OEE1M0UiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0VGMzIzQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyMiI+Y291bnRkb3duPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4QTUzRSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5zaG9wIHNtYXJ0ZXI8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.531,
    lng: 172.574,
    phone: "+64 3 348 7766",
    hours: "6:00 AM - 12:00 AM",
    rating: 4.0
  },
  {
    id: 5,
    name_en: "Pak'nSave Hornby",
    name_zh: "Pak'nSave（Hornby）",
    location: "The Hub Hornby, Main South Rd, Hornby",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZEQjAwIiByeD0iMTAiLz4KPHJlY3QgeD0iNDAiIHk9IjcwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDAwMDAwIiByeD0iNCIvPgo8dGV4dCB4PSIxMDAiIHk9Ijk0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZEQjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4Ij5QQUtuU0FWRTY8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTA5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjEyIj5IT1JOQlk8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.538,
    lng: 172.536,
    phone: "+64 3 349 8052",
    hours: "7:00 AM - 10:00 PM",
    rating: 4.2
  },
  {
    id: 6,
    name_en: "New World Bishopdale",
    name_zh: "New World（Bishopdale）",
    location: "Cnr Farrington Ave & Harewood Rd, Bishopdale",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPCEtLSBOZXcgV29ybGQgRGlhbW9uZCBMb2dvIC0tPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1MCwgNDApIj4KPHBhdGggZD0iTTUwIDIwTDgwIDUwTDUwIDgwTDIwIDUwWiIgZmlsbD0iI0VEMzEzQyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiLz4KPHBhdGggZD0iTTI4IDQyTDcyIDQyTDUwIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMjggNThMNzIgNThMNTAgODBaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yMCA1MEw0MiA1MEw1MCAyOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTU4IDUwTDgwIDUwTDUwIDI4WiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMjAgNTBMNDIgNTBMNTAgNzJaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik01OCA1MEw4MCA1MEw1MCA3MloiIGZpbGw9IiNGRkZGRkYiLz4KPGVsbGlwc2UgY3g9IjUwIiBjeT0iNTAiIHJ4PSIxNCIgcnk9IjE0IiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNFRDMxM0MiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTYiPk5XPC90ZXh0Pgo8L2c+Cjx0ZXh0IHg9IjEwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRUQzMTNDIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4Ij5ORVcgV09STEQ8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.504,
    lng: 172.585,
    phone: "+64 3 359 4040",
    hours: "7:00 AM - 10:00 PM",
    rating: 4.2
  },
  {
    id: 7,
    name_en: "FreshChoice Barrington",
    name_zh: "FreshChoice（Barrington）",
    location: "256 Barrington St, Barrington",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA5NEY0IiByeD0iMTAiLz4KPCEtLSBGcmVzaENob2ljZSBDb2xvcmZ1bCBDaXJjbGUgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQ1KSI+CjxwYXRoIGQ9Ik0zNSA1NUMzNSAzNSA1NSAzNSA3NSA1NVM3NSA3NSA1NSA3NVMzNSA3NSAzNSA1NVoiIGZpbGw9IiNGRkVEMDAiLz4KPHBhdGggZD0iTTM1IDU1QzM1IDM1IDU1IDM1IDc1IDU1UzEwMCA3NSA4MCA3NVM1NSA3NSAzNSA1NVoiIGZpbGw9IiNGRkI5MDAiLz4KPHBhdGggZD0iTTc1IDU1QzEwMCA1NSAxMDAgNzUgODAgNzVTNTUgNzUgNzUgNTVaIiBmaWxsPSIjRkY2OTAwIi8+CjxwYXRoIGQ9Ik01NSA1NUMzNSAzNSA1NSAzNSA3NSA1NVMxMDAgNzUgODAgNzVTNTUgNzUgNTUgNTVaIiBmaWxsPSIjNEZCRTQyIi8+CjxwYXRoIGQ9Ik02MCA1NUMzNSAzNSA1NSAzNSA3NSA1NVMxMDAgNzUgODAgNzVTNjAgNzUgNjAgNTVaIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjEzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0ibm9ybWFsIj5mcmVzaDwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSIxNTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiPmNob2ljZTwvdGV4dD4KPC9zdmc+",
    lat: -43.555,
    lng: 172.628,
    phone: "+64 3 338 3045",
    hours: "7:00 AM - 9:00 PM",
    rating: 4.3
  },
  {
    id: 8,
    name_en: "Sunson Asian Food Market Riccarton",
    name_zh: "三商亚洲超市（Riccarton）",
    location: "386 Riccarton Road, Upper Riccarton",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjREM0MzNCIiByeD0iMTAiLz4KPCEtLSBDaGluZXNlIERyYWdvbiBJbnNwaXJlZCBMb2dvIC0tPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNDApIj4KPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNDUiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0RDNDMzNCIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxwYXRoIGQ9Ik0zNSA2MEw4NSA2MEw2MCA0MEwzNSA2MFoiIGZpbGw9IiNEQzQzM0IiLz4KPHBhdGggZD0iTTM1IDYwTDg1IDYwTDYwIDgwTDM1IDYwWiIgZmlsbD0iI0RDNDMzQiIvPgo8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSIyNSIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjREMxQjMyIiBzdHJva2Utd2lkdGg9IjIiLz4KPHR5eHQgeD0iNjAiIHk9IjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMxQjMyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjI0Ij7kuInphYk8L3RleHQ+CjwvZz4KPHR5eHQgeD0iMTAwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTgiPlNVTlNPTjwvdGV4dD4KPHR5eHQgeD0iMTAwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+QVNJQTwvdGV4dD4KPC9zdmc+",
    lat: -43.53,
    lng: 172.585,
    phone: "+64 3 348 3288",
    hours: "9:00 AM - 8:00 PM",
    rating: 4.5
  },
  {
    id: 9,
    name_en: "Kosco Asian Supermarket Ilam",
    name_zh: "Kosco Asian Supermarket（Ilam）",
    location: "209A Waimairi Rd, Ilam",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkYwMDUwIiByeD0iMTAiLz4KPCEtLSBBc2lhIE1hcnQgRGVzaWduIC0tPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNDApIj4KPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNDAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGMDA1MCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Ik0zNSA2MEg4NU01MCAzNUw2MCA2MEw3MCA4NU01MCA4NUw2MCA2MEw3MCAzNSIgc3Ryb2tlPSIjRkYwMDUwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9nPgo8dGV4dCB4PSIxMDAiIHk9IjE0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxOCI+S09TQ088L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkFTSUFOPC90ZXh0Pgo8L3N2Zz4=",
    lat: -43.53,
    lng: 172.574,
    phone: "+64 3 358 1888",
    hours: "9:00 AM - 8:00 PM",
    rating: 4.4
  },
  {
    id: 10,
    name_en: "Four Square Papanui",
    name_zh: "Four Square（Papanui）",
    location: "167 Main North Rd, Papanui",
    logo_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA3RkZGIiByeD0iMTAiLz4KPCEtLSBGb3VyIFNxdWFyZSBHZW9tZXRyaWMgTG9nbyAtLT4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsIDUwKSI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iNTUiIHk9IjAiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iMCIgeT0iNTUiIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI0ZGRkZGRiIgcng9IjUiLz4KPHJlY3QgeD0iNTUiIHk9IjU1IiB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIGZpbGw9IiNGRkZGRkYiIHJ4PSI1Ii8+CjwvZz4KPHRleHQgeD0iMTAwIiB5PSIxNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTYiPkZPVVI8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE2Ij5TUVVBUkU8L3RleHQ+Cjwvc3ZnPg==",
    lat: -43.504,
    lng: 172.612,
    phone: "+64 3 352 2020",
    hours: "7:00 AM - 9:00 PM",
    rating: 4.0
  }
];

// 只保留前10个商品，调整它们的supermarket_id以匹配新的超市数据
export const updatedMockProducts: Product[] = [
  {
    id: 1,
    name_en: "Fresh Tomatoes",
    name_zh: "新鲜番茄",
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop&crop=center",
    price: 2.99,
    originalPrice: 3.99,
    unit: "NZD/kg",
    supermarket_id: 1,
    category: "vegetable",
    updated_at: "2025-01-20",
    isSpecial: true,
    specialEndDate: "2025-01-25",
    discount: 25,
    origin: "New Zealand",
    freshness: "Grade A",
    rating: 4.5
  },
  {
    id: 2,
    name_en: "Royal Gala Apples",
    name_zh: "皇家嘎拉苹果",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&crop=center",
    price: 4.50,
    unit: "NZD/kg",
    supermarket_id: 2,
    category: "fruit",
    updated_at: "2025-01-20",
    origin: "New Zealand",
    freshness: "Premium",
    rating: 4.8
  },
  {
    id: 3,
    name_en: "Fresh Salmon Fillet",
    name_zh: "新鲜三文鱼片",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=300&fit=crop&crop=center",
    price: 28.99,
    unit: "NZD/kg",
    supermarket_id: 3,
    category: "seafood",
    updated_at: "2025-01-20",
    origin: "South Island",
    freshness: "Premium",
    rating: 4.7
  },
  {
    id: 4,
    name_en: "Organic Carrots",
    name_zh: "有机胡萝卜",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&crop=center",
    price: 3.20,
    originalPrice: 3.80,
    unit: "NZD/kg",
    supermarket_id: 4,
    category: "vegetable",
    updated_at: "2025-01-19",
    isSpecial: true,
    specialEndDate: "2025-01-24",
    discount: 16,
    origin: "Canterbury",
    freshness: "Organic",
    rating: 4.6
  },
  {
    id: 5,
    name_en: "Premium Beef",
    name_zh: "优质牛肉",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=300&fit=crop&crop=center",
    price: 12.99,
    unit: "NZD/kg",
    supermarket_id: 5,
    category: "meat",
    updated_at: "2025-01-19",
    origin: "Canterbury",
    freshness: "Grade A",
    rating: 4.4
  },
  {
    id: 6,
    name_en: "Fresh Milk",
    name_zh: "新鲜牛奶",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&crop=center",
    price: 2.80,
    unit: "NZD/L",
    supermarket_id: 6,
    category: "dairy",
    updated_at: "2025-01-19",
    origin: "Canterbury",
    freshness: "Fresh",
    rating: 4.3
  },
  {
    id: 7,
    name_en: "Mandarin Oranges",
    name_zh: "蜜柑",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop&crop=center",
    price: 5.99,
    originalPrice: 7.99,
    unit: "NZD/kg",
    supermarket_id: 7,
    category: "fruit",
    updated_at: "2025-01-18",
    isSpecial: true,
    specialEndDate: "2025-01-26",
    discount: 25,
    origin: "Nelson",
    freshness: "Premium",
    rating: 4.7
  },
  {
    id: 8,
    name_en: "Chinese Cabbage",
    name_zh: "白菜",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&h=300&fit=crop&crop=center",
    price: 3.99,
    unit: "NZD/each",
    supermarket_id: 8,
    category: "vegetable",
    updated_at: "2025-01-20",
    origin: "New Zealand",
    freshness: "Premium",
    rating: 4.6
  },
  {
    id: 9,
    name_en: "Jasmine Rice",
    name_zh: "茉莉香米",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&crop=center",
    price: 12.99,
    originalPrice: 15.99,
    unit: "NZD/5kg",
    supermarket_id: 9,
    category: "grain",
    updated_at: "2025-01-19",
    isSpecial: true,
    specialEndDate: "2025-01-26",
    discount: 19,
    origin: "Thailand",
    freshness: "Premium",
    rating: 4.8
  },
  {
    id: 10,
    name_en: "Local Honey",
    name_zh: "本地蜂蜜",
    image: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=300&h=300&fit=crop&crop=center",
    price: 18.99,
    unit: "NZD/500g",
    supermarket_id: 10,
    category: "condiment",
    updated_at: "2025-01-18",
    origin: "Canterbury",
    freshness: "Premium",
    rating: 4.7
  }
];

// Add supermarket reference to products
updatedMockProducts.forEach(product => {
  product.supermarket = newMockSupermarkets.find(s => s.id === product.supermarket_id);
});


