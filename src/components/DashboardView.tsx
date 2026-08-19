import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  BedDouble,
  FlaskConical,
  PhoneCall,
  Activity,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Search,
  RotateCw,
  Clock,
  HeartPulse
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenEmergencyModal: () => void;
  onOpenNewPatientModal: () => void;
  onOpenNewTriageModal: () => void;
  onOpenNewLabModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenEmergencyModal,
  onOpenNewPatientModal,
  onOpenNewTriageModal,
  onOpenNewLabModal
}) => {
  const { stats, triageQueue, labTests, patients, hospitalBeds } = useHospitalData();
  const { userProfile, activeRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 24-hour patient admission / emergency influx data for Recharts
  const patientFlowData = [
    { time: '00:00', emergency: 3, admissions: 1, labOrders: 2 },
    { time: '04:00', emergency: 5, admissions: 2, labOrders: 3 },
    { time: '08:00', emergency: 12, admissions: 6, labOrders: 14 },
    { time: '12:00', emergency: 16, admissions: 8, labOrders: 22 },
    { time: '16:00', emergency: 11, admissions: 5, labOrders: 18 },
    { time: '20:00', emergency: 8, admissions: 4, labOrders: 9 },
    { time: 'Now', emergency: stats.emergencyTriageActive + 2, admissions: stats.activeAdmissions, labOrders: stats.pendingLabTests + 6 }
  ];

  // Triage priority breakdown
  const p1Count = triageQueue.filter((t) => t.priority === 'P1_Immediate').length;
  const p2Count = triageQueue.filter((t) => t.priority === 'P2_Urgent').length;
  const p3Count = triageQueue.filter((t) => t.priority === 'P3_Delayed').length;
  const p4Count = triageQueue.filter((t) => t.priority === 'P4_Minor').length;

  const triagePieData = [
    { name: 'P1 Immediate (Red)', value: p1Count || 1, color: '#EF4444' },
    { name: 'P2 Urgent (Orange)', value: p2Count || 2, color: '#F97316' },
    { name: 'P3 Delayed (Yellow)', value: p3Count || 3, color: '#EAB308' },
    { name: 'P4 Minor (Green)', value: p4Count || 1, color: '#10B981' }
  ];

  // Lab test category counts
  const labCategoryCounts = [
    { category: 'Parasitology (Malaria)', completed: 8, pending: 2, abnormal: 5 },
    { category: 'Hematology (CBC)', completed: 12, pending: 3, abnormal: 4 },
    { category: 'Biochemistry', completed: 6, pending: 2, abnormal: 3 },
    { category: 'Microbiology (Typhoid)', completed: 7, pending: 1, abnormal: 2 },
    { category: 'Urinalysis', completed: 9, pending: 1, abnormal: 1 }
  ];

  // Ward occupancy calculations
  const wardMap: Record<string, { total: number; occupied: number }> = {};
  hospitalBeds.forEach((bed) => {
    if (!wardMap[bed.ward]) {
      wardMap[bed.ward] = { total: 0, occupied: 0 };
    }
    wardMap[bed.ward].total += 1;
    if (bed.isOccupied) wardMap[bed.ward].occupied += 1;
  });

  const wardBarData = Object.keys(wardMap).map((ward) => ({
    name: ward.replace(' Ward', '').replace('Resuscitation', 'Resusc.'),
    Occupied: wardMap[ward].occupied,
    Available: wardMap[ward].total - wardMap[ward].occupied
  }));

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="hospital-dashboard" className="space-y-6">
      {/* Top Header & Operational Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-sans">Operational Overview</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live EMR Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Morning Star Hospital — 24/7 Clinical Monitoring, Emergency Triage, & Diagnostics in Sierra Leone
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients, EMR, test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white transition-colors text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          <button
            id="dash-emergency-call"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>24/7 Hotline</span>
          </button>

          <button
            id="dash-new-triage-btn"
            onClick={onOpenNewTriageModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>New Triage</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Professional Polish Architecture) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Inpatients */}
        <div
          id="kpi-inpatients"
          onClick={() => onNavigate('patients')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Inpatients</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeAdmissions}</p>
          <p className="text-xs text-green-600 mt-2 font-medium flex items-center justify-between">
            <span>of {stats.totalPatients} Registered Patients</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Card 2: 24/7 Emergency Triage */}
        <div
          id="kpi-emergency-triage"
          onClick={() => onNavigate('triage')}
          className={`p-6 rounded-2xl border shadow-sm hover:border-slate-300 transition-all cursor-pointer group ${
            p1Count > 0 ? 'bg-red-50/40 border-red-200' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">24/7 Emergency Triage</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.emergencyTriageActive}</p>
          <p className="text-xs text-red-600 mt-2 font-medium flex items-center justify-between">
            <span>{p1Count > 0 ? `${p1Count} STAT P1 Cases` : 'Queue flow optimal'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Card 3: Bed Occupancy */}
        <div
          id="kpi-bed-occupancy"
          onClick={() => onNavigate('wards')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Capacity</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.occupancyRate}%</p>
          <p className="text-xs text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>{stats.availableBeds} Available ({stats.totalBeds} Total)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Card 4: Laboratory Diagnostics */}
        <div
          id="kpi-lab-diagnostics"
          onClick={() => onNavigate('lab')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab Diagnostics</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.pendingLabTests}</p>
          <p className="text-xs text-indigo-600 mt-2 font-medium flex items-center justify-between">
            <span>Pending Validation Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>

      {/* Secondary Operations & Resource Control Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Investment Control Quick Card */}
        <div
          id="kpi-investment-control"
          onClick={() => onNavigate('investment')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Investment Control</span>
            <p className="text-lg font-bold text-slate-900 font-sans">
              ${(stats.totalInvestmentsValue || 0).toLocaleString()} <span className="text-xs font-mono text-slate-400">USD</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">CapEx Infrastructure</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Pharmacy Control Quick Card */}
        <div
          id="kpi-pharmacy-control"
          onClick={() => onNavigate('pharmacy')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pharmacy Control</span>
            <p className="text-lg font-bold text-slate-900 font-sans">
              {stats.lowStockMedicationsCount || 0} <span className="text-xs font-normal text-slate-500">Low Stock</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dispensing & Formulary</p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Staff & Shift Swap Control Quick Card */}
        <div
          id="kpi-staff-control"
          onClick={() => onNavigate('staff')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff & Shift Swaps</span>
            <p className="text-lg font-bold text-slate-900 font-sans">
              {stats.onDutyStaffCount || 0} <span className="text-xs font-normal text-slate-500">Active</span>
            </p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {stats.pendingShiftSwapsCount ? `${stats.pendingShiftSwapsCount} Shift Swap Due` : 'Roster Active'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Billing & Invoicing Quick Card */}
        <div
          id="kpi-billing-control"
          onClick={() => onNavigate('billing')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing & Invoicing</span>
            <p className="text-lg font-bold text-emerald-600 font-sans">
              ${(stats.totalRevenue || 0).toLocaleString()} <span className="text-xs font-mono text-slate-400">Paid</span>
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              ${(stats.pendingPayments || 0).toLocaleString()} Pending Due
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24-Hour Patient Flow & Influx */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                24-Hour Patient Flow & Clinical Volume
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time emergency admissions and diagnostic laboratory trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Emergency
              </span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span> Inpatient
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Lab Orders
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emergencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="labGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area type="monotone" dataKey="emergency" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#emergencyGrad)" name="Emergency Cases" />
                <Area type="monotone" dataKey="admissions" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#admissionGrad)" name="Admissions" />
                <Area type="monotone" dataKey="labOrders" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#labGrad)" name="Lab Tests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Emergency Triage Priority Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Triage Priority Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manchester Emergency Triage Scoring</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {triagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {triagePieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name.split(' ')[0]} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Ward Bed Breakdown & Laboratory Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Bed Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Ward Bed Occupancy by Department
              </h2>
              <p className="text-xs text-slate-400">Live capacity status across inpatient wards</p>
            </div>
            <button
              onClick={() => onNavigate('wards')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage Beds →
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Occupied" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lab Diagnostic Overview & Abnormalities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Diagnostic Laboratory Metrics
              </h2>
              <p className="text-xs text-slate-400">Microscopy & Clinical Pathology Volume</p>
            </div>
            <button
              onClick={() => onNavigate('lab')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Open Lab →
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labCategoryCounts} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#334155' }} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" fill="#6366F1" name="Completed" radius={[0, 4, 4, 0]} />
                <Bar dataKey="abnormal" fill="#EF4444" name="Abnormal / Reactive" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Operational Board: Active Emergency Triage & Today's Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Triage Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active 24/7 Emergency Triage Desk
              </h3>
            </div>
            <button
              onClick={() => onNavigate('triage')}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Full Queue ({triageQueue.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {triageQueue.slice(0, 4).map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{entry.patientName}</span>
                    <span className="text-xs text-slate-500">({entry.age}y, {entry.gender})</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        entry.priority === 'P1_Immediate'
                          ? 'bg-red-600 text-white'
                          : entry.priority === 'P2_Urgent'
                          ? 'bg-orange-500 text-white'
                          : 'bg-yellow-500 text-slate-900'
                      }`}
                    >
                      {entry.priority.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{entry.chiefComplaint}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    {entry.spo2 && <span>SpO2: {entry.spo2}%</span>}
                    {entry.heartRate && <span>HR: {entry.heartRate} bpm</span>}
                    {entry.systolicBP && <span>BP: {entry.systolicBP}/{entry.diastolicBP}</span>}
                    <span>Arr: {entry.arrivedAt}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 capitalize">
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Patients & Medical Doctors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Current Inpatient Care & Diagnoses
              </h3>
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Patient Registry ({patients.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredPatients.slice(0, 4).map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{p.fullName}</span>
                    <span className="text-xs font-mono text-slate-400">[{p.patientId}]</span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {p.wardNumber || 'Outpatient'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{p.diagnosis || 'Clinical evaluation'}</p>
                  <p className="text-[11px] text-slate-400">Assigned: {p.assignedDoctor}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{p.bloodGroup}</span>
                  <div className="text-[11px] text-slate-500 capitalize">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
