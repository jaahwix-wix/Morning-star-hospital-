import React, { useState } from 'react';
import {
  Sparkles,
  Stethoscope,
  FileText,
  FlaskConical,
  Activity,
  AlertTriangle,
  Send,
  Copy,
  Check,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export const AiClinicalAssistant: React.FC = () => {
  const { patients } = useHospitalData();
  const [activeTab, setActiveTab] = useState<'triage' | 'soap' | 'lab'>('triage');

  // 1. Triage Assistant State
  const [triageAge, setTriageAge] = useState<string>('32');
  const [triageGender, setTriageGender] = useState<string>('Female');
  const [triageSymptoms, setTriageSymptoms] = useState<string>(
    'Severe cyclical high fevers (39.8°C), severe chills, vomiting, and confusion for 3 days.'
  );
  const [triageSpo2, setTriageSpo2] = useState<string>('93');
  const [triageHR, setTriageHR] = useState<string>('118');
  const [triageBP, setTriageBP] = useState<string>('95/60');
  const [triageLoading, setTriageLoading] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  // 2. SOAP Note State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [soapSymptoms, setSoapSymptoms] = useState<string>('Epigastric burning pain radiating to the back for 4 days.');
  const [soapFindings, setSoapFindings] = useState<string>('Tenderness on palpation in right upper quadrant, soft abdomen, no rebound tenderness.');
  const [soapDiagnosis, setSoapDiagnosis] = useState<string>('Acute Gastroduodenitis vs Biliary colic');
  const [soapLabs, setSoapLabs] = useState<string>('Full blood count normal, H. pylori stool antigen positive');
  const [soapLoading, setSoapLoading] = useState<boolean>(false);
  const [soapResult, setSoapResult] = useState<any>(null);

  // 3. Lab Explainer State
  const [labTestName, setLabTestName] = useState<string>('Thick Blood Film for Malaria Parasites');
  const [labResultVal, setLabResultVal] = useState<string>('P. falciparum trophozoites seen: +++ (High Parasite Load)');
  const [labNormalRange, setLabNormalRange] = useState<string>('Negative (No trophozoites detected)');
  const [labInterp, setLabInterp] = useState<string>('Heavy plasmodium infestation, immediate IV Artesunate protocol indicated.');
  const [labLoading, setLabLoading] = useState<boolean>(false);
  const [labResult, setLabResult] = useState<any>(null);

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Triage Assistant
  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriageLoading(true);
    try {
      const res = await fetch('/api/gemini/triage-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAge: triageAge,
          gender: triageGender,
          symptoms: triageSymptoms,
          vitals: {
            spo2: Number(triageSpo2),
            heartRate: Number(triageHR),
            bloodPressure: triageBP
          }
        })
      });
      const data = await res.json();
      setTriageResult(data);
    } catch (err) {
      console.error('Error running AI triage:', err);
    } finally {
      setTriageLoading(false);
    }
  };

  // Run SOAP Note Generator
  const handleRunSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    setSoapLoading(true);
    const pat = patients.find((p) => p.id === selectedPatientId);
    try {
      const res = await fetch('/api/gemini/soap-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: pat?.fullName || 'Walk-in Patient',
          age: pat?.age || '42',
          symptoms: soapSymptoms,
          examFindings: soapFindings,
          diagnosis: soapDiagnosis,
          labResults: soapLabs
        })
      });
      const data = await res.json();
      setSoapResult(data);
    } catch (err) {
      console.error('Error generating SOAP note:', err);
    } finally {
      setSoapLoading(false);
    }
  };

  // Run Lab Explainer
  const handleRunLabExplainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLabLoading(true);
    try {
      const res = await fetch('/api/gemini/lab-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: labTestName,
          resultValue: labResultVal,
          normalRange: labNormalRange,
          interpretation: labInterp
        })
      });
      const data = await res.json();
      setLabResult(data);
    } catch (err) {
      console.error('Error generating lab explanation:', err);
    } finally {
      setLabLoading(false);
    }
  };

  // Quick Preset Handlers
  const loadPreset = (type: string) => {
    if (type === 'severe-malaria') {
      setActiveTab('triage');
      setTriageAge('28');
      setTriageGender('Female');
      setTriageSymptoms('High fever 39.9°C, severe rigors, confusion, vomiting, deep breathing.');
      setTriageSpo2('91');
      setTriageHR('122');
      setTriageBP('90/55');
    } else if (type === 'cardiac') {
      setActiveTab('triage');
      setTriageAge('58');
      setTriageGender('Male');
      setTriageSymptoms('Crushing retrosternal chest pain radiating to left jaw, diaphoresis, shortness of breath.');
      setTriageSpo2('94');
      setTriageHR('108');
      setTriageBP('165/105');
    } else if (type === 'pediatric') {
      setActiveTab('triage');
      setTriageAge('3');
      setTriageGender('Male');
      setTriageSymptoms('High febrile seizure lasting 2 minutes, lethargic, reduced fluid intake.');
      setTriageSpo2('95');
      setTriageHR('140');
      setTriageBP('85/50');
    }
  };

  return (
    <div id="ai-clinical-copilot-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              Clinical AI Copilot & Diagnostic Decision Support
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rapid emergency triage scoring, SOAP medical documentation, and plain-language patient explanations.
          </p>
        </div>

        {/* Preset Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset('severe-malaria')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-amber-700 border border-slate-200 transition-colors"
          >
            ⚡ Severe Malaria
          </button>
          <button
            onClick={() => loadPreset('cardiac')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-red-700 border border-slate-200 transition-colors"
          >
            ⚡ Chest Pain / ACS
          </button>
          <button
            onClick={() => loadPreset('pediatric')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-sky-700 border border-slate-200 transition-colors"
          >
            ⚡ Pediatric Febrile
          </button>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'triage'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>1. Emergency Triage Scoring</span>
        </button>

        <button
          onClick={() => setActiveTab('soap')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'soap'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. SOAP Clinical Note Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'lab'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>3. Patient Lab Result Explainer</span>
        </button>
      </div>

      {/* 1. Triage Advisor Tab */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Patient Presentation & Vitals Input</h2>
            <form onSubmit={handleRunTriage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Patient Age</label>
                  <input
                    type="text"
                    value={triageAge}
                    onChange={(e) => setTriageAge(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={triageGender}
                    onChange={(e) => setTriageGender(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chief Complaints & Onset
                </label>
                <textarea
                  rows={3}
                  value={triageSymptoms}
                  onChange={(e) => setTriageSymptoms(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={triageSpo2}
                    onChange={(e) => setTriageSpo2(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Heart Rate</label>
                  <input
                    type="number"
                    value={triageHR}
                    onChange={(e) => setTriageHR(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={triageBP}
                    onChange={(e) => setTriageBP(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={triageLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{triageLoading ? 'Evaluating Clinical Severity...' : 'Run Clinical Triage Analysis'}</span>
              </button>
            </form>
          </div>

          {/* Results Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Clinical Decision Guidance</h2>
              {triageResult && (
                <button
                  onClick={() => handleCopy(JSON.stringify(triageResult, null, 2))}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {triageResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">
                      Recommended Urgency
                    </span>
                    <span className="text-base font-bold text-indigo-950">
                      {triageResult.urgency || 'Urgent Clinical Evaluation'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold text-[11px]">
                    {triageResult.triageCode || 'TRIAGE-AI-OK'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Clinical Presentation:</span>
                  <p className="text-slate-600 leading-relaxed">{triageResult.summary}</p>
                </div>

                {triageResult.differentialDiagnosis && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">Differential Diagnosis:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {triageResult.differentialDiagnosis.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {triageResult.recommendedActions && (
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-800">Immediate Nursing & Diagnostic Actions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                      {triageResult.recommendedActions.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {triageResult.cautionFlags && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 space-y-1">
                    <strong className="block font-bold">⚠️ Critical Safety Warning:</strong>
                    <p>{triageResult.cautionFlags}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 border border-dashed border-slate-200 rounded-xl">
                <Sparkles className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No Assessment Run Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Fill in the patient's symptoms and vital signs or click a quick preset to generate clinical triage guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SOAP Note Generator Tab */}
      {activeTab === 'soap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Encounter Data</h2>
            <form onSubmit={handleRunSoap} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Patient (Optional)</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- General Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientId}) - {p.age}y
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subjective Symptoms</label>
                <textarea
                  rows={2}
                  value={soapSymptoms}
                  onChange={(e) => setSoapSymptoms(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Physical Examination Findings</label>
                <textarea
                  rows={2}
                  value={soapFindings}
                  onChange={(e) => setSoapFindings(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Working Diagnosis</label>
                <input
                  type="text"
                  value={soapDiagnosis}
                  onChange={(e) => setSoapDiagnosis(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Laboratory & Diagnostic Workup</label>
                <input
                  type="text"
                  value={soapLabs}
                  onChange={(e) => setSoapLabs(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={soapLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{soapLoading ? 'Formatting SOAP Record...' : 'Generate Standard SOAP Medical Note'}</span>
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Standardized SOAP Medical Record</h2>
            {soapResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                    S — Subjective
                  </span>
                  <p className="text-slate-700">{soapResult.subjective}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-sky-700 uppercase tracking-wider block mb-1">
                    O — Objective
                  </span>
                  <p className="text-slate-700">{soapResult.objective}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    A — Assessment
                  </span>
                  <p className="text-slate-700">{soapResult.assessment}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-amber-700 uppercase tracking-wider block mb-1">
                    P — Plan
                  </span>
                  <p className="text-slate-700 whitespace-pre-line">{soapResult.plan}</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 border border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No SOAP Note Generated</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Fill in the subjective symptoms and exam findings to produce an official medical SOAP document.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Patient Lab Result Explainer Tab */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Diagnostic Parameters</h2>
            <form onSubmit={handleRunLabExplainer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Laboratory Test Name</label>
                <input
                  type="text"
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reported Result Value</label>
                <input
                  type="text"
                  value={labResultVal}
                  onChange={(e) => setLabResultVal(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Standard Reference Range</label>
                <input
                  type="text"
                  value={labNormalRange}
                  onChange={(e) => setLabNormalRange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Scientist / Physician Interpretation</label>
                <textarea
                  rows={2}
                  value={labInterp}
                  onChange={(e) => setLabInterp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={labLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{labLoading ? 'Translating Results...' : 'Generate Patient Explainer'}</span>
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Patient-Friendly Explanation</h2>
            {labResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-emerald-800">
                    What this result means in plain terms:
                  </span>
                  <p className="leading-relaxed">{labResult.plainEnglishSummary}</p>
                </div>

                {labResult.whatThisMeans && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                      Medical context:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{labResult.whatThisMeans}</p>
                  </div>
                )}

                {labResult.nextSteps && (
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 text-indigo-950 space-y-1">
                    <span className="font-bold text-indigo-800 block text-[10px] uppercase tracking-wider">
                      Recommended next steps for patient:
                    </span>
                    <p className="leading-relaxed">{labResult.nextSteps}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 border border-dashed border-slate-200 rounded-xl">
                <FlaskConical className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No Explanation Generated</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Enter laboratory diagnostic values to translate complex scientific markers into clear, reassuring patient guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
