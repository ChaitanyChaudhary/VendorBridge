"use client";

import React from "react";
import { usePortal } from "@/context/PortalContext";
import { TrendingUp, Award, Calendar, DollarSign } from "lucide-react";
import { formatINR, formatINRShort } from "@/lib/currency";
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
  const { pos } = usePortal();

  // Compute reports metrics
  const totalSpend = pos.reduce((sum, po) => sum + po.amount, 0) + 2215000; // base mockup total ₹2.3M
  
  // Data for Category breakdown
  const categoryData = [
    { name: "Furniture & Decor", value: 121200 + 40000, color: "#10B981" }, // Emerald
    { name: "IT Hardware & Software", value: 85000 + 1500000, color: "#6366F1" }, // Indigo
    { name: "Office Supplies & Paper", value: 250000, color: "#F59E0B" }, // Amber
    { name: "Logistics & Shipping", value: 38800, color: "#3B82F6" }, // Blue
  ];

  // Data for Top Vendors
  const vendorSpendData = [
    { name: "TechCorp", spend: 1585000 },
    { name: "Info Supplies", spend: 121200 },
    { name: "OfficeDepot", spend: 250000 },
    { name: "GlobalOffice", spend: 40000 },
  ].sort((a, b) => b.spend - a.spend);

  const metrics = [
    {
      label: "Total Procurement Spend",
      value: formatINRShort(totalSpend),
      desc: "+4.2% vs previous period",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Average RFP Cycle Time",
      value: "8.4 Days",
      desc: "-1.2 days reduction (Faster)",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Average Bid Savings Rate",
      value: "14.6%",
      desc: "Target: 12% (+2.6% over)",
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Reports & Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Procurement metrics and spend intelligence analysis
        </p>
      </div>

      {/* Metrics Bento Row */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Spend by Category Donut */}
        <div className="bento-card p-6 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">
              Spend by Category
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 mb-6">
              Procurement breakdown across departments
            </p>

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
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Spend"]}
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

        {/* Right Card: Top Vendors Spend Horizontal Bar */}
        <div className="bento-card p-6 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">
              Top Vendors by Spend
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 mb-6">
              Total transaction values per registered supplier
            </p>

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
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
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
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Spend"]}
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
