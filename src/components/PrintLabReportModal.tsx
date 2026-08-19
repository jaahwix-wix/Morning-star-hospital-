import React from 'react';
import {
  Printer,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  ShieldCheck
} from 'lucide-react';
import { LabTest } from '../types';

interface PrintLabReportModalProps {
  test: LabTest | null;
  onClose: () => void;
}

export const PrintLabReportModal: React.FC<PrintLabReportModalProps> = ({
  test,
  onClose
}) => {
  if (!test) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 text-slate-900 border border-slate-200 print:p-0 print:border-none print:shadow-none">
        {/* Actions bar (Hidden when printed) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Official Diagnostic Laboratory Certificate
          </span>
          <div className="flex items-center gap-2">
            <button
              id="modal-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 px-2 py-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Letterhead */}
        <div className="border border-slate-200 p-8 rounded-xl space-y-6 print:border-none print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xl">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight font-serif text-slate-900 uppercase">
                  MORNING STAR HOSPITAL
                </h1>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  "Your Health is our PRIORITY" • 24 HOURS SERVICE EVERYDAY
                </p>
                <p className="text-[10px] text-slate-500">
                  Tel: +232 73 929 145 / +232 78 355 293 • Sierra Leone
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Number</span>
              <span className="font-mono font-bold text-xs text-slate-900">
                REP-MSH-{test.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Date: {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Patient Details Sub-header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Patient Name:</span>
              <span className="font-bold text-slate-900">{test.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Age / Gender:</span>
              <span className="font-medium text-slate-800">{test.patientAge || 'Adult'}y / Female</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Ordering Physician:</span>
              <span className="font-medium text-slate-800">{test.orderedBy}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Category:</span>
              <span className="font-bold text-indigo-700">{test.category}</span>
            </div>
          </div>

          {/* Test Investigation Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Laboratory Investigation Results
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Investigation / Diagnostic Marker</th>
                  <th className="p-3">Result Finding</th>
                  <th className="p-3">Reference Interval</th>
                  <th className="p-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-sans font-bold text-slate-900">{test.testName}</td>
                  <td className="p-3 font-bold text-slate-900">{test.resultValue || 'Pending verification'}</td>
                  <td className="p-3 text-slate-600">{test.normalRange || 'Standard reference'}</td>
                  <td className="p-3">
                    {test.isAbnormal ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700 text-[10px]">
                        ABNORMAL / REACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                        NORMAL
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Clinical Interpretation & Scientist Comments */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Clinical Pathologist Interpretation:
            </span>
            <p className="text-slate-800 leading-relaxed font-serif text-sm italic">
              "{test.interpretation || 'Findings consistent with clinical presentation. Correlate with patient symptoms.'}"
            </p>
          </div>

          {/* Signatures Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div>
              <div className="h-10 border-b border-slate-400 w-48 mb-1 flex items-end">
                <span className="font-serif italic text-teal-800 text-sm">Sister Mariama Bah</span>
              </div>
              <p className="font-bold text-slate-800">Sister Mariama Bah</p>
              <p className="text-[10px] text-slate-500">Lead Medical Laboratory Scientist</p>
            </div>

            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1 ml-auto flex items-end justify-end">
                <span className="font-serif italic text-teal-800 text-sm">Dr. A. Koroma, MD</span>
              </div>
              <p className="font-bold text-slate-800">Dr. Alusine Koroma</p>
              <p className="text-[10px] text-slate-500">Chief Medical Officer / Reviewing Physician</p>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-100">
            Morning Star Hospital Diagnostic Center • Computer-generated validated electronic medical document
          </div>
        </div>
      </div>
    </div>
  );
};
