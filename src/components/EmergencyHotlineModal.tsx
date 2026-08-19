import React, { useState } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  Ambulance,
  MapPin,
  Clock,
  Shield,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

interface EmergencyHotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHotlineModal: React.FC<EmergencyHotlineModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addTriageEntry } = useHospitalData();
  const [callerName, setCallerName] = useState<string>('');
  const [callerPhone, setCallerPhone] = useState<string>('');
  const [callerLocation, setCallerLocation] = useState<string>('');
  const [emergencyDetails, setEmergencyDetails] = useState<string>('');
  const [ambulanceDispatched, setAmbulanceDispatched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDispatchAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTriageEntry({
      patientName: callerName || 'Emergency Ambulance Call Patient',
      age: 35,
      gender: 'Other',
      priority: 'P1_Immediate',
      chiefComplaint: `AMBULANCE DISPATCH [Location: ${callerLocation || 'En route'}]: ${emergencyDetails || 'Acute emergency reported via hotline'}`,
      status: 'waiting',
      nurseInCharge: '24/7 Mobile Emergency Unit'
    });
    setAmbulanceDispatched(true);
    setTimeout(() => {
      setAmbulanceDispatched(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                24 HOURS SERVICE EVERYDAY
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Emergency Hotlines & Rapid Dispatch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* 2 Main Hotline Numbers (Inspired by Billboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:+23273929145"
            className="bg-red-950/70 hover:bg-red-900 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-red-300 block">Emergency Line 1</span>
              <span className="text-base font-black font-mono text-white tracking-wide">+232 73 929 145</span>
            </div>
          </a>

          <a
            href="tel:+23278355293"
            className="bg-red-950/70 hover:bg-red-900 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 transition-all group shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-red-300 block">Emergency Line 2</span>
              <span className="text-base font-black font-mono text-white tracking-wide">+232 78 355 293</span>
            </div>
          </a>
        </div>

        {/* Quick Ambulance Dispatch Intake */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-red-400" />
            <span>Instant Ambulance / Bedside Emergency Requisition</span>
          </div>

          {ambulanceDispatched ? (
            <div className="p-6 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
              <p className="font-bold text-sm text-emerald-200">AMBULANCE & RESUSCITATION TEAM DISPATCHED</p>
              <p className="text-xs text-slate-300">
                Morning Star emergency medical dispatchers and ICU triage desk have been notified. Keep phone line open.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDispatchAmbulance} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Patient / Caller Name *"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Phone Number *"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Pickup Location / Street Address / Town in Sierra Leone *"
                value={callerLocation}
                onChange={(e) => setCallerLocation(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />

              <textarea
                rows={2}
                placeholder="Describe emergency symptoms (e.g. Unconscious, Road accident, Difficulty breathing, Severe malaria convulsion)..."
                value={emergencyDetails}
                onChange={(e) => setEmergencyDetails(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Trigger STAT Red Emergency Dispatch</span>
              </button>
            </form>
          )}
        </div>

        <div className="text-[11px] text-slate-400 text-center">
          Morning Star Hospital Trauma Center • 24 Hours Service Everyday
        </div>
      </div>
    </div>
  );
};
