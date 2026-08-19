import React, { useState, useEffect } from 'react';
import {
  Menu,
  PhoneCall,
  Clock,
  Radio,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  activeTab: string;
  onOpenMobileMenu: () => void;
  onOpenEmergencyModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenEmergencyModal
}) => {
  const { userProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabLabels: Record<string, string> = {
    dashboard: 'Executive Dashboard & Clinical Analytics',
    triage: '24/7 Emergency Triage & Trauma Board',
    patients: 'Patient Control & Electronic Medical Records',
    lab: 'Diagnostic Laboratory & Pathology Center',
    consultations: 'Physician Consultations & Appointments',
    wards: 'Hospital Beds & Inpatient Ward Monitoring',
    investment: 'Capital Investment & Health Infrastructure Control',
    pharmacy: 'Pharmacy Inventory & Medication Dispensation Control',
    staff: 'Clinical Staff Roster & Station Assignment Control',
    'ai-copilot': 'Clinical AI Copilot & Diagnostic Decision Support',
    'patient-portal': 'Patient Care & Wellness Portal'
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with 24/7 Hotline */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="tracking-wider uppercase text-[10px]">24 HOURS SERVICE EVERYDAY</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-xs">
            <span className="text-slate-400 text-[11px]">Emergency Hotline:</span>
            <button
              onClick={onOpenEmergencyModal}
              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 text-xs"
            >
              +232 73 929 145
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={onOpenEmergencyModal}
              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 text-xs"
            >
              +232 78 355 293
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-slate-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 py-0.5 rounded-md text-[11px] transition-colors shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency Call</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden border border-slate-200"
            title="Open System Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Morning Star Hospital</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-indigo-600 font-semibold capitalize">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              {tabLabels[activeTab] || 'Clinical Management'}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick info */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Welcome, <strong className="text-slate-800">{userProfile?.name}</strong>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            {userProfile?.department || 'Medical Staff'}
          </span>
        </div>
      </div>
    </header>
  );
};
