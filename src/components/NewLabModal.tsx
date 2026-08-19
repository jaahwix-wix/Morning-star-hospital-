import React, { useState } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { LabCategory } from '../types';

interface NewLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLabModal: React.FC<NewLabModalProps> = ({ isOpen, onClose }) => {
  const { addLabTest, patients } = useHospitalData();
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [category, setCategory] = useState<LabCategory>('Parasitology');
  const [testName, setTestName] = useState<string>('Thick & Thin Blood Film for Malaria Parasites (Microscopy)');
  const [orderedBy, setOrderedBy] = useState<string>('Dr. Alusine Koroma');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const testPresets: Record<LabCategory, string[]> = {
    Parasitology: [
      'Thick & Thin Blood Film for Malaria Parasites (Microscopy)',
      'Malaria Rapid Diagnostic Test (Pf/Pan RDT)',
      'Stool Routine Examination & Parasitology'
    ],
    Hematology: [
      'Full Blood Count (CBC / FBC with 5-part Differential)',
      'Hemoglobin (Hb) & Packed Cell Volume (PCV)',
      'Erythrocyte Sedimentation Rate (ESR)',
      'ABO & Rhesus Blood Grouping'
    ],
    Biochemistry: [
      'Serum Electrolytes, Urea & Creatinine (E/U/Cr)',
      'Liver Function Tests (LFTs: ALT, AST, Bilirubin, Albumin)',
      'Fasting & Random Blood Glucose (FBS/RBS)',
      'High-Sensitivity Cardiac Troponin-I'
    ],
    Microbiology: [
      'Widal Agglutination Test (Typhoid Fever)',
      'Blood Culture & Antimicrobial Sensitivity',
      'Urine Culture & Sensitivity Testing',
      'High Vaginal Swab (HVS) Microscopy'
    ],
    Urinalysis: [
      'Urinalysis 10-Parameter Chemical Dipstick',
      'Urine Microscopy (Cast, Crystals, RBCs, Pus Cells)'
    ],
    Imaging: [
      'Obstetric & Pelvic Ultrasound Scan',
      'Abdominal / Hepatobiliary Ultrasound',
      '12-Lead Diagnostic Electrocardiogram (ECG)'
    ]
  };

  const handlePatientSelect = (pId: string) => {
    setPatientId(pId);
    const pat = patients.find((p) => p.id === pId);
    if (pat) {
      setPatientName(pat.fullName);
      setPatientAge(pat.age);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addLabTest({
        patientId: patientId || undefined,
        patientName: patientName || 'Walk-in Diagnostic Patient',
        patientAge,
        testName,
        category,
        status: 'pending',
        orderedBy
      });
      onClose();
    } catch (err) {
      console.error('Error ordering lab test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Order Laboratory Diagnostic Test</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Inpatient / Registered Patient</label>
            <select
              value={patientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
            >
              <option value="">-- Or enter walk-in name below --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) - {p.age}y
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Isata Mansaray"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Patient Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Diagnostic Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as LabCategory;
                  setCategory(cat);
                  if (testPresets[cat]?.length) setTestName(testPresets[cat][0]);
                }}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
              >
                {Object.keys(testPresets).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Laboratory Test Name *</label>
            <select
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white font-medium mb-1.5"
            >
              {testPresets[category]?.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Custom Test Name"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ordering Doctor</label>
            <select
              value={orderedBy}
              onChange={(e) => setOrderedBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-800 bg-white"
            >
              <option value="Dr. Alusine Koroma">Dr. Alusine Koroma (Chief Medical Officer)</option>
              <option value="Dr. Mariatu Turay">Dr. Mariatu Turay (Pediatrics & Ob-Gyn)</option>
              <option value="Dr. J. Bangura">Dr. J. Bangura (Internal Medicine)</option>
            </select>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Requisitioning...' : 'Dispatch Requisition to Lab'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
