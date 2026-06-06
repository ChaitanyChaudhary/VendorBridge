"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import Sidebar from "@/components/Sidebar";
import LoginScreen from "@/components/LoginScreen";
import RegisterScreen from "@/components/RegisterScreen";
import DashboardScreen from "@/components/DashboardScreen";
import VendorsScreen from "@/components/VendorsScreen";
import CreateRFQScreen from "@/components/CreateRFQScreen";
import SubmitQuotationScreen from "@/components/SubmitQuotationScreen";
import AllQuotationsScreen from "@/components/AllQuotationsScreen";
import CompareQuotationsScreen from "@/components/CompareQuotationsScreen";
import ApprovalWorkflowScreen from "@/components/ApprovalWorkflowScreen";
import PurchaseOrderScreen from "@/components/PurchaseOrderScreen";
import ActivityScreen from "@/components/ActivityScreen";
import ReportsScreen from "@/components/ReportsScreen";
import SettingsScreen from "@/components/SettingsScreen";
import { Menu } from "lucide-react";

export default function Home() {
  const { user, currentView } = usePortal();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Auth Routing
  if (!user) {
    if (currentView === "register") {
      return <RegisterScreen />;
    }
    return <LoginScreen />;
  }

  // 2. Dashboard Inner Panel Switcher
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardScreen />;
      case "vendors":
        return <VendorsScreen />;
      case "rfqs":
        return <CreateRFQScreen />;
      case "quotations":
        return <SubmitQuotationScreen />;
      case "allQuotations":
        return <AllQuotationsScreen />;
      case "comparison":
        return <CompareQuotationsScreen />;
      case "approvals":
        return <ApprovalWorkflowScreen />;
      case "pos":
        return <PurchaseOrderScreen />;
      case "reports":
        return <ReportsScreen />;
      case "activity":
        return <ActivityScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-50 p-2 sm:p-4 gap-3 sm:gap-4 lg:gap-6 overflow-hidden">
      {/* Sidebar navigation */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setMobileSidebarOpen(false)}
            type="button"
          />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-sm">
            <Sidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content pane */}
      <main className="flex-1 min-h-0 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm overflow-y-auto scrollbar-none relative">
        <div className="flex items-center justify-between gap-3 mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VendorBridge</p>
            <p className="text-xs font-semibold text-slate-700">Procure Suite</p>
          </div>
        </div>

        <div className="hidden lg:block">
          {renderCurrentView()}
        </div>
        <div className="lg:hidden">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}
