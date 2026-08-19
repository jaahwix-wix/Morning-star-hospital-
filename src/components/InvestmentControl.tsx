import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Plus,
  Zap,
  Building2,
  Cpu,
  Truck,
  Layers,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowUpRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { HospitalInvestment, InvestmentCategory, InvestmentStatus, FundingSource } from '../types';

export const InvestmentControl: React.FC = () => {
  const { investments, addInvestment, updateInvestmentStatus } = useHospitalData();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedInvForDetail, setSelectedInvForDetail] = useState<HospitalInvestment | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<InvestmentCategory>('Medical Equipment');
  const [amount, setAmount] = useState<number>(50000);
  const [fundingSource, setFundingSource] = useState<FundingSource>('Retained Earnings');
  const [roiProjection, setRoiProjection] = useState<string>('2.5 Years');
  const [expectedLifespan, setExpectedLifespan] = useState<string>('8 Years');
  const [departmentBeneficiary, setDepartmentBeneficiary] = useState<string>('Emergency Care & Surgery');
  const [procurementLead, setProcurementLead] = useState<string>('Dr. Alusine Koroma');
  const [operationalImpact, setOperationalImpact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const totalCapital = investments.reduce((acc, curr) => acc + curr.amount, 0);
  const deployedCount = investments.filter((i) => i.status === 'deployed').length;
  const approvedCount = investments.filter((i) => i.status === 'approved').length;
  const inReviewCount = investments.filter((i) => i.status === 'in_review').length;

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.departmentBeneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.procurementLead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || inv.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !operationalImpact.trim()) return;

    await addInvestment({
      title: title.trim(),
      category,
      amount: Number(amount),
      currency: 'USD',
      fundingSource,
      status: 'in_review',
      roiProjection: roiProjection.trim(),
      expectedLifespan: expectedLifespan.trim(),
      departmentBeneficiary: departmentBeneficiary.trim(),
      procurementLead: procurementLead.trim(),
      operationalImpact: operationalImpact.trim(),
      notes: notes.trim() || undefined
    });

    setTitle('');
    setOperationalImpact('');
    setNotes('');
    setIsModalOpen(false);
  };

  const getCategoryIcon = (cat: InvestmentCategory) => {
    switch (cat) {
      case 'Medical Equipment':
        return Cpu;
      case 'Infrastructure & Energy':
        return Zap;
      case 'Digital Health & IT':
        return Sparkles;
      case 'Ambulance & Logistics':
        return Truck;
      case 'Facility Expansion':
        return Building2;
      default:
        return Layers;
    }
  };

  const getStatusBadge = (status: InvestmentStatus) => {
    switch (status) {
      case 'deployed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Deployed & Operational
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3 h-3" /> Approved / PO Issued
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Board Review
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Layers className="w-3 h-3" /> Planned Pipeline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Capital Invested</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            ${totalCapital.toLocaleString()} <span className="text-xs font-medium text-slate-500 font-mono">USD</span>
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% Zero Debt Asset Ownership
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Deployed Assets</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {deployedCount} <span className="text-xs font-medium text-slate-500">Systems</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">24/7 Clinical Uptime: 99.8%</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Approved / Pipeline</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">
            {approvedCount + inReviewCount} <span className="text-xs font-medium text-slate-500">Projects</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{approvedCount} Approved, {inReviewCount} In Board Review</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Average Payback / ROI</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-sans">2.6 Years</p>
          <p className="text-xs text-slate-500 mt-1">Projected savings & cost recovery</p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Action */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search investment titles, departments, procurement leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="Medical Equipment">Medical Equipment</option>
            <option value="Infrastructure & Energy">Infrastructure & Energy</option>
            <option value="Digital Health & IT">Digital Health & IT</option>
            <option value="Ambulance & Logistics">Ambulance & Logistics</option>
            <option value="Facility Expansion">Facility Expansion</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="deployed">Deployed</option>
            <option value="approved">Approved</option>
            <option value="in_review">In Review</option>
            <option value="planned">Planned</option>
          </select>
        </div>

        {/* Propose Button */}
        <button
          id="propose-investment-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Capital Investment</span>
        </button>
      </div>

      {/* Investment Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInvestments.map((inv) => {
          const Icon = getCategoryIcon(inv.category);
          return (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Icon, Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{inv.category}</span>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>

                {/* Title & Valuation */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                  {inv.title}
                </h3>

                <div className="flex items-baseline gap-2 mb-3 pb-3 border-b border-slate-100">
                  <span className="text-xl font-extrabold text-slate-900 font-sans">
                    ${inv.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">USD</span>
                  <span className="text-[10px] ml-auto px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                    {inv.fundingSource}
                  </span>
                </div>

                {/* Operational Impact */}
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {inv.operationalImpact}
                </p>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beneficiary:</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {inv.departmentBeneficiary}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ROI Timeline:</span>
                    <span className="font-semibold text-emerald-700 truncate block">
                      {inv.roiProjection}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lifespan:</span>
                    <span className="font-semibold text-slate-800">{inv.expectedLifespan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Procurement Lead:</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {inv.procurementLead}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedInvForDetail(inv)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  View Full Asset Dossier
                </button>

                <div className="flex items-center gap-1.5">
                  {inv.status === 'in_review' && (
                    <button
                      onClick={() => updateInvestmentStatus(inv.id, 'approved')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      Approve CapEx
                    </button>
                  )}
                  {inv.status === 'approved' && (
                    <button
                      onClick={() => updateInvestmentStatus(inv.id, 'deployed')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      Mark Deployed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Propose New Capital Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Propose Hospital Capital Investment
                  </h3>
                  <p className="text-xs text-slate-500">
                    CapEx budget allocation and clinical equipment procurement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvestment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Investment Title & Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Biochemistry Analyzer & Microplate Reader"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InvestmentCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Infrastructure & Energy">Infrastructure & Energy</option>
                    <option value="Digital Health & IT">Digital Health & IT</option>
                    <option value="Ambulance & Logistics">Ambulance & Logistics</option>
                    <option value="Facility Expansion">Facility Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Funding Source *
                  </label>
                  <select
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value as FundingSource)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Retained Earnings">Retained Hospital Earnings</option>
                    <option value="MOH Equity Grant">Ministry of Health Equity Grant</option>
                    <option value="Donor Funding">International Donor Funding</option>
                    <option value="Private Health Capital">Private Health Capital</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Projected Cost ($ USD) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ROI / Payback Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.5 Years"
                    value={roiProjection}
                    onChange={(e) => setRoiProjection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Expected Lifespan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Years"
                    value={expectedLifespan}
                    onChange={(e) => setExpectedLifespan(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Beneficiary Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diagnostics Lab & Pathology"
                    value={departmentBeneficiary}
                    onChange={(e) => setDepartmentBeneficiary(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Procurement Lead Officer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alusine Koroma (CMO)"
                    value={procurementLead}
                    onChange={(e) => setProcurementLead(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Operational & Clinical Impact *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain how this investment enhances patient survival, eliminates delays, or reduces hospital operational overhead..."
                  value={operationalImpact}
                  onChange={(e) => setOperationalImpact(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Vendor & Maintenance Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. OEM Warranty covers 3 years, includes bi-annual preventative calibration."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Submit for Board Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Dossier Modal */}
      {selectedInvForDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Asset Record • {selectedInvForDetail.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  {selectedInvForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvForDetail(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Asset Valuation:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ${selectedInvForDetail.amount.toLocaleString()} USD
                  </span>
                </div>
                {getStatusBadge(selectedInvForDetail.status)}
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">Clinical Purpose & Impact:</strong>
                <p>{selectedInvForDetail.operationalImpact}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-[11px]">
                <div>
                  <span className="text-slate-400 block">Beneficiary:</span>
                  <span className="font-semibold text-slate-800">{selectedInvForDetail.departmentBeneficiary}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Funding Source:</span>
                  <span className="font-semibold text-slate-800">{selectedInvForDetail.fundingSource}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ROI Projection:</span>
                  <span className="font-semibold text-emerald-700">{selectedInvForDetail.roiProjection}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Design Lifespan:</span>
                  <span className="font-semibold text-slate-800">{selectedInvForDetail.expectedLifespan}</span>
                </div>
              </div>

              {selectedInvForDetail.notes && (
                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Maintenance & Warranty:</strong> {selectedInvForDetail.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedInvForDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
