"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import { FileText, Download, Printer, Award, CheckCircle } from "lucide-react";
import { formatINR, calculateGST } from "@/lib/currency";

export default function PurchaseOrderScreen() {
  const { pos } = usePortal();
  const [selectedPoId, setSelectedPoId] = useState("");

  const activePo = pos.find((po) => po.id === selectedPoId) || pos[0];

  if (!activePo) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="font-semibold">No purchase orders generated yet.</p>
        <p className="text-xs mt-1">POs are automatically generated once an RFQ award is approved.</p>
      </div>
    );
  }

  // Calculate items total
  const subtotal = activePo.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const { cgst, sgst, grandTotal } = calculateGST(subtotal);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:p-0">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
            Purchase Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View auto-generated PO documents and dispatch logs
          </p>
        </div>

        {/* PO select dropdown */}
        <div className="flex gap-3">
          {pos.length > 1 && (
            <select
              value={activePo.id}
              onChange={(e) => setSelectedPoId(e.target.value)}
              className="block px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {pos.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.id} ({po.vendorName.substring(0, 15)}...)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print PO
          </button>
        </div>
      </div>

      {/* Invoice Bento Box Sheet */}
      <div className="bento-card p-8 bg-white max-w-3xl mx-auto shadow-md border border-slate-200/60 print:border-none print:shadow-none">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                VB
              </div>
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">
                VendorBridge
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-semibold mt-1">
              Smart Procurement Solutions
            </p>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block">
              {activePo.status}
            </span>
            <h2 className="text-lg font-black text-slate-800 tracking-tight mt-2">
              {activePo.id}
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Issued: {activePo.date}
            </span>
          </div>
        </div>

        {/* Addresses Box */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs font-semibold text-slate-650">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Issued To (Supplier)
            </span>
            <p className="text-slate-800 font-extrabold">{activePo.vendorName}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              {activePo.vendorAddress}<br />
              {activePo.vendorCountry}<br />
              {activePo.vendorEmail} | {activePo.vendorPhone}
            </p>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Buyer Office
            </span>
            <p className="text-slate-800 font-extrabold">VendorBridge Headquarters</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              100 Innovation Parkway<br />
              Silicon Valley, CA 94025<br />
              procurement@vendorbridge.com
            </p>
          </div>
        </div>

        {/* Items Summary Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 text-xs">
          <div className="grid grid-cols-5 bg-slate-50/50 border-b border-slate-100 py-3 px-4 text-[9px] font-bold text-slate-400 uppercase">
            <span className="col-span-2">Item Description</span>
            <span>Quantity</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Total Price</span>
          </div>

          <div className="divide-y divide-slate-50">
            {activePo.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-5 py-3 px-4 text-slate-600 font-medium">
                <span className="col-span-2 font-bold text-slate-800">{item.description}</span>
                <span>{item.qty} {item.unit}</span>
                <span className="text-right">{formatINR(item.unitPrice)}</span>
                <span className="text-right font-bold text-slate-700">{formatINR(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing calculations */}
        <div className="flex justify-end text-xs font-semibold text-slate-600">
          <div className="w-56 space-y-2.5">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CGST (9%):</span>
              <span>{formatINR(cgst)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SGST (9%):</span>
              <span>{formatINR(sgst)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5 text-sm font-bold text-slate-850">
              <span>Grand Total:</span>
              <span className="text-emerald-600 font-black">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-medium">
          <p className="font-bold text-slate-500">Notice to Supplier:</p>
          <p className="mt-1">
            This document is auto-generated by the VendorBridge Procurement Suite following approval workflow completion. Please acknowledge receipt of this PO. Deliveries should match specified quantities and descriptions. Terms of payment apply as per GST compliant invoice.
          </p>
        </div>

      </div>
    </div>
  );
}
