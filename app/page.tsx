"use client";

import React from "react";
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

export default function Home() {
  const { user, currentView } = usePortal();

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
    <div className="flex min-h-screen bg-slate-50 p-4 gap-6">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content pane */}
      <main className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-2rem)] relative">
        {renderCurrentView()}
      </main>
    </div>
  );
}
