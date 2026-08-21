import React, { useState } from 'react';
import { Home, Utensils, Navigation, AlertCircle, RefreshCw, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Role } from '../../types';

const DIETARY_TYPES = ['Veg', 'Non-Veg', 'Vegan', 'Halal', 'Jain'];
const CONTAINERS = [
  { id: 'Small', label: 'Small Container', servings: 10 },
  { id: 'Medium', label: 'Medium Container', servings: 25 },
  { id: 'Large', label: 'Large Container', servings: 50 },
  { id: 'Extra Large', label: 'Extra Large / Cauldron', servings: 100 },
];

export const LandingView: React.FC = () => {
  const { loginUser, currentCity } = useStore();
  const [activeModal, setActiveModal] = useState<Role | null>(null);

  // Form States (pre-filled with demo defaults)
  const [donorForm, setDonorForm] = useState({
    name: 'Grand Celebration Banquet',
    phone: '+91 98765 43210',
    address: '123 Event Hall, Main St',
    location: { lat: currentCity.lat, lng: currentCity.lng },
    dietaryTypes: ['Veg', 'Jain'] as string[],
    exactItems: 'Paneer Butter Masala, Jeera Rice, Dal Makhani',
    preparationTime: '18:30',
    containerSize: 'Large',
    containerQuantity: 3,
    expiryHours: 3
  });

  const [shelterForm, setShelterForm] = useState({
    name: 'Sneha Community Shelter',
    phone: '+91 99999 00000',
    address: '45 Welfare Ave, Downtown',
    capacityGoal: 200,
    currentFulfilled: 60,
    vehicleType: 'E-Van',
    maxRadius: 10
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const totalServings = (CONTAINERS.find(c => c.id === donorForm.containerSize)?.servings || 0) * donorForm.containerQuantity;

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setDonorForm(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
            address: data.display_name || 'Detected Location'
          }));
        } catch (err) {
          setDonorForm(prev => ({ ...prev, location: { lat: latitude, lng: longitude } }));
        } finally {
          setDetectingLocation(false);
        }
      }, () => {
        alert("Geolocation denied. Using default map center.");
        setDetectingLocation(false);
      });
    }
  };

  const handleDonorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser('DONOR', {
      name: donorForm.name,
      phone: donorForm.phone,
      address: donorForm.address,
      ...donorForm // pass all form data so the map view can access it if needed (we can broadcast immediately or from map)
    });
  };

  const handleShelterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser('SHELTER', {
      name: shelterForm.name,
      phone: shelterForm.phone,
      address: shelterForm.address,
      capacityGoal: shelterForm.capacityGoal,
      vehicleType: shelterForm.vehicleType,
    });
  };

  const toggleDietary = (type: string) => {
    setDonorForm(prev => ({
      ...prev,
      dietaryTypes: prev.dietaryTypes.includes(type) 
        ? prev.dietaryTypes.filter(t => t !== type)
        : [...prev.dietaryTypes, type]
    }));
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 z-0"></div>
      
      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Select Your Role</h1>
        <p className="text-slate-500 mb-10">Choose an entry point to begin the rescue flow.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banquet Donor Card */}
          <div 
            onClick={() => setActiveModal('DONOR')}
            className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-emerald-100 transition-colors">
              <Utensils className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Join / Broadcast as Banquet Donor</h2>
            <p className="text-slate-500 text-sm">Have surplus food? Broadcast it to nearby shelters instantly.</p>
          </div>

          {/* Shelter Overseer Card */}
          <div 
            onClick={() => setActiveModal('SHELTER')}
            className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-indigo-100 transition-colors">
              <Home className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Register / Oversee Shelter</h2>
            <p className="text-slate-500 text-sm">Set up your command center and dispatch fleets for rescues.</p>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold">
                  {activeModal === 'DONOR' ? 'Banquet Surplus Entry Form' : 'Shelter Configuration Form'}
                </h2>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeModal === 'DONOR' && (
                <form onSubmit={handleDonorSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Donor Name</label>
                      <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={donorForm.name} onChange={e => setDonorForm({...donorForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Contact / Phone No.</label>
                      <input required type="tel" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={donorForm.phone} onChange={e => setDonorForm({...donorForm, phone: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Venue Address</label>
                    <div className="flex space-x-2">
                      <input required type="text" className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={donorForm.address} onChange={e => setDonorForm({...donorForm, address: e.target.value})} />
                      <button type="button" onClick={handleDetectLocation} disabled={detectingLocation} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center font-bold">
                        {detectingLocation ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5 mr-2" />}
                        {detectingLocation ? '...' : 'Detect'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Dietary Classification</label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_TYPES.map(type => (
                        <button type="button" key={type} onClick={() => toggleDietary(type)} className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${donorForm.dietaryTypes.includes(type) ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Exact Food Items</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={donorForm.exactItems} onChange={e => setDonorForm({...donorForm, exactItems: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Container Size</label>
                      <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={donorForm.containerSize} onChange={e => setDonorForm({...donorForm, containerSize: e.target.value})}>
                        {CONTAINERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Container Count</label>
                      <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                        <button type="button" onClick={() => setDonorForm(p => ({...p, containerQuantity: Math.max(1, p.containerQuantity - 1)}))} className="w-8 h-8 rounded bg-white border flex items-center justify-center font-bold text-slate-600">-</button>
                        <span className="font-bold flex-1 text-center">{donorForm.containerQuantity}</span>
                        <button type="button" onClick={() => setDonorForm(p => ({...p, containerQuantity: p.containerQuantity + 1}))} className="w-8 h-8 rounded bg-white border flex items-center justify-center font-bold text-slate-600">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-emerald-600 font-bold text-sm">Total Estimated: {totalServings} Servings</div>

                  <div>
                    <label className="block text-sm font-bold text-amber-700 mb-1">Freshness & Safe Consumption Window (Hours)</label>
                    <input type="range" min="1" max="12" className="w-full accent-amber-500" value={donorForm.expiryHours} onChange={e => setDonorForm({...donorForm, expiryHours: Number(e.target.value)})} />
                    <div className="text-center font-bold text-amber-600 mt-1">{donorForm.expiryHours} Hours</div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-emerald-700 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 mr-2" /> Broadcast Surplus & View Route Map
                  </button>
                </form>
              )}

              {activeModal === 'SHELTER' && (
                <form onSubmit={handleShelterSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Shelter Name</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={shelterForm.name} onChange={e => setShelterForm({...shelterForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Address / Area</label>
                    <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={shelterForm.address} onChange={e => setShelterForm({...shelterForm, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Max Capacity (Servings)</label>
                      <input required type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={shelterForm.capacityGoal} onChange={e => setShelterForm({...shelterForm, capacityGoal: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Current Occupancy</label>
                      <input required type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={shelterForm.currentFulfilled} onChange={e => setShelterForm({...shelterForm, currentFulfilled: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fleet Transport Type</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={shelterForm.vehicleType} onChange={e => setShelterForm({...shelterForm, vehicleType: e.target.value})}>
                      <option>Auto-Rickshaw</option>
                      <option>E-Van</option>
                      <option>Two-Wheeler</option>
                      <option>Mini-Truck</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center mt-8">
                    <Navigation className="w-6 h-6 mr-2" /> Open Command Map
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
