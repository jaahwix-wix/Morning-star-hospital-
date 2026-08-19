import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Patient,
  Appointment,
  LabTest,
  TriageEntry,
  HospitalBed,
  HospitalInvestment,
  PharmacyItem,
  MedicationDispensation,
  StaffMember,
  ShiftSwapRequest,
  HospitalInvoice
} from './types';

const app = initializeApp(firebaseConfig);

// CRITICAL: Connect to the exact databaseId specified in configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection confirmed.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or permissions pending.');
    }
    return false;
  }
}

// Initial seed data representing Morning Star Hospital (Sierra Leone + West Africa 24/7 care center)
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-101',
    patientId: 'MSH-2026-1001',
    fullName: 'Samuel Kamara',
    age: 44,
    gender: 'male',
    bloodGroup: 'O+',
    phone: '+232 76 412 889',
    emergencyContact: 'Aminata Kamara (Spouse)',
    emergencyPhone: '+232 78 554 112',
    address: '14 Wilkinson Road, Freetown',
    status: 'admitted',
    assignedDoctor: 'Dr. Alusine Koroma',
    wardNumber: 'ICU Ward',
    bedNumber: 'ICU-02',
    allergies: 'Penicillin, Sulfa drugs',
    chronicConditions: 'Hypertension, Type 2 Diabetes',
    diagnosis: 'Acute Coronary Syndrome, Hypertensive Crisis',
    admissionDate: '2026-08-18 14:30',
    notes: 'Continuous cardiac monitoring active. Oxygen therapy 3L/min.',
    registeredBy: 'system',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    vitals: [
      {
        id: 'v-1',
        timestamp: '2026-08-19 08:00',
        systolicBP: 142,
        diastolicBP: 88,
        heartRate: 84,
        spo2: 97,
        temperature: 37.1,
        respiratoryRate: 18,
        recordedBy: 'Nurse Fatmata Sesay'
      },
      {
        id: 'v-2',
        timestamp: '2026-08-19 12:00',
        systolicBP: 136,
        diastolicBP: 82,
        heartRate: 78,
        spo2: 98,
        temperature: 36.8,
        respiratoryRate: 16,
        recordedBy: 'Nurse Fatmata Sesay'
      }
    ]
  },
  {
    id: 'pat-102',
    patientId: 'MSH-2026-1002',
    fullName: 'Mariama Bangura',
    age: 28,
    gender: 'female',
    bloodGroup: 'B+',
    phone: '+232 79 338 901',
    emergencyContact: 'Mohamed Bangura (Brother)',
    emergencyPhone: '+232 77 122 344',
    address: '88 Circular Road, Freetown',
    status: 'admitted',
    assignedDoctor: 'Dr. Sia Kamara',
    wardNumber: 'Maternity Ward',
    bedNumber: 'MAT-04',
    allergies: 'None known',
    chronicConditions: 'None',
    diagnosis: 'Post-partum observation / Healthy delivery',
    admissionDate: '2026-08-18 22:15',
    notes: 'Stable post-partum vitals. Infant vitals normal, breastfeeding well.',
    registeredBy: 'system',
    createdAt: new Date(Date.now() - 64800000).toISOString(),
    updatedAt: new Date().toISOString(),
    vitals: [
      {
        id: 'v-3',
        timestamp: '2026-08-19 09:30',
        systolicBP: 118,
        diastolicBP: 74,
        heartRate: 72,
        spo2: 99,
        temperature: 36.7,
        respiratoryRate: 16,
        recordedBy: 'Nurse Fatmata Sesay'
      }
    ]
  },
  {
    id: 'pat-103',
    patientId: 'MSH-2026-1003',
    fullName: 'Mohamed Jalloh',
    age: 9,
    gender: 'male',
    bloodGroup: 'A+',
    phone: '+232 88 654 321',
    emergencyContact: 'Haja Jalloh (Mother)',
    emergencyPhone: '+232 88 654 321',
    address: '22 Lumley Beach Road, Freetown',
    status: 'admitted',
    assignedDoctor: 'Dr. Aminata Conteh',
    wardNumber: 'Pediatric Ward',
    bedNumber: 'PED-01',
    allergies: 'Peanuts',
    chronicConditions: 'Asthma (Mild)',
    diagnosis: 'Plasmodium Falciparum Malaria & Moderate Dehydration',
    admissionDate: '2026-08-19 03:45',
    notes: 'IV Artesunate commenced, oral rehydration therapy ongoing.',
    registeredBy: 'system',
    createdAt: new Date(Date.now() - 32400000).toISOString(),
    updatedAt: new Date().toISOString(),
    vitals: [
      {
        id: 'v-4',
        timestamp: '2026-08-19 10:00',
        systolicBP: 105,
        diastolicBP: 65,
        heartRate: 98,
        spo2: 98,
        temperature: 38.4,
        respiratoryRate: 22,
        recordedBy: 'Nurse Fatmata Sesay'
      }
    ]
  },
  {
    id: 'pat-104',
    patientId: 'MSH-2026-1004',
    fullName: 'Fatu Sesay',
    age: 52,
    gender: 'female',
    bloodGroup: 'O-',
    phone: '+232 73 998 123',
    emergencyContact: 'Alhaji Sesay (Husband)',
    emergencyPhone: '+232 73 998 124',
    address: '5 Spur Road, Freetown',
    status: 'emergency',
    assignedDoctor: 'Dr. Alusine Koroma',
    wardNumber: 'Emergency Care',
    bedNumber: 'EMR-01',
    allergies: 'Aspirin',
    chronicConditions: 'Asthma, Osteoarthritis',
    diagnosis: 'Acute Severe Asthma Exacerbation',
    admissionDate: '2026-08-19 09:10',
    notes: 'Nebulized Salbutamol + Ipratropium administered. SpO2 improving.',
    registeredBy: 'system',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pat-105',
    patientId: 'MSH-2026-1005',
    fullName: 'Ibrahim Bah',
    age: 36,
    gender: 'male',
    bloodGroup: 'AB+',
    phone: '+232 78 445 678',
    emergencyContact: 'Kadiatu Bah (Sister)',
    emergencyPhone: '+232 78 445 679',
    address: '17 Pademba Road, Freetown',
    status: 'outpatient',
    assignedDoctor: 'Dr. Mohamed Mansaray',
    allergies: 'None',
    diagnosis: 'Routine Medical Checkup & Lipid Profile Evaluation',
    registeredBy: 'system',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_BEDS: HospitalBed[] = [
  { id: 'bed-emr-01', ward: 'Emergency Ward', bedNumber: 'EMR-01', isOccupied: true, patientId: 'pat-104', patientName: 'Fatu Sesay', admissionDate: '2026-08-19', condition: 'critical', assignedNurse: 'Nurse Fatmata Sesay', oxygenSupport: true },
  { id: 'bed-emr-02', ward: 'Emergency Ward', bedNumber: 'EMR-02', isOccupied: false },
  { id: 'bed-emr-03', ward: 'Emergency Ward', bedNumber: 'EMR-03', isOccupied: false },
  { id: 'bed-icu-01', ward: 'ICU Ward', bedNumber: 'ICU-01', isOccupied: false },
  { id: 'bed-icu-02', ward: 'ICU Ward', bedNumber: 'ICU-02', isOccupied: true, patientId: 'pat-101', patientName: 'Samuel Kamara', admissionDate: '2026-08-18', condition: 'critical', assignedNurse: 'Nurse Fatmata Sesay', oxygenSupport: true },
  { id: 'bed-mat-01', ward: 'Maternity Ward', bedNumber: 'MAT-01', isOccupied: false },
  { id: 'bed-mat-02', ward: 'Maternity Ward', bedNumber: 'MAT-02', isOccupied: false },
  { id: 'bed-mat-04', ward: 'Maternity Ward', bedNumber: 'MAT-04', isOccupied: true, patientId: 'pat-102', patientName: 'Mariama Bangura', admissionDate: '2026-08-18', condition: 'stable', assignedNurse: 'Nurse Fatmata Sesay' },
  { id: 'bed-ped-01', ward: 'Pediatric Ward', bedNumber: 'PED-01', isOccupied: true, patientId: 'pat-103', patientName: 'Mohamed Jalloh', admissionDate: '2026-08-19', condition: 'improving', assignedNurse: 'Nurse Fatmata Sesay', oxygenSupport: false },
  { id: 'bed-ped-02', ward: 'Pediatric Ward', bedNumber: 'PED-02', isOccupied: false },
  { id: 'bed-gen-01', ward: 'General Male Ward', bedNumber: 'GEN-M1', isOccupied: false },
  { id: 'bed-gen-02', ward: 'General Male Ward', bedNumber: 'GEN-M2', isOccupied: false },
  { id: 'bed-gen-03', ward: 'General Female Ward', bedNumber: 'GEN-F1', isOccupied: false },
  { id: 'bed-gen-04', ward: 'General Female Ward', bedNumber: 'GEN-F2', isOccupied: false }
];

export const INITIAL_TRIAGE: TriageEntry[] = [
  {
    id: 'trg-001',
    patientName: 'Fatu Sesay',
    age: 52,
    gender: 'female',
    priority: 'P1_Immediate',
    chiefComplaint: 'Severe breathlessness, wheezing, SpO2 88% on room air',
    systolicBP: 158,
    diastolicBP: 96,
    heartRate: 118,
    spo2: 89,
    temperature: 37.4,
    respiratoryRate: 28,
    painScale: 6,
    status: 'attending',
    bedAssigned: 'EMR-01',
    nurseInCharge: 'Nurse Fatmata Sesay',
    attendingDoctor: 'Dr. Alusine Koroma',
    arrivedAt: '2026-08-19 09:10',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'trg-002',
    patientName: 'Kallon Turay',
    age: 23,
    gender: 'male',
    priority: 'P2_Urgent',
    chiefComplaint: 'Motorbike laceration on right forearm, deep wound with active bleeding, severe pain',
    systolicBP: 130,
    diastolicBP: 80,
    heartRate: 92,
    spo2: 99,
    temperature: 36.6,
    respiratoryRate: 18,
    painScale: 8,
    status: 'waiting',
    nurseInCharge: 'Nurse Fatmata Sesay',
    arrivedAt: '2026-08-19 10:45',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'trg-003',
    patientName: 'Isata Mansaray',
    age: 31,
    gender: 'female',
    priority: 'P3_Delayed',
    chiefComplaint: 'High spiking fever (39.1°C), chills, severe joint and back pain for 3 days',
    systolicBP: 110,
    diastolicBP: 70,
    heartRate: 96,
    spo2: 98,
    temperature: 39.1,
    respiratoryRate: 19,
    painScale: 5,
    status: 'waiting',
    nurseInCharge: 'Nurse Fatmata Sesay',
    arrivedAt: '2026-08-19 11:15',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_LAB_TESTS: LabTest[] = [
  {
    id: 'lab-201',
    patientId: 'pat-103',
    patientName: 'Mohamed Jalloh',
    patientAge: 9,
    testName: 'Malaria Rapid Diagnostic (Pf-HRP2) & Blood Film',
    category: 'Parasitology',
    status: 'completed',
    orderedBy: 'Dr. Aminata Conteh',
    performedBy: 'Sister Mariama Bah (Lead Lab Scientist)',
    resultValue: 'POSITIVE (+++) Plasmodium Falciparum trophozoites seen (12,400 parasites/µL)',
    normalRange: 'Negative / No parasites',
    unit: 'parasites/µL',
    interpretation: 'Active High-density P. falciparum Malaria infection requiring intravenous therapy.',
    isAbnormal: true,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    completedAt: new Date(Date.now() - 25200000).toISOString()
  },
  {
    id: 'lab-202',
    patientId: 'pat-101',
    patientName: 'Samuel Kamara',
    patientAge: 44,
    testName: 'Cardiac Troponin I & CK-MB Panel',
    category: 'Biochemistry',
    status: 'completed',
    orderedBy: 'Dr. Alusine Koroma',
    performedBy: 'Sister Mariama Bah (Lead Lab Scientist)',
    resultValue: 'Troponin I: 2.84 ng/mL (High Elevated)',
    normalRange: '< 0.04 ng/mL',
    unit: 'ng/mL',
    interpretation: 'Marked myocardial injury indicative of Acute Coronary Syndrome.',
    isAbnormal: true,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 54000000).toISOString(),
    completedAt: new Date(Date.now() - 50400000).toISOString()
  },
  {
    id: 'lab-203',
    patientId: 'pat-105',
    patientName: 'Ibrahim Bah',
    patientAge: 36,
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    status: 'completed',
    orderedBy: 'Dr. Mohamed Mansaray',
    performedBy: 'Sister Mariama Bah (Lead Lab Scientist)',
    resultValue: 'WBC: 6.8 x10^9/L, Hb: 14.5 g/dL, Platelets: 240 x10^9/L',
    normalRange: 'Hb: 13.5-17.5 g/dL, WBC: 4.5-11.0 x10^9/L',
    unit: 'g/dL',
    interpretation: 'Hematological parameters are within normal physiological limits.',
    isAbnormal: false,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 82800000).toISOString()
  },
  {
    id: 'lab-204',
    patientId: 'pat-104',
    patientName: 'Fatu Sesay',
    patientAge: 52,
    testName: 'Arterial Blood Gas (ABG) & Serum Electrolytes',
    category: 'Biochemistry',
    status: 'processing',
    orderedBy: 'Dr. Alusine Koroma',
    performedBy: 'Sister Mariama Bah',
    resultValue: 'Analysis in progress on AVL 9180 Analyzer',
    normalRange: 'pH 7.35-7.45, PaO2 80-100 mmHg',
    interpretation: 'Processing stat sample...',
    isAbnormal: false,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'lab-205',
    patientName: 'Isata Mansaray',
    patientAge: 31,
    testName: 'Widal Agglutination & Typhoid Rapid IgM/IgG',
    category: 'Microbiology',
    status: 'pending',
    orderedBy: 'Dr. Alusine Koroma',
    interpretation: 'Sample received in diagnostic lab; queued for slide titration.',
    isAbnormal: false,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-301',
    patientId: 'pat-105',
    patientName: 'Ibrahim Bah',
    patientPhone: '+232 78 445 678',
    doctorName: 'Dr. Mohamed Mansaray',
    department: 'Internal Medicine',
    date: '2026-08-19',
    timeSlot: '14:00 - 14:30',
    reason: 'Review of lipid profile and cardiovascular preventative guidance',
    triagePriority: 'standard',
    status: 'scheduled',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'apt-302',
    patientName: 'Grace Bangura',
    patientPhone: '+232 76 991 223',
    doctorName: 'Dr. Sia Kamara',
    department: 'Obstetrics & Gynecology',
    date: '2026-08-19',
    timeSlot: '15:00 - 15:30',
    reason: 'Third-trimester antenatal routine ultrasound & fetal monitoring',
    triagePriority: 'standard',
    status: 'scheduled',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 'apt-303',
    patientName: 'Abu Bakarr Kargbo',
    patientPhone: '+232 77 400 119',
    doctorName: 'Dr. Alusine Koroma',
    department: 'General Surgery & Trauma',
    date: '2026-08-19',
    timeSlot: '16:00 - 16:30',
    reason: 'Pre-operative evaluation for inguinal hernia repair',
    triagePriority: 'urgent',
    status: 'scheduled',
    createdBy: 'system',
    createdAt: new Date(Date.now() - 18000000).toISOString()
  }
];

export const INITIAL_INVESTMENTS: HospitalInvestment[] = [
  {
    id: 'inv-001',
    title: '1.5T Superconducting MRI & CT Diagnostic Imaging Suite',
    category: 'Medical Equipment',
    amount: 480000,
    currency: 'USD',
    fundingSource: 'MOH Equity Grant',
    status: 'deployed',
    roiProjection: '3.4 Years (Expected 42 scans/week)',
    expectedLifespan: '10 Years',
    purchaseDate: '2025-11-10',
    departmentBeneficiary: 'Diagnostic Radiology & Trauma Surgery',
    procurementLead: 'Dr. Alusine Koroma (CMO)',
    operationalImpact: 'Enables rapid zero-wait cranial trauma evaluation and spinal diagnostics in-country without overseas referrals.',
    notes: 'Under active Siemens warranty with 6-month preventive servicing agreement.',
    createdAt: '2025-11-10T10:00:00Z'
  },
  {
    id: 'inv-002',
    title: '120kVA Solar Hybrid Microgrid & ICU Battery Inverter Bank',
    category: 'Infrastructure & Energy',
    amount: 145000,
    currency: 'USD',
    fundingSource: 'Donor Funding',
    status: 'deployed',
    roiProjection: '2.1 Years ($3,800/mo diesel savings)',
    expectedLifespan: '15 Years',
    purchaseDate: '2026-01-15',
    departmentBeneficiary: '24/7 Hospital Infrastructure & Operating Theatres',
    procurementLead: 'Eng. Abu Kargbo (Biomed Lead)',
    operationalImpact: 'Guarantees uninterrupted 24/7 power to ventilators, incubators, cold-chain vaccines, and operating suites.',
    notes: 'Lithium iron phosphate (LiFePO4) storage bank with smart automatic grid handover.',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'inv-003',
    title: 'On-Site Medical Oxygen PSA Generation & Piping Plant',
    category: 'Infrastructure & Energy',
    amount: 92000,
    currency: 'USD',
    fundingSource: 'Retained Earnings',
    status: 'deployed',
    roiProjection: '1.8 Years (Direct cylinder purchase elimination)',
    expectedLifespan: '12 Years',
    purchaseDate: '2026-03-20',
    departmentBeneficiary: 'Emergency Resuscitation & ICU Wards',
    procurementLead: 'Dr. Alusine Koroma',
    operationalImpact: 'Produces 30 Nm3/hr of 95% pure medical grade oxygen piped directly to all 14 acute ward beds.',
    notes: 'Emergency 40-cylinder backup manifold fully primed.',
    createdAt: '2026-03-20T11:30:00Z'
  },
  {
    id: 'inv-004',
    title: '2x Mercedes Sprinter Advanced Cardiac Life Support (ACLS) Ambulances',
    category: 'Ambulance & Logistics',
    amount: 175000,
    currency: 'USD',
    fundingSource: 'Private Health Capital',
    status: 'deployed',
    roiProjection: '4.0 Years (Regional rapid dispatch subscription)',
    expectedLifespan: '8 Years',
    purchaseDate: '2026-04-05',
    departmentBeneficiary: '24/7 Emergency Dispatch & Trauma Response',
    procurementLead: 'Nurse Fatmata Sesay (Lead Triage)',
    operationalImpact: 'Equipped with Zoll Defibrillators, transport ventilators, telemedicine telemetry, and GPS emergency tracking.',
    notes: 'Stationed at Spur Road and Lumley dispatch nodes.',
    createdAt: '2026-04-05T08:00:00Z'
  },
  {
    id: 'inv-005',
    title: 'Maternal-Fetal Telemetric Ultrasound & HD Laparoscopic Tower',
    category: 'Medical Equipment',
    amount: 68000,
    currency: 'USD',
    fundingSource: 'Retained Earnings',
    status: 'approved',
    roiProjection: '2.5 Years (Expanding minimally invasive surgical volume)',
    expectedLifespan: '7 Years',
    departmentBeneficiary: 'Obstetrics, Gynecology & General Surgery',
    procurementLead: 'Dr. Sia Kamara',
    operationalImpact: 'Reduces post-op hospital stay from 6 days to 24 hours for elective appendectomies and gynecological procedures.',
    notes: 'Purchase order issued to Karl Storz; delivery expected in Q4 2026.',
    createdAt: '2026-07-01T14:00:00Z'
  },
  {
    id: 'inv-006',
    title: 'Automated Hospital EMR Server Cluster & AI Diagnostic Nodes',
    category: 'Digital Health & IT',
    amount: 38000,
    currency: 'USD',
    fundingSource: 'Retained Earnings',
    status: 'deployed',
    roiProjection: 'Immediate (Zero paper loss, instantaneous lab sync)',
    expectedLifespan: '5 Years',
    purchaseDate: '2026-06-12',
    departmentBeneficiary: 'All Clinical & Administrative Departments',
    procurementLead: 'Sister Mariama Bah',
    operationalImpact: 'Powers real-time clinical triage, automated drug dosage cross-referencing, and patient portal records.',
    notes: 'Encrypted Firestore database sync with automated offsite snapshots.',
    createdAt: '2026-06-12T16:00:00Z'
  }
];

export const INITIAL_PHARMACY: PharmacyItem[] = [
  {
    id: 'ph-001',
    name: 'Artesunate 60mg for Injection',
    genericName: 'Artesunate',
    category: 'Antimalarials',
    dosageForm: 'Injection/Vial',
    batchNumber: 'ART-2026-88',
    stockQuantity: 240,
    minThreshold: 50,
    unitPrice: 4.5,
    currency: 'USD',
    expiryDate: '2027-11-30',
    manufacturer: 'Guilin Pharmaceutical Co.',
    storageLocation: 'Emergency Crash Cart & Central Pharmacy Rack A1',
    lastRestocked: '2026-08-10',
    requiresPrescription: true
  },
  {
    id: 'ph-002',
    name: 'Ceftriaxone Sodium 1g Vial',
    genericName: 'Ceftriaxone',
    category: 'Antibiotics',
    dosageForm: 'Injection/Vial',
    batchNumber: 'CTX-2026-04',
    stockQuantity: 180,
    minThreshold: 40,
    unitPrice: 3.2,
    currency: 'USD',
    expiryDate: '2027-09-15',
    manufacturer: 'Sandoz Pharmaceuticals',
    storageLocation: 'Antibiotics Vault Shelf B3',
    lastRestocked: '2026-08-05',
    requiresPrescription: true
  },
  {
    id: 'ph-003',
    name: 'Artemether + Lumefantrine 20/120mg (Coartem)',
    genericName: 'Artemether / Lumefantrine',
    category: 'Antimalarials',
    dosageForm: 'Tablets',
    batchNumber: 'AL-9021',
    stockQuantity: 420,
    minThreshold: 100,
    unitPrice: 2.0,
    currency: 'USD',
    expiryDate: '2028-02-28',
    manufacturer: 'Novartis Pharma',
    storageLocation: 'Main Dispensary Shelf C1',
    lastRestocked: '2026-08-14',
    requiresPrescription: true
  },
  {
    id: 'ph-004',
    name: 'Paracetamol IV Infusion 10mg/ml (100ml)',
    genericName: 'Acetaminophen / Paracetamol',
    category: 'Analgesics & Pain',
    dosageForm: 'IV Infusion',
    batchNumber: 'PCM-IV-55',
    stockQuantity: 85,
    minThreshold: 30,
    unitPrice: 1.8,
    currency: 'USD',
    expiryDate: '2027-06-30',
    manufacturer: 'B. Braun Medical',
    storageLocation: 'Inpatient Fluid Bay 2',
    lastRestocked: '2026-07-28',
    requiresPrescription: false
  },
  {
    id: 'ph-005',
    name: 'Ringer Lactate Infusion Solution 500ml',
    genericName: 'Sodium Lactate Compound',
    category: 'IV Fluids & Electrolytes',
    dosageForm: 'IV Infusion',
    batchNumber: 'RL-500-19',
    stockQuantity: 190,
    minThreshold: 60,
    unitPrice: 1.2,
    currency: 'USD',
    expiryDate: '2028-04-30',
    manufacturer: 'Fresenius Kabi',
    storageLocation: 'IV Hydration Stack D1',
    lastRestocked: '2026-08-01',
    requiresPrescription: true
  },
  {
    id: 'ph-006',
    name: 'Salbutamol Respirator Solution 5mg/ml (20ml)',
    genericName: 'Albuterol / Salbutamol',
    category: 'Emergency & Resuscitation',
    dosageForm: 'Topical/Inhaler',
    batchNumber: 'SAL-NEB-02',
    stockQuantity: 18, // Low Stock Alert
    minThreshold: 25,
    unitPrice: 5.5,
    currency: 'USD',
    expiryDate: '2027-03-31',
    manufacturer: 'GlaxoSmithKline (GSK)',
    storageLocation: 'Emergency Triage Nebulizer Station',
    lastRestocked: '2026-06-15',
    requiresPrescription: true
  },
  {
    id: 'ph-007',
    name: 'Adrenaline (Epinephrine) 1:1000 Ampoules 1mg/ml',
    genericName: 'Epinephrine Hydrochloride',
    category: 'Emergency & Resuscitation',
    dosageForm: 'Injection/Vial',
    batchNumber: 'EPI-STAT-99',
    stockQuantity: 45,
    minThreshold: 20,
    unitPrice: 2.5,
    currency: 'USD',
    expiryDate: '2026-12-31', // Approaching Expiry
    manufacturer: 'Pfizer Injectables',
    storageLocation: 'Emergency Resuscitation Tray A (Light-Protected)',
    lastRestocked: '2026-05-10',
    requiresPrescription: true
  },
  {
    id: 'ph-008',
    name: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)',
    genericName: 'Co-Amoxiclav',
    category: 'Antibiotics',
    dosageForm: 'Tablets',
    batchNumber: 'AUG-625-77',
    stockQuantity: 310,
    minThreshold: 75,
    unitPrice: 6.0,
    currency: 'USD',
    expiryDate: '2027-10-30',
    manufacturer: 'GSK Pharmaceuticals',
    storageLocation: 'Main Dispensary Shelf B1',
    lastRestocked: '2026-08-08',
    requiresPrescription: true
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf-001',
    staffId: 'MSH-STF-001',
    fullName: 'Dr. Alusine Koroma',
    role: 'Chief Medical Officer',
    department: 'Executive Clinical Leadership & Trauma Surgery',
    specialty: 'Trauma & General Surgery',
    shift: '24h On-Call Emergency',
    status: 'on_duty',
    phone: '+232 76 400 120',
    email: 'dr.koroma@morningstarhospital.sl',
    licenseNumber: 'SL-MDC-2012-0488',
    joinedDate: '2018-03-01',
    currentStation: 'Emergency Trauma Theatre 1'
  },
  {
    id: 'stf-002',
    staffId: 'MSH-STF-002',
    fullName: 'Dr. Sia Kamara',
    role: 'Consultant Physician',
    department: 'Obstetrics & Maternal-Fetal Medicine',
    specialty: 'Obstetrics & High-Risk Pregnancy',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 78 512 349',
    email: 'dr.kamara@morningstarhospital.sl',
    licenseNumber: 'SL-MDC-2015-0912',
    joinedDate: '2020-07-15',
    currentStation: 'Maternity Ward & Delivery Suite'
  },
  {
    id: 'stf-003',
    staffId: 'MSH-STF-003',
    fullName: 'Dr. Aminata Conteh',
    role: 'Consultant Physician',
    department: 'Pediatrics & Child Survival Center',
    specialty: 'Pediatric Intensive Care & Infectious Diseases',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 77 622 189',
    email: 'dr.conteh@morningstarhospital.sl',
    licenseNumber: 'SL-MDC-2017-1240',
    joinedDate: '2021-02-10',
    currentStation: 'Pediatric High Dependency Unit'
  },
  {
    id: 'stf-004',
    staffId: 'MSH-STF-004',
    fullName: 'Nurse Fatmata Sesay',
    role: 'Triage Nurse',
    department: '24/7 Emergency Triage & Acute Trauma',
    specialty: 'Advanced Emergency Nursing & Manchester Triage',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 73 929 145',
    email: 'nurse.sesay@morningstarhospital.sl',
    licenseNumber: 'SL-NMC-2016-3021',
    joinedDate: '2019-09-01',
    currentStation: 'Triage Desk & Resuscitation Bay'
  },
  {
    id: 'stf-005',
    staffId: 'MSH-STF-005',
    fullName: 'Sister Mariama Bah',
    role: 'Lead Lab Scientist',
    department: 'Pathology & Diagnostic Laboratory',
    specialty: 'Clinical Biochemistry & Parasitology',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 88 333 444',
    email: 'mariama.bah@morningstarhospital.sl',
    licenseNumber: 'SL-MLS-2014-0199',
    joinedDate: '2019-01-15',
    currentStation: 'Central Diagnostic Laboratory'
  },
  {
    id: 'stf-006',
    staffId: 'MSH-STF-006',
    fullName: 'Moses Fornah, BPharm',
    role: 'Chief Pharmacist',
    department: 'Clinical Pharmacy & Cold Chain Dispensary',
    specialty: 'Antimicrobial Stewardship & Critical Care Pharmacology',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 79 111 890',
    email: 'pharmacy@morningstarhospital.sl',
    licenseNumber: 'SL-PBS-2018-0552',
    joinedDate: '2022-04-01',
    currentStation: 'Main Dispensary & Pharmacy Vault'
  },
  {
    id: 'stf-007',
    staffId: 'MSH-STF-007',
    fullName: 'Dr. Mohamed Mansaray',
    role: 'General Medical Officer',
    department: 'Internal Medicine & Outpatient Clinic',
    specialty: 'Cardiometabolic & Chronic Disease Care',
    shift: 'Evening Shift (16:00 - 00:00)',
    status: 'on_call',
    phone: '+232 76 889 001',
    email: 'dr.mansaray@morningstarhospital.sl',
    licenseNumber: 'SL-MDC-2019-1402',
    joinedDate: '2023-01-10',
    currentStation: 'Consultation Suite 2'
  },
  {
    id: 'stf-008',
    staffId: 'MSH-STF-008',
    fullName: 'Eng. Abu Kargbo',
    role: 'Biomedical Engineer',
    department: 'Hospital Technology & Medical Equipment',
    specialty: 'Clinical Gas Systems, Solar Microgrid & Imaging Tech',
    shift: 'Day Shift (08:00 - 16:00)',
    status: 'on_duty',
    phone: '+232 77 400 992',
    email: 'tech@morningstarhospital.sl',
    licenseNumber: 'SL-ENG-2016-081',
    joinedDate: '2020-11-01',
    currentStation: 'Oxygen PSA Plant & Solar Control Room'
  }
];

