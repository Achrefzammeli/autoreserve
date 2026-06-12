export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  type: string;
  price_per_day: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  image_url: string | null;
  specs: string | null;
}

export interface VehicleCreatePayload {
  brand: string;
  model: string;
  type: string;
  price_per_day: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  image_url: string | null;
  specs: string | null;
}