import React, { useState } from 'react';
import {
  User,
  HeartPulse,
  Calendar,
  FlaskConical,
  PhoneCall,
  Activity,
  FileText,
  Clock,
  ShieldCheck,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';

interface PatientPortalProps {
  onOpenEmergencyModal: () => void;
  onOpenNewAppointmentModal: () => void;
}

export const PatientPortalView: React.FC<PatientPortalProps> = ({
  onOpenEmergencyModal,
  onOpenNewAppointmentModal
}) => {
  const { patients, appointments, labTests } = useHospitalData();
  const { userProfile } = useAuth();

  // Pick first patient or matching user name
  const patientData =
    patients.find((p) => p.fullName.toLowerCase().includes('samuel') || p.id === 'pat-001') ||
    patients[0];

  const myAppointments = appointments.filter(
    (a) => a.patientName.toLowerCase() === patientData?.fullName.toLowerCase() || a.patientId === patientData?.id
  );

  const myLabTests = labTests.filter(
    (l) => l.patientName.toLowerCase() === patientData?.fullName.toLowerCase() || l.patientId === patientData?.id
  );

  return (
    <div id="patient-portal-container" className="space-y-6">
      {/* Patient Welcome Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              Welcome, {patientData?.fullName || userProfile?.name}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Patient Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            "Your Health is our <strong className="text-indigo-600 uppercase">PRIORITY</strong>". Access your diagnostic reports, doctor visits, and 24/7 care support.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="portal-call-emergency"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>24/7 Emergency Line</span>
          </button>
          <button
            id="portal-book-appointment"
            onClick={onOpenNewAppointmentModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Book Doctor Visit</span>
          </button>
        </div>
      </div>

      {/* Patient Vital Stats & Chart Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hospital Identification
          </span>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            {patientData?.patientId || 'MSH-2026-0001'}
          </p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">
            Blood Group: {patientData?.bloodGroup || 'O+'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Attending Physician
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {patientData?.assignedDoctor || 'Dr. Alusine Koroma'}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Chief Medical Officer
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Care Location
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {patientData?.wardNumber ? `${patientData.wardNumber} (${patientData.bedNumber})` : 'Outpatient Follow-up'}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block capitalize">
            Status: {patientData?.status || 'Admitted'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Emergency Hotlines
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 mt-1">
            +232 73 929 145
          </p>
          <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
            +232 78 355 293
          </p>
        </div>
      </div>

      {/* Main Grid: My Lab Results & Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Results */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">My Laboratory Diagnostic Reports</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {myLabTests.length} tests on file
            </span>
          </div>

          <div className="space-y-3">
            {myLabTests.length > 0 ? (
              myLabTests.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    test.isAbnormal ? 'bg-red-50/40 border-red-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {test.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{test.testName}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                        test.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : test.status === 'critical_flag'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {test.status.replace('_', ' ')}
                    </span>
                  </div>

                  {test.resultValue && (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Result Value:</span>
                      <p className="font-bold font-mono text-slate-900">{test.resultValue}</p>
                      {test.normalRange && (
                        <p className="text-[10px] text-slate-500 mt-0.5">Reference: {test.normalRange}</p>
                      )}
                    </div>
                  )}

                  {test.interpretation && (
                    <p className="text-xs text-slate-600 italic">
                      <strong>Doctor/Scientist Note:</strong> {test.interpretation}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No diagnostic test records found.
              </div>
            )}
          </div>
        </div>

        {/* My Appointments & Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Scheduled Consultations & Visits</h3>
            </div>
            <button
              onClick={onOpenNewAppointmentModal}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Book Visit
            </button>
          </div>

          <div className="space-y-3">
            {myAppointments.length > 0 ? (
              myAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        {apt.specialty}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{apt.reason}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 capitalize">
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.appointmentDate}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.appointmentTime}</span>
                    </span>
                    <span className="text-slate-500">Dr: {apt.doctorName}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No consultations currently scheduled. Click "Book Doctor Visit" to schedule a consultation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
