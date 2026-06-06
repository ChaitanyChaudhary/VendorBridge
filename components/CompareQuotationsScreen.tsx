"use client";

import React, { useState } from "react";
import { usePortal, Quotation } from "@/context/PortalContext";
import { formatINR, calculateGST } from "@/lib/currency";
import { Check, AlertCircle, ShieldCheck, ArrowUpDown, IndianRupee, FileText, Percent } from "lucide-react";

export default function CompareQuotationsScreen() {
  const { rfqs, quotations, selectedRfqForCompare, selectQuotationWinner, setSelectedRfqForCompare, setView } = usePortal();

  // Find all RFQs that have quotations
  const rfqsWithQuotes = rfqs.filter((r) =>
    quotations.some((q) => q.rfqId === r.id)
  );

  // Selected RFQ for detailed comparison
  const [activeTab, setActiveTab] = useState<"overview" | "detailed">("overview");
  const rfqId = selectedRfqForCompare || rfqsWithQuotes[0]?.id;
  const currentRfq = rfqs.find((r) => r.id === rfqId);
  const currentQuotes = quotations.filter((q) => q.rfqId === rfqId);

  // Calculate totals and find the lowest price vendor for current RFQ
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

  // Group all quotations by RFQ for overview
  const allQuotationsByRfq = rfqsWithQuotes.map((rfq) => {
    const quotes = quotations.filter((q) => q.rfqId === rfq.id);
    let minTotal = Infinity;
    let minVendor = "";
    quotes.forEach((q) => {
      const total = q.items.reduce((s, i) => s + i.totalPrice, 0);
      if (total < minTotal) {
        minTotal = total;
        minVendor = q.vendorName;
      }
    });
    return { rfq, quotes, minTotal, minVendor };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
            Quotation Comparison
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare all received bids across RFQs — prices in ₹ with 18% GST
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Quotations Overview
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "detailed"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Detailed Comparison
          </button>
        </div>
      </div>

      {/* ========================= OVERVIEW TAB ========================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bento-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-800 block">{quotations.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Quotations</span>
              </div>
            </div>
            <div className="bento-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-800 block">
                  {formatINR(quotations.reduce((sum, q) => sum + q.items.reduce((s, i) => s + i.totalPrice, 0), 0))}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bid Volume</span>
              </div>
            </div>
            <div className="bento-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-800 block">18%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GST Rate Applied</span>
              </div>
            </div>
          </div>

          {/* Master Quotation Comparison Table */}
          <div className="bento-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-800 tracking-tight">
                  All Quotations — Master View
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Every submitted bid across all active RFQs
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Quote ID</th>
                    <th className="pb-3">RFQ Title</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">GST (18%)</th>
                    <th className="pb-3 text-right">Grand Total</th>
                    <th className="pb-3">Delivery</th>
                    <th className="pb-3">Terms</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-center">Best Deal</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-50">
                  {allQuotationsByRfq.map(({ rfq, quotes, minTotal, minVendor }) =>
                    quotes.map((quote) => {
                      const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
                      const gst = calculateGST(subtotal);
                      const isBestDeal = quote.vendorName === minVendor;

                      return (
                        <tr
                          key={quote.id}
                          className={`hover:bg-slate-50/50 transition-colors ${
                            isBestDeal ? "bg-emerald-50/20" : ""
                          }`}
                        >
                          <td className="py-3.5 pl-3 font-mono text-[10px] text-slate-400 font-bold">
                            {quote.id}
                          </td>
                          <td className="py-3.5">
                            <div>
                              <span className="font-bold text-slate-700 block text-[11px]">{rfq.title}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{rfq.id}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-bold text-slate-800">{quote.vendorName}</span>
                          </td>
                          <td className="py-3.5 text-right font-bold text-slate-700">
                            {formatINR(subtotal)}
                          </td>
                          <td className="py-3.5 text-right text-slate-500">
                            {formatINR(gst.totalGst)}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`font-extrabold ${isBestDeal ? "text-emerald-600" : "text-slate-800"}`}>
                              {formatINR(gst.grandTotal)}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">{quote.deliveryTime}</td>
                          <td className="py-3.5 text-slate-500">{quote.paymentTerms}</td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                quote.status === "Selected"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : quote.status === "Rejected"
                                  ? "bg-rose-50 text-rose-700 border-rose-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {quote.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            {isBestDeal ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm">
                                <ShieldCheck className="w-3 h-3" /> Lowest
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-RFQ Summary Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allQuotationsByRfq.map(({ rfq, quotes, minTotal, minVendor }) => {
              const gstMin = calculateGST(minTotal);
              return (
                <div
                  key={rfq.id}
                  onClick={() => {
                    setSelectedRfqForCompare(rfq.id);
                    setActiveTab("detailed");
                  }}
                  className="bento-card p-5 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">{rfq.id}</span>
                      <h4 className="font-bold text-sm text-slate-800 mt-0.5 leading-tight">{rfq.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase ${
                      rfq.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : rfq.status === "Comparing"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {rfq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Bids</span>
                      <span className="text-slate-800 font-extrabold text-sm block mt-0.5">{quotes.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Lowest (incl. GST)</span>
                      <span className="text-emerald-600 font-extrabold text-sm block mt-0.5">{formatINR(gstMin.grandTotal)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {minVendor}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================= DETAILED TAB ========================= */}
      {activeTab === "detailed" && (
        <div className="space-y-6 animate-fade-in">
          {/* RFQ Selector */}
          {rfqsWithQuotes.length > 1 && (
            <div className="bento-card p-4 flex flex-wrap gap-2">
              {rfqsWithQuotes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRfqForCompare(r.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    rfqId === r.id
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                      : "bg-white text-slate-500 border-slate-100 hover:text-slate-800"
                  }`}
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}

          {/* Info bar */}
          {currentRfq && (
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
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Bids Received</span>
                  <span className="text-xs font-extrabold text-slate-700">{currentQuotes.length} supplier quotes</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">RFQ Status</span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {currentRfq.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-side Vendor Card Comparison */}
          {currentQuotes.length === 0 ? (
            <div className="bento-card p-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-sm">No quotations submitted yet for this RFQ.</p>
              <button
                onClick={() => setView("quotations")}
                className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                Submit Mock Prices
              </button>
            </div>
          ) : (
            <>
              {/* Line-item Level Comparison Table */}
              <div className="bento-card p-6">
                <h3 className="font-bold text-base text-slate-800 tracking-tight mb-1">
                  Item-Level Price Comparison
                </h3>
                <p className="text-slate-400 text-xs mb-5">
                  Line-item breakdown across all vendors — lowest price per item highlighted in green
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-3 sticky left-0 bg-white z-10">Item Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        {currentQuotes.map((q) => (
                          <th key={q.id} className="pb-3 text-right px-3">
                            <div className="flex flex-col items-end">
                              <span className={lowestQuoteVendorId === q.vendorId ? "text-emerald-600" : ""}>{q.vendorName}</span>
                              <span className="text-[8px] font-mono text-slate-300">{q.vendorId}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentQuotes[0]?.items.map((_, itemIdx) => {
                        // Find lowest unit price for this item
                        let minUnitPrice = Infinity;
                        currentQuotes.forEach((q) => {
                          if (q.items[itemIdx] && q.items[itemIdx].unitPrice < minUnitPrice) {
                            minUnitPrice = q.items[itemIdx].unitPrice;
                          }
                        });

                        return (
                          <tr key={itemIdx} className="hover:bg-slate-50/30">
                            <td className="py-3 pl-3 font-bold text-slate-700 sticky left-0 bg-white z-10">
                              {currentQuotes[0].items[itemIdx].description}
                            </td>
                            <td className="py-3 text-center text-slate-500">
                              {currentQuotes[0].items[itemIdx].qty} {currentQuotes[0].items[itemIdx].unit}
                            </td>
                            {currentQuotes.map((q) => {
                              const item = q.items[itemIdx];
                              const isLowest = item && item.unitPrice === minUnitPrice;
                              return (
                                <td key={q.id} className="py-3 text-right px-3">
                                  <div className={`${isLowest ? "text-emerald-600 font-extrabold" : "text-slate-700 font-bold"}`}>
                                    {formatINR(item?.unitPrice || 0)}
                                    {isLowest && <span className="text-[8px] block font-bold text-emerald-500 mt-0.5">LOWEST</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Total: {formatINR(item?.totalPrice || 0)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Subtotal Row */}
                      <tr className="border-t-2 border-slate-200 bg-slate-50/20">
                        <td className="py-3 pl-3 font-extrabold text-slate-800 sticky left-0 bg-white z-10">Subtotal</td>
                        <td></td>
                        {currentQuotes.map((q) => {
                          const subtotal = q.items.reduce((s, i) => s + i.totalPrice, 0);
                          const isLowest = q.vendorId === lowestQuoteVendorId;
                          return (
                            <td key={q.id} className={`py-3 text-right px-3 font-extrabold ${isLowest ? "text-emerald-600" : "text-slate-800"}`}>
                              {formatINR(subtotal)}
                            </td>
                          );
                        })}
                      </tr>

                      {/* GST Row */}
                      <tr className="bg-slate-50/10">
                        <td className="py-2 pl-3 font-semibold text-slate-500 sticky left-0 bg-white z-10">
                          GST @ 18%
                          <span className="block text-[9px] text-slate-400">(CGST 9% + SGST 9%)</span>
                        </td>
                        <td></td>
                        {currentQuotes.map((q) => {
                          const subtotal = q.items.reduce((s, i) => s + i.totalPrice, 0);
                          const gst = calculateGST(subtotal);
                          return (
                            <td key={q.id} className="py-2 text-right px-3 text-slate-500 font-semibold">
                              {formatINR(gst.totalGst)}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Grand Total Row */}
                      <tr className="border-t-2 border-emerald-200 bg-emerald-50/10">
                        <td className="py-3.5 pl-3 font-black text-slate-800 text-sm sticky left-0 bg-white z-10">
                          Grand Total (incl. GST)
                        </td>
                        <td></td>
                        {currentQuotes.map((q) => {
                          const subtotal = q.items.reduce((s, i) => s + i.totalPrice, 0);
                          const gst = calculateGST(subtotal);
                          const isLowest = q.vendorId === lowestQuoteVendorId;
                          return (
                            <td key={q.id} className={`py-3.5 text-right px-3 font-black text-sm ${isLowest ? "text-emerald-600" : "text-slate-800"}`}>
                              {formatINR(gst.grandTotal)}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vendor Cards for Quick Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {currentQuotes.map((quote) => {
                  const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
                  const gst = calculateGST(subtotal);
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
                        <div className="border-b border-slate-100 pb-4 mb-5">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">{quote.vendorId}</span>
                          <span className="font-extrabold text-base text-slate-800 block mt-1">{quote.vendorName}</span>
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

                        {/* Price breakdown */}
                        <div className="space-y-2 mb-5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-semibold">Subtotal</span>
                            <span className="font-bold text-slate-700">{formatINR(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">CGST (9%)</span>
                            <span className="text-slate-500">{formatINR(gst.cgst)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">SGST (9%)</span>
                            <span className="text-slate-500">{formatINR(gst.sgst)}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-slate-100 pt-2">
                            <span className="font-bold text-slate-700">Grand Total</span>
                            <span className={`font-extrabold ${isLowest ? "text-emerald-600" : "text-slate-800"}`}>
                              {formatINR(gst.grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {isSelected ? (
                          <div className="w-full text-center py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1">
                            <Check className="w-4.5 h-4.5" /> Selected Winner
                          </div>
                        ) : currentRfq?.status === "Approved" ? (
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
