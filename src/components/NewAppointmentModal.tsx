import React, { useState } from 'react';
import { Calendar, Stethoscope } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DoctorSpecialty } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addAppointment, patients } = useHospitalData();
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('Dr. Alusine Koroma');
  const [specialty, setSpecialty] = useState<DoctorSpecialty>('General Medicine');
  const [appointmentDate, setAppointmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePatientSelect = (pId: string) => {
    setPatientId(pId);
    const pat = patients.find((p) => p.id === pId);
    if (pat) setPatientName(pat.fullName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addAppointment({
        patientId: patientId || undefined,
        patientName: patientName || 'Consultation Patient',
        doctorName,
        specialty,
        appointmentDate,
        appointmentTime,
        status: 'scheduled',
        reason
      });
      onClose();
    } catch (err) {
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Book Doctor Consultation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Registered Patient</label>
            <select
              value={patientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
            >
              <option value="">-- Or enter name below --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Mariama Bangura"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinic Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as DoctorSpecialty)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Emergency & Trauma Surgery">Emergency & Trauma Surgery</option>
                <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                <option value="Clinical Pathology & Laboratory">Clinical Pathology</option>
                <option value="Internal Medicine & Cardiology">Internal Medicine</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Doctor on Duty</label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="Dr. Alusine Koroma">Dr. Alusine Koroma</option>
                <option value="Dr. Mariatu Turay">Dr. Mariatu Turay</option>
                <option value="Dr. J. Bangura">Dr. J. Bangura</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Slot (24/7)</label>
              <input
                type="text"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                placeholder="e.g. 02:30 PM / 09:00 PM"
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Reason for Visit / Symptoms *</label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Antenatal follow-up, persistent cough, blood pressure check..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
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
              disabled={loading || !patientName}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Scheduling...' : 'Confirm Consultation Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