export const INITIAL_DISPENSATIONS: MedicationDispensation[] = [
  {
    id: 'dsp-001',
    patientId: 'pat-103',
    patientName: 'Mohamed Jalloh',
    medicationName: 'Artesunate 60mg for Injection',
    quantity: 3,
    prescribedBy: 'Dr. Aminata Conteh',
    dispensedBy: 'Moses Fornah, BPharm',
    dispensedAt: '2026-08-19 04:00',
    instructions: 'Reconstitute with 5% sodium bicarbonate. Administer 2.4mg/kg IV at 0, 12, 24 hours.',
    totalCost: 13.5
  },
  {
    id: 'dsp-002',
    patientId: 'pat-104',
    patientName: 'Fatu Sesay',
    medicationName: 'Salbutamol Respirator Solution 5mg/ml',
    quantity: 1,
    prescribedBy: 'Dr. Alusine Koroma',
    dispensedBy: 'Moses Fornah, BPharm',
    dispensedAt: '2026-08-19 09:20',
    instructions: '2.5mg in 3ml Normal Saline via jet nebulizer with 6L/min Oxygen every 20 mins x 3 doses.',
    totalCost: 5.5
  }
];

export const INITIAL_SHIFT_SWAPS: ShiftSwapRequest[] = [
  {
    id: 'swp-001',
    requestId: 'SWP-2026-101',
    requestorStaffId: 'MSH-STF-104',
    requestorName: 'Isata Bangura, RN',
    requestorRole: 'Triage Nurse',
    requestorCurrentShift: 'Night Shift (00:00 - 08:00)',
    targetStaffId: 'MSH-STF-105',
    targetStaffName: 'Kadiatu Sesay, RN',
    targetCurrentShift: 'Day Shift (08:00 - 16:00)',
    targetRole: 'Registered Nurse',
    shiftDate: '2026-08-20',
    reason: 'Attending West Africa College of Nursing pediatric resuscitation CME workshop in Freetown.',
    urgency: 'routine',
    status: 'pending',
    createdAt: '2026-08-19 10:15'
  },
  {
    id: 'swp-002',
    requestId: 'SWP-2026-102',
    requestorStaffId: 'MSH-STF-102',
    requestorName: 'Dr. Alusine Koroma',
    requestorRole: 'Consultant Physician',
    requestorCurrentShift: 'Evening Shift (16:00 - 00:00)',
    targetStaffId: 'MSH-STF-101',
    targetStaffName: 'Dr. Aminata Conteh',
    targetCurrentShift: 'Day Shift (08:00 - 16:00)',
    targetRole: 'Chief Medical Officer',
    shiftDate: '2026-08-19',
    reason: 'Emergency on-call coverage requested for critical pediatric asthma admissions in ICU.',
    urgency: 'urgent',
    status: 'approved',
    reviewedBy: 'Dr. Aminata Conteh (CMO)',
    reviewedAt: '2026-08-19 11:30',
    reviewerNotes: 'Approved. Cross-coverage confirmed with Emergency Triage charge nurse.',
    createdAt: '2026-08-19 08:45'
  },
  {
    id: 'swp-003',
    requestId: 'SWP-2026-103',
    requestorStaffId: 'MSH-STF-103',
    requestorName: 'Dr. Foday Mansaray',
    requestorRole: 'Emergency Surgeon',
    requestorCurrentShift: '24h On-Call Emergency',
    targetStaffId: 'MSH-STF-102',
    targetStaffName: 'Dr. Alusine Koroma',
    targetCurrentShift: 'Day Shift (08:00 - 16:00)',
    targetRole: 'Consultant Physician',
    shiftDate: '2026-08-21',
    reason: 'Scheduled laparoscopy surgical rotation duty at regional trauma theatre.',
    urgency: 'routine',
    status: 'pending',
    createdAt: '2026-08-19 11:00'
  }
];

