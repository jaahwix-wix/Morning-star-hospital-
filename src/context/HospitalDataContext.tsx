import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  seedInitialHospitalDataIfEmpty,
  INITIAL_PATIENTS,
  INITIAL_BEDS,
  INITIAL_TRIAGE,
  INITIAL_LAB_TESTS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVESTMENTS,
  INITIAL_PHARMACY,
  INITIAL_STAFF,
  INITIAL_DISPENSATIONS,
  INITIAL_SHIFT_SWAPS,
  INITIAL_INVOICES
} from '../firebase';
import {
  Patient,
  Appointment,
  LabTest,
  TriageEntry,
  HospitalBed,
  HospitalStats,
  PatientVital,
  HospitalInvestment,
  PharmacyItem,
  MedicationDispensation,
  StaffMember,
  ShiftSwapRequest,
  ShiftSwapStatus,
  HospitalInvoice,
  PaymentMethod
} from '../types';

interface HospitalDataContextType {
  patients: Patient[];
  appointments: Appointment[];
  labTests: LabTest[];
  triageQueue: TriageEntry[];
  hospitalBeds: HospitalBed[];
  investments: HospitalInvestment[];
  pharmacyItems: PharmacyItem[];
  dispensations: MedicationDispensation[];
  staffMembers: StaffMember[];
  shiftSwaps: ShiftSwapRequest[];
  invoices: HospitalInvoice[];
  stats: HospitalStats;
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  addPatientVital: (patientId: string, vital: Omit<PatientVital, 'id' | 'timestamp'>) => Promise<void>;
  addTriageEntry: (triage: Omit<TriageEntry, 'id' | 'createdAt' | 'arrivedAt'>) => Promise<string>;
  updateTriageStatus: (id: string, status: TriageEntry['status'], bedAssigned?: string) => Promise<void>;
  addLabTest: (test: Omit<LabTest, 'id' | 'createdAt'>) => Promise<string>;
  updateLabResult: (id: string, resultValue: string, normalRange: string, interpretation: string, isAbnormal: boolean, performedBy: string) => Promise<void>;
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Promise<string>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) => Promise<void>;
  updateBedStatus: (bedId: string, isOccupied: boolean, patientId?: string, patientName?: string, condition?: HospitalBed['condition']) => Promise<void>;
  // Investment Control
  addInvestment: (investment: Omit<HospitalInvestment, 'id' | 'createdAt'>) => Promise<string>;
  updateInvestmentStatus: (id: string, status: HospitalInvestment['status'], notes?: string) => Promise<void>;
  // Pharmacy Control
  addPharmacyItem: (item: Omit<PharmacyItem, 'id' | 'lastRestocked'>) => Promise<string>;
  updatePharmacyStock: (id: string, newQuantity: number) => Promise<void>;
  dispenseMedication: (dispensation: Omit<MedicationDispensation, 'id' | 'dispensedAt'>) => Promise<string>;
  // Staff Control & Shift Swapping
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'joinedDate'>) => Promise<string>;
  updateStaffStatus: (id: string, status: StaffMember['status'], shift?: StaffMember['shift'], station?: string) => Promise<void>;
  requestShiftSwap: (swap: Omit<ShiftSwapRequest, 'id' | 'requestId' | 'status' | 'createdAt'>) => Promise<string>;
  updateShiftSwapStatus: (id: string, status: ShiftSwapStatus, reviewerName?: string, notes?: string) => Promise<void>;
  // Billing & Invoicing
  createInvoice: (invoice: Omit<HospitalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Promise<string>;
  recordPayment: (id: string, amount: number, method: PaymentMethod, reference?: string, notes?: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: HospitalInvoice['status']) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const HospitalDataContext = createContext<HospitalDataContextType | undefined>(undefined);

export const HospitalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [labTests, setLabTests] = useState<LabTest[]>(INITIAL_LAB_TESTS);
  const [triageQueue, setTriageQueue] = useState<TriageEntry[]>(INITIAL_TRIAGE);
  const [hospitalBeds, setHospitalBeds] = useState<HospitalBed[]>(INITIAL_BEDS);
  const [investments, setInvestments] = useState<HospitalInvestment[]>(INITIAL_INVESTMENTS);
  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(INITIAL_PHARMACY);
  const [dispensations, setDispensations] = useState<MedicationDispensation[]>(INITIAL_DISPENSATIONS);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [shiftSwaps, setShiftSwaps] = useState<ShiftSwapRequest[]>(INITIAL_SHIFT_SWAPS);
  const [invoices, setInvoices] = useState<HospitalInvoice[]>(INITIAL_INVOICES);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize DB and listen to real-time changes
  useEffect(() => {
    seedInitialHospitalDataIfEmpty();

    // 1. Patients Real-time Listener
    const unsubPatients = onSnapshot(
      collection(db, 'patients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Patient[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setPatients(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'patients');
      }
    );

    // 2. Appointments Real-time Listener
    const unsubAppointments = onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Appointment[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setAppointments(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'appointments');
      }
    );

    // 3. Lab Tests Real-time Listener
    const unsubLab = onSnapshot(
      collection(db, 'lab_tests'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LabTest[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setLabTests(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'lab_tests');
      }
    );

    // 4. Triage Queue Real-time Listener
    const unsubTriage = onSnapshot(
      collection(db, 'triage_queue'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TriageEntry[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setTriageQueue(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'triage_queue');
      }
    );

    // 5. Hospital Beds Real-time Listener
    const unsubBeds = onSnapshot(
      collection(db, 'hospital_beds'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HospitalBed[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setHospitalBeds(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'hospital_beds');
      }
    );

    // 6. Investments Real-time Listener
    const unsubInvestments = onSnapshot(
      collection(db, 'hospital_investments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HospitalInvestment[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setInvestments(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'hospital_investments');
      }
    );

    // 7. Pharmacy Real-time Listener
    const unsubPharmacy = onSnapshot(
      collection(db, 'pharmacy_inventory'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PharmacyItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setPharmacyItems(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'pharmacy_inventory');
      }
    );

    // 8. Staff Real-time Listener
    const unsubStaff = onSnapshot(
      collection(db, 'hospital_staff'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: StaffMember[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setStaffMembers(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'hospital_staff');
      }
    );

    // 9. Dispensations Real-time Listener
    const unsubDispensations = onSnapshot(
      collection(db, 'pharmacy_dispensations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MedicationDispensation[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setDispensations(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'pharmacy_dispensations');
      }
    );

    // 10. Shift Swaps Real-time Listener
    const unsubShiftSwaps = onSnapshot(
      collection(db, 'hospital_shift_swaps'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ShiftSwapRequest[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setShiftSwaps(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'hospital_shift_swaps');
      }
    );

    // 11. Invoices Real-time Listener
    const unsubInvoices = onSnapshot(
      collection(db, 'hospital_invoices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HospitalInvoice[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setInvoices(list);
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'hospital_invoices');
        setLoading(false);
      }
    );

    return () => {
      unsubPatients();
      unsubAppointments();
      unsubLab();
      unsubTriage();
      unsubBeds();
      unsubInvestments();
      unsubPharmacy();
      unsubStaff();
      unsubDispensations();
      unsubShiftSwaps();
      unsubInvoices();
    };
  }, []);

  // Compute live hospital statistics
  const occupiedBeds = hospitalBeds.filter((b) => b.isOccupied).length;
  const totalBedsCount = hospitalBeds.length || 1;
  const totalInvestmentsValue = investments.reduce((acc, curr) => acc + curr.amount, 0);
  const lowStockMedicationsCount = pharmacyItems.filter(
    (item) => item.stockQuantity <= item.minThreshold
  ).length;
  const onDutyStaffCount = staffMembers.filter((s) => s.status === 'on_duty').length;

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const paidInvoicesCount = invoices.filter((inv) => inv.status === 'paid').length;
  const pendingInvoicesCount = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'partially_paid' || inv.status === 'overdue').length;
  const pendingShiftSwapsCount = shiftSwaps.filter((sw) => sw.status === 'pending').length;

  const stats: HospitalStats = {
    totalPatients: patients.length,
    activeAdmissions: patients.filter((p) => p.status === 'admitted').length,
    emergencyTriageActive: triageQueue.filter((t) => t.status === 'waiting' || t.status === 'attending').length,
    occupancyRate: Math.round((occupiedBeds / totalBedsCount) * 100),
    pendingLabTests: labTests.filter((l) => l.status === 'pending' || l.status === 'processing').length,
    todayConsultations: appointments.filter((a) => a.status === 'scheduled' || a.status === 'in_progress').length,
    criticalCases: triageQueue.filter((t) => t.priority === 'P1_Immediate').length +
      hospitalBeds.filter((b) => b.condition === 'critical').length,
    availableBeds: hospitalBeds.filter((b) => !b.isOccupied).length,
    totalBeds: totalBedsCount,
    totalInvestmentsValue,
    lowStockMedicationsCount,
    onDutyStaffCount,
    totalRevenue,
    pendingPayments,
    paidInvoicesCount,
    pendingInvoicesCount,
    pendingShiftSwapsCount
  };

  // 1. Add Patient
  const addPatient = async (data: Omit<Patient, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `pat-${Date.now().toString().slice(-6)}`;
    const patientId = `MSH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...data,
      id,
      patientId,
      createdAt: now,
      updatedAt: now,
      vitals: data.vitals || []
    };

    try {
      await setDoc(doc(db, 'patients', id), newPatient);
    } catch (err) {
      console.warn('Direct Firestore write issue, updating local context:', err);
    }
    setPatients((prev) => [newPatient, ...prev]);
    return id;
  };

  // 2. Update Patient
  const updatePatient = async (id: string, updates: Partial<Patient>): Promise<void> => {
    const now = new Date().toISOString();
    const updatedFields = { ...updates, updatedAt: now };

    try {
      await updateDoc(doc(db, 'patients', id), updatedFields);
    } catch (err) {
      console.warn('Update Firestore issue, updating local:', err);
    }
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  // 3. Add Vital record to Patient
  const addPatientVital = async (patientId: string, vital: Omit<PatientVital, 'id' | 'timestamp'>): Promise<void> => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const newVital: PatientVital = {
      ...vital,
      id: `v-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentVitals = patient.vitals || [];
    const updatedVitals = [newVital, ...currentVitals];

    await updatePatient(patientId, { vitals: updatedVitals });
  };

  // 4. Add Emergency Triage Entry
  const addTriageEntry = async (triage: Omit<TriageEntry, 'id' | 'createdAt' | 'arrivedAt'>): Promise<string> => {
    const id = `trg-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const newEntry: TriageEntry = {
      ...triage,
      id,
      arrivedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString()
    };

    try {
      await setDoc(doc(db, 'triage_queue', id), newEntry);
    } catch (err) {
      console.warn('Triage Firestore issue, updating local state:', err);
    }
    setTriageQueue((prev) => [newEntry, ...prev]);
    return id;
  };

  // 5. Update Triage status
  const updateTriageStatus = async (id: string, status: TriageEntry['status'], bedAssigned?: string): Promise<void> => {
    const updates: Partial<TriageEntry> = { status };
    if (bedAssigned !== undefined) updates.bedAssigned = bedAssigned;

    try {
      await updateDoc(doc(db, 'triage_queue', id), updates);
    } catch (err) {
      console.warn('Update triage Firestore issue:', err);
    }
    setTriageQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  // 6. Add Lab Test Requisition
  const addLabTest = async (test: Omit<LabTest, 'id' | 'createdAt'>): Promise<string> => {
    const id = `lab-${Date.now().toString().slice(-5)}`;
    const newTest: LabTest = {
      ...test,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'lab_tests', id), newTest);
    } catch (err) {
      console.warn('Lab test Firestore write issue:', err);
    }
    setLabTests((prev) => [newTest, ...prev]);
    return id;
  };

  // 7. Update Lab Test Result
  const updateLabResult = async (
    id: string,
    resultValue: string,
    normalRange: string,
    interpretation: string,
    isAbnormal: boolean,
    performedBy: string
  ): Promise<void> => {
    const updates: Partial<LabTest> = {
      status: isAbnormal ? 'critical_flag' : 'completed',
      resultValue,
      normalRange,
      interpretation,
      isAbnormal,
      performedBy,
      completedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'lab_tests', id), updates);
    } catch (err) {
      console.warn('Lab result update Firestore issue:', err);
    }
    setLabTests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  // 8. Add Appointment
  const addAppointment = async (apt: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> => {
    const id = `apt-${Date.now().toString().slice(-5)}`;
    const newApt: Appointment = {
      ...apt,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'appointments', id), newApt);
    } catch (err) {
      console.warn('Appointment Firestore write issue:', err);
    }
    setAppointments((prev) => [newApt, ...prev]);
    return id;
  };

  // 9. Update Appointment status
  const updateAppointmentStatus = async (id: string, status: Appointment['status'], notes?: string): Promise<void> => {
    const updates: Partial<Appointment> = { status };
    if (notes !== undefined) updates.notes = notes;

    try {
      await updateDoc(doc(db, 'appointments', id), updates);
    } catch (err) {
      console.warn('Update appointment Firestore issue:', err);
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  // 10. Update Hospital Bed Status
  const updateBedStatus = async (
    bedId: string,
    isOccupied: boolean,
    patientId?: string,
    patientName?: string,
    condition?: HospitalBed['condition']
  ): Promise<void> => {
    const updates: Partial<HospitalBed> = {
      isOccupied,
      patientId: isOccupied ? patientId : undefined,
      patientName: isOccupied ? patientName : undefined,
      condition: isOccupied ? condition || 'stable' : undefined,
      admissionDate: isOccupied ? new Date().toISOString().split('T')[0] : undefined
    };

    try {
      await updateDoc(doc(db, 'hospital_beds', bedId), updates);
    } catch (err) {
      console.warn('Update bed Firestore issue:', err);
    }
    setHospitalBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, ...updates } : b))
    );
  };

  // 11. Add Hospital Investment
  const addInvestment = async (data: Omit<HospitalInvestment, 'id' | 'createdAt'>): Promise<string> => {
    const id = `inv-${Date.now().toString().slice(-5)}`;
    const newInv: HospitalInvestment = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'hospital_investments', id), newInv);
    } catch (err) {
      console.warn('Investment Firestore write issue:', err);
    }
    setInvestments((prev) => [newInv, ...prev]);
    return id;
  };

  // 12. Update Investment Status
  const updateInvestmentStatus = async (id: string, status: HospitalInvestment['status'], notes?: string): Promise<void> => {
    const updates: Partial<HospitalInvestment> = { status, updatedAt: new Date().toISOString() };
    if (notes) updates.notes = notes;

    try {
      await updateDoc(doc(db, 'hospital_investments', id), updates);
    } catch (err) {
      console.warn('Update investment Firestore issue:', err);
    }
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  // 13. Add Pharmacy Item
  const addPharmacyItem = async (data: Omit<PharmacyItem, 'id' | 'lastRestocked'>): Promise<string> => {
    const id = `ph-${Date.now().toString().slice(-5)}`;
    const newItem: PharmacyItem = {
      ...data,
      id,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, 'pharmacy_inventory', id), newItem);
    } catch (err) {
      console.warn('Pharmacy item Firestore write issue:', err);
    }
    setPharmacyItems((prev) => [newItem, ...prev]);
    return id;
  };

  // 14. Update Pharmacy Stock Quantity
  const updatePharmacyStock = async (id: string, newQuantity: number): Promise<void> => {
    const updates = { stockQuantity: newQuantity, lastRestocked: new Date().toISOString().split('T')[0] };

    try {
      await updateDoc(doc(db, 'pharmacy_inventory', id), updates);
    } catch (err) {
      console.warn('Update pharmacy stock Firestore issue:', err);
    }
    setPharmacyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // 15. Dispense Medication to Patient
  const dispenseMedication = async (
    data: Omit<MedicationDispensation, 'id' | 'dispensedAt'>
  ): Promise<string> => {
    const id = `dsp-${Date.now().toString().slice(-5)}`;
    const newDispensation: MedicationDispensation = {
      ...data,
      id,
      dispensedAt: new Date().toISOString()
    };

    // Find drug item and auto-decrement stock
    const drug = pharmacyItems.find((p) => p.name === data.medicationName);
    if (drug) {
      const updatedStock = Math.max(0, drug.stockQuantity - data.quantity);
      await updatePharmacyStock(drug.id, updatedStock);
    }

    try {
      await setDoc(doc(db, 'pharmacy_dispensations', id), newDispensation);
    } catch (err) {
      console.warn('Dispensation write Firestore issue:', err);
    }
    setDispensations((prev) => [newDispensation, ...prev]);
    return id;
  };

  // 16. Add Staff Member
  const addStaffMember = async (data: Omit<StaffMember, 'id' | 'joinedDate'>): Promise<string> => {
    const id = `stf-${Date.now().toString().slice(-5)}`;
    const newStaff: StaffMember = {
      ...data,
      id,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, 'hospital_staff', id), newStaff);
    } catch (err) {
      console.warn('Staff write Firestore issue:', err);
    }
    setStaffMembers((prev) => [newStaff, ...prev]);
    return id;
  };

  // 17. Update Staff Status & Station
  const updateStaffStatus = async (
    id: string,
    status: StaffMember['status'],
    shift?: StaffMember['shift'],
    station?: string
  ): Promise<void> => {
    const updates: Partial<StaffMember> = { status };
    if (shift) updates.shift = shift;
    if (station) updates.currentStation = station;

    try {
      await updateDoc(doc(db, 'hospital_staff', id), updates);
    } catch (err) {
      console.warn('Update staff Firestore issue:', err);
    }
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // 18. Request Shift Swap
  const requestShiftSwap = async (
    data: Omit<ShiftSwapRequest, 'id' | 'requestId' | 'status' | 'createdAt'>
  ): Promise<string> => {
    const id = `swp-${Date.now().toString().slice(-5)}`;
    const requestId = `SWP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newSwap: ShiftSwapRequest = {
      ...data,
      id,
      requestId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'hospital_shift_swaps', id), newSwap);
    } catch (err) {
      console.warn('Shift swap Firestore write issue:', err);
    }
    setShiftSwaps((prev) => [newSwap, ...prev]);
    return id;
  };

  // 19. Update Shift Swap Status (and cross-exchange shifts if approved)
  const updateShiftSwapStatus = async (
    id: string,
    status: ShiftSwapStatus,
    reviewerName?: string,
    notes?: string
  ): Promise<void> => {
    const swap = shiftSwaps.find((s) => s.id === id);
    const now = new Date().toISOString();
    const updates: Partial<ShiftSwapRequest> = {
      status,
      reviewedBy: reviewerName || 'Clinical Administrator',
      reviewedAt: now
    };
    if (notes) updates.reviewerNotes = notes;

    try {
      await updateDoc(doc(db, 'hospital_shift_swaps', id), updates);
    } catch (err) {
      console.warn('Update shift swap Firestore issue:', err);
    }
    setShiftSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    // If approved, automatically swap the shifts of both clinicians
    if (status === 'approved' && swap) {
      const requestor = staffMembers.find((s) => s.staffId === swap.requestorStaffId || s.id === swap.requestorStaffId);
      const target = staffMembers.find((s) => s.staffId === swap.targetStaffId || s.id === swap.targetStaffId);

      if (requestor && target) {
        // Swap their shifts
        const requestorNewShift = swap.targetCurrentShift;
        const targetNewShift = swap.requestorCurrentShift;

        await updateStaffStatus(requestor.id, requestor.status, requestorNewShift);
        await updateStaffStatus(target.id, target.status, targetNewShift);
      }
    }
  };

  // 20. Create Hospital Invoice
  const createInvoice = async (
    data: Omit<HospitalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>
  ): Promise<string> => {
    const id = `inv-${Date.now().toString().slice(-5)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const subtotal = data.lineItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const totalAmount = Math.max(0, subtotal - discount + tax);
    const paidAmount = data.paidAmount || 0;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let calculatedStatus = data.status;
    if (paidAmount >= totalAmount && totalAmount > 0) {
      calculatedStatus = 'paid';
    } else if (paidAmount > 0) {
      calculatedStatus = 'partially_paid';
    }

    const newInvoice: HospitalInvoice = {
      ...data,
      id,
      invoiceNumber,
      subtotal,
      discount,
      tax,
      totalAmount,
      paidAmount,
      balanceDue,
      status: calculatedStatus,
      createdAt: now
    };

    try {
      await setDoc(doc(db, 'hospital_invoices', id), newInvoice);
    } catch (err) {
      console.warn('Invoice Firestore write issue:', err);
    }
    setInvoices((prev) => [newInvoice, ...prev]);
    return id;
  };

  // 21. Record Payment on Invoice
  const recordPayment = async (
    id: string,
    amount: number,
    method: PaymentMethod,
    reference?: string,
    notes?: string
  ): Promise<void> => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return;

    const newPaidAmount = (invoice.paidAmount || 0) + amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus: HospitalInvoice['status'] = newBalanceDue <= 0.01 ? 'paid' : 'partially_paid';
    const now = new Date().toISOString();

    const updates: Partial<HospitalInvoice> = {
      paidAmount: newPaidAmount,
      balanceDue: newBalanceDue,
      status: newStatus,
      paymentMethod: method,
      paymentReference: reference || `REC-${Date.now().toString().slice(-6)}`,
      paidAt: now
    };
    if (notes) {
      updates.notes = invoice.notes ? `${invoice.notes} | ${notes}` : notes;
    }

    try {
      await updateDoc(doc(db, 'hospital_invoices', id), updates);
    } catch (err) {
      console.warn('Update invoice payment Firestore issue:', err);
    }
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  // 22. Update Invoice Status (e.g. waived / cancelled / overdue)
  const updateInvoiceStatus = async (
    id: string,
    status: HospitalInvoice['status']
  ): Promise<void> => {
    const updates: Partial<HospitalInvoice> = { status };
    try {
      await updateDoc(doc(db, 'hospital_invoices', id), updates);
    } catch (err) {
      console.warn('Update invoice status Firestore issue:', err);
    }
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  // Reset demo records
  const resetToDefaultData = async () => {
    setPatients(INITIAL_PATIENTS);
    setHospitalBeds(INITIAL_BEDS);
    setTriageQueue(INITIAL_TRIAGE);
    setLabTests(INITIAL_LAB_TESTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setInvestments(INITIAL_INVESTMENTS);
    setPharmacyItems(INITIAL_PHARMACY);
    setStaffMembers(INITIAL_STAFF);
    setDispensations(INITIAL_DISPENSATIONS);
    setShiftSwaps(INITIAL_SHIFT_SWAPS);
    setInvoices(INITIAL_INVOICES);
  };

  return (
    <HospitalDataContext.Provider
      value={{
        patients,
        appointments,
        labTests,
        triageQueue,
        hospitalBeds,
        investments,
        pharmacyItems,
        dispensations,
        staffMembers,
        shiftSwaps,
        invoices,
        stats,
        loading,
        addPatient,
        updatePatient,
        addPatientVital,
        addTriageEntry,
        updateTriageStatus,
        addLabTest,
        updateLabResult,
        addAppointment,
        updateAppointmentStatus,
        updateBedStatus,
        addInvestment,
        updateInvestmentStatus,
        addPharmacyItem,
        updatePharmacyStock,
        dispenseMedication,
        addStaffMember,
        updateStaffStatus,
        requestShiftSwap,
        updateShiftSwapStatus,
        createInvoice,
        recordPayment,
        updateInvoiceStatus,
        resetToDefaultData
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
};

export function useHospitalData() {
  const context = useContext(HospitalDataContext);
  if (!context) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
}
