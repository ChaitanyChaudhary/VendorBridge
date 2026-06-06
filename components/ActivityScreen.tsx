"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import { History, ShieldAlert, Settings, UserCheck, Search, Filter } from "lucide-react";

export default function ActivityScreen() {
  const { activityLogs } = usePortal();
  const [filterType, setFilterType] = useState<"All" | "User" | "System" | "Error">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter = filterType === "All" || log.category === filterType;
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogIcon = (category: string) => {
    switch (category) {
      case "User":
        return <UserCheck className="w-4.5 h-4.5 text-blue-600" />;
      case "System":
        return <Settings className="w-4.5 h-4.5 text-emerald-600" />;
      case "Error":
        return <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />;
      default:
        return <History className="w-4.5 h-4.5 text-slate-400" />;
    }
  };

  const getLogColor = (category: string) => {
    switch (category) {
      case "User":
        return "bg-blue-50 border-blue-100 text-blue-700";
      case "System":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      case "Error":
        return "bg-rose-50 border-rose-100 text-rose-700";
      default:
        return "bg-slate-50 border-slate-100 text-slate-650";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Activity & Logs
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Procurement audit trail and system operational feeds
        </p>
      </div>

      {/* Filter Bento Card */}
      <div className="bento-card p-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              placeholder="Search logs details..."
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {(["All", "User", "System", "Error"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  filterType === type
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm"
                    : "bg-white text-slate-500 border-slate-100 hover:text-slate-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List Bento Card */}
      <div className="bento-card p-6 min-h-[450px]">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-450">
            <Filter className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-sm font-semibold">No logs found</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing your search keywords.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-100 pl-6 space-y-6 ml-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative animate-fade-in">
                {/* Bullet point icon */}
                <div
                  className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full flex items-center justify-center border shadow-inner ${getLogColor(
                    log.category
                  )}`}
                >
                  {getLogIcon(log.category)}
                </div>

                {/* Log card */}
                <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-200 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-800 text-xs">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">•</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Actor: {log.user}</span>
                      <span className="text-[10px] text-slate-450 font-bold font-mono bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded">
                        {log.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                      {log.details}
                    </p>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 shrink-0 text-right">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
