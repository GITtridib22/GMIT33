import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { RoutingMap } from '../RoutingMap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Truck, AlertOctagon, Navigation, CheckCircle, Car, X, ShieldCheck, Zap } from 'lucide-react';

export const MapView: React.FC = () => {
  const { currentRole, currentUserProfile, currentCity, donations, shelters, broadcastDonation, dispatchFleet, declineDonation, verifyHandover } = useStore();
  const [otpInput, setOtpInput] = useState('');
  const [routeTelemetry, setRouteTelemetry] = useState<Record<string, { distance: string; duration: string; traffic: string }>>({});

  const shelter = currentRole === 'SHELTER' ? shelters[0] : null;

  // Dynamic Map Re-Centering Hook
  const MapRecenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      if (center && center[0] && center[1]) {
        map.flyTo(center, 13, { duration: 1.5 });
      }
    }, [center, map]);
    return null;
  };

  // On mount, if Donor, broadcast the initial payload from currentUserProfile
  useEffect(() => {
    if (currentRole === 'DONOR' && currentUserProfile && donations.length === 0) {
      broadcastDonation({
        donorName: currentUserProfile.name,
        phone: currentUserProfile.phone,
        address: currentUserProfile.address,
        location: (currentUserProfile as any).location || { lat: currentCity.lat, lng: currentCity.lng },
        dietaryTypes: (currentUserProfile as any).dietaryTypes || ['Veg', 'Jain'],
        exactItems: (currentUserProfile as any).exactItems || 'Paneer Butter Masala, Jeera Rice',
        preparationTime: (currentUserProfile as any).preparationTime || '18:30',
        containerSize: (currentUserProfile as any).containerSize || 'Large',
        containerQuantity: (currentUserProfile as any).containerQuantity || 3,
        servings: (currentUserProfile as any).containerQuantity * 50 || 150,
        expiryHours: (currentUserProfile as any).expiryHours || 3
      });
    }
  }, [currentRole, currentUserProfile, broadcastDonation, currentCity, donations.length]);

  const donorActiveDonation = currentRole === 'DONOR' ? donations.find(d => d.donorName === currentUserProfile?.name) : null;
  
  const incomingAlerts = currentRole === 'SHELTER' ? donations.filter(d => d.status === 'BROADCASTING') : [];
  const activeDispatches = currentRole === 'SHELTER' && shelter ? donations.filter(d => d.status === 'DISPATCHED' && d.claimedByShelterId === shelter.id) : [];

  const handleVerifyOtp = (donationId: string) => {
    if (otpInput.length === 4) {
      const success = verifyHandover(donationId, otpInput);
      if (success) {
        setOtpInput('');
        alert('Handover verified successfully!');
      } else {
        alert('Invalid OTP. Please check with the donor.');
      }
    }
  };

  const activeDonationTarget = currentRole === 'SHELTER' ? (activeDispatches[0] || incomingAlerts[0] || null) : donorActiveDonation;

  const telemetry = activeDonationTarget ? routeTelemetry[activeDonationTarget.id] : null;

  // Fallback to detected profile location instead of hardcoded city
  const mapCenter = activeDonationTarget 
    ? [activeDonationTarget.location.lat, activeDonationTarget.location.lng] 
    : (currentUserProfile as any)?.location 
      ? [(currentUserProfile as any).location.lat, (currentUserProfile as any).location.lng]
      : [currentCity.lat, currentCity.lng];

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50">
      
      {/* LEFT PANEL: 35% */}
      <div className="w-full lg:w-[35%] bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl overflow-y-auto">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="font-bold text-lg">{currentRole === 'DONOR' ? 'Live Broadcast Status' : 'Command Center'}</h2>
            <p className="text-sm text-slate-400">{currentUserProfile?.name}</p>
          </div>
          {currentRole === 'DONOR' && <Zap className="w-6 h-6 text-emerald-400" />}
          {currentRole === 'SHELTER' && <ShieldCheck className="w-6 h-6 text-indigo-400" />}
        </div>

        <div className="p-6 flex-1 bg-slate-50">
          
          {/* DONOR LEFT PANEL */}
          {currentRole === 'DONOR' && donorActiveDonation && (
            <div className="space-y-6">
              
              {donorActiveDonation.status === 'BROADCASTING' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-center relative overflow-hidden">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-2 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Broadcasting Surplus</h3>
                  <p className="text-sm text-slate-500 mb-6">Alerting shelters within 8 km...</p>
                  
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="text-xs font-bold text-amber-800 uppercase mb-1">Time To Live (TTL)</div>
                    <div className="text-2xl font-mono text-amber-600 font-bold">0{donorActiveDonation.expiryHours}:00:00</div>
                  </div>
                </div>
              )}

              {donorActiveDonation.status === 'DISPATCHED' && (
                <div className="bg-white rounded-2xl shadow-md border border-emerald-200 p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-center text-slate-900 mb-6">Rescue Claimed!</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Assigned Shelter</p>
                    <p className="font-bold text-slate-900">Sneha Community Shelter</p>
                  </div>

                  <div className="bg-emerald-600 p-6 rounded-xl text-center text-white shadow-lg">
                    <p className="text-sm font-bold opacity-90 mb-2 uppercase tracking-widest">Secure Handover OTP</p>
                    <p className="text-6xl font-black tracking-widest">{donorActiveDonation.otp}</p>
                    <p className="text-xs opacity-75 mt-3 bg-emerald-700/50 py-2 rounded-lg">Provide this to the driver upon arrival</p>
                  </div>
                </div>
              )}

              {donorActiveDonation.status === 'COMPLETED' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-center animate-in zoom-in duration-500">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Rescue Complete</h3>
                  <p className="text-slate-600 mb-6">Thank you for preventing food waste.</p>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl font-bold border border-emerald-200 text-lg">
                    +{donorActiveDonation.servings} Meals Saved
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SHELTER LEFT PANEL */}
          {currentRole === 'SHELTER' && (
            <div className="space-y-6">
              
              {/* Active Dispatch */}
              {activeDispatches.length > 0 && activeDispatches.map(dispatch => (
                <div key={dispatch.id} className="bg-emerald-600 border border-emerald-500 shadow-xl rounded-2xl overflow-hidden text-white">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-xl">{dispatch.donorName}</h4>
                        <p className="text-emerald-100 text-sm font-bold mt-1 flex items-center"><MapPin className="w-4 h-4 mr-1"/> {dispatch.address}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center">
                      <p className="text-xs font-bold text-emerald-200 uppercase mb-2">Verify Donor OTP</p>
                      <div className="flex items-center justify-center space-x-3">
                        <input 
                          type="text" maxLength={4}
                          className="w-32 text-center p-3 rounded-xl font-mono text-2xl font-black outline-none focus:ring-2 focus:ring-white bg-emerald-800/50 border border-emerald-500 text-white placeholder-emerald-700"
                          placeholder="----"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        />
                        <button 
                          onClick={() => handleVerifyOtp(dispatch.id)}
                          className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-black transition-transform hover:scale-105 active:scale-95 shadow-md"
                        >Verify</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Incoming Radar */}
              {activeDispatches.length === 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2"></div>
                    Live Radar
                  </h2>
                  {incomingAlerts.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-medium">
                      Listening for rescue broadcasts...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incomingAlerts.map(alert => (
                        <div key={alert.id} className="bg-white border-2 border-rose-200 shadow-lg rounded-2xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1.5 rounded-bl-xl text-xs font-bold shadow-md flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> 0{alert.expiryHours}h 45m left
                          </div>
                          
                          <h3 className="text-xl font-black text-slate-900 mt-2">{alert.donorName}</h3>
                          <p className="text-sm font-medium text-slate-500 flex items-center mt-1"><MapPin className="w-4 h-4 mr-1 text-slate-400" /> {alert.address}</p>
                          
                          <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm font-bold text-slate-900 mb-2">{alert.exactItems}</p>
                            <p className="text-xs text-slate-600 font-medium">{alert.containerQuantity} x {alert.containerSize} • <span className="font-bold text-emerald-600">{alert.servings} Servings</span></p>
                          </div>

                          <div className="flex space-x-3">
                            <button 
                              onClick={() => declineDonation(alert.id)}
                              className="px-4 py-3 bg-white border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-xl transition-colors shrink-0"
                            ><X className="w-5 h-5" /></button>
                            <button 
                              onClick={() => shelter && dispatchFleet(alert.id, shelter.id)}
                              className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center"
                            ><Truck className="w-5 h-5 mr-2" /> Accept & Route</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL: 65% OSRM MAP */}
      <div className="hidden lg:block lg:w-[65%] relative bg-slate-200 h-full">
        
        {/* Telemetry Badge (Only if active route) */}
        {telemetry && activeDonationTarget?.status === 'DISPATCHED' && (
          <div className="absolute top-6 right-6 z-[400] animate-in fade-in slide-in-from-top-4">
            <div className={`bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border-l-8 flex items-center ${telemetry.traffic === 'Heavy' ? 'border-rose-500' : telemetry.traffic === 'Moderate' ? 'border-amber-500' : 'border-emerald-500'}`}>
              <div className={`p-3 rounded-xl mr-4 ${telemetry.traffic === 'Heavy' ? 'bg-rose-100 text-rose-600' : telemetry.traffic === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {telemetry.traffic === 'Heavy' ? <AlertOctagon className="w-6 h-6" /> : <Navigation className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Live Routing • {telemetry.traffic} Traffic</div>
                <div className="text-2xl font-black text-slate-900">ETA: {telemetry.duration} <span className="text-sm font-bold text-slate-400 ml-2">({telemetry.distance})</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-full z-0">
          {/* If there's an active dispatch AND shelter data, render the full routing map */}
          {activeDonationTarget && activeDonationTarget.status === 'DISPATCHED' && shelter ? (
            <RoutingMap 
              shelterLocation={shelter.location} 
              donorLocation={activeDonationTarget.location}
              onRouteComputed={(dist, dur, traf) => {
                setRouteTelemetry(prev => ({
                  ...prev,
                  [activeDonationTarget.id]: { distance: dist, duration: dur, traffic: traf }
                }));
              }}
            />
          ) : (
            /* Default fallback map if just waiting / broadcasting */
            <MapContainer center={mapCenter as L.LatLngExpression} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
              <MapRecenter center={mapCenter as [number, number]} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Show donor pin if active target exists */}
              {activeDonationTarget && (
                <Marker position={[activeDonationTarget.location.lat, activeDonationTarget.location.lng]} icon={L.divIcon({ className: 'custom-pin', html: '<div class="w-8 h-8 bg-emerald-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>' })}>
                  <Popup>{activeDonationTarget.donorName}</Popup>
                </Marker>
              )}
              
              {/* Show shelter pins if waiting */}
              {!activeDonationTarget && shelters.map(s => (
                <Marker key={s.id} position={[s.location.lat, s.location.lng]} icon={L.divIcon({ className: 'custom-pin', html: '<div class="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center"></div>' })}>
                  <Popup>{s.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};
