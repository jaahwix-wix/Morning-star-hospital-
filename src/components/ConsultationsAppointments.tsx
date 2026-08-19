import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  Video
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { Appointment, DoctorSpecialty } from '../types';

interface ConsultationsProps {
  onOpenNewAppointmentModal: () => void;
}

export const ConsultationsAppointments: React.FC<ConsultationsProps> = ({
  onOpenNewAppointmentModal
}) => {
  const { appointments, updateAppointmentStatus } = useHospitalData();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const specialties: DoctorSpecialty[] = [
    'General Medicine',
    'Emergency & Trauma Surgery',
    'Pediatrics & Child Health',
    'Obstetrics & Gynecology',
    'Clinical Pathology & Laboratory',
    'Internal Medicine & Cardiology'
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSpec = selectedSpecialty === 'all' || apt.specialty === selectedSpecialty;
    const matchesStat = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesStat && matchesSearch;
  });

  return (
    <div id="consultations-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              Clinical Consultations & Specialist Roster
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              24/7 Specialist Clinics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Round-the-clock doctor appointments with specialist physicians, emergency surgeons, pediatricians, and gynecologists.
          </p>
        </div>

        <button
          id="book-consultation-btn"
          onClick={onOpenNewAppointmentModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedSpecialty('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selectedSpecialty === 'all'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          All Clinics ({appointments.length})
        </button>
        {specialties.map((spec) => {
          const count = appointments.filter((a) => a.specialty === spec).length;
          const isSelected = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{spec}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="consultation-search-input"
            type="text"
            placeholder="Search patient, doctor, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="appointment-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAppointments.map((apt) => {
          return (
            <div
              key={apt.id}
              id={`apt-card-${apt.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {apt.specialty}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                      {apt.patientName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                      apt.status === 'completed'
                        ? 'bg-slate-100 text-slate-700'
                        : apt.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.appointmentTime}</span>
                  </div>
                </div>

                {/* Reason & Physician */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-700">
                    <strong>Chief Complaint:</strong> {apt.reason}
                  </p>
                  <p className="text-slate-500">
                    Attending: <strong className="text-slate-800">{apt.doctorName}</strong>
                  </p>
                  {apt.notes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                      <strong>Doctor Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {apt.status === 'scheduled' && (
                  <button
                    id={`start-consultation-${apt.id}`}
                    onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all"
                  >
                    Start Consultation
                  </button>
                )}

                {apt.status === 'in_progress' && (
                  <button
                    id={`complete-consultation-${apt.id}`}
                    onClick={() => updateAppointmentStatus(apt.id, 'completed', 'Completed with prescriptions dispatched.')}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all"
                  >
                    Conclude & Sign Off
                  </button>
                )}

                {apt.status === 'completed' && (
                  <span className="text-[11px] text-slate-400 font-medium">Encounter Finished</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
