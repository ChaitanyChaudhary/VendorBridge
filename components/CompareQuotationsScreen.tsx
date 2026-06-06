"use client";

import React, { useState } from "react";
import { usePortal, Quotation } from "@/context/PortalContext";
import { Check, AlertCircle, ShoppingBag, ShieldCheck, HelpCircle } from "lucide-react";

export default function CompareQuotationsScreen() {
  const { rfqs, quotations, selectedRfqForCompare, selectQuotationWinner, setSelectedRfqForCompare, setView } = usePortal();

  // Find all comparing/reviewed RFQs that have quotes
  const compareRfqs = rfqs.filter((r) => r.status === "Comparing" || r.status === "Under Review" || r.status === "Approved");
  
  // Selected RFQ logic
  const rfqId = selectedRfqForCompare || compareRfqs[0]?.id;
  const currentRfq = rfqs.find((r) => r.id === rfqId);

  // Filter quotations for this RFQ
  const currentQuotes = quotations.filter((q) => q.rfqId === rfqId);

  // Calculate totals and find the lowest price vendor
  let lowestTotal = Infinity;
  let lowestQuoteVendorId = "";

  currentQuotes.forEach((quote) => {
    const total = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (total < lowestTotal) {
      lowestTotal = total;
      lowestQuoteVendorId = quote.vendorId;
    }
  });

  const handleSelectWinner = (vendorId: string) => {
    if (!rfqId) return;
    selectQuotationWinner(rfqId, vendorId);
  };

  if (!currentRfq) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="font-semibold">No RFQs are currently in comparison phase.</p>
        <button
          onClick={() => setView("rfqs")}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          Go to RFQ wizard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
            Quotation Comparison
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare received bids side-by-side
          </p>
        </div>

        {/* Dropdown select RFQ */}
        {compareRfqs.length > 1 && (
          <select
            value={rfqId}
            onChange={(e) => setSelectedRfqForCompare(e.target.value)}
            className="block px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {compareRfqs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Info bar Bento Box */}
      <div className="bento-card p-5 bg-emerald-50/10 border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
            Analyzing Request
          </span>
          <h3 className="font-bold text-sm text-slate-800 mt-0.5">
            {currentRfq.title}
          </h3>
        </div>
        <div className="flex gap-6">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">
              Bids Received
            </span>
            <span className="text-xs font-extrabold text-slate-700">
              {currentQuotes.length} supplier quotes
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">
              RFQ Status
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {currentRfq.status}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Bento Grid */}
      {currentQuotes.length === 0 ? (
        <div className="bento-card p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-sm">No quotations submitted yet for this RFQ.</p>
          <p className="text-xs text-slate-400 mt-1">Please head to the Submit Quotations page to submit mock prices.</p>
          <button
            onClick={() => setView("quotations")}
            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm"
          >
            Submit Mock Prices
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {currentQuotes.map((quote) => {
            const total = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const isLowest = quote.vendorId === lowestQuoteVendorId;
            const isSelected = quote.status === "Selected";

            return (
              <div
                key={quote.id}
                className={`bento-card p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  isLowest
                    ? "border-emerald-500 bg-emerald-50/10 shadow-[0_4px_16px_rgba(16,185,129,0.08)]"
                    : "border-slate-200/80"
                }`}
              >
                {/* Ribbon Tag */}
                {isLowest && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                    <ShieldCheck className="w-3.5 h-3.5" /> Best Deal
                  </div>
                )}

                <div>
                  {/* Supplier Details */}
                  <div className="border-b border-slate-100 pb-4 mb-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      {quote.vendorId}
                    </span>
                    <span className="font-extrabold text-base text-slate-800 block mt-1">
                      {quote.vendorName}
                    </span>
                    
                    {/* Delivery & Payment Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3.5 text-[11px] font-semibold text-slate-500">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Delivery</span>
                        <span className="text-slate-700 block mt-0.5">{quote.deliveryTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Terms</span>
                        <span className="text-slate-700 block mt-0.5">{quote.paymentTerms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bid Breakdown
                    </span>
                    <div className="space-y-2">
                      {quote.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="max-w-[150px] truncate">
                            <span className="text-slate-700 font-bold block">{item.description}</span>
                            <span className="text-[10px] text-slate-400 block">{item.qty} {item.unit} x ${item.unitPrice}</span>
                          </div>
                          <span className="font-extrabold text-slate-850">
                            ${item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card footer totals & Select */}
                <div>
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center mb-5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Total Quote Price
                      </span>
                      <span className="text-xl font-black text-slate-800 tracking-tight block mt-0.5">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {isSelected ? (
                    <div className="w-full text-center py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/10 flex items-center justify-center gap-1">
                      <Check className="w-4.5 h-4.5" /> Selected Winner
                    </div>
                  ) : currentRfq.status === "Approved" ? (
                    <div className="w-full text-center py-2.5 bg-slate-100 text-slate-450 border border-slate-200/50 rounded-xl text-xs font-bold cursor-not-allowed">
                      RFQ Approved
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectWinner(quote.vendorId)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm ${
                        isLowest
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white active:bg-emerald-700"
                          : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 active:bg-slate-100"
                      }`}
                    >
                      Select Winner
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
