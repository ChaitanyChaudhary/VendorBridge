"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePortal, ViewType } from "@/context/PortalContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  FileSignature,
  FileSpreadsheet,
  CheckSquare,
  Receipt,
  BarChart3,
  History,
  LogOut,
  Building2,
  Settings,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  id: ViewType;
  label: string;
  icon: LucideIcon;
}

export default function Sidebar() {
  const { currentView, setView, user, logout, userProfile } = usePortal();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const menuItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "rfqs", label: "RFQs", icon: FileText },
    { id: "quotations", label: "Quotations", icon: FileSignature },
    { id: "allQuotations", label: "All Quotations", icon: FileSpreadsheet },
    { id: "approvals", label: "Approvals", icon: CheckSquare },
    { id: "pos", label: "Purchase Orders", icon: Receipt },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "activity", label: "Activity Logs", icon: History },
  ];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Helper to highlight active navigation link
  const isActive = (viewId: ViewType) => currentView === viewId;

  return (
    <aside className="w-64 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col shadow-sm h-[calc(100vh-2rem)] sticky top-4 select-none overflow-visible">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-800 tracking-tight block leading-tight">
            VendorBridge
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest leading-none">
            Procure Suite
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
              }`}
            >
              <IconComponent
                className={`w-4.5 h-4.5 transition-colors ${
                  active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Session Profile Card */}
      {user && (
        <div ref={profileMenuRef} className="mt-auto pt-6 border-t border-slate-100 pb-2 relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl border transition-all duration-200 text-left ${
              profileMenuOpen
                ? "bg-emerald-50 border-emerald-100 shadow-sm"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner shrink-0">
              {userProfile.avatarUrl ? (
                <Image
                  src={userProfile.avatarUrl}
                  alt={userProfile.name || user.name}
                  width={40}
                  height={40}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    userProfile.avatarGrayscale ? "avatar-bw" : ""
                  }`}
                />
              ) : (
                <span className="font-bold text-sm text-emerald-800 uppercase">
                  {(userProfile.name || user.name).charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-slate-800 block truncate leading-tight">
                {userProfile.name || user.name}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block truncate leading-none mt-1">
                {userProfile.role || user.role}
              </span>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                profileMenuOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden z-20">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setView("settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
