import React, { useState } from 'react';
import {
  Activity,
  PhoneCall,
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
  Clock,
  X,
  TrendingUp,
  Pill,
  UserCheck,
  Building2,
  Users,
  Receipt
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEmergencyModal: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergencyModal,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, userProfile, activeRole, switchRole, signInWithGoogle, signOut } = useAuth();
  const { stats, triageQueue, pharmacyItems, staffMembers } = useHospitalData();
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  const criticalTriageCount = triageQueue.filter(
    (t) => t.priority === 'P1_Immediate' && t.status !== 'discharged'
  ).length;

  const lowStockDrugsCount = pharmacyItems.filter(
    (p) => p.stockQuantity <= p.minThreshold
  ).length;

  const onDutyStaffCount = staffMembers.filter((s) => s.status === 'on_duty').length;

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string; bgBadge: string }> = {
    doctor: { label: 'Chief Doctor', icon: Stethoscope, color: 'text-indigo-700', bgBadge: 'bg-indigo-50 border-indigo-200' },
    nurse: { label: 'Triage Nurse', icon: HeartPulse, color: 'text-sky-700', bgBadge: 'bg-sky-50 border-sky-200' },
    lab_tech: { label: 'Lab Scientist', icon: FlaskConical, color: 'text-teal-700', bgBadge: 'bg-teal-50 border-teal-200' },
    admin: { label: 'Admin / Director', icon: Shield, color: 'text-slate-800', bgBadge: 'bg-slate-100 border-slate-300' },
    patient: { label: 'Patient Portal', icon: User, color: 'text-amber-700', bgBadge: 'bg-amber-50 border-amber-200' }
  };

  // Primary Clinical Navigation
  const clinicalNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['doctor', 'nurse', 'lab_tech', 'admin'] },
    {
      id: 'triage',
      label: 'Emergency Triage',
      icon: AlertCircle,
      badge: criticalTriageCount > 0 ? `${criticalTriageCount} STAT` : undefined,
      badgeColor: 'bg-red-500 text-white',
      roles: ['doctor', 'nurse', 'admin']
    },
    { id: 'patients', label: 'Patients Control', icon: Users, roles: ['doctor', 'nurse', 'admin'] },
    {
      id: 'lab',
      label: 'Diagnostics Lab',
      icon: FlaskConical,
      badge: stats.pendingLabTests > 0 ? `${stats.pendingLabTests}` : undefined,
      badgeColor: 'bg-indigo-600 text-white',
      roles: ['doctor', 'lab_tech', 'admin']
    },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope, roles: ['doctor', 'nurse', 'admin'] },
    { id: 'wards', label: 'Wards & Beds', icon: BedDouble, roles: ['doctor', 'nurse', 'admin'] },
    { id: 'ai-copilot', label: 'Clinical AI Copilot', icon: Sparkles, roles: ['doctor', 'nurse', 'lab_tech', 'admin'] },
    { id: 'patient-portal', label: 'My Patient Portal', icon: HeartPulse, roles: ['patient', 'doctor', 'nurse', 'admin', 'lab_tech'] }
  ];

  // Hospital Governance & Operations Navigation
  const operationsNavItems = [
    {
      id: 'investment',
      label: 'Investment Control',
      icon: TrendingUp,
      roles: ['doctor', 'nurse', 'admin', 'lab_tech']
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy Control',
      icon: Pill,
      badge: lowStockDrugsCount > 0 ? `${lowStockDrugsCount} Low` : undefined,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['doctor', 'nurse', 'admin', 'lab_tech']
    },
    {
      id: 'staff',
      label: 'Staff Control',
      icon: UserCheck,
      badge: `${onDutyStaffCount} Active`,
      badgeColor: 'bg-emerald-600 text-white',
      roles: ['doctor', 'nurse', 'admin']
    },
    {
      id: 'billing',
      label: 'Billing & Invoicing',
      icon: Receipt,
      badge: stats.pendingInvoicesCount > 0 ? `${stats.pendingInvoicesCount} Due` : undefined,
      badgeColor: 'bg-amber-600 text-white',
      roles: ['doctor', 'nurse', 'admin', 'patient']
    }
  ];

  const visibleClinical = clinicalNavItems.filter((item) => item.roles.includes(activeRole));
  const visibleOperations = operationsNavItems.filter((item) => item.roles.includes(activeRole));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        id="system-left-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs flex-shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-slate-900 font-sans">
                  Morning Star
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-900 text-white">
                  Hospital
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 italic truncate">
                Your Health is our <span className="font-bold text-indigo-600 uppercase">Priority</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Role Selection Widget */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Clinical Role
            </label>
            <button
              id="sidebar-role-toggle"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all bg-white ${roleLabels[activeRole].bgBadge}`}
            >
              <div className="flex items-center gap-2 truncate">
                {React.createElement(roleLabels[activeRole].icon, {
                  className: `w-3.5 h-3.5 flex-shrink-0 ${roleLabels[activeRole].color}`
                })}
                <span className={`truncate ${roleLabels[activeRole].color}`}>{roleLabels[activeRole].label}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {showRoleMenu && (
              <div
                id="sidebar-role-dropdown"
                className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Access Role
                </div>
                {(Object.keys(DEMO_PROFILES) as UserRole[]).map((r) => {
                  const info = roleLabels[r];
                  const isCurrent = activeRole === r;
                  return (
                    <button
                      key={r}
                      id={`sidebar-switch-role-${r}`}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleMenu(false);
                        if (r === 'patient') {
                          setActiveTab('patient-portal');
                        } else if (activeTab === 'patient-portal') {
                          setActiveTab('dashboard');
                        }
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {React.createElement(info.icon, {
                          className: `w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`
                        })}
                        <span className="truncate">{info.label}</span>
                      </div>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Middle Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* Clinical Management Group */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Clinical & Care
            </div>

            {visibleClinical.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
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

          {/* Operations & Control Group */}
          {visibleOperations.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Operations & Controls
              </div>

              {visibleOperations.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
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
          )}
        </div>

        {/* Bottom Section: 24/7 Hotline, Emergency Call & User */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Emergency Hotline Button */}
          <button
            id="sidebar-emergency-btn"
            onClick={onOpenEmergencyModal}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg text-xs transition-all shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>24/7 Emergency Dispatch</span>
          </button>

          {/* Sync Status Badge */}
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-medium">Firestore Live</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">24/7 Care</span>
          </div>

          {/* User Account / Profile */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                {getInitials(userProfile?.name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {userProfile?.name || 'Staff User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">
                  {userProfile?.department || 'Medical Center'}
                </p>
              </div>
            </div>

            {currentUser ? (
              <button
                id="sidebar-signout-btn"
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="sidebar-google-login-btn"
                onClick={signInWithGoogle}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
