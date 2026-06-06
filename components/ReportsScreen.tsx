"use client";

import React from "react";
import { usePortal } from "@/context/PortalContext";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { formatINRShort } from "@/lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsScreen() {
  const { pos, rfqs } = usePortal();

  const totalSpend = pos.reduce((sum, purchaseOrder) => sum + purchaseOrder.amount, 0);

  const rfqById = new Map(rfqs.map((rfq) => [rfq.id, rfq]));
  const categoryTotals = new Map<string, number>();
  rfqs.forEach((rfq) => {
    const matchingPo = pos.find((purchaseOrder) => purchaseOrder.rfqId === rfq.id);
    if (matchingPo) {
      categoryTotals.set(rfq.category, (categoryTotals.get(rfq.category) || 0) + matchingPo.amount);
    }
  });

  const categoryData = Array.from(categoryTotals.entries()).map(([name, value], index) => ({
    name,
    value,
    color: ["#10B981", "#6366F1", "#F59E0B", "#3B82F6", "#EF4444"][index % 5],
  }));

  const vendorTotals = new Map<string, number>();
  pos.forEach((purchaseOrder) => {
    vendorTotals.set(purchaseOrder.vendorName, (vendorTotals.get(purchaseOrder.vendorName) || 0) + purchaseOrder.amount);
  });

  const vendorSpendData = Array.from(vendorTotals.entries())
    .map(([name, spend]) => ({ name, spend }))
    .sort((left, right) => right.spend - left.spend);

  const averageCycleDays =
    pos.length === 0
      ? 0
      : pos.reduce((sum, purchaseOrder) => {
          const rfq = rfqById.get(purchaseOrder.rfqId);
          if (!rfq) return sum;
          const start = new Date(`${rfq.createdAt}T00:00:00`).getTime();
          const end = new Date(`${purchaseOrder.date}T00:00:00`).getTime();
          return sum + Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        }, 0) / pos.length;

  const averageSavingsRate =
    pos.length === 0
      ? 0
      : pos.reduce((sum, purchaseOrder) => {
          const rfq = rfqById.get(purchaseOrder.rfqId);
          if (!rfq) return sum;
          const estimatedTotal = rfq.items.reduce(
            (itemSum, item) => itemSum + item.qty * item.estimatedPrice,
            0
          );
          if (estimatedTotal === 0) return sum;
          const savings = ((estimatedTotal - purchaseOrder.amount) / estimatedTotal) * 100;
          return sum + savings;
        }, 0) / pos.length;

  const metrics = [
    {
      label: "Total Procurement Spend",
      value: formatINRShort(totalSpend),
      desc: "Computed from purchase orders",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Average RFP Cycle Time",
      value: `${averageCycleDays.toFixed(1)} Days`,
      desc: "From RFQ creation to PO issue",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Average Bid Savings Rate",
      value: `${averageSavingsRate.toFixed(1)}%`,
      desc: "Against estimated RFQ totals",
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Reports & Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Procurement metrics and spend intelligence analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bento-card p-6 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {metric.label}
                </span>
                <span className="text-2xl font-black text-slate-850 block tracking-tight">
                  {metric.value}
                </span>
                <span className="text-[10px] font-medium text-slate-400 block">
                  {metric.desc}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${metric.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card p-6 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">Spend by Category</h3>
            <p className="text-slate-400 text-xs mt-0.5 mb-6">Procurement breakdown across categories</p>

            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "11px",
                    }}
                    formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, "Spend"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-slate-500">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bento-card p-6 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">Top Vendors by Spend</h3>
            <p className="text-slate-400 text-xs mt-0.5 mb-6">Total transaction values per registered supplier</p>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vendorSpendData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "11px",
                    }}
                    formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, "Spend"]}
                  />
                  <Bar dataKey="spend" fill="#10B981" radius={[0, 8, 8, 0]} barSize={16}>
                    {vendorSpendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : "#6366F1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
