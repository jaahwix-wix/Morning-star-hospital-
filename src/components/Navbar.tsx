import React, { useState, useEffect } from 'react';
import {
  Activity,
  PhoneCall,
  Clock,
  Shield,
  User,
  LogOut,
  ChevronDown,
  AlertCircle,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  Sparkles,
  BedDouble,
  Search
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergencyModal
}) => {
  const { currentUser, userProfile, activeRole, switchRole, signInWithGoogle, signOut } = useAuth();
  const { stats, triageQueue } = useHospitalData();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

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

  const criticalTriageCount = triageQueue.filter((t) => t.priority === 'P1_Immediate' && t.status !== 'discharged').length;

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string; bgBadge: string }> = {
    doctor: { label: 'Chief Doctor', icon: Stethoscope, color: 'text-indigo-700', bgBadge: 'bg-indigo-50 border-indigo-200' },
    nurse: { label: 'Triage Nurse', icon: HeartPulse, color: 'text-sky-700', bgBadge: 'bg-sky-50 border-sky-200' },
    lab_tech: { label: 'Lab Scientist', icon: FlaskConical, color: 'text-teal-700', bgBadge: 'bg-teal-50 border-teal-200' },
    admin: { label: 'Admin / Director', icon: Shield, color: 'text-slate-800', bgBadge: 'bg-slate-100 border-slate-300' },
    patient: { label: 'Patient Portal', icon: User, color: 'text-amber-700', bgBadge: 'bg-amber-50 border-amber-200' }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['doctor', 'nurse', 'lab_tech', 'admin'] },
    { id: 'triage', label: 'Emergency Triage', icon: AlertCircle, badge: criticalTriageCount > 0 ? `${criticalTriageCount} STAT` : undefined, badgeColor: 'bg-red-500 text-white', roles: ['doctor', 'nurse', 'admin'] },
    { id: 'patients', label: 'Patients & EMR', icon: User, roles: ['doctor', 'nurse', 'admin'] },
    { id: 'lab', label: 'Diagnostics Lab', icon: FlaskConical, badge: stats.pendingLabTests > 0 ? `${stats.pendingLabTests}` : undefined, badgeColor: 'bg-indigo-600 text-white', roles: ['doctor', 'lab_tech', 'admin'] },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope, roles: ['doctor', 'nurse', 'admin'] },
    { id: 'wards', label: 'Wards & Beds', icon: BedDouble, roles: ['doctor', 'nurse', 'admin'] },
    { id: 'ai-copilot', label: 'Clinical AI Copilot', icon: Sparkles, roles: ['doctor', 'nurse', 'lab_tech', 'admin'] },
    { id: 'patient-portal', label: 'My Patient Portal', icon: HeartPulse, roles: ['patient', 'doctor', 'nurse', 'admin', 'lab_tech'] }
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(activeRole));

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header id="hospital-navbar" className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* Top Utility & 24/7 Hotline Sub-header */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="tracking-wider uppercase text-[11px]">24 HOURS SERVICE EVERYDAY</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-xs">
            <span className="text-slate-400">Hotlines:</span>
            <button
              onClick={onOpenEmergencyModal}
              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              +232 73 929 145
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={onOpenEmergencyModal}
              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              +232 78 355 293
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Real-time Firestore Sync Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <button
            id="emergency-dispatch-top-btn"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg text-xs transition-colors shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency 24/7 Call</span>
          </button>
        </div>
      </div>

      {/* Main App Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Hospital Slogan */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs">
              <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-slate-900 font-sans">
                  Morning Star
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-900 text-white">
                  Hospital
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 italic">
                Your Health is our <span className="font-bold text-indigo-600 uppercase">Priority</span>
              </p>
            </div>
          </div>

          {/* Right Side: Role Selector & User Profile Widget */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                id="role-switcher-toggle"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all ${roleLabels[activeRole].bgBadge}`}
              >
                {React.createElement(roleLabels[activeRole].icon, {
                  className: `w-4 h-4 ${roleLabels[activeRole].color}`
                })}
                <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
                <span className={roleLabels[activeRole].color}>{roleLabels[activeRole].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div
                  id="role-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Clinical / Portal Access
                  </div>
                  {(Object.keys(DEMO_PROFILES) as UserRole[]).map((r) => {
                    const info = roleLabels[r];
                    const isCurrent = activeRole === r;
                    return (
                      <button
                        key={r}
                        id={`switch-role-${r}`}
                        onClick={() => {
                          switchRole(r);
                          setShowRoleMenu(false);
                          if (r === 'patient') {
                            setActiveTab('patient-portal');
                          } else if (activeTab === 'patient-portal') {
                            setActiveTab('dashboard');
                          }
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {React.createElement(info.icon, { className: `w-4 h-4 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}` })}
                          <div>
                            <div className="font-semibold">{info.label}</div>
                            <div className="text-[10px] text-slate-400">{DEMO_PROFILES[r].name}</div>
                          </div>
                        </div>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {getInitials(userProfile?.name)}
                  </div>
                  <div className="hidden md:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{userProfile?.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{userProfile?.department || 'Medical Staff'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  id="google-signin-btn"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Google Login</span>
                </button>
              )}

              {showUserMenu && currentUser && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in duration-100"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{userProfile?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{userProfile?.department}</p>
                  </div>
                  <button
                    id="signout-btn"
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip (Professional Polish) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
          {visibleNav.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                      item.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
