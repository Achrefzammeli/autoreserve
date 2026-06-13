export interface Vehicle {
  id:            number;
  brand:         string;
  model:         string;
  price_per_day: number;
  status:        'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  image_url:     string | null;
  specs:         string | null;
}

export interface VehicleFormData {
  brand:         string;
  model:         string;
  price_per_day: number;
  status:        'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  specs:         string | null;
  image:         File | null;
}