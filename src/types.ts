export type UserRole = 'admin' | 'doctor' | 'nurse' | 'lab_tech' | 'patient';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PatientStatus = 'admitted' | 'outpatient' | 'emergency' | 'discharged';
export type Gender = 'male' | 'female' | 'other';
export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export interface PatientVital {
  id: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  spo2: number;
  temperature: number; // in Celsius
  respiratoryRate: number;
  recordedBy: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. MSH-2026-1001
  fullName: string;
  age: number;
  gender: Gender;
  bloodGroup: string | BloodGroup;
  phone: string;
  emergencyContact: string;
  emergencyPhone?: string;
  address: string;
  status: PatientStatus;
  assignedDoctor: string;
  wardNumber?: string;
  bedNumber?: string;
  allergies?: string;
  chronicConditions?: string;
  diagnosis?: string;
  admissionDate?: string;
  dischargeDate?: string;
  vitals?: PatientVital[];
  notes?: string;
  registeredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TriagePriority = 'P1_Immediate' | 'P2_Urgent' | 'P3_Delayed' | 'P4_Minor';
export type TriageStatus = 'waiting' | 'attending' | 'transferred_ward' | 'discharged';

export interface TriageEntry {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  priority: TriagePriority;
  chiefComplaint: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  painScale?: number; // 1-10
  status: TriageStatus;
  bedAssigned?: string;
  nurseInCharge?: string;
  attendingDoctor?: string;
  triageNotes?: string;
  arrivedAt: string;
  createdBy?: string;
  createdAt: string;
}

export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TriageUrgency = 'critical' | 'urgent' | 'standard';
export type DoctorSpecialty =
  | 'General Medicine'
  | 'Emergency & Trauma Surgery'
  | 'Pediatrics & Child Health'
  | 'Obstetrics & Gynecology'
  | 'Clinical Pathology & Laboratory'
  | 'Internal Medicine & Cardiology';

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  department?: string;
  specialty?: DoctorSpecialty | string;
  date?: string;
  appointmentDate?: string;
  timeSlot?: string;
  appointmentTime?: string;
  reason: string;
  triagePriority?: TriageUrgency;
  status: AppointmentStatus;
  notes?: string;
  prescription?: string;
  createdBy?: string;
  createdAt: string;
}

export type LabCategory = 'Hematology' | 'Parasitology' | 'Biochemistry' | 'Microbiology' | 'Imaging' | 'Urinalysis';
export type LabStatus = 'pending' | 'processing' | 'completed' | 'critical_flag';

export interface LabTest {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: number;
  testName: string;
  category: LabCategory;
  status: LabStatus;
  orderedBy: string;
  performedBy?: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  interpretation?: string;
  isAbnormal?: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  completedAt?: string;
}

export type BedCondition = 'stable' | 'critical' | 'improving' | 'observation';
export type WardType =
  | 'Emergency Resuscitation Ward'
  | 'Intensive Care Unit (ICU)'
  | 'Maternity & Labor Ward'
  | 'Pediatric Ward'
  | 'Male Medical Ward'
  | 'Female Medical Ward'
  | string;

export interface HospitalBed {
  id: string;
  ward: WardType;
  bedNumber: string;
  isOccupied: boolean;
  patientId?: string;
  patientName?: string;
  admissionDate?: string;
  condition?: BedCondition;
  assignedNurse?: string;
  assignedDoctor?: string;
  oxygenSupport?: boolean;
  hasOxygen?: boolean;
  hasMonitor?: boolean;
  updatedBy?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface MedicalPrescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
  dispensed: boolean;
  dispensedBy?: string;
}

// ----------------------------------------------------
// 1. Investment Control Types
// ----------------------------------------------------
export type InvestmentCategory =
  | 'Medical Equipment'
  | 'Infrastructure & Energy'
  | 'Digital Health & IT'
  | 'Ambulance & Logistics'
  | 'Facility Expansion';

export type InvestmentStatus = 'approved' | 'in_review' | 'deployed' | 'planned';
export type FundingSource =
  | 'Retained Earnings'
  | 'MOH Equity Grant'
  | 'Donor Funding'
  | 'Private Health Capital';

