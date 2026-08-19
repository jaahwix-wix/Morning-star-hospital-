import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Printer,
  Calendar,
  Building2,
  Pill,
  Stethoscope,
  FlaskConical,
  BedDouble,
  ArrowUpRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  User
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import {
  HospitalInvoice,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethod,
  Patient
} from '../types';

export const BillingControl: React.FC = () => {
  const {
    invoices,
    patients,
    appointments,
    pharmacyItems,
    dispensations,
    labTests,
    hospitalBeds,
    stats,
    createInvoice,
    recordPayment,
    updateInvoiceStatus
  } = useHospitalData();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<HospitalInvoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<HospitalInvoice | null>(null);

  // Payment Recording Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Invoice Creation Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<PaymentMethod>('Cash');
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: `item-${Date.now()}`,
      description: 'General Medical Consultation & Clinical Assessment',
      category: 'consultation',
      quantity: 1,
      unitPrice: 15,
      totalPrice: 15
    }
  ]);

  // Financial Stats
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.lineItems || []).some((li) =>
        li.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' ||
      invoice.lineItems.some((li) => li.category === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle Add Item to creation modal
  const handleAddLineItem = (category: InvoiceLineItem['category'] = 'custom') => {
    const defaultDesc =
      category === 'consultation'
        ? 'Specialist Doctor Consultation'
        : category === 'medication'
        ? 'Prescription Medication Dispensation'
        : category === 'lab_test'
        ? 'Clinical Diagnostic Lab Investigation'
        : category === 'ward_stay'
        ? 'Inpatient Ward Bed & Nursing Care (per day)'
        : 'Medical Service / Supply';

    const defaultPrice =
      category === 'consultation'
        ? 20
        : category === 'medication'
        ? 12
        : category === 'lab_test'
        ? 25
        : category === 'ward_stay'
        ? 35
        : 10;

    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      description: defaultDesc,
      category,
      quantity: 1,
      unitPrice: defaultPrice,
      totalPrice: defaultPrice
    };

    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const q = field === 'quantity' ? Number(value) : item.quantity;
            const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
            updated.totalPrice = Math.max(0, q * p);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Quick link appointment to invoice
  const handleLinkAppointment = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) return;

    setSelectedPatientId(apt.patientId);
    const newItem: InvoiceLineItem = {
      id: `apt-${apt.id}`,
      description: `Consultation with ${apt.doctorName} (${apt.type})`,
      category: 'consultation',
      quantity: 1,
      unitPrice: 20,
      totalPrice: 20,
      linkedAppointmentId: apt.id
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  // Quick link medication dispensation to invoice
  const handleLinkDispensation = (dispId: string) => {
    const disp = dispensations.find((d) => d.id === dispId);
    if (!disp) return;

    setSelectedPatientId(disp.patientId);
    const newItem: InvoiceLineItem = {
      id: `disp-${disp.id}`,
      description: `Rx: ${disp.medicationName} (${disp.dosage}, ${disp.quantity} units)`,
      category: 'medication',
      quantity: disp.quantity || 1,
      unitPrice: 5,
      totalPrice: (disp.quantity || 1) * 5,
      linkedDispensationId: disp.id
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  // Quick link lab test to invoice
  const handleLinkLabTest = (labId: string) => {
    const lab = labTests.find((l) => l.id === labId);
    if (!lab) return;

    setSelectedPatientId(lab.patientId);
    const newItem: InvoiceLineItem = {
      id: `lab-${lab.id}`,
      description: `Lab Diagnostic: ${lab.testName} (${lab.testCategory})`,
      category: 'lab_test',
      quantity: 1,
      unitPrice: 25,
      totalPrice: 25,
      linkedLabTestId: lab.id
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal - discount + tax);

  // Submit new invoice
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.patientId === selectedPatientId || p.id === selectedPatientId);
    if (!patient) {
      alert('Please select a valid patient.');
      return;
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item to the invoice.');
      return;
    }

    const initialPaid = Math.min(initialPayment, calculatedTotal);

    await createInvoice({
      patientId: patient.patientId,
      patientName: patient.fullName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      lineItems,
      subtotal: calculatedSubtotal,
      discount,
      tax,
      totalAmount: calculatedTotal,
      paidAmount: initialPaid,
      balanceDue: Math.max(0, calculatedTotal - initialPaid),
      status: initialPaid >= calculatedTotal && calculatedTotal > 0 ? 'paid' : initialPaid > 0 ? 'partially_paid' : 'pending',
      paymentMethod: initialPaid > 0 ? initialPaymentMethod : undefined,
      notes: invoiceNotes.trim()
    });

    // Reset form
    setIsCreateModalOpen(false);
    setLineItems([
      {
        id: `item-${Date.now()}`,
        description: 'General Medical Consultation & Clinical Assessment',
        category: 'consultation',
        quantity: 1,
        unitPrice: 15,
        totalPrice: 15
      }
    ]);
    setDiscount(0);
    setTax(0);
    setInitialPayment(0);
    setInvoiceNotes('');
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (invoice: HospitalInvoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentAmount(invoice.balanceDue);
    setPaymentMethod('Cash');
    setPaymentReference(`REC-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('');
  };

  // Submit Payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than 0.');
      return;
    }

    await recordPayment(
      selectedInvoiceForPayment.id,
      paymentAmount,
      paymentMethod,
      paymentReference,
      paymentNotes
    );

    setSelectedInvoiceForPayment(null);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid in Full
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> Partially Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Payment
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue
          </span>
        );
      case 'waived':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" /> Waived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: InvoiceLineItem['category']) => {
    switch (cat) {
      case 'consultation':
        return <Stethoscope className="w-3 h-3 text-indigo-600" />;
      case 'medication':
        return <Pill className="w-3 h-3 text-amber-600" />;
      case 'lab_test':
        return <FlaskConical className="w-3 h-3 text-teal-600" />;
      case 'ward_stay':
        return <BedDouble className="w-3 h-3 text-sky-600" />;
      default:
        return <Tag className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Revenue & Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Billed Services</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            ${totalBilled.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>{invoices.length} Hospital Invoices</span>
            <span className="text-indigo-600 font-semibold">{collectionRate}% Collected</span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Collected Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-sans">
            ${totalPaid.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {paidCount} Invoices Settled in Full
          </p>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pending Receivables</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 font-sans">
            ${totalPending.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'pending' || i.status === 'partially_paid').length} Invoices Pending Settlement
          </p>
        </div>

        {/* Overdue / Recovery */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Overdue Balances</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {overdueCount} <span className="text-xs font-medium text-slate-500">Overdue</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Direct billing cashier follow-up</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action Button */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by invoice number, patient name, ID, or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending Payment</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid in Full</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Service Categories</option>
            <option value="consultation">Consultations & OPD</option>
            <option value="medication">Pharmacy Dispensations</option>
            <option value="lab_test">Lab Diagnostics</option>
            <option value="ward_stay">Inpatient Wards</option>
          </select>
        </div>

        <button
          id="create-invoice-btn"
          onClick={() => {
            if (patients.length > 0) setSelectedPatientId(patients[0].patientId);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Patient Invoice</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Services & Linked Items</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Paid / Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600">No Hospital Invoices Found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or create a new invoice.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Invoice ID & Issue Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{inv.issueDate}</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.patientName}</div>
                      <div className="font-mono text-[10px] text-indigo-600">{inv.patientId}</div>
                    </td>

                    {/* Service Lines */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="space-y-1">
                        {inv.lineItems.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                          >
                            {getCategoryIcon(item.category)}
                            <span className="truncate">{item.description}</span>
                            <span className="ml-auto font-mono text-[10px] text-slate-500 shrink-0">
                              ${item.totalPrice}
                            </span>
                          </div>
                        ))}
                        {inv.lineItems.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-semibold block pl-1">
                            +{inv.lineItems.length - 2} more services
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm font-sans">
                        ${inv.totalAmount.toFixed(2)}
                      </div>
                      {(inv.discount > 0 || inv.tax > 0) && (
                        <div className="text-[10px] text-slate-400">
                          {inv.discount > 0 ? `-$${inv.discount} disc ` : ''}
                          {inv.tax > 0 ? `+$${inv.tax} tax` : ''}
                        </div>
                      )}
                    </td>

                    {/* Paid & Balance */}
                    <td className="py-3 px-4">
                      <div className="text-emerald-700 font-semibold">
                        ${(inv.paidAmount || 0).toFixed(2)} paid
                      </div>
                      <div className="text-amber-700 font-bold font-mono text-[11px]">
                        ${(inv.balanceDue || 0).toFixed(2)} due
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDue > 0 && inv.status !== 'waived' && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                            title="Record payment for this invoice"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                          title="Print official hospital receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE PATIENT INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Generate Patient Hospital Invoice
                  </h3>
                  <p className="text-xs text-slate-500">
                    Link consultations, pharmacy dispensations, lab diagnostics, and hospital services
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              {/* Patient Selection & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="">Choose Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.patientId}>
                        {p.fullName} ({p.patientId}) — {p.gender}, {p.age}y
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Auto-Link Shortcuts */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Quick Link Outstanding Clinical Services:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Click to auto-populate invoice</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddLineItem('consultation')}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Stethoscope className="w-3 h-3" /> + Consultation ($20)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddLineItem('medication')}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Pill className="w-3 h-3" /> + Rx Medication ($12)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddLineItem('lab_test')}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-teal-700 hover:bg-teal-50 rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    <FlaskConical className="w-3 h-3" /> + Lab Investigation ($25)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddLineItem('ward_stay')}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-sky-700 hover:bg-sky-50 rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    <BedDouble className="w-3 h-3" /> + Ward Admission Bed ($35)
                  </button>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Itemized Billing Line Items ({lineItems.length}) *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddLineItem('custom')}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Custom Service
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                    >
                      <div className="w-28 shrink-0">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              item.id,
                              'category',
                              e.target.value as InvoiceLineItem['category']
                            )
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] font-semibold"
                        >
                          <option value="consultation">Consultation</option>
                          <option value="medication">Pharmacy</option>
                          <option value="lab_test">Diagnostics</option>
                          <option value="ward_stay">Ward Bed</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Service or medication description"
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                            placeholder="Qty"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs text-center"
                          />
                        </div>

                        <div className="w-20">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                            placeholder="Unit $"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-xs text-right font-mono"
                          />
                        </div>

                        <div className="w-16 text-right font-mono font-bold text-slate-800 text-xs">
                          ${item.totalPrice.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 text-sm font-bold"
                          title="Remove item"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations: Subtotal, Discount, Tax, Final Total */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Tax / Surcharge ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 flex flex-col justify-center text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                    Total Invoiced
                  </span>
                  <span className="text-lg font-bold font-sans text-indigo-950">
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Initial Payment at Counter (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Deposit / Paid at Counter ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={calculatedTotal}
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={initialPaymentMethod}
                    onChange={(e) => setInitialPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Cash">Cash (Physical Currency)</option>
                    <option value="Mobile Money (Orange/Africell)">Mobile Money (Orange / Africell Money)</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Insurance">Health Insurance Coverage</option>
                    <option value="Credit / Debit Card">Credit / Debit Card (POS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Billing Notes / Insurance Policy Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard OPD consultation, insured under Sierra National Health Scheme..."
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Issue Hospital Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT MODAL */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Record Patient Payment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invoice: <span className="font-mono font-bold text-slate-700">{selectedInvoiceForPayment.invoiceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Invoice Summary Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Patient:</span>
                <strong className="text-slate-900">{selectedInvoiceForPayment.patientName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Invoiced:</span>
                <strong className="text-slate-900">${selectedInvoiceForPayment.totalAmount.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Previously Paid:</span>
                <strong className="text-emerald-700">${(selectedInvoiceForPayment.paidAmount || 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-800 pt-1 border-t border-slate-200 font-bold">
                <span>Outstanding Balance Due:</span>
                <span className="text-amber-700 font-mono text-sm">${selectedInvoiceForPayment.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Amount Received ($) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step={0.01}
                    min={0.01}
                    max={selectedInvoiceForPayment.balanceDue}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
                {/* Quick amount shortcuts */}
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedInvoiceForPayment.balanceDue)}
                    className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 hover:bg-emerald-100"
                  >
                    Pay Full Due (${selectedInvoiceForPayment.balanceDue})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round(selectedInvoiceForPayment.balanceDue / 2))}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-200"
                  >
                    Pay 50%
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Channel / Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Cash">Cash (Physical Currency)</option>
                  <option value="Mobile Money (Orange/Africell)">Mobile Money (Orange / Africell Money)</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="Insurance">Health Insurance Coverage</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (POS)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Receipt / Transaction Ref Number
                </label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cashier Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared at Central Hospital Cashier Desk 1"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Confirm & Settle Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW & PRINT OFFICIAL STAMPED HOSPITAL RECEIPT */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">Hospital Receipt Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Formal Stamped Document Canvas */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-800">
              {/* Header with Hospital Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-indigo-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight font-sans">
                    MORNING STAR HOSPITAL
                  </h1>
                  <p className="text-xs text-indigo-800 font-semibold italic">
                    "Your Health is our PRIORITY"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    24 Hours Service Everyday • Emergency Hotline: +232 73 929 145 / +232 78 355 293
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Freetown, Sierra Leone • Ministry of Health & Sanitation Accredited
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                    Official Receipt
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-950 block">
                    {selectedInvoiceForReceipt.invoiceNumber}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Date: {selectedInvoiceForReceipt.issueDate}
                  </span>
                </div>
              </div>

              {/* Patient & Billing Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Billed Patient
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{selectedInvoiceForReceipt.patientName}</div>
                  <div className="font-mono text-indigo-700">ID: {selectedInvoiceForReceipt.patientId}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Settlement Status
                  </span>
                  <div>{getStatusBadge(selectedInvoiceForReceipt.status)}</div>
                  {selectedInvoiceForReceipt.paymentMethod && (
                    <div className="text-[11px] text-slate-600 mt-1">
                      Method: <strong className="text-slate-800">{selectedInvoiceForReceipt.paymentMethod}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceForReceipt.lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2 text-slate-500 capitalize">{item.category.replace('_', ' ')}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Totals Calculation */}
              <div className="border-t border-slate-300 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Services:</span>
                  <span className="font-mono">${selectedInvoiceForReceipt.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoiceForReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Hospital Concession / Discount:</span>
                    <span className="font-mono">-${selectedInvoiceForReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoiceForReceipt.tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax / Regulatory Fee:</span>
                    <span className="font-mono">+${selectedInvoiceForReceipt.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount Billed:</span>
                  <span className="font-mono text-base font-black">${selectedInvoiceForReceipt.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-emerald-700">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono">${(selectedInvoiceForReceipt.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-amber-800">
                  <span>Outstanding Balance Remaining:</span>
                  <span className="font-mono">${(selectedInvoiceForReceipt.balanceDue || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Official Hospital Seal / Stamp */}
              <div className="pt-6 border-t border-dashed border-slate-300 flex items-center justify-between">
                <div className="border-2 border-indigo-600/60 rounded-xl p-3 inline-block rotate-[-2deg] bg-indigo-50/40">
                  <div className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                    MORNING STAR HOSPITAL
                  </div>
                  <div className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> OFFICIAL ACCOUNTS VALIDATION
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono">
                    Ref: {selectedInvoiceForReceipt.paymentReference || 'VERIFIED-DESK-1'}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Chief Accounts Officer
                  </span>
                  <span className="text-[9px] text-slate-400">Morning Star Revenue Dept</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
