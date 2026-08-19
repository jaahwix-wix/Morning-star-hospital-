import React, { useState } from 'react';
import {
  BedDouble,
  Activity,
  UserCheck,
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  Heart,
  Wind,
  Shield,
  Clock
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { HospitalBed, WardType } from '../types';

export const WardBedManagement: React.FC = () => {
  const { hospitalBeds, updateBedStatus, stats, patients } = useHospitalData();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [patientIdToAssign, setPatientIdToAssign] = useState<string>('');
  const [bedCondition, setBedCondition] = useState<HospitalBed['condition']>('stable');

  const wards: WardType[] = [
    'Emergency Resuscitation Ward',
    'Intensive Care Unit (ICU)',
    'Maternity & Labor Ward',
    'Pediatric Ward',
    'Male Medical Ward',
    'Female Medical Ward'
  ];

  const filteredBeds = hospitalBeds.filter((bed) => {
    return selectedWard === 'all' || bed.ward === selectedWard;
  });

  const unassignedPatients = patients.filter((p) => p.status === 'admitted' || p.status === 'emergency');

  const handleOpenAssign = (bed: HospitalBed) => {
    setSelectedBed(bed);
    setPatientIdToAssign('');
    setBedCondition('stable');
    setAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedBed) return;
    const patient = patients.find((p) => p.id === patientIdToAssign);
    await updateBedStatus(
      selectedBed.id,
      true,
      patientIdToAssign,
      patient?.fullName || 'Assigned Inpatient',
      bedCondition
    );
    setAssignModalOpen(false);
  };

  const handleDischargeBed = async (bed: HospitalBed) => {
    await updateBedStatus(bed.id, false);
  };

  return (
    <div id="wards-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              Hospital Bed & Inpatient Ward Operations
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              6 Clinical Departments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual telemetry, ICU capacity, oxygen supply ports, and bedside admission monitoring.
          </p>
        </div>

        {/* Live Bed Count Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Available Beds</span>
            <span className="text-xl font-bold text-emerald-600">{stats.availableBeds}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Occupancy Rate</span>
            <span className="text-xl font-bold text-indigo-600">{stats.occupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedWard('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selectedWard === 'all'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          All Wards ({hospitalBeds.length} Beds)
        </button>
        {wards.map((ward) => {
          const total = hospitalBeds.filter((b) => b.ward === ward).length;
          const occ = hospitalBeds.filter((b) => b.ward === ward && b.isOccupied).length;
          const isSelected = selectedWard === ward;
          return (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{ward}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${occ === total ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                {occ}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredBeds.map((bed) => {
          const isOcc = bed.isOccupied;
          const isCritical = bed.condition === 'critical';

          return (
            <div
              key={bed.id}
              id={`bed-card-${bed.id}`}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-red-50/40 border-red-200'
                  : isOcc
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Bed Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {bed.bedNumber}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{bed.ward}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isOcc
                        ? isCritical
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-slate-800 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOcc ? (bed.condition ? bed.condition.toUpperCase() : 'OCCUPIED') : 'VACANT'}
                  </span>
                </div>

                {/* Patient / Bed Info */}
                {isOcc ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      <span>Admitted Patient</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">
                      {bed.patientName || 'Inpatient'}
                    </p>
                    {bed.admissionDate && (
                      <p className="text-[10px] text-slate-500">Since: {bed.admissionDate}</p>
                    )}
                  </div>
                ) : (
                  <div className="py-3.5 text-center text-xs text-emerald-700 font-medium bg-emerald-50/50 rounded-xl border border-emerald-100">
                    Bed Ready for Immediate Admission
                  </div>
                )}

                {/* Features: Oxygen & Telemetry */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  {bed.hasOxygen && (
                    <span className="flex items-center gap-1 text-indigo-600 font-medium" title="Piped Bedside Oxygen Available">
                      <Wind className="w-3.5 h-3.5" />
                      <span>O2 Port</span>
                    </span>
                  )}
                  {bed.hasMonitor && (
                    <span className="flex items-center gap-1 text-teal-600 font-medium" title="Continuous Cardiac Telemetry">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Telemetry</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {isOcc ? (
                  <button
                    id={`discharge-bed-${bed.id}`}
                    onClick={() => handleDischargeBed(bed)}
                    className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Discharge & Sanitize Bed
                  </button>
                ) : (
                  <button
                    id={`assign-bed-${bed.id}`}
                    onClick={() => handleOpenAssign(bed)}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    Assign Patient to Bed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Assignment Modal */}
      {assignModalOpen && selectedBed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Assign Bed {selectedBed.bedNumber}
                </h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Department: <strong>{selectedBed.ward}</strong>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Patient to Admit *
                </label>
                <select
                  id="assign-patient-select"
                  value={patientIdToAssign}
                  onChange={(e) => setPatientIdToAssign(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {unassignedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientId}) - {p.diagnosis || 'Inpatient'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinical Severity / Condition
                </label>
                <select
                  id="assign-condition-select"
                  value={bedCondition}
                  onChange={(e) => setBedCondition(e.target.value as HospitalBed['condition'])}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="stable">Stable / Recovering</option>
                  <option value="observation">Active Observation</option>
                  <option value="critical">Critical / Continuous Monitoring</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="confirm-admit-bed-btn"
                disabled={!patientIdToAssign}
                onClick={handleConfirmAssignment}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-xs"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
