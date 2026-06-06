"use client";

import React, { useState } from "react";
import { usePortal, QuoteItem, RFQ, Vendor } from "@/context/PortalContext";
import { ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/currency";

function QuotationForm({
  rfq,
  vendors,
  submitQuotation,
  setView,
}: {
  rfq: RFQ;
  vendors: Vendor[];
  submitQuotation: ReturnType<typeof usePortal>["submitQuotation"];
  setView: ReturnType<typeof usePortal>["setView"];
}) {
  const [selectedVendorId, setSelectedVendorId] = useState(
    rfq.selectedSuppliers[0] || vendors[0]?.id || ""
  );
  const [items, setItems] = useState<QuoteItem[]>(
    rfq.items.map((item) => ({
      description: item.description,
      qty: item.qty,
      unit: item.unit,
      unitPrice: 0,
      totalPrice: 0,
    }))
  );
  const [deliveryTime, setDeliveryTime] = useState("10 Days");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [remarks, setRemarks] = useState("");

  const handlePriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          unitPrice: price,
          totalPrice: item.qty * price,
        };
      })
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedVendorId || items.some((item) => item.unitPrice <= 0)) return;

    submitQuotation(rfq.id, selectedVendorId, items, deliveryTime, paymentTerms, remarks);
    setView("allQuotations");
  };

  const quoteTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Submit Quotation
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Provide pricing estimates as a registered supplier
        </p>
      </div>

      <div className="bento-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Target RFQ
              </span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {rfq.title}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Deadline Date
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-0.5 block">
                {rfq.deadline}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Simulator Supplier
              </span>
              <select
                value={selectedVendorId}
                onChange={(event) => setSelectedVendorId(event.target.value)}
                className="mt-0.5 block w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 w-24">Qty</th>
                  <th className="py-3 px-4 w-24">Unit</th>
                  <th className="py-3 px-4 w-36">Unit Price (INR)</th>
                  <th className="py-3 px-4 w-32 text-right">Total Price (INR)</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-650 divide-y divide-slate-50">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/10">
                    <td className="py-4 px-4 font-bold text-slate-700">{item.description}</td>
                    <td className="py-4 px-4 text-slate-500">{item.qty}</td>
                    <td className="py-4 px-4 text-slate-400">{item.unit}</td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={item.unitPrice || ""}
                        onChange={(event) =>
                          handlePriceChange(index, Number.parseFloat(event.target.value) || 0)
                        }
                        placeholder="Enter bid unit price"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                      />
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 text-right">
                      {formatINR(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pr-4">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center">
              Quotation Bid Sum:
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              {formatINR(quoteTotal)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Time
                </label>
                <input
                  type="text"
                  required
                  value={deliveryTime}
                  onChange={(event) => setDeliveryTime(event.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g. 10 Days"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(event) => setPaymentTerms(event.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30 (Default)</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Additional Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={4.5}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                placeholder="List warranties, package details, bulk discount context, etc."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              Submit Quotation
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubmitQuotationScreen() {
  const { rfqs, vendors, submitQuotation, selectedRfqForQuote, setView } = usePortal();
  const rfq = rfqs.find((item) => item.id === selectedRfqForQuote) || rfqs[1] || rfqs[0];

  if (!rfq) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="font-semibold">No active open RFQ found for quotation submissions.</p>
        <button
          onClick={() => setView("rfqs")}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          Create one now
        </button>
      </div>
    );
  }

  return (
    <QuotationForm
      key={rfq.id}
      rfq={rfq}
      vendors={vendors}
      submitQuotation={submitQuotation}
      setView={setView}
    />
  );
}
