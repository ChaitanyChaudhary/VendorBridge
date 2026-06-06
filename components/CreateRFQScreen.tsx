"use client";

import React, { useState } from "react";
import { usePortal, RFQItem, RFQ } from "@/context/PortalContext";
import { Plus, Trash2, ArrowLeft, ArrowRight, Building, Check, ClipboardList } from "lucide-react";

export default function CreateRFQScreen() {
  const { vendors, addRFQ, setView } = usePortal();
  const [step, setStep] = useState(1);

  // Form states
  const [rfqDetails, setRfqDetails] = useState({
    title: "",
    description: "",
    category: "Office Supplies & Furniture",
    deadline: "",
  });

  const [rfqItems, setRfqItems] = useState<RFQItem[]>([
    { description: "Developer Laptop Stand", qty: 25, unit: "Pcs", estimatedPrice: 45 },
  ]);

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const categories = [
    "Office Supplies & Furniture",
    "Furniture & Decor",
    "Office Supplies & Paper",
    "IT Hardware & Software",
    "Logistics & Shipping",
  ];

  // Handlers
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRfqDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddItem = () => {
    setRfqItems((prev) => [...prev, { description: "", qty: 1, unit: "Pcs", estimatedPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (rfqItems.length === 1) return;
    setRfqItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RFQItem, value: any) => {
    setRfqItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          return updated;
        }
        return item;
      })
    );
  };

  const handleToggleSupplier = (vendorId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handlePublish = () => {
    if (!rfqDetails.title.trim() || selectedSuppliers.length === 0) return;
    
    addRFQ({
      title: rfqDetails.title,
      description: rfqDetails.description,
      category: rfqDetails.category,
      deadline: rfqDetails.deadline,
      items: rfqItems,
      selectedSuppliers: selectedSuppliers,
    });

    // Reset Form
    setRfqDetails({ title: "", description: "", category: "Office Supplies & Furniture", deadline: "" });
    setRfqItems([{ description: "Developer Laptop Stand", qty: 25, unit: "Pcs", estimatedPrice: 45 }]);
    setSelectedSuppliers([]);
    setStep(1);

    // Redirect to Dashboard or RFQ tab
    setView("dashboard");
  };

  const nextStep = () => {
    if (step === 1 && !rfqDetails.title.trim()) return;
    if (step === 2 && rfqItems.some((item) => !item.description.trim())) return;
    if (step === 3 && selectedSuppliers.length === 0) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const stepsLabel = ["RFQ Details", "Line Items", "Target Suppliers", "Review & Publish"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Create RFQ
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Initiate a new Request for Quotation
        </p>
      </div>

      {/* Bento Layout Card */}
      <div className="bento-card p-6 min-h-[500px] flex flex-col justify-between">
        <div>
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 overflow-x-auto scrollbar-none">
            {stepsLabel.map((label, idx) => {
              const currentStep = idx + 1;
              const isCompleted = step > currentStep;
              const isActive = step === currentStep;
              return (
                <div key={idx} className="flex items-center gap-3 shrink-0 mr-4 last:mr-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : currentStep}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  {idx < 3 && <div className="h-0.5 w-10 bg-slate-100 hidden md:block"></div>}
                </div>
              );
            })}
          </div>

          {/* Step 1: RFQ Details */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in max-w-xl">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  RFQ Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={rfqDetails.title}
                  onChange={handleDetailsChange}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g. Annual IT Office Equipment Procurement"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={rfqDetails.description}
                  onChange={handleDetailsChange}
                  rows={4}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  placeholder="Provide brief details about the requirements, quality standards, or target expectations."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Product Category
                  </label>
                  <select
                    name="category"
                    value={rfqDetails.category}
                    onChange={handleDetailsChange}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Response Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={rfqDetails.deadline}
                    onChange={handleDetailsChange}
                    className="block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Line Items Builder */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  List of Items
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-100 rounded-lg text-[10px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 w-24">Qty</th>
                      <th className="py-2.5 px-3 w-24">Unit</th>
                      <th className="py-2.5 px-3 w-32">Est. Unit Price ($)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Total Est. ($)</th>
                      <th className="py-2.5 px-3 w-16 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-50">
                    {rfqItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            placeholder="Item name / spec detail"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, "qty", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            value={item.estimatedPrice}
                            onChange={(e) => handleItemChange(idx, "estimatedPrice", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700 text-right">
                          ${(item.qty * item.estimatedPrice).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={rfqItems.length === 1}
                            className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                              rfqItems.length === 1
                                ? "text-slate-350 cursor-not-allowed"
                                : "text-rose-500 hover:bg-rose-50 hover:border-rose-100"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Estimate Total */}
              <div className="flex justify-end pt-3 pr-8">
                <span className="text-xs font-semibold text-slate-400 mr-2">Total Project Estimate:</span>
                <span className="text-sm font-extrabold text-slate-800">
                  ${rfqItems.reduce((sum, i) => sum + i.qty * i.estimatedPrice, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Suppliers Selector */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select target vendors to publish RFQ
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((vendor) => {
                  const isChecked = selectedSuppliers.includes(vendor.id);
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => handleToggleSupplier(vendor.id)}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-emerald-300 ${
                        isChecked
                          ? "bg-emerald-50/30 border-emerald-500 shadow-inner-sm"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {vendor.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {vendor.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {vendor.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Summary & Review */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                Final Review of RFQ Details
              </span>

              {/* Grid block */}
              <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    RFQ Title
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {rfqDetails.title}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Deadline
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {rfqDetails.deadline}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Description
                  </span>
                  <span className="text-xs font-medium text-slate-600 mt-0.5 block">
                    {rfqDetails.description || "No description provided."}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Category
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {rfqDetails.category}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Target Suppliers
                  </span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                    {selectedSuppliers.length} selected vendors
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Items Summary
                </span>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-slate-50 py-2 px-3 text-[10px] font-bold text-slate-400 uppercase">
                    <span className="col-span-2">Item Description</span>
                    <span>Quantity</span>
                    <span className="text-right">Est. Unit Price</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {rfqItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-4 py-2.5 px-3 text-slate-650 font-medium">
                        <span className="col-span-2 font-bold text-slate-700">{item.description}</span>
                        <span>{item.qty} {item.unit}</span>
                        <span className="text-right">${item.estimatedPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Footer Controls */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold transition-colors ${
              step === 1
                ? "text-slate-300 border-slate-100 cursor-not-allowed"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10"
            >
              Publish RFQ
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
