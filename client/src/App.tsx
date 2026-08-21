import React from 'react';
import { Header } from './components/Header';
import { LandingView } from './components/views/LandingView';
import { MapView } from './components/views/MapView';
import { DashboardView } from './components/views/DashboardView';
import { useStore } from './store/useStore';

function App() {
  const { currentAppView, currentRole } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans h-screen overflow-hidden">
      <Header />
      
      <main className="flex-1 relative h-[calc(100vh-64px)] overflow-hidden">
        {/* Conditional rendering based on view */}
        {currentAppView === 'landing' && <LandingView />}
        {currentAppView === 'map' && currentRole !== 'ADMIN' && <MapView />}
        {currentRole === 'ADMIN' && <DashboardView />}
        
        {/* Helper text for demo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 text-xs text-gray-500 text-center pointer-events-none hidden sm:block">
          Interactive Demo • Switch roles in the header to simulate the multi-sided marketplace
        </div>
      </main>
    </div>
  );
}

export default App;
