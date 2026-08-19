import React, { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  AlertCircle,
  Heart,
  Activity,
  Calendar,
  FileText,
  BedDouble,
  Stethoscope,
  ChevronRight,
  Shield,
  Clock,
  Download,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { Patient, PatientStatus, Gender } from '../types';

interface PatientManagementProps {
  onOpenNewPatientModal: () => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  onOpenNewPatientModal
}) => {
  const { patients, addPatientVital, updatePatient } = useHospitalData();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New Vital Reading Modal State
  const [vitalsModalOpen, setVitalsModalOpen] = useState<boolean>(false);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);

  // CSV Export Feedback State
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const filteredPatients = patients.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Helper function to safely escape CSV cell content according to RFC 4180
  const escapeCsvCell = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    // If string contains comma, double quote, newline, or carriage return, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const exportPatientsToCsv = (exportScope: 'filtered' | 'all') => {
    const dataToExport = exportScope === 'filtered' ? filteredPatients : patients;

    if (dataToExport.length === 0) {
      alert('No patient records found to export.');
      return;
    }

    const headers = [
      'Patient ID',
      'Full Name',
      'Age',
      'Gender',
      'Blood Group',
      'Clinical Status',
      'Ward / Location',
      'Bed Number',
      'Assigned Doctor',
      'Phone Number',
      'Emergency Contact',
      'Emergency Phone',
      'Residential Address',
      'Primary Diagnosis',
      'Known Allergies',
      'Chronic Conditions',
      'Admission Date',
      'Discharge Date',
      'Latest BP (mmHg)',
      'Latest Heart Rate (bpm)',
      'Latest SpO2 (%)',
      'Latest Temperature (°C)',
      'Latest Resp Rate (/min)',
      'Latest Vital Check Timestamp',
      'Latest Vital Check Recorded By',
      'Clinical Notes',
      'Registered By',
      'Registration Date'
    ];

    const rows = dataToExport.map((p) => {
      const latestVital = p.vitals && p.vitals.length > 0 ? p.vitals[p.vitals.length - 1] : null;
      return [
        escapeCsvCell(p.patientId),
        escapeCsvCell(p.fullName),
        escapeCsvCell(p.age),
        escapeCsvCell(p.gender),
        escapeCsvCell(p.bloodGroup),
        escapeCsvCell(p.status),
        escapeCsvCell(p.wardNumber || 'Outpatient'),
        escapeCsvCell(p.bedNumber || 'N/A'),
        escapeCsvCell(p.assignedDoctor),
        escapeCsvCell(p.phone),
        escapeCsvCell(p.emergencyContact),
        escapeCsvCell(p.emergencyPhone || 'N/A'),
        escapeCsvCell(p.address),
        escapeCsvCell(p.diagnosis || 'General Evaluation'),
        escapeCsvCell(p.allergies || 'None recorded (NKDA)'),
        escapeCsvCell(p.chronicConditions || 'None recorded'),
        escapeCsvCell(p.admissionDate || 'N/A'),
        escapeCsvCell(p.dischargeDate || 'N/A'),
        escapeCsvCell(latestVital ? `${latestVital.systolicBP}/${latestVital.diastolicBP}` : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.heartRate : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.spo2 : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.temperature : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.respiratoryRate : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.timestamp : 'N/A'),
        escapeCsvCell(latestVital ? latestVital.recordedBy : 'N/A'),
        escapeCsvCell(p.notes || ''),
        escapeCsvCell(p.registeredBy || 'Clinical Staff'),
        escapeCsvCell(p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0])
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for proper Excel UTF-8 character encoding support
    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    const timestamp = new Date().toISOString().slice(0, 10);
    const scopeLabel = exportScope === 'filtered' && (searchQuery || statusFilter !== 'all') ? 'filtered' : 'registry';
    downloadLink.href = url;
    downloadLink.setAttribute('download', `morning_star_patients_${scopeLabel}_${timestamp}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    setExportModalOpen(false);
    setExportSuccessMessage(
      `Successfully exported ${dataToExport.length} patient record${dataToExport.length === 1 ? '' : 's'} to CSV!`
    );
    setTimeout(() => {
      setExportSuccessMessage(null);
    }, 4000);
  };

  const handleRecordVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    await addPatientVital(selectedPatient.id, {
      systolicBP: Number(systolic),
      diastolicBP: Number(diastolic),
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
      respiratoryRate: Number(respiratoryRate),
      recordedBy: userProfile?.name || 'Nurse Fatmata Sesay'
    });

    // Update selected patient view
    const updated = patients.find((p) => p.id === selectedPatient.id);
    if (updated) setSelectedPatient(updated);

    setVitalsModalOpen(false);
  };

  const handleStatusChange = async (newStatus: PatientStatus) => {
    if (!selectedPatient) return;
    await updatePatient(selectedPatient.id, { status: newStatus });
    setSelectedPatient({ ...selectedPatient, status: newStatus });
  };

  return (
    <div id="patient-management-container" className="space-y-6">
      {/* Export Success Alert */}
      {exportSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              Patient Registry & Electronic Medical Records (EMR)
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              HIPAA / Clinical EMR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized patient charts, live vital signs monitoring, admissions registry, and diagnostic summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export CSV Button */}
          <button
            id="export-patients-csv-btn"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
            title="Export patient records to CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Register New Patient */}
          <button
            id="register-new-patient-btn"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Filters & Search & Export Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="patient-search-input"
            type="text"
            placeholder="Search patient name, ID (#MSH-), diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="patient-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">All Statuses ({patients.length})</option>
            <option value="admitted">Admitted Inpatients</option>
            <option value="emergency">Emergency Care</option>
            <option value="outpatient">Outpatient</option>
            <option value="discharged">Discharged</option>
          </select>

          {/* Quick Filtered Export Action */}
          <button
            id="quick-csv-export-btn"
            onClick={() => exportPatientsToCsv('filtered')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            title={`Export current ${filteredPatients.length} shown patients to CSV`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export View ({filteredPatients.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Patients List & Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patients Directory ({filteredPatients.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  id={`patient-item-${p.id}`}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50/60 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.fullName}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.bloodGroup}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{p.patientId}</p>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-medium">
                        {p.diagnosis || 'General Evaluation'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                        p.status === 'admitted'
                          ? 'bg-teal-100 text-teal-800'
                          : p.status === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : p.status === 'outpatient'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{p.wardNumber ? `${p.wardNumber} - ${p.bedNumber || ''}` : 'Outpatient'}</span>
                    <span>{p.age} yrs • {p.gender}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Patient Medical Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-y-auto h-[700px]">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 font-sans">
                      {selectedPatient.fullName}
                    </h2>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {selectedPatient.patientId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                    <span>Age: <strong>{selectedPatient.age} yrs</strong></span>
                    <span>Gender: <strong className="capitalize">{selectedPatient.gender}</strong></span>
                    <span>Blood Group: <strong className="text-red-600 font-mono font-bold">{selectedPatient.bloodGroup}</strong></span>
                    <span>Doctor: <strong>{selectedPatient.assignedDoctor}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id="patient-status-changer"
                    value={selectedPatient.status}
                    onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
                    className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="admitted">Admitted</option>
                    <option value="emergency">Emergency Care</option>
                    <option value="outpatient">Outpatient</option>
                    <option value="discharged">Discharged</option>
                  </select>

                  <button
                    id="record-vital-btn"
                    onClick={() => setVitalsModalOpen(true)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Log Vitals</span>
                  </button>
                </div>
              </div>

              {/* Patient Core Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Location
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedPatient.wardNumber ? `${selectedPatient.wardNumber} (${selectedPatient.bedNumber})` : 'Outpatient Clinic'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Allergies & Cautions
                  </span>
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {selectedPatient.allergies || 'No known drug allergies (NKDA)'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phone & Emergency Contact
                  </span>
                  <p className="text-xs font-medium text-slate-800 mt-1 truncate">
                    {selectedPatient.phone} • {selectedPatient.emergencyContact}
                  </p>
                </div>
              </div>

              {/* Primary Diagnosis & Clinical Notes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Primary Diagnosis & Treatment Summary</span>
                </h3>
                <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold text-indigo-950 text-sm">{selectedPatient.diagnosis || 'Clinical evaluation ongoing'}</p>
                  <p className="text-slate-700 leading-relaxed">{selectedPatient.notes || 'Patient under routine observation.'}</p>
                  {selectedPatient.chronicConditions && (
                    <p className="text-slate-600 pt-1 text-[11px]">
                      <strong>Chronic Conditions:</strong> {selectedPatient.chronicConditions}
                    </p>
                  )}
                </div>
              </div>

              {/* Vitals History Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Vital Signs History</span>
                  </h3>
                  <button
                    onClick={() => setVitalsModalOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Vital Check
                  </button>
                </div>

                {selectedPatient.vitals && selectedPatient.vitals.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                        <tr>
                          <th className="p-2.5">Time</th>
                          <th className="p-2.5">BP (mmHg)</th>
                          <th className="p-2.5">Heart Rate</th>
                          <th className="p-2.5">SpO2</th>
                          <th className="p-2.5">Temp (°C)</th>
                          <th className="p-2.5">Resp Rate</th>
                          <th className="p-2.5">Nurse</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedPatient.vitals.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/70">
                            <td className="p-2.5 text-slate-500">{v.timestamp}</td>
                            <td className="p-2.5 font-bold text-slate-900">{v.systolicBP}/{v.diastolicBP}</td>
                            <td className="p-2.5 font-bold text-slate-900">{v.heartRate} bpm</td>
                            <td className={`p-2.5 font-bold ${v.spo2 < 92 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {v.spo2}%
                            </td>
                            <td className={`p-2.5 font-bold ${v.temperature > 38 ? 'text-orange-600' : 'text-slate-900'}`}>
                              {v.temperature}°C
                            </td>
                            <td className="p-2.5 text-slate-700">{v.respiratoryRate}/min</td>
                            <td className="p-2.5 text-slate-500 font-sans text-[11px]">{v.recordedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
                    No vitals recorded yet. Click "Log Vitals" above to start tracking.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <User className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Patient Selected</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Select a patient from the directory on the left to review their complete EMR chart, vitals, and diagnostic history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Log Vitals Modal */}
      {vitalsModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Patient Vitals</h3>
              </div>
              <button
                onClick={() => setVitalsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordVital} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Respiratory Rate (/min)</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVitalsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  Save Vital Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Export Options Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-sans">
                    Export Patient Registry to CSV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generate administrative and clinical records spreadsheet (.csv)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Scope Selection Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Export Scope
              </span>

              {/* Option 1: Current Filtered View */}
              <div
                id="export-filtered-scope-card"
                onClick={() => exportPatientsToCsv('filtered')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">
                      Current Filtered View
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {filteredPatients.length} Patients
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Exports only the records currently visible based on active search criteria ({searchQuery ? `"${searchQuery}"` : 'None'}) and status filter ({statusFilter}).
                  </p>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
              </div>

              {/* Option 2: Full Patient Registry */}
              <div
                id="export-all-scope-card"
                onClick={() => exportPatientsToCsv('all')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-800">
                      Entire Hospital Registry
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {patients.length} Total Patients
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Exports complete historical and active patient charts, demographics, diagnosis, and latest vitals.
                  </p>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1" />
              </div>
            </div>

            {/* Columns Included Overview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block">Included Fields in CSV:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Patient ID, Full Name, Age, Gender, Blood Group, Clinical Status, Ward / Bed, Assigned Doctor, Phone, Emergency Contacts, Address, Diagnosis, Allergies, Chronic Conditions, Admission/Discharge Dates, Latest Vital Signs (BP, HR, SpO2, Temp, Resp Rate), and Timestamps.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => exportPatientsToCsv('filtered')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV ({filteredPatients.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