export const INITIAL_INVOICES: HospitalInvoice[] = [
  {
    id: 'inv-8801',
    invoiceNumber: 'INV-2026-8801',
    patientId: 'pat-103',
    patientName: 'Mohamed Jalloh',
    patientPhone: '+232 78 445566',
    appointmentId: 'apt-002',
    dispensationId: 'dsp-001',
    labTestId: 'lab-001',
    issueDate: '2026-08-19',
    issuedDate: '2026-08-19',
    dueDate: '2026-08-26',
    lineItems: [
      {
        id: 'li-1',
        description: 'Emergency Physician Consultation (Severe Malaria)',
        category: 'consultation',
        itemType: 'consultation',
        quantity: 1,
        unitPrice: 15.0,
        totalPrice: 15.0,
        referenceId: 'apt-002'
      },
      {
        id: 'li-2',
        description: 'Rapid Diagnostic Test (RDT) Malaria Pf/Pv & Parasite Density',
        category: 'lab_test',
        itemType: 'lab_test',
        quantity: 1,
        unitPrice: 8.5,
        totalPrice: 8.5,
        referenceId: 'lab-001'
      },
      {
        id: 'li-3',
        description: 'Artesunate 60mg for Injection (3 vials)',
        category: 'medication',
        itemType: 'medication',
        quantity: 3,
        unitPrice: 4.5,
        totalPrice: 13.5,
        referenceId: 'dsp-001'
      },
      {
        id: 'li-4',
        description: 'Inpatient Isolation Bed Day 1 (Infectious Ward)',
        category: 'ward_stay',
        itemType: 'ward_stay',
        quantity: 1,
        unitPrice: 12.0,
        totalPrice: 12.0
      }
    ],
    subtotal: 49.0,
    discount: 5.0,
    tax: 0.0,
    totalAmount: 44.0,
    paidAmount: 44.0,
    balanceDue: 0.0,
    status: 'paid',
    paymentMethod: 'Mobile Money (Orange/Africell)',
    paymentReference: 'OM-TXN-994821',
    paidAt: '2026-08-19 06:30',
    notes: 'Paid via Orange Money. Receipt issued.',
    createdBy: 'Moses Fornah (Pharmacy / Billing)',
    createdAt: '2026-08-19 04:15'
  },
  {
    id: 'inv-8802',
    invoiceNumber: 'INV-2026-8802',
    patientId: 'pat-104',
    patientName: 'Fatu Sesay',
    patientPhone: '+232 33 667788',
    appointmentId: 'apt-003',
    dispensationId: 'dsp-002',
    issueDate: '2026-08-19',
    issuedDate: '2026-08-19',
    dueDate: '2026-08-24',
    lineItems: [
      {
        id: 'li-1',
        description: 'Pediatric Specialist Consultation (Acute Bronchospasm)',
        category: 'consultation',
        itemType: 'consultation',
        quantity: 1,
        unitPrice: 18.0,
        totalPrice: 18.0,
        referenceId: 'apt-003'
      },
      {
        id: 'li-2',
        description: 'Salbutamol Respirator Solution 5mg/ml + Jet Nebulization',
        category: 'medication',
        itemType: 'medication',
        quantity: 1,
        unitPrice: 5.5,
        totalPrice: 5.5,
        referenceId: 'dsp-002'
      },
      {
        id: 'li-3',
        description: 'Medical Oxygen PSA Therapy (3 hours at 6L/min)',
        category: 'procedure',
        itemType: 'procedure',
        quantity: 3,
        unitPrice: 4.0,
        totalPrice: 12.0
      }
    ],
    subtotal: 35.5,
    discount: 0.0,
    tax: 0.0,
    totalAmount: 35.5,
    paidAmount: 20.0,
    balanceDue: 15.5,
    status: 'partially_paid',
    paymentMethod: 'Cash',
    paymentReference: 'CSH-REC-1044',
    paidAt: '2026-08-19 10:00',
    notes: 'Initial cash deposit of $20.00 received. Balance due upon discharge.',
    createdBy: 'Finance Officer Sia Mansaray',
    createdAt: '2026-08-19 09:30'
  },
  {
    id: 'inv-8803',
    invoiceNumber: 'INV-2026-8803',
    patientId: 'pat-101',
    patientName: 'Samuel Kamara',
    patientPhone: '+232 76 123456',
    appointmentId: 'apt-001',
    labTestId: 'lab-002',
    issueDate: '2026-08-19',
    issuedDate: '2026-08-19',
    dueDate: '2026-08-25',
    lineItems: [
      {
        id: 'li-1',
        description: 'Internal Medicine Consultation (Cardiovascular & Hypertensive Review)',
        category: 'consultation',
        itemType: 'consultation',
        quantity: 1,
        unitPrice: 20.0,
        totalPrice: 20.0,
        referenceId: 'apt-001'
      },
      {
        id: 'li-2',
        description: 'Full Blood Count (FBC) with 5-Part Differential',
        category: 'lab_test',
        itemType: 'lab_test',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
        referenceId: 'lab-002'
      },
      {
        id: 'li-3',
        description: 'Renal & Electrolyte Profile (Electrolytes, Urea, Creatinine)',
        category: 'lab_test',
        itemType: 'lab_test',
        quantity: 1,
        unitPrice: 14.0,
        totalPrice: 14.0
      }
    ],
    subtotal: 44.0,
    discount: 0.0,
    tax: 0.0,
    totalAmount: 44.0,
    paidAmount: 0.0,
    balanceDue: 44.0,
    status: 'pending',
    notes: 'Pending cashier settlement before morning clinic checkout.',
    createdBy: 'Finance Officer Sia Mansaray',
    createdAt: '2026-08-19 10:45'
  }
];

