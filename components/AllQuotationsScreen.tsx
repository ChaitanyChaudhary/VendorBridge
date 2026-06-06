"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import { calculateGST, formatINR } from "@/lib/currency";
import {
  ArrowUpDown,
  CalendarDays,
  FileSignature,
  IndianRupee,
  Package,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

type ViewMode = "master" | "rfq" | "vendor";

export default function AllQuotationsScreen() {
  const { rfqs, quotations, setSelectedRfqForCompare, setView } = usePortal();
  const [viewMode, setViewMode] = useState<ViewMode>("master");

  const quoteRows = quotations.map((quote) => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const gst = calculateGST(subtotal);
    return {
      ...quote,
      subtotal,
      gst,
      grandTotal: gst.grandTotal,
    };
  });

  const rfqsWithQuotes = rfqs.filter((rfq) => quotations.some((quote) => quote.rfqId === rfq.id));

  const vendorRows = Array.from(
    quotations.reduce((map, quote) => {
      const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const current = map.get(quote.vendorId) || {
        vendorId: quote.vendorId,
        vendorName: quote.vendorName,
        bids: 0,
        totalValue: 0,
        bestBidCount: 0,
        lowestGrandTotal: Infinity,
      };

      const nextGrandTotal = calculateGST(subtotal).grandTotal;
      current.bids += 1;
      current.totalValue += nextGrandTotal;
      current.lowestGrandTotal = Math.min(current.lowestGrandTotal, nextGrandTotal);
      map.set(quote.vendorId, current);
      return map;
    }, new Map<string, { vendorId: string; vendorName: string; bids: number; totalValue: number; bestBidCount: number; lowestGrandTotal: number }>())
  ).map((entry) => entry[1]);

  quoteRows.forEach((quote) => {
    const lowestInRfQ = Math.min(
      ...quoteRows.filter((row) => row.rfqId === quote.rfqId).map((row) => row.grandTotal)
    );
    if (quote.grandTotal === lowestInRfQ) {
      const vendorStat = vendorRows.find((row) => row.vendorId === quote.vendorId);
      if (vendorStat) vendorStat.bestBidCount += 1;
    }
  });

  const totals = quoteRows.reduce(
    (accumulator, quote) => {
      accumulator.quoteCount += 1;
      accumulator.subtotal += quote.subtotal;
      accumulator.grandTotal += quote.grandTotal;
      accumulator.lowestGrandTotal = Math.min(accumulator.lowestGrandTotal, quote.grandTotal);
      return accumulator;
    },
    { quoteCount: 0, subtotal: 0, grandTotal: 0, lowestGrandTotal: Infinity }
  );

  const topQuote =
    quoteRows.length > 0
      ? quoteRows.reduce((best, quote) => (quote.grandTotal < best.grandTotal ? quote : best), quoteRows[0])
      : null;

  const topRfQ = rfqsWithQuotes
    .map((rfq) => {
      const quotes = quoteRows.filter((quote) => quote.rfqId === rfq.id);
      const lowest = quotes.reduce((best, quote) => (quote.grandTotal < best.grandTotal ? quote : best), quotes[0]);
      return { rfq, quotes, lowest };
    })
    .sort((left, right) => left.lowest.grandTotal - right.lowest.grandTotal);

  const openComparison = (rfqId: string) => {
    setSelectedRfqForCompare(rfqId);
    setView("comparison");
  };

  if (quotations.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
            All Quotations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            No quotations have been submitted yet.
          </p>
        </div>
        <div className="bento-card p-10 text-center">
          <FileSignature className="w-11 h-11 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">There is nothing to compare yet.</p>
          <button
            onClick={() => setView("quotations")}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm"
          >
            Submit First Quotation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
            All Quotations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare every submitted quote across all RFQs from one dashboard.
          </p>
        </div>

        <div className="inline-flex bg-slate-50 border border-slate-100 rounded-2xl p-1">
          {[
            { key: "master", label: "Master View" },
            { key: "rfq", label: "RFQ Summary" },
            { key: "vendor", label: "Vendor Scorecard" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setViewMode(item.key as ViewMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                viewMode === item.key
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{totals.quoteCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Quotes</span>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{formatINR(totals.grandTotal)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bid Volume</span>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {topQuote ? formatINR(topQuote.grandTotal) : "-"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Overall Bid</span>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">{rfqsWithQuotes.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RFQs Covered</span>
          </div>
        </div>
      </div>

      {viewMode === "master" && (
        <div className="bento-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight">Master Quotation Ledger</h3>
              <p className="text-slate-400 text-xs mt-0.5">All bids, totals, and delivery terms in one table.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
              Lowest bid highlighted per RFQ
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Quote</th>
                  <th className="pb-3">RFQ</th>
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3 text-right">Subtotal</th>
                  <th className="pb-3 text-right">GST</th>
                  <th className="pb-3 text-right">Grand Total</th>
                  <th className="pb-3">Delivery</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {quoteRows.map((quote) => {
                  const rfq = rfqs.find((item) => item.id === quote.rfqId);
                  const lowestTotalForRfq = Math.min(
                    ...quoteRows.filter((item) => item.rfqId === quote.rfqId).map((item) => item.grandTotal)
                  );
                  const isLowest = quote.grandTotal === lowestTotalForRfq;

                  return (
                    <tr key={quote.id} className={`hover:bg-slate-50/50 transition-colors ${isLowest ? "bg-emerald-50/20" : ""}`}>
                      <td className="py-3.5 pl-3 font-mono text-[10px] text-slate-400 font-bold">
                        {quote.id}
                      </td>
                      <td className="py-3.5">
                        <div>
                          <span className="font-bold text-slate-700 block text-[11px]">{rfq?.title || quote.rfqId}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{quote.rfqId}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-800">{quote.vendorName}</span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-700">{formatINR(quote.subtotal)}</td>
                      <td className="py-3.5 text-right text-slate-500">{formatINR(quote.gst.totalGst)}</td>
                      <td className="py-3.5 text-right">
                        <span className={`font-extrabold ${isLowest ? "text-emerald-600" : "text-slate-800"}`}>
                          {formatINR(quote.grandTotal)}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">{quote.deliveryTime}</td>
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
                      <td className="py-3.5 text-right pr-3">
                        <button
                          onClick={() => openComparison(quote.rfqId)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          Compare RFQ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "rfq" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {topRfQ.map(({ rfq, quotes, lowest }) => (
            <button
              key={rfq.id}
              onClick={() => openComparison(rfq.id)}
              className="bento-card p-6 text-left"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">{rfq.id}</span>
                  <h3 className="font-bold text-base text-slate-800 tracking-tight mt-1">{rfq.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rfq.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {rfq.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Quotes Received</span>
                  <span className="text-lg font-extrabold text-slate-800 block mt-1">{quotes.length}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Best Grand Total</span>
                  <span className="text-lg font-extrabold text-emerald-600 block mt-1">{formatINR(lowest.grandTotal)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Best vendor
                </span>
                <span className="text-sm font-bold text-slate-800">{lowest.vendorName}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {viewMode === "vendor" && (
        <div className="bento-card p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight">Vendor Scorecard</h3>
              <p className="text-slate-400 text-xs mt-0.5">See who is submitting the most competitive bids.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Users className="w-4 h-4" />
              Aggregated by vendor
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Vendor</th>
                  <th className="pb-3">Bid Count</th>
                  <th className="pb-3 text-right">Avg Grand Total</th>
                  <th className="pb-3 text-right">Best Bid Count</th>
                  <th className="pb-3 text-right pr-3">Lowest Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {vendorRows
                  .sort((left, right) => left.lowestGrandTotal - right.lowestGrandTotal)
                  .map((vendor) => (
                    <tr key={vendor.vendorId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pl-3">
                        <div>
                          <span className="font-bold text-slate-800 block">{vendor.vendorName}</span>
                          <span className="text-[9px] font-mono text-slate-400">{vendor.vendorId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">{vendor.bids}</td>
                      <td className="py-3.5 text-right font-bold text-slate-700">
                        {formatINR(vendor.totalValue / vendor.bids)}
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-600">
                        {vendor.bestBidCount}
                      </td>
                      <td className="py-3.5 text-right pr-3 font-extrabold text-slate-800">
                        {formatINR(vendor.lowestGrandTotal)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <CalendarDays className="w-4 h-4" />
            Click a row in Master View to jump into RFQ-level comparison
          </div>
        </div>
      )}
    </div>
  );
}
