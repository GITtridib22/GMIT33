import { create } from 'zustand';
import type { Role, Donation, Shelter, City, UserProfile } from '../types';

export const CITIES = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 }
];

const DEFAULT_CITY = CITIES[3];

interface AppState {
  currentAppView: 'landing' | 'map';
  currentRole: Role;
  currentUserProfile: UserProfile | null;
  currentCity: City;
  donations: Donation[];
  shelters: Shelter[];
  setRole: (role: Role) => void;
  setAppView: (view: 'landing' | 'map') => void;
  loginUser: (role: Role, profile: UserProfile) => void;
  logoutUser: () => void;
  setCity: (city: City) => void;
  broadcastDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'status' | 'otp' | 'claimedByShelterId'>) => void;
  dispatchFleet: (donationId: string, shelterId: string) => void;
  declineDonation: (donationId: string) => void;
  verifyHandover: (donationId: string, otp: string) => boolean;
  updateShelterProfile: (shelterId: string, profile: Partial<Shelter>) => void;
}

const generateMockShelters = (cityLat: number, cityLng: number): Shelter[] => [
  {
    id: 's1',
    name: 'Annakshetra Community Kitchen',
    location: { lat: cityLat + 0.01, lng: cityLng - 0.01 },
    capacityGoal: 500,
    currentFulfilled: 320,
    incomingDeliveries: 45,
    vehicleType: 'E-Van',
    maxRadius: 8,
  },
  {
    id: 's2',
    name: 'Aahar NGO Shelter',
    location: { lat: cityLat - 0.015, lng: cityLng + 0.005 },
    capacityGoal: 300,
    currentFulfilled: 150,
    incomingDeliveries: 0,
    vehicleType: 'Mini-Truck',
    maxRadius: 12,
  }
];


const generateMockDonations = (cityLat: number, cityLng: number): Donation[] => [
  {
    id: 'd1',
    donorName: 'Grand Celebration Banquet',
    phone: '+91 98765 43210',
    address: '123 Main St, City Center',
    dietaryTypes: ['Veg', 'Jain'],
    exactItems: 'Vegetable Biryani & Raita',
    containerSize: 'Large',
    containerQuantity: 2,
    servings: 45,
    preparationTime: '18:30',
    expiryHours: 2,
    location: { lat: cityLat + 0.02, lng: cityLng + 0.01 },
    status: 'BROADCASTING',
    createdAt: new Date(),
  },
  {
    id: 'd2',
    donorName: 'Corporate Event Caterers',
    phone: '+91 99999 88888',
    address: '45 Tech Park',
    dietaryTypes: ['Veg'],
    exactItems: 'Chapati and Mixed Sabzi',
    containerSize: 'Extra Large',
    containerQuantity: 1,
    servings: 100,
    preparationTime: '19:00',
    expiryHours: 1,
    location: { lat: cityLat - 0.005, lng: cityLng - 0.02 },
    status: 'AVAILABLE',
    createdAt: new Date(),
  }
];

export const useStore = create<AppState>((set) => ({
  currentAppView: 'landing',
  currentRole: 'GUEST',
  currentUserProfile: null,
  currentCity: DEFAULT_CITY,
  donations: generateMockDonations(DEFAULT_CITY.lat, DEFAULT_CITY.lng),
  shelters: generateMockShelters(DEFAULT_CITY.lat, DEFAULT_CITY.lng),
  
  setRole: (role) => set({ currentRole: role }),
  setAppView: (view) => set({ currentAppView: view }),

  loginUser: (role, profile) => set((state) => {
    if (role === 'SHELTER') {
      const newShelter: Shelter = {
        id: `s_${Date.now()}`,
        name: profile.name,
        location: { lat: state.currentCity.lat, lng: state.currentCity.lng },
        capacityGoal: (profile as any).capacityGoal || 500,
        currentFulfilled: 0,
        incomingDeliveries: 0,
        vehicleType: (profile as any).vehicleType || 'E-Van',
        maxRadius: 10
      };
      return { 
        currentRole: role, 
        currentUserProfile: profile, 
        currentAppView: 'map',
        shelters: [newShelter, ...state.shelters] 
      };
    }
    return { 
      currentRole: role, 
      currentUserProfile: profile,
      currentAppView: 'map'
    };
  }),

  logoutUser: () => set({ 
    currentRole: 'GUEST', 
    currentUserProfile: null,
    currentAppView: 'landing' 
  }),
  
  setCity: (city) => set(() => {
    return {
      currentCity: city,
      donations: generateMockDonations(city.lat, city.lng),
      shelters: generateMockShelters(city.lat, city.lng),
    };
  }),
  
  broadcastDonation: (donationInput) => set((state) => {
    const newDonation: Donation = {
      ...donationInput,
      id: `d${Date.now()}`,
      status: 'BROADCASTING',
      createdAt: new Date(),
    };
    return { donations: [...state.donations, newDonation] };
  }),

  dispatchFleet: (donationId, shelterId) => set((state) => {
    // Generate random 4 digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    return {
      donations: state.donations.map(d => 
        d.id === donationId ? { ...d, status: 'DISPATCHED', claimedByShelterId: shelterId, otp: generatedOtp } : d
      ),
      shelters: state.shelters.map(s => {
        if (s.id === shelterId) {
          const don = state.donations.find(d => d.id === donationId);
          return { ...s, incomingDeliveries: s.incomingDeliveries + (don?.servings || 0) };
        }
        return s;
      })
    };
  }),

  declineDonation: (donationId) => set((state) => ({
    donations: state.donations.map(d => 
      d.id === donationId ? { ...d, status: 'DECLINED' } : d
    )
  })),

  verifyHandover: (donationId, otp) => {
    let success = false;
    set((state) => {
      const donation = state.donations.find(d => d.id === donationId);
      if (donation && donation.otp === otp) {
        success = true;
        return {
          donations: state.donations.map(d => 
            d.id === donationId ? { ...d, status: 'COMPLETED' } : d
          ),
          shelters: state.shelters.map(s => 
            s.id === donation.claimedByShelterId 
              ? { 
                  ...s, 
                  incomingDeliveries: s.incomingDeliveries - donation.servings,
                  currentFulfilled: s.currentFulfilled + donation.servings 
                } 
              : s
          )
        };
      }
      return state;
    });
    return success;
  },

  updateShelterProfile: (shelterId, profile) => set((state) => ({
    shelters: state.shelters.map(s => s.id === shelterId ? { ...s, ...profile } : s)
  }))
}));
