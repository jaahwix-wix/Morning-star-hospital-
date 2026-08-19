import React, { useState } from 'react';
import { User, Plus, Shield, Activity } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { BloodGroup, Gender, PatientStatus } from '../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose }) => {
  const { addPatient } = useHospitalData();
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<Gender>('female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState<string>('+232 7');
  const [emergencyContact, setEmergencyContact] = useState<string>('+232 7');
  const [address, setAddress] = useState<string>('Freetown, Sierra Leone');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [status, setStatus] = useState<PatientStatus>('admitted');
  const [assignedDoctor, setAssignedDoctor] = useState<string>('Dr. Alusine Koroma');
  const [wardNumber, setWardNumber] = useState<string>('Emergency Resuscitation Ward');
  const [bedNumber, setBedNumber] = useState<string>('BED-01');
  const [allergies, setAllergies] = useState<string>('No known allergies (NKDA)');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPatient({
        fullName,
        age: Number(age),
        gender,
        bloodGroup,
        phone,
        emergencyContact,
        address,
        diagnosis,
        status,
        assignedDoctor,
        wardNumber,
        bedNumber,
        allergies,
        admissionDate: new Date().toISOString().split('T')[0],
        vitals: [
          {
            id: `v-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            systolicBP: 120,
            diastolicBP: 80,
            heartRate: 76,
            spo2: 98,
            temperature: 36.8,
            respiratoryRate: 16,
            recordedBy: 'Nurse Fatmata Sesay'
          }
        ]
      });
      onClose();
    } catch (err) {
      console.error('Error adding patient:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">Register New Patient EMR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Samuel Koroma"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
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
              <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number (+232)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Emergency Contact</label>
              <input
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Doctor</label>
              <select
                value={assignedDoctor}
                onChange={(e) => setAssignedDoctor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="Dr. Alusine Koroma">Dr. Alusine Koroma (Chief Medical Officer)</option>
                <option value="Dr. Mariatu Turay">Dr. Mariatu Turay (Pediatrics & Ob-Gyn)</option>
                <option value="Dr. J. Bangura">Dr. J. Bangura (Internal Medicine)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Care Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="admitted">Admitted Inpatient</option>
                <option value="emergency">Emergency Care</option>
                <option value="outpatient">Outpatient</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ward Department</label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                <option value="Emergency Resuscitation Ward">Emergency Resuscitation Ward</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Maternity & Labor Ward">Maternity & Labor Ward</option>
                <option value="Pediatric Ward">Pediatric Ward</option>
                <option value="Male Medical Ward">Male Medical Ward</option>
                <option value="Female Medical Ward">Female Medical Ward</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bed Number</label>
              <input
                type="text"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Diagnosis / Chief Complaint *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Febrile Illness / Severe Malaria Investigation"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Known Allergies / Medical Alerts</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating Record...' : 'Complete Patient Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
