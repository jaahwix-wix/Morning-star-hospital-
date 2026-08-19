import React, { useState } from 'react';
import {
  AlertTriangle,
  Heart,
  Activity,
  Plus,
  Clock,
  User,
  CheckCircle2,
  BedDouble,
  Stethoscope,
  PhoneCall,
  Search,
  Filter,
  Thermometer,
  Wind
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { TriagePriority, TriageEntry } from '../types';

interface TriageBoardProps {
  onOpenNewTriageModal: () => void;
  onOpenEmergencyModal: () => void;
}

export const TriageEmergencyBoard: React.FC<TriageBoardProps> = ({
  onOpenNewTriageModal,
  onOpenEmergencyModal
}) => {
  const { triageQueue, updateTriageStatus, hospitalBeds, updateBedStatus } = useHospitalData();
  const { userProfile } = useAuth();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<TriageEntry | null>(null);
  const [assignBedModalOpen, setAssignBedModalOpen] = useState<boolean>(false);
  const [selectedBedId, setSelectedBedId] = useState<string>('');

  const priorityConfigs: Record<
    TriagePriority,
    { label: string; bg: string; text: string; border: string; maxWait: string; badge: string }
  > = {
    P1_Immediate: {
      label: 'P1 - Immediate / Resuscitation',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300',
      maxWait: '0 mins (Immediate STAT)',
      badge: 'bg-red-600 text-white'
    },
    P2_Urgent: {
      label: 'P2 - Very Urgent',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      maxWait: '< 10 mins',
      badge: 'bg-orange-500 text-white'
    },
    P3_Delayed: {
      label: 'P3 - Urgent / Delayed',
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      maxWait: '< 60 mins',
      badge: 'bg-yellow-500 text-slate-900'
    },
    P4_Minor: {
      label: 'P4 - Standard / Minor',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      maxWait: '< 120 mins',
      badge: 'bg-emerald-600 text-white'
    }
  };

  const filteredQueue = triageQueue.filter((t) => {
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const availableBeds = hospitalBeds.filter((b) => !b.isOccupied);

  const handleBedAssignment = async () => {
    if (!selectedEntry || !selectedBedId) return;
    const bed = hospitalBeds.find((b) => b.id === selectedBedId);
    if (!bed) return;

    await updateTriageStatus(selectedEntry.id, 'transferred_ward', `${bed.ward} - ${bed.bedNumber}`);
    await updateBedStatus(bed.id, true, selectedEntry.id, selectedEntry.patientName, 'observation');
    setAssignBedModalOpen(false);
    setSelectedEntry(null);
  };

  return (
    <div id="triage-board-container" className="space-y-6">
      {/* 24/7 Emergency Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              24/7 Emergency & Clinical Triage Queue
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
              Manchester MTS Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time vital scoring, priority triage dispatch, and emergency room telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="triage-call-hotline"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Emergency Dispatch</span>
          </button>
          <button
            id="triage-new-patient-btn"
            onClick={onOpenNewTriageModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Intake Emergency Patient</span>
          </button>
        </div>
      </div>

      {/* Priority Level Reference Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(priorityConfigs) as TriagePriority[]).map((p) => {
          const config = priorityConfigs[p];
          const count = triageQueue.filter((t) => t.priority === p && t.status !== 'discharged').length;
          const isSelected = filterPriority === p;
          return (
            <div
              key={p}
              onClick={() => setFilterPriority(filterPriority === p ? 'all' : p)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-xs'
                  : 'border-slate-200/80 bg-white shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.badge}`}>
                  {p.replace('_', ' ')}
                </span>
                <span className="text-2xl font-bold text-slate-900">{count}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2">{config.label.split(' - ')[1]}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Target: {config.maxWait}</p>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="triage-search-input"
            type="text"
            placeholder="Search patient name or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="triage-priority-filter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">All Priorities ({triageQueue.length})</option>
            <option value="P1_Immediate">P1 Immediate (Red)</option>
            <option value="P2_Urgent">P2 Very Urgent (Orange)</option>
            <option value="P3_Delayed">P3 Urgent (Yellow)</option>
            <option value="P4_Minor">P4 Minor (Green)</option>
          </select>
        </div>
      </div>

      {/* Triage Patient Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQueue.map((entry) => {
          const config = priorityConfigs[entry.priority];
          const isCritical = entry.priority === 'P1_Immediate' || (entry.spo2 && entry.spo2 < 90);

          return (
            <div
              key={entry.id}
              id={`triage-card-${entry.id}`}
              className={`rounded-2xl border p-5 shadow-xs hover:shadow-sm transition-all relative ${
                isCritical ? 'bg-red-50/40 border-red-200' : 'bg-white border-slate-200/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{entry.patientName}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({entry.age}y, {entry.gender})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Arrived: {entry.arrivedAt}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.badge}`}>
                  {entry.priority.replace('_', ' ')}
                </span>
              </div>

              {/* Chief Complaint */}
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Chief Complaint
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">
                  {entry.chiefComplaint}
                </p>
              </div>

              {/* Vitals Grid */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-2 rounded-lg border ${
                    entry.spo2 && entry.spo2 < 92
                      ? 'bg-red-100 text-red-700 border-red-300 font-bold animate-pulse'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block font-semibold">SpO2</span>
                  <span className="font-mono font-bold text-xs">{entry.spo2 ? `${entry.spo2}%` : '--'}</span>
                </div>

                <div
                  className={`p-2 rounded-lg border ${
                    entry.heartRate && (entry.heartRate > 105 || entry.heartRate < 50)
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block font-semibold">Heart Rate</span>
                  <span className="font-mono font-bold text-xs">
                    {entry.heartRate ? `${entry.heartRate} bpm` : '--'}
                  </span>
                </div>

                <div
                  className={`p-2 rounded-lg border ${
                    entry.temperature && entry.temperature > 38.5
                      ? 'bg-orange-100 text-orange-800 border-orange-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block font-semibold">Temp</span>
                  <span className="font-mono font-bold text-xs">
                    {entry.temperature ? `${entry.temperature}°C` : '--'}
                  </span>
                </div>
              </div>

              {/* Secondary Vitals */}
              {(entry.systolicBP || entry.respiratoryRate) && (
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  {entry.systolicBP && (
                    <span>
                      BP: <strong>{entry.systolicBP}/{entry.diastolicBP}</strong>
                    </span>
                  )}
                  {entry.respiratoryRate && (
                    <span>
                      Resp: <strong>{entry.respiratoryRate}/min</strong>
                    </span>
                  )}
                  {entry.painScale && (
                    <span>
                      Pain: <strong>{entry.painScale}/10</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Assigned Status & Bed info */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Attending Care</span>
                  <span className="font-semibold text-slate-800">
                    {entry.bedAssigned || entry.nurseInCharge || 'Triage Intake'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {entry.status === 'waiting' && (
                    <button
                      id={`attend-btn-${entry.id}`}
                      onClick={() => updateTriageStatus(entry.id, 'attending')}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all"
                    >
                      Attend
                    </button>
                  )}

                  {entry.status === 'attending' && (
                    <button
                      id={`transfer-bed-btn-${entry.id}`}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setAssignBedModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1"
                    >
                      <BedDouble className="w-3 h-3" />
                      <span>Transfer Bed</span>
                    </button>
                  )}

                  {entry.status === 'transferred_ward' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                      In Ward
                    </span>
                  )}

                  {entry.status !== 'discharged' && (
                    <button
                      id={`discharge-btn-${entry.id}`}
                      onClick={() => updateTriageStatus(entry.id, 'discharged')}
                      className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-500 font-medium text-xs transition-colors"
                      title="Discharge from emergency queue"
                    >
                      Discharge
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Assignment Modal */}
      {assignBedModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Assign Inpatient Bed</h3>
              </div>
              <button
                onClick={() => setAssignBedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transfer <strong>{selectedEntry.patientName}</strong> ({selectedEntry.priority.replace('_', ' ')}) to an available inpatient ward bed.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Available Ward Bed</label>
              <select
                id="select-bed-dropdown"
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Bed --</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.ward} - Bed {b.bedNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssignBedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="confirm-bed-assign-btn"
                disabled={!selectedBedId}
                onClick={handleBedAssignment}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-xs"
              >
                Confirm Bed Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
