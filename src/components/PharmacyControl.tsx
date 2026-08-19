import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  RotateCw,
  TrendingDown,
  ShieldAlert,
  Archive,
  DollarSign
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PharmacyItem, MedicationCategory, DosageForm } from '../types';

export const PharmacyControl: React.FC = () => {
  const {
    pharmacyItems,
    dispensations,
    patients,
    addPharmacyItem,
    updatePharmacyStock,
    dispenseMedication
  } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal'>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensary' | 'dispense_log'>('inventory');

  // Modals
  const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState<boolean>(false);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState<boolean>(false);
  const [selectedDrugForDispense, setSelectedDrugForDispense] = useState<PharmacyItem | null>(null);

  // Add Drug Form State
  const [name, setName] = useState<string>('');
  const [genericName, setGenericName] = useState<string>('');
  const [category, setCategory] = useState<MedicationCategory>('Antibiotics');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablets');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [minThreshold, setMinThreshold] = useState<number>(30);
  const [unitPrice, setUnitPrice] = useState<number>(2.5);
  const [expiryDate, setExpiryDate] = useState<string>('2027-12-31');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [storageLocation, setStorageLocation] = useState<string>('Main Dispensary Shelf A1');
  const [requiresPrescription, setRequiresPrescription] = useState<boolean>(true);

  // Dispense Form State
  const [dispensePatientId, setDispensePatientId] = useState<string>('');
  const [dispenseQuantity, setDispenseQuantity] = useState<number>(1);
  const [prescribedBy, setPrescribedBy] = useState<string>('Dr. Alusine Koroma');
  const [dispensedBy, setDispensedBy] = useState<string>('Moses Fornah, BPharm');
  const [instructions, setInstructions] = useState<string>('');

  const lowStockCount = pharmacyItems.filter((item) => item.stockQuantity <= item.minThreshold).length;
  const totalStockUnits = pharmacyItems.reduce((acc, curr) => acc + curr.stockQuantity, 0);
  const totalDispensationsCount = dispensations.length;

  const filteredItems = pharmacyItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stockQuantity <= item.minThreshold) ||
      (stockFilter === 'normal' && item.stockQuantity > item.minThreshold);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleCreateDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !batchNumber.trim()) return;

    await addPharmacyItem({
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
      category,
      dosageForm,
      batchNumber: batchNumber.trim(),
      stockQuantity: Number(stockQuantity),
      minThreshold: Number(minThreshold),
      unitPrice: Number(unitPrice),
      currency: 'USD',
      expiryDate,
      manufacturer: manufacturer.trim() || 'Approved Pharma Lab',
      storageLocation: storageLocation.trim(),
      requiresPrescription
    });

    setName('');
    setGenericName('');
    setBatchNumber('');
    setManufacturer('');
    setIsAddDrugModalOpen(false);
  };

  const handleOpenDispense = (drug: PharmacyItem) => {
    setSelectedDrugForDispense(drug);
    setDispenseQuantity(1);
    setInstructions(
      drug.dosageForm === 'Injection/Vial'
        ? 'Administer via IV slow push under nurse supervision.'
        : 'Take 1 tablet every 8 hours after meals x 5 days.'
    );
    if (patients.length > 0) {
      setDispensePatientId(patients[0].id);
    }
    setIsDispenseModalOpen(true);
  };

  const handleExecuteDispensation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrugForDispense) return;

    const patient = patients.find((p) => p.id === dispensePatientId);
    const patientName = patient ? patient.fullName : 'Outpatient Walk-in';

    await dispenseMedication({
      patientId: dispensePatientId || 'pat-walkin',
      patientName,
      medicationName: selectedDrugForDispense.name,
      quantity: Number(dispenseQuantity),
      prescribedBy: prescribedBy.trim(),
      dispensedBy: dispensedBy.trim(),
      instructions: instructions.trim(),
      totalCost: Number(dispenseQuantity) * selectedDrugForDispense.unitPrice
    });

    setIsDispenseModalOpen(false);
    setSelectedDrugForDispense(null);
  };

  const handleQuickRestock = async (drugId: string, current: number, amountToAdd: number) => {
    await updatePharmacyStock(drugId, current + amountToAdd);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Pharmacy Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Formulary SKU Count</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {pharmacyItems.length} <span className="text-xs font-medium text-slate-500">Medicines</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">WHO Essential Medicines Compliant</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Low Stock Alerts</span>
            <div
              className={`p-2 rounded-lg ${
                lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold font-sans ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {lowStockCount} <span className="text-xs font-medium text-slate-500">Items Buffer Depleted</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Automatic PO generation primed</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Stock Units</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {totalStockUnits.toLocaleString()} <span className="text-xs font-medium text-slate-500">Units</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">In 24/7 Temperature Controlled Vault</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Dispensations</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {totalDispensationsCount} <span className="text-xs font-medium text-slate-500">Prescriptions</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Pharmacist Audited</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="pharmacy-tab-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medication Inventory ({pharmacyItems.length})</span>
        </button>

        <button
          id="pharmacy-tab-dispensary"
          onClick={() => setActiveTab('dispensary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dispensary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span>Direct Prescription Dispenser</span>
        </button>

        <button
          id="pharmacy-tab-log"
          onClick={() => setActiveTab('dispense_log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dispense_log'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dispensation History ({dispensations.length})</span>
        </button>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search medication name, generic compound, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Drug Classes</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antimalarials">Antimalarials</option>
                <option value="Analgesics & Pain">Analgesics & Pain</option>
                <option value="IV Fluids & Electrolytes">IV Fluids & Electrolytes</option>
                <option value="Emergency & Resuscitation">Emergency & Resuscitation</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Stock Statuses</option>
                <option value="low">Low Stock Alerts Only</option>
                <option value="normal">Adequate Stock</option>
              </select>
            </div>

            <button
              id="add-medication-btn"
              onClick={() => setIsAddDrugModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Medication</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Medication & Generic</th>
                    <th className="py-3 px-4">Class & Form</th>
                    <th className="py-3 px-4">Batch / Expiry</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((drug) => {
                    const isLow = drug.stockQuantity <= drug.minThreshold;
                    return (
                      <tr key={drug.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{drug.name}</div>
                          <div className="text-[11px] text-slate-500">{drug.genericName}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {drug.category}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {drug.dosageForm}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-800 font-semibold">{drug.batchNumber}</div>
                          <div className="text-[10px] text-slate-400">Exp: {drug.expiryDate}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono text-sm ${
                                isLow ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              {drug.stockQuantity}
                            </span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Min Buffer: {drug.minThreshold}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          ${drug.unitPrice.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                          {drug.storageLocation}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDispense(drug)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                            >
                              Dispense
                            </button>
                            <button
                              onClick={() => handleQuickRestock(drug.id, drug.stockQuantity, 50)}
                              title="Restock +50 units"
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Direct Prescription Dispenser */}
      {activeTab === 'dispensary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacyItems.map((drug) => (
            <div
              key={drug.id}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-indigo-600">{drug.category}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{drug.batchNumber}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{drug.name}</h4>
                <p className="text-xs text-slate-500">{drug.genericName}</p>

                <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available Units:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {drug.stockQuantity} {drug.dosageForm}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Unit Price:</span>
                    <span className="font-bold font-mono text-slate-900">
                      ${drug.unitPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDispense(drug)}
                disabled={drug.stockQuantity === 0}
                className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                  drug.stockQuantity === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {drug.stockQuantity === 0 ? 'Out of Stock' : 'Dispense to Patient'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dispensation Log */}
      {activeTab === 'dispense_log' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-sans">
              Pharmacy Dispensation Registry & Receipts
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Total {dispensations.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dispensation ID & Timestamp</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Medication & Quantity</th>
                  <th className="py-3 px-4">Prescribed By</th>
                  <th className="py-3 px-4">Pharmacist</th>
                  <th className="py-3 px-4">Dosage Instructions</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispensations.map((disp) => (
                  <tr key={disp.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900 block">{disp.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {disp.dispensedAt.replace('T', ' ').slice(0, 16)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {disp.patientName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {disp.medicationName}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-mono font-bold">
                        Qty: {disp.quantity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {disp.prescribedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {disp.dispensedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {disp.instructions}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ${disp.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {isAddDrugModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Add Medication to Pharmacy Master Stock
                  </h3>
                  <p className="text-xs text-slate-500">Register new batch and formulary item</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDrugModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDrug} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Trade / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coartem 20/120mg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Generic Compound Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artemether / Lumefantrine"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Therapeutic Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Antimalarials">Antimalarials</option>
                    <option value="Analgesics & Pain">Analgesics & Pain</option>
                    <option value="IV Fluids & Electrolytes">IV Fluids & Electrolytes</option>
                    <option value="Emergency & Resuscitation">Emergency & Resuscitation</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Pediatric Formulations">Pediatric Formulations</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Dosage Form *
                  </label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Tablets">Tablets / Capsules</option>
                    <option value="Injection/Vial">Injection / Vial</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Syrup">Syrup / Suspension</option>
                    <option value="Topical/Inhaler">Topical / Inhaler / Nebulizer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-2026-X"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Storage Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vault Shelf B2 or Cold Refrigerator"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDrugModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Save to Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {isDispenseModalOpen && selectedDrugForDispense && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Prescription Dispensation
                </span>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  {selectedDrugForDispense.name}
                </h3>
              </div>
              <button
                onClick={() => setIsDispenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteDispensation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Patient *
                </label>
                <select
                  value={dispensePatientId}
                  onChange={(e) => setDispensePatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientId}) - {p.status.toUpperCase()}
                    </option>
                  ))}
                  <option value="pat-walkin">Outpatient Walk-in (External Prescription)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Quantity to Dispense *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedDrugForDispense.stockQuantity}
                    required
                    value={dispenseQuantity}
                    onChange={(e) => setDispenseQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Available: {selectedDrugForDispense.stockQuantity}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Total Charge ($)
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-900">
                    ${(dispenseQuantity * selectedDrugForDispense.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Prescribing Physician *
                </label>
                <input
                  type="text"
                  required
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Dosage & Administration Instructions *
                </label>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDispenseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Authorize & Dispense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
