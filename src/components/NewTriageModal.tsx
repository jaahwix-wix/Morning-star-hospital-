import React, { useState } from 'react';
import { AlertTriangle, Activity, HeartPulse } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { TriagePriority, Gender } from '../types';

interface NewTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTriageModal: React.FC<NewTriageModalProps> = ({ isOpen, onClose }) => {
  const { addTriageEntry } = useHospitalData();
  const [patientName, setPatientName] = useState<string>('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<Gender>('female');
  const [priority, setPriority] = useState<TriagePriority>('P2_Urgent');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [systolicBP, setSystolicBP] = useState<number>(125);
  const [diastolicBP, setDiastolicBP] = useState<number>(85);
  const [heartRate, setHeartRate] = useState<number>(88);
  const [spo2, setSpo2] = useState<number>(96);
  const [temperature, setTemperature] = useState<number>(38.2);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [painScale, setPainScale] = useState<number>(6);
  const [nurseInCharge, setNurseInCharge] = useState<string>('Nurse Fatmata Sesay');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Auto-calculate recommended triage level when vital changes
  const handleVitalsChange = (newSpo2: number, newHR: number, newTemp: number) => {
    if (newSpo2 < 90 || newHR > 130 || newTemp > 40.0) {
      setPriority('P1_Immediate');
    } else if (newSpo2 < 94 || newHR > 105 || newTemp > 38.8) {
      setPriority('P2_Urgent');
    } else {
      setPriority('P3_Delayed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addTriageEntry({
        patientName,
        age: Number(age),
        gender,
        priority,
        chiefComplaint,
        systolicBP: Number(systolicBP),
        diastolicBP: Number(diastolicBP),
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        respiratoryRate: Number(respiratoryRate),
        painScale: Number(painScale),
        status: 'waiting',
        nurseInCharge
      });
      onClose();
    } catch (err) {
      console.error('Error in triage entry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">24/7 Emergency Triage Intake</h3>
              <p className="text-[11px] text-slate-500">Manchester Triage & ESI Scoring</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Emergency Patient Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Foday Kamara"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Triage Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TriagePriority)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white font-bold"
              >
                <option value="P1_Immediate">P1 - Immediate (Red)</option>
                <option value="P2_Urgent">P2 - Very Urgent (Orange)</option>
                <option value="P3_Delayed">P3 - Urgent (Yellow)</option>
                <option value="P4_Minor">P4 - Minor (Green)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Chief Complaint & Symptoms *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Acute chest discomfort with shortness of breath and diaphoresis..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Vitals Grid */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Emergency Bedside Vital Signs
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSpo2(val);
                    handleVitalsChange(val, heartRate, temperature);
                  }}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeartRate(val);
                    handleVitalsChange(spo2, val, temperature);
                  }}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTemperature(val);
                    handleVitalsChange(spo2, heartRate, val);
                  }}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[11px] text-slate-600 block">BP (Systolic)</label>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">BP (Diastolic)</label>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block">Pain (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={painScale}
                  onChange={(e) => setPainScale(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-slate-800 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50 shadow-md"
            >
              {loading ? 'Queuing Patient...' : 'Dispatch to Emergency Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
