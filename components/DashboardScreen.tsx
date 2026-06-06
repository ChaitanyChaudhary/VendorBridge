"use client";

import React from "react";
import { usePortal } from "@/context/PortalContext";
import { formatINRShort } from "@/lib/currency";
import {
  FileText,
  CheckSquare,
  DollarSign,
  AlertTriangle,
  PlusCircle,
  UserPlus,
  BarChart,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardScreen() {
  const { rfqs, approvals, pos, activityLogs, setView, user } = usePortal();

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySpendMap = new Map<string, number>();
  pos.forEach((purchaseOrder) => {
    const monthName = new Date(`${purchaseOrder.date}T00:00:00`).toLocaleString("en-US", { month: "short" });
    monthlySpendMap.set(monthName, (monthlySpendMap.get(monthName) || 0) + purchaseOrder.amount);
  });
  const chartData = Array.from(monthlySpendMap.entries())
    .map(([name, spend]) => ({ name, spend }))
    .sort((left, right) => monthOrder.indexOf(left.name) - monthOrder.indexOf(right.name));

  const activeRfqsCount = rfqs.filter((rfq) => rfq.status !== "Approved" && rfq.status !== "Draft").length;
  const pendingApprovalsCount = approvals.filter((approval) => approval.stage !== "Approved" && approval.stage !== "Completed").length;
  const totalSpend = pos.reduce((sum, purchaseOrder) => sum + purchaseOrder.amount, 0);
  const overduePosCount = pos.filter((purchaseOrder) => purchaseOrder.status === "Issued").length;

  const stats = [
    {
      label: "Active RFQs",
      value: activeRfqsCount,
      change: "Live database count",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      view: "rfqs" as const,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovalsCount,
      change: "Workflow items awaiting action",
      icon: CheckSquare,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      view: "approvals" as const,
    },
    {
      label: "Monthly Spend",
      value: formatINRShort(totalSpend),
      change: "Calculated from purchase orders",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      view: "reports" as const,
    },
    {
      label: "Open POs",
      value: overduePosCount,
      change: "Issued and awaiting completion",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      view: "pos" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Welcome back, {user?.name || "Procurement Officer"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here is your procurement overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setView(stat.view)}
                  className="bento-card p-5 cursor-pointer flex flex-col justify-between h-40 group"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider flex items-center gap-0.5">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-extrabold text-slate-800 block tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 block mt-1">
                      {stat.label}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 block mt-1.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 inline" /> {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bento-card p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-base text-slate-800 tracking-tight">Recent Activity</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Latest audits and operations logs</p>
                </div>
                <button
                  onClick={() => setView("activity")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  View full history <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">User / Actor</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Details</th>
                      <th className="pb-3 pr-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-600 divide-y divide-slate-50">
                    {activityLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
                          <span className="font-semibold text-slate-700">{log.user}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-xs max-w-[200px] truncate">{log.details}</td>
                        <td className="py-3 pr-2 text-right text-xs text-slate-400 font-normal">
                          {log.timestamp.split(" ")[1]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bento-card p-6 flex flex-col justify-between h-[280px]">
            <div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight">Spend Trend</h3>
              <p className="text-slate-400 text-xs mt-0.5 mb-6">Monthly cumulative spend (INR)</p>

              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, "Spend"]}
                    />
                    <Area type="monotone" dataKey="spend" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 flex flex-col justify-between h-[284px]">
            <div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight">Quick Actions</h3>
              <p className="text-slate-400 text-xs mt-0.5 mb-6">Fast-track procurement procedures</p>

              <div className="space-y-3">
                <button
                  onClick={() => setView("rfqs")}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Create RFQ</span>
                      <span className="text-[10px] text-slate-400">Initiate new quotation request</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>

                <button
                  onClick={() => setView("vendors")}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Add Vendor</span>
                      <span className="text-[10px] text-slate-400">Register new partner supplier</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>

                <button
                  onClick={() => setView("reports")}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <BarChart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">View Reports</span>
                      <span className="text-[10px] text-slate-400">Analyze procurement data</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
