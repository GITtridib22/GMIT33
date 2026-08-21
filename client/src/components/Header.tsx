import { Truck, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Header = () => {
  const { currentAppView, logoutUser } = useStore();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-[1000] shadow-sm shrink-0">
      <div className="flex items-center">
        <div className="bg-emerald-600 p-2 rounded-xl">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <span className="ml-2 text-xl font-black text-slate-900 tracking-tight">Rescue<span className="text-emerald-600">Route</span></span>
      </div>
      
      {currentAppView === 'map' && (
        <button 
          onClick={() => logoutUser()}
          className="flex items-center px-4 py-2 text-sm font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Landing Page
        </button>
      )}
    </header>
  );
};
