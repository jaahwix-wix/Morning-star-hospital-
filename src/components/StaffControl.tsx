import React, { useState } from 'react';
import {
  UserCheck,
  Users,
  Clock,
  Shield,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Award,
  Stethoscope,
  Activity,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  XCircle,
  Calendar,
  FileText,
  UserPlus
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import {
  StaffMember,
  StaffRole,
  StaffShift,
  StaffStatus,
  ShiftSwapRequest,
  ShiftSwapStatus,
  ShiftSwapUrgency
} from '../types';

export const StaffControl: React.FC = () => {
  const {
    staffMembers,
    shiftSwaps,
    addStaffMember,
    updateStaffStatus,
    requestShiftSwap,
    updateShiftSwapStatus
  } = useHospitalData();

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'swaps'>('roster');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [swapStatusFilter, setSwapStatusFilter] = useState<string>('all');

  // Modals
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState<boolean>(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [selectedStaffForSwap, setSelectedStaffForSwap] = useState<StaffMember | null>(null);
  const [reviewingSwapId, setReviewingSwapId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');

  // Add Staff Form State
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<StaffRole>('Staff Physician');
  const [department, setDepartment] = useState<string>('Emergency Trauma & Critical Care');
  const [specialty, setSpecialty] = useState<string>('Emergency Medicine');
  const [shift, setShift] = useState<StaffShift>('Day Shift (08:00 - 16:00)');
  const [status, setStatus] = useState<StaffStatus>('on_duty');
  const [phone, setPhone] = useState<string>('+232 76 ');
  const [email, setEmail] = useState<string>('@morningstarhospital.sl');
  const [licenseNumber, setLicenseNumber] = useState<string>('SL-MDC-2026-');
  const [currentStation, setCurrentStation] = useState<string>('Emergency Trauma Triage');

  // Shift Swap Form State
  const [swapRequestorStaffId, setSwapRequestorStaffId] = useState<string>('');
  const [swapTargetStaffId, setSwapTargetStaffId] = useState<string>('');
  const [swapDate, setSwapDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [swapUrgency, setSwapUrgency] = useState<ShiftSwapUrgency>('routine');
  const [swapReason, setSwapReason] = useState<string>('');

  const onDutyCount = staffMembers.filter((s) => s.status === 'on_duty').length;
  const onCallCount = staffMembers.filter((s) => s.status === 'on_call').length;
  const doctorsCount = staffMembers.filter(
    (s) => s.role.includes('Physician') || s.role.includes('Officer') || s.role.includes('Surgeon')
  ).length;
  const pendingSwapsCount = shiftSwaps.filter((s) => s.status === 'pending').length;

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || staff.department.includes(selectedDepartment);
    const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredSwaps = shiftSwaps.filter((swap) => {
    const matchesStatus = swapStatusFilter === 'all' || swap.status === swapStatusFilter;
    const matchesSearch =
      swap.requestorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      swap.targetStaffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      swap.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      swap.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const staffId = `MSH-STF-${Math.floor(100 + Math.random() * 900)}`;

    await addStaffMember({
      staffId,
      fullName: fullName.trim(),
      role,
      department: department.trim(),
      specialty: specialty.trim(),
      shift,
      status,
      phone: phone.trim(),
      email: email.trim(),
      licenseNumber: licenseNumber.trim(),
      currentStation: currentStation.trim()
    });

    setFullName('');
    setIsAddStaffModalOpen(false);
  };

  const handleOpenSwapModal = (staff?: StaffMember) => {
    if (staff) {
      setSelectedStaffForSwap(staff);
      setSwapRequestorStaffId(staff.staffId);
      // Choose default different target staff
      const other = staffMembers.find((s) => s.staffId !== staff.staffId);
      if (other) setSwapTargetStaffId(other.staffId);
    } else {
      if (staffMembers.length > 0) {
        setSwapRequestorStaffId(staffMembers[0].staffId);
        if (staffMembers.length > 1) {
          setSwapTargetStaffId(staffMembers[1].staffId);
        }
      }
    }
    setSwapReason('');
    setSwapUrgency('routine');
    setIsSwapModalOpen(true);
  };

  const handleSubmitShiftSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapRequestorStaffId || !swapTargetStaffId || swapRequestorStaffId === swapTargetStaffId) {
      alert('Please select two distinct clinicians for shift swapping.');
      return;
    }

    const requestor = staffMembers.find((s) => s.staffId === swapRequestorStaffId);
    const target = staffMembers.find((s) => s.staffId === swapTargetStaffId);

    if (!requestor || !target) {
      alert('Selected staff records not found.');
      return;
    }

    await requestShiftSwap({
      requestorStaffId: requestor.staffId,
      requestorName: requestor.fullName,
      requestorRole: requestor.role,
      requestorCurrentShift: requestor.shift,
      targetStaffId: target.staffId,
      targetStaffName: target.fullName,
      targetCurrentShift: target.shift,
      targetRole: target.role,
      shiftDate: swapDate,
      reason: swapReason.trim() || 'Colleague cross-shift coverage arrangement.',
      urgency: swapUrgency
    });

    setIsSwapModalOpen(false);
    setActiveSubTab('swaps');
  };

  const handleApproveSwap = async (swapId: string) => {
    await updateShiftSwapStatus(swapId, 'approved', 'Dr. Aminata Conteh (CMO)', reviewNotes || 'Shift swap officially validated and updated on roster.');
    setReviewingSwapId(null);
    setReviewNotes('');
  };

  const handleRejectSwap = async (swapId: string) => {
    await updateShiftSwapStatus(swapId, 'rejected', 'Dr. Aminata Conteh (CMO)', reviewNotes || 'Shift swap request declined due to minimum departmental coverage requirements.');
    setReviewingSwapId(null);
    setReviewNotes('');
  };

  const getStatusBadge = (st: StaffStatus) => {
    switch (st) {
      case 'on_duty':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> On Active Duty
          </span>
        );
      case 'on_call':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> 24h On-Call
          </span>
        );
      case 'break':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Clinical Rest Break
          </span>
        );
      case 'off_duty':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Off Shift
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {st}
          </span>
        );
    }
  };

  const getSwapStatusBadge = (st: ShiftSwapStatus) => {
    switch (st) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Shift Exchanged & Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Staff & Shift Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Clinicians On Active Duty</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {onDutyCount} <span className="text-xs font-medium text-slate-500">Staff Active</span>
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3" /> All clinical stations fully manned
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Specialists On-Call</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {onCallCount} <span className="text-xs font-medium text-slate-500">Emergency Call</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Under 15-min trauma response radius</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Shift Swap Requests</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {pendingSwapsCount} <span className="text-xs font-medium text-slate-500">Pending Review</span>
          </p>
          <p className="text-xs text-indigo-600 font-medium mt-1">
            {shiftSwaps.filter((s) => s.status === 'approved').length} completed exchanges
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Medical Cadre</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {staffMembers.length} <span className="text-xs font-medium text-slate-500">Cadre</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{doctorsCount} Doctors & Surgeons</p>
        </div>
      </div>

      {/* Sub-tab Switcher: Clinician Roster vs Shift Swap Workflow */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            id="staff-tab-roster"
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'roster'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clinicians Roster & Stations ({staffMembers.length})</span>
          </button>

          <button
            id="staff-tab-swaps"
            onClick={() => setActiveSubTab('swaps')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'swaps'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Shift-Swapping Workflow</span>
            {pendingSwapsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingSwapsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'roster' ? (
            <button
              id="add-staff-btn"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          ) : (
            <button
              id="request-swap-btn"
              onClick={() => handleOpenSwapModal()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Request Shift Swap</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ROSTER VIEW */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search staff name, specialty, department or license..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Duty Statuses</option>
                <option value="on_duty">On Active Duty</option>
                <option value="on_call">On-Call</option>
                <option value="break">Clinical Break</option>
                <option value="off_duty">Off Duty</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenSwapModal()}
              className="flex items-center justify-center gap-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Shift Swap Request</span>
            </button>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{staff.staffId}</span>
                    {getStatusBadge(staff.status)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{staff.fullName}</h3>
                  <p className="text-xs font-semibold text-indigo-600">{staff.role}</p>
                  <p className="text-[11px] text-slate-500">{staff.specialty}</p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{staff.currentStation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{staff.shift}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Award className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-[10px] text-slate-500 truncate">{staff.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Status Control & Shift Swap Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <select
                    value={staff.status}
                    onChange={(e) => updateStaffStatus(staff.id, e.target.value as StaffStatus)}
                    className="text-[11px] font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="on_duty">On Duty</option>
                    <option value="on_call">On-Call</option>
                    <option value="break">Break</option>
                    <option value="off_duty">Off Duty</option>
                  </select>

                  <button
                    onClick={() => handleOpenSwapModal(staff)}
                    title="Request Shift Swap for this staff"
                    className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200/60"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap Shift</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SHIFT-SWAPPING WORKFLOW BOARD */}
      {activeSubTab === 'swaps' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search shift swaps by clinician name, request ID, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={swapStatusFilter}
                onChange={(e) => setSwapStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Swap Requests</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved & Completed</option>
                <option value="rejected">Declined</option>
              </select>
            </div>

            <button
              id="new-swap-request-btn"
              onClick={() => handleOpenSwapModal()}
              className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Shift Swap Request</span>
            </button>
          </div>

          {/* Shift Swapping List */}
          <div className="space-y-3">
            {filteredSwaps.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs">
                <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Shift Swap Requests Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  There are no shift exchange requests matching the selected filter.
                </p>
                <button
                  onClick={() => handleOpenSwapModal()}
                  className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Request a Shift Swap
                </button>
              </div>
            ) : (
              filteredSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{swap.requestId}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              swap.urgency === 'emergency_cover'
                                ? 'bg-red-100 text-red-700'
                                : swap.urgency === 'urgent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {swap.urgency.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Submitted on {swap.createdAt} • Target Date: <span className="font-semibold text-slate-700">{swap.shiftDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getSwapStatusBadge(swap.status)}
                    </div>
                  </div>

                  {/* Clinicians Exchange Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {/* Requestor */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Requesting Clinician
                      </div>
                      <div className="text-xs font-bold text-slate-900">{swap.requestorName}</div>
                      <div className="text-[11px] text-indigo-600 font-semibold">{swap.requestorRole}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Current Shift: <strong className="text-slate-800">{swap.requestorCurrentShift}</strong></span>
                      </div>
                    </div>

                    {/* Target Colleague */}
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200/60 pt-2 md:pt-0 md:pl-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Exchange Partner
                      </div>
                      <div className="text-xs font-bold text-slate-900">{swap.targetStaffName}</div>
                      <div className="text-[11px] text-indigo-600 font-semibold">{swap.targetRole || 'Clinical Colleague'}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Exchange With: <strong className="text-slate-800">{swap.targetCurrentShift}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Reason & Notes */}
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900 mb-0.5">Clinical Justification / Reason:</p>
                    <p className="text-slate-600 leading-relaxed">{swap.reason}</p>
                    {swap.reviewerNotes && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <strong className="text-slate-700">Supervisor Review ({swap.reviewedBy}):</strong> {swap.reviewerNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {swap.status === 'pending' && (
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500 italic">
                        Approving will immediately swap their assigned shifts in the live hospital roster.
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleRejectSwap(swap.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleApproveSwap(swap.id)}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Exchange Shifts</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER STAFF MODAL */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Register Clinical & Support Staff
                  </h3>
                  <p className="text-xs text-slate-500">Board certification and shift assignment</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Legal Name & Credentials *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Samuel Kamara, MD, FWACS"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Role / Position *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Chief Medical Officer">Chief Medical Officer</option>
                    <option value="Consultant Physician">Consultant Physician</option>
                    <option value="Staff Physician">Staff Physician</option>
                    <option value="General Medical Officer">General Medical Officer</option>
                    <option value="Emergency Surgeon">Emergency Surgeon</option>
                    <option value="Lead Triage Nurse">Lead Triage Nurse</option>
                    <option value="Registered Nurse">Registered Nurse</option>
                    <option value="ICU Charge Nurse">ICU Charge Nurse</option>
                    <option value="Chief Pharmacist">Chief Pharmacist</option>
                    <option value="Clinical Pharmacist">Clinical Pharmacist</option>
                    <option value="Lead Lab Scientist">Lead Lab Scientist</option>
                    <option value="Biomedical Engineer">Biomedical Engineer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Clinical Specialty *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Orthopedic Trauma & Resuscitation"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surgery & Intensive Care"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    License / Council Reg No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SL-MDC-2026-990"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Assigned Shift *
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as StaffShift)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Day Shift (08:00 - 16:00)">Day Shift (08:00 - 16:00)</option>
                    <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                    <option value="Night Shift (00:00 - 08:00)">Night Shift (00:00 - 08:00)</option>
                    <option value="24h On-Call Emergency">24h On-Call Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Current Assigned Station *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emergency Theatre 2"
                    value={currentStation}
                    onChange={(e) => setCurrentStation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Emergency Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Add to Hospital Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST SHIFT SWAP MODAL */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Request Shift Swap (Nurses & Doctors)
                  </h3>
                  <p className="text-xs text-slate-500">Cross-coverage request with shift exchange</p>
                </div>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitShiftSwap} className="space-y-4">
              {/* Requestor Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Requesting Doctor / Nurse *
                </label>
                <select
                  required
                  value={swapRequestorStaffId}
                  onChange={(e) => setSwapRequestorStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="">Select Requesting Staff Member</option>
                  {staffMembers.map((s) => (
                    <option key={s.staffId} value={s.staffId}>
                      {s.fullName} ({s.role}) — {s.shift}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Colleague Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Exchange Colleague (Target Staff) *
                </label>
                <select
                  required
                  value={swapTargetStaffId}
                  onChange={(e) => setSwapTargetStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="">Select Colleague to Swap With</option>
                  {staffMembers
                    .filter((s) => s.staffId !== swapRequestorStaffId)
                    .map((s) => (
                      <option key={s.staffId} value={s.staffId}>
                        {s.fullName} ({s.role}) — {s.shift}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Date of Shift Exchange *
                  </label>
                  <input
                    type="date"
                    required
                    value={swapDate}
                    onChange={(e) => setSwapDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={swapUrgency}
                    onChange={(e) => setSwapUrgency(e.target.value as ShiftSwapUrgency)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="routine">Routine Exchange</option>
                    <option value="urgent">Urgent Coverage</option>
                    <option value="emergency_cover">Emergency / STAT Coverage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason & Clinical Context *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. CME workshop attendance, emergency surgery on-call cover, personal illness..."
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-indigo-700">
                  <Shield className="w-3.5 h-3.5" /> Departmental Compliance
                </div>
                <p>
                  Shift swaps maintain equal clinical competence across Emergency Trauma, Triage, and Wards. Upon supervisor approval, roster shifts will update automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