// Seeder function that synchronizes initial records if the database is fresh
export async function seedInitialHospitalDataIfEmpty() {
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    if (patientsSnap.empty) {
      console.log('Seeding initial Morning Star Hospital records into Firestore...');
      const batch = writeBatch(db);

      for (const p of INITIAL_PATIENTS) {
        batch.set(doc(db, 'patients', p.id), p);
      }
      for (const b of INITIAL_BEDS) {
        batch.set(doc(db, 'hospital_beds', b.id), b);
      }
      for (const t of INITIAL_TRIAGE) {
        batch.set(doc(db, 'triage_queue', t.id), t);
      }
      for (const l of INITIAL_LAB_TESTS) {
        batch.set(doc(db, 'lab_tests', l.id), l);
      }
      for (const a of INITIAL_APPOINTMENTS) {
        batch.set(doc(db, 'appointments', a.id), a);
      }
      for (const inv of INITIAL_INVESTMENTS) {
        batch.set(doc(db, 'hospital_investments', inv.id), inv);
      }
      for (const ph of INITIAL_PHARMACY) {
        batch.set(doc(db, 'pharmacy_inventory', ph.id), ph);
      }
      for (const stf of INITIAL_STAFF) {
        batch.set(doc(db, 'hospital_staff', stf.id), stf);
      }
      for (const dsp of INITIAL_DISPENSATIONS) {
        batch.set(doc(db, 'pharmacy_dispensations', dsp.id), dsp);
      }
      for (const swp of INITIAL_SHIFT_SWAPS) {
        batch.set(doc(db, 'hospital_shift_swaps', swp.id), swp);
      }
      for (const inv of INITIAL_INVOICES) {
        batch.set(doc(db, 'hospital_invoices', inv.id), inv);
      }

      await batch.commit();
      console.log('Morning Star Hospital records seeded successfully!');
    }
  } catch (err) {
    console.warn('Seeder skipped or restricted by rules:', err);
  }
}
