export interface Project {
  id: string;
  order: number;
  title: string;
  region: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  image: string; // Main cover image
  gallery: string[]; // Additional images for carousel
  coordinates: { x: number; y: number }; // Percentage on the map (Legacy visual coords)
  geoCoordinates: [number, number]; // Real world coordinates [lat, long] - Marker location
  
  // NEW: Custom camera position configuration
  mapView?: {
    center?: [number, number]; // Where the camera looks (defaults to geoCoordinates if empty)
    zoom?: number;             // Zoom level (defaults to 14)
  };

  // NEW: Exclusive camera position for Mobile (< 768px)
  mobileMapView?: {
    center?: [number, number];
    zoom?: number;
  };

  // Optional GeoJSON data from Yandex Maps Constructor
  geoJson?: any; 
  stats: {
    area: string;
    units: number;
    completion: number;
  };
  features: string[];
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface StatItem {
  id: number;
  value: string;
  label: string;
  suffix?: string;
}