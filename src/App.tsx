import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HospitalDataProvider } from './context/HospitalDataContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TriageEmergencyBoard } from './components/TriageEmergencyBoard';
import { PatientManagement } from './components/PatientManagement';
import { LabDiagnosticsCenter } from './components/LabDiagnosticsCenter';
import { ConsultationsAppointments } from './components/ConsultationsAppointments';
import { WardBedManagement } from './components/WardBedManagement';
import { InvestmentControl } from './components/InvestmentControl';
import { PharmacyControl } from './components/PharmacyControl';
import { StaffControl } from './components/StaffControl';
import { BillingControl } from './components/BillingControl';
import { AiClinicalAssistant } from './components/AiClinicalAssistant';
import { PatientPortalView } from './components/PatientPortalView';
import { EmergencyHotlineModal } from './components/EmergencyHotlineModal';
import { PrintLabReportModal } from './components/PrintLabReportModal';
import { NewPatientModal } from './components/NewPatientModal';
import { NewTriageModal } from './components/NewTriageModal';
import { NewLabModal } from './components/NewLabModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { LabTest } from './types';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modal States
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState<boolean>(false);
  const [newTriageModalOpen, setNewTriageModalOpen] = useState<boolean>(false);
  const [newLabModalOpen, setNewLabModalOpen] = useState<boolean>(false);
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState<boolean>(false);
  const [selectedLabTestForPrint, setSelectedLabTestForPrint] = useState<LabTest | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Hand Side System Menu / Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area (Offset for Left Sidebar on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
              onOpenNewPatientModal={() => setNewPatientModalOpen(true)}
              onOpenNewTriageModal={() => setNewTriageModalOpen(true)}
              onOpenNewLabModal={() => setNewLabModalOpen(true)}
            />
          )}

          {activeTab === 'triage' && (
            <TriageEmergencyBoard
              onOpenNewTriageModal={() => setNewTriageModalOpen(true)}
              onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
            />
          )}

          {activeTab === 'patients' && (
            <PatientManagement
              onOpenNewPatientModal={() => setNewPatientModalOpen(true)}
            />
          )}

          {activeTab === 'lab' && (
            <LabDiagnosticsCenter
              onOpenNewLabModal={() => setNewLabModalOpen(true)}
              onPrintLabReport={(test) => setSelectedLabTestForPrint(test)}
            />
          )}

          {activeTab === 'consultations' && (
            <ConsultationsAppointments
              onOpenNewAppointmentModal={() => setNewAppointmentModalOpen(true)}
            />
          )}

          {activeTab === 'wards' && <WardBedManagement />}

          {activeTab === 'investment' && <InvestmentControl />}

          {activeTab === 'pharmacy' && <PharmacyControl />}

          {activeTab === 'staff' && <StaffControl />}

          {activeTab === 'billing' && <BillingControl />}

          {activeTab === 'ai-copilot' && <AiClinicalAssistant />}

          {activeTab === 'patient-portal' && (
            <PatientPortalView
              onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
              onOpenNewAppointmentModal={() => setNewAppointmentModalOpen(true)}
            />
          )}
        </main>

        {/* Hospital System Footer */}
        <footer className="bg-white border-t border-slate-200/80 text-slate-500 text-xs py-5 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-sans tracking-tight">
                MORNING STAR HOSPITAL
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600 font-medium italic">"Your Health is our PRIORITY"</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap justify-center">
              <span>24 Hours Service Everyday</span>
              <span>•</span>
              <span className="font-mono font-bold text-slate-700">
                Emergency: +232 73 929 145 / +232 78 355 293
              </span>
              <span>•</span>
              <span>Sierra Leone</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <EmergencyHotlineModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      <PrintLabReportModal
        test={selectedLabTestForPrint}
        onClose={() => setSelectedLabTestForPrint(null)}
      />

      <NewPatientModal
        isOpen={newPatientModalOpen}
        onClose={() => setNewPatientModalOpen(false)}
      />

      <NewTriageModal
        isOpen={newTriageModalOpen}
        onClose={() => setNewTriageModalOpen(false)}
      />

      <NewLabModal
        isOpen={newLabModalOpen}
        onClose={() => setNewLabModalOpen(false)}
      />

      <NewAppointmentModal
        isOpen={newAppointmentModalOpen}
        onClose={() => setNewAppointmentModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HospitalDataProvider>
        <MainAppContent />
      </HospitalDataProvider>
    </AuthProvider>
  );
}

export default App;