export interface HospitalInvestment {
  id: string;
  title: string;
  category: InvestmentCategory;
  amount: number;
  currency: string;
  fundingSource: FundingSource;
  status: InvestmentStatus;
  roiProjection: string;
  expectedLifespan: string;
  purchaseDate?: string;
  departmentBeneficiary: string;
  procurementLead: string;
  operationalImpact: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// 2. Pharmacy Control Types
// ----------------------------------------------------
export type MedicationCategory =
  | 'Antibiotics'
  | 'Antimalarials'
  | 'Analgesics & Pain'
  | 'IV Fluids & Electrolytes'
  | 'Emergency & Resuscitation'
  | 'Cardiovascular'
  | 'Pediatric Formulations';

export type DosageForm = 'Tablets' | 'Injection/Vial' | 'Syrup' | 'IV Infusion' | 'Topical/Inhaler';

export interface PharmacyItem {
  id: string;
  name: string;
  genericName: string;
  category: MedicationCategory;
  dosageForm: DosageForm;
  batchNumber: string;
  stockQuantity: number;
  minThreshold: number;
  unitPrice: number;
  currency: string;
  expiryDate: string;
  manufacturer: string;
  storageLocation: string;
  lastRestocked: string;
  requiresPrescription: boolean;
}

export interface MedicationDispensation {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  quantity: number;
  prescribedBy: string;
  dispensedBy: string;
  dispensedAt: string;
  instructions: string;
  totalCost: number;
}

// ----------------------------------------------------
// 3. Staff Control Types
// ----------------------------------------------------
export type StaffRole =
  | 'Chief Medical Officer'
  | 'Consultant Physician'
  | 'Staff Physician'
  | 'General Medical Officer'
  | 'Emergency Surgeon'
  | 'Triage Nurse'
  | 'Lead Triage Nurse'
  | 'Registered Nurse'
  | 'ICU Charge Nurse'
  | 'Chief Pharmacist'
  | 'Clinical Pharmacist'
  | 'Lead Lab Scientist'
  | 'Biomedical Engineer'
  | 'Administrator'
  | 'Hospital Administrator';

export type ShiftType =
  | 'Day Shift (08:00 - 16:00)'
  | 'Evening Shift (16:00 - 00:00)'
  | 'Night Call (00:00 - 08:00)'
  | 'Night Shift (00:00 - 08:00)'
  | '24h On-Call Emergency';

export type StaffShift = ShiftType;

export type StaffStatus = 'on_duty' | 'on_call' | 'off_duty' | 'leave' | 'break';

export interface StaffMember {
  id: string;
  staffId: string;
  fullName: string;
  role: StaffRole;
  department: string;
  specialty?: string;
  shift: ShiftType;
  status: StaffStatus;
  phone: string;
  email: string;
  licenseNumber: string;
  joinedDate: string;
  currentStation?: string;
}

// ----------------------------------------------------
// 4. Shift Swapping Workflow Types
// ----------------------------------------------------
export type ShiftSwapStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ShiftSwapUrgency = 'routine' | 'urgent' | 'emergency_cover';

export interface ShiftSwapRequest {
  id: string;
  requestId: string; // e.g. "SWP-2026-101"
  requestorStaffId: string;
  requestorName: string;
  requestorRole: StaffRole;
  requestorCurrentShift: ShiftType;
  targetStaffId: string;
  targetStaffName: string;
  targetCurrentShift: ShiftType;
  targetRole?: StaffRole;
  shiftDate: string;
  reason: string;
  urgency: ShiftSwapUrgency;
  status: ShiftSwapStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// 5. Billing & Invoicing Types
// ----------------------------------------------------
export type InvoiceStatus = 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'waived';
export type PaymentMethod =
  | 'Cash'
  | 'Mobile Money (Orange/Africell)'
  | 'Bank Transfer'
  | 'National Health Insurance'
  | 'Insurance'
  | 'Credit / Debit Card'
  | 'Credit Card';

export type InvoiceItemCategory =
  | 'consultation'
  | 'medication'
  | 'lab_test'
  | 'ward_stay'
  | 'procedure'
  | 'custom';

export type InvoiceItemType = InvoiceItemCategory;

export interface InvoiceLineItem {
  id: string;
  description: string;
  category: InvoiceItemCategory;
  itemType?: InvoiceItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  linkedAppointmentId?: string;
  linkedDispensationId?: string;
  linkedLabTestId?: string;
  referenceId?: string; // appointmentId, dispensationId, labTestId
}

export interface HospitalInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-8801"
  patientId: string;
  patientName: string;
  patientPhone?: string;
  appointmentId?: string;
  dispensationId?: string;
  labTestId?: string;
  admissionId?: string;
  issueDate: string;
  issuedDate?: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface HospitalStats {
  totalPatients: number;
  activeAdmissions: number;
  emergencyTriageActive: number;
  occupancyRate: number;
  pendingLabTests: number;
  todayConsultations: number;
  criticalCases: number;
  availableBeds: number;
  totalBeds: number;
  totalInvestmentsValue?: number;
  lowStockMedicationsCount?: number;
  onDutyStaffCount?: number;
  totalRevenue?: number;
  pendingPayments?: number;
  paidInvoicesCount?: number;
  pendingInvoicesCount?: number;
  pendingShiftSwapsCount?: number;
}
