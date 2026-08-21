import React, { useEffect, useState } from 'react';
import { BarChart, Activity, Users, Home, TrendingUp, Cloud, Thermometer, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const DashboardView: React.FC = () => {
  const { donations, shelters, currentCity } = useStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEED'>('OVERVIEW');
  const [weather, setWeather] = useState<{ temp: number; windspeed: number; description: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // 1. REAL API INTEGRATION: Open-Meteo Weather API
  // This is a completely free, no-API-key-required real API to satisfy the hackathon requirement.
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentCity.lat}&longitude=${currentCity.lng}&current_weather=true`);
        const data = await res.json();
        if (data && data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
            description: data.current_weather.weathercode <= 3 ? 'Clear/Cloudy' : 'Rain/Poor Conditions'
          });
        }
      } catch (err) {
        console.error("Failed to fetch real weather API", err);
      } finally {
        setLoadingWeather(false);
      }
    };
    
    fetchWeather();
  }, [currentCity]);

  const totalMealsRescued = shelters.reduce((acc, shelter) => acc + shelter.currentFulfilled, 0);
  const totalMealsIncoming = shelters.reduce((acc, shelter) => acc + shelter.incomingDeliveries, 0);
  const pendingDonations = donations.filter(d => d.status === 'AVAILABLE' || d.status === 'BROADCASTING').length;

  return (
    <div className="absolute top-4 left-4 z-[400] w-[450px] max-h-[90vh] flex flex-col">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Global Dashboard
          </h2>
          <p className="text-slate-300 text-sm mt-1 flex items-center">
            Network overview for {currentCity.name}
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'OVERVIEW' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            Metrics Overview
          </button>
          <button 
            onClick={() => setActiveTab('FEED')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'FEED' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            Live Feed
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Main KPI */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{totalMealsRescued.toLocaleString()}</h2>
                    <p className="text-emerald-100 text-sm font-medium mt-1">Total Meals Rescued in {currentCity.name}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                  <div className="flex items-center text-slate-500 mb-2">
                    <Cloud className="w-4 h-4 mr-2 text-sky-500" />
                    <span className="text-xs font-semibold uppercase">Logistics Weather</span>
                  </div>
                  {loadingWeather ? (
                    <div className="animate-pulse h-8 bg-slate-200 rounded w-1/2"></div>
                  ) : weather ? (
                    <>
                      <p className="text-2xl font-bold text-slate-900">{weather.temp}°C</p>
                      <div className="mt-2 text-xs text-slate-500 font-medium">
                        {weather.description} • Wind: {weather.windspeed}km/h
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Weather API unavailable</p>
                  )}
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                  <div className="flex items-center text-slate-500 mb-2">
                    <Home className="w-4 h-4 mr-2 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase">Network Shelters</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{shelters.length}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    Active nodes operational in {currentCity.name}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'FEED' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Recent Activity
              </h3>
              
              {donations.map((d, i) => (
                <div key={d.id} className="relative pl-6 border-l-2 border-slate-200 pb-6 last:pb-0">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                    d.status === 'COMPLETED' ? 'bg-emerald-500' :
                    d.status === 'DISPATCHED' ? 'bg-indigo-500' : 'bg-rose-500 animate-pulse'
                  }`}></div>
                  
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{d.status === 'COMPLETED' ? 'Rescue Verified' : d.status === 'DISPATCHED' ? 'Fleet Dispatched' : 'New Broadcast'}</p>
                        <p className="text-xs text-slate-500 mt-1">{d.exactItems || d.donorName} • {d.servings} Servings</p>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {d.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {d.status === 'BROADCASTING' && (
                      <div className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded inline-flex">
                        Action Required
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
