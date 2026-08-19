import React, { useState } from 'react';
import {
  FlaskConical,
  Microscope,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  Sparkles,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { LabTest, LabCategory, LabStatus } from '../types';

interface LabDiagnosticsCenterProps {
  onOpenNewLabModal: () => void;
  onPrintLabReport: (test: LabTest) => void;
}

export const LabDiagnosticsCenter: React.FC<LabDiagnosticsCenterProps> = ({
  onOpenNewLabModal,
  onPrintLabReport
}) => {
  const { labTests, updateLabResult } = useHospitalData();
  const { userProfile, activeRole } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Result entry modal state
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [resultVal, setResultVal] = useState<string>('');
  const [normalRange, setNormalRange] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string>('');
  const [isAbnormal, setIsAbnormal] = useState<boolean>(false);
  const [aiExplaining, setAiExplaining] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<{ plainEnglishSummary?: string; whatThisMeans?: string; nextSteps?: string } | null>(null);

  const categories: LabCategory[] = [
    'Parasitology',
    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Urinalysis',
    'Imaging'
  ];

  const filteredTests = labTests.filter((test) => {
    const matchesCat = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || test.status === selectedStatus;
    const matchesSearch =
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSearch;
  });

  const handleOpenResultEntry = (test: LabTest) => {
    setEditingTest(test);
    setResultVal(test.resultValue || '');
    setNormalRange(test.normalRange || '');
    setInterpretation(test.interpretation || '');
    setIsAbnormal(test.isAbnormal || false);
    setAiExplanation(null);
  };

  const handleSaveResult = async () => {
    if (!editingTest) return;
    await updateLabResult(
      editingTest.id,
      resultVal,
      normalRange,
      interpretation,
      isAbnormal,
      userProfile?.name || 'Sister Mariama Bah (Lead Scientist)'
    );
    setEditingTest(null);
  };

  const handleGenerateAiExplainer = async () => {
    if (!editingTest) return;
    setAiExplaining(true);
    try {
      const res = await fetch('/api/gemini/lab-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: editingTest.testName,
          resultValue: resultVal || editingTest.resultValue || 'Pending analysis',
          normalRange: normalRange || editingTest.normalRange || 'Standard reference',
          interpretation: interpretation || editingTest.interpretation || ''
        })
      });
      const data = await res.json();
      setAiExplanation(data);
    } catch (err) {
      console.error('Error generating AI explanation:', err);
    } finally {
      setAiExplaining(false);
    }
  };

  return (
    <div id="lab-diagnostics-container" className="space-y-6">
      {/* Laboratory Wing Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 font-sans">
              High-Precision Diagnostic Laboratory
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Lead: Sister Mariama Bah
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            24/7 Blood film microscopy (Malaria RDT), Hematology, Clinical Biochemistry, and Microbiology culture screening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="order-lab-btn"
            onClick={onOpenNewLabModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Order Diagnostic Test</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          All Categories ({labTests.length})
        </button>
        {categories.map((cat) => {
          const count = labTests.filter((t) => t.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{cat}</span>
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
            id="lab-search-input"
            type="text"
            placeholder="Search test name or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="lab-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="critical_flag">Critical / Abnormal Flag</option>
          </select>
        </div>
      </div>

      {/* Diagnostic Lab Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTests.map((test) => {
          const isCompleted = test.status === 'completed' || test.status === 'critical_flag';
          const isAbnormal = test.isAbnormal || test.status === 'critical_flag';

          return (
            <div
              key={test.id}
              id={`lab-card-${test.id}`}
              className={`rounded-2xl border p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                isAbnormal ? 'bg-red-50/40 border-red-200' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Category & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {test.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">
                      {test.testName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                      test.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : test.status === 'critical_flag'
                        ? 'bg-red-600 text-white animate-pulse'
                        : test.status === 'processing'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {test.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Patient Information */}
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{test.patientName}</span>
                    {test.patientAge && <span className="text-slate-400">({test.patientAge}y)</span>}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Dr: {test.orderedBy.split(' ')[1] || test.orderedBy}</span>
                </div>

                {/* Result Block if completed */}
                {isCompleted ? (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isAbnormal ? 'bg-red-100/60 border-red-200 text-red-950' : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase tracking-wider">
                        {isAbnormal ? '⚠️ Reactive / Abnormal Result' : '✓ Normal Parameter'}
                      </span>
                      {test.normalRange && (
                        <span className="text-[10px] text-slate-500">Ref: {test.normalRange}</span>
                      )}
                    </div>
                    <p className="font-mono font-bold text-xs pt-1">{test.resultValue}</p>
                    {test.interpretation && (
                      <p className="text-[11px] text-slate-700 italic pt-1">{test.interpretation}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>Requisition queued in diagnostic laboratory</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(test.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id={`enter-result-btn-${test.id}`}
                    onClick={() => handleOpenResultEntry(test)}
                    className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    {isCompleted ? 'Edit Result' : 'Enter Result'}
                  </button>

                  {isCompleted && (
                    <button
                      id={`print-report-btn-${test.id}`}
                      onClick={() => onPrintLabReport(test)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                      title="Print Official Diagnostic Report"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Entry & Verification Dialog */}
      {editingTest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Record Diagnostic Result</h3>
                  <p className="text-xs text-slate-500">
                    {editingTest.testName} • {editingTest.patientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Test info summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-semibold text-slate-800">{editingTest.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ordered By:</span>
                <span className="font-semibold text-slate-800">{editingTest.orderedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Scientist on Duty:</span>
                <span className="font-semibold text-indigo-600">{userProfile?.name}</span>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Result Findings & Values *
                </label>
                <textarea
                  id="lab-result-value-input"
                  rows={3}
                  value={resultVal}
                  onChange={(e) => setResultVal(e.target.value)}
                  placeholder="e.g. POSITIVE (+++) P. falciparum trophozoites seen. Or: Hemoglobin 13.8 g/dL..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Normal Reference Range
                  </label>
                  <input
                    id="lab-normal-range-input"
                    type="text"
                    value={normalRange}
                    onChange={(e) => setNormalRange(e.target.value)}
                    placeholder="e.g. Negative / 12.0 - 16.0 g/dL"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="lab-is-abnormal-checkbox"
                    type="checkbox"
                    checked={isAbnormal}
                    onChange={(e) => setIsAbnormal(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <label htmlFor="lab-is-abnormal-checkbox" className="text-xs font-bold text-red-700">
                    Flag as Critical / Reactive Abnormal
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinical Interpretation & Notes
                </label>
                <textarea
                  id="lab-interpretation-input"
                  rows={2}
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  placeholder="e.g. High density parasite load; recommend immediate IV artesunate protocol."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* AI Patient Explainer Trigger */}
              <div className="pt-2">
                <button
                  id="generate-ai-explanation-btn"
                  type="button"
                  onClick={handleGenerateAiExplainer}
                  disabled={aiExplaining || !resultVal}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{aiExplaining ? 'Generating Patient Explanation...' : 'Generate AI Plain-Language Explainer for Patient'}</span>
                </button>

                {aiExplanation && (
                  <div className="mt-2 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1 text-slate-800">
                    <p className="font-bold text-indigo-900">Patient-Friendly Summary:</p>
                    <p>{aiExplanation.plainEnglishSummary}</p>
                    {aiExplanation.whatThisMeans && (
                      <p className="text-slate-600 pt-1">
                        <strong>Clinical context:</strong> {aiExplanation.whatThisMeans}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingTest(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="save-lab-result-btn"
                onClick={handleSaveResult}
                disabled={!resultVal}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-xs"
              >
                Verify & Save Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
