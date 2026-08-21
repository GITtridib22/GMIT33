export type Role = 'GUEST' | 'DONOR' | 'SHELTER' | 'ADMIN';

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  // Shelter specific
  capacityGoal?: number;
  vehicleType?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'DELIVERED' | 'BROADCASTING' | 'DISPATCHED' | 'COMPLETED' | 'DECLINED';

export interface Donation {
  id: string;
  donorName: string;
  phone: string;
  address: string;
  dietaryTypes: string[];
  exactItems: string; // "Paneer Butter Masala, Jeera Rice..."
  containerSize: string;
  containerQuantity: number;
  servings: number;
  preparationTime: string;
  expiryHours: number;
  location: Location;
  status: DonationStatus;
  createdAt: Date;
  otp?: string;
  claimedByShelterId?: string;
  // Fallback for older mock data
  foodType?: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: Location;
  capacityGoal: number;
  currentFulfilled: number;
  incomingDeliveries: number;
  vehicleType: string;
  maxRadius: number;
}
