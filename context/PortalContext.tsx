"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ViewType =
  | "login"
  | "register"
  | "dashboard"
  | "vendors"
  | "rfqs"
  | "quotations"
  | "allQuotations"
  | "comparison"
  | "approvals"
  | "pos"
  | "reports"
  | "activity"
  | "settings";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  avatarUrl: string;
  avatarGrayscale: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: "Approved" | "Pending" | "Rejected";
  rating: number;
  email: string;
  phone: string;
  address: string;
  country: string;
  registeredDate: string;
}

export interface RFQItem {
  description: string;
  qty: number;
  unit: string;
  estimatedPrice: number;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  status: "Draft" | "Open" | "Submitted" | "Comparing" | "Under Review" | "Approved";
  items: RFQItem[];
  selectedSuppliers: string[]; // Vendor IDs
  createdAt: string;
}

export interface QuoteItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  items: QuoteItem[];
  deliveryTime: string;
  paymentTerms: string;
  additionalRemarks: string;
  status: "Pending Review" | "Selected" | "Rejected";
  submittedAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  stage: "Prepared" | "Reviewed" | "Approved" | "Completed";
  comments: { user: string; text: string; date: string }[];
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorCountry: string;
  amount: number;
  status: "Issued" | "Acknowledged" | "Paid" | "Delivered";
  date: string;
  items: QuoteItem[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: "User" | "System" | "Error";
  details: string;
}

interface PortalContextType {
  user: { id: string; name: string; email: string; role: string } | null;
  currentView: ViewType;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: ApprovalWorkflow[];
  pos: PurchaseOrder[];
  activityLogs: ActivityLog[];
  selectedRfqForQuote: string | null;
  selectedRfqForCompare: string | null;
  selectedRfqForApproval: string | null;
  theme: "white" | "black";
  userProfile: UserProfile;
  setView: (view: ViewType) => void;
  setTheme: (theme: "white" | "black") => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    phone?: string,
    address?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  addVendor: (vendor: Omit<Vendor, "id" | "registeredDate" | "rating">) => Promise<void>;
  addRFQ: (rfq: Omit<RFQ, "id" | "status" | "createdAt">) => Promise<void>;
  submitQuotation: (
    rfqId: string,
    vendorId: string,
    items: QuoteItem[],
    deliveryTime: string,
    paymentTerms: string,
    remarks: string
  ) => Promise<void>;
  selectQuotationWinner: (rfqId: string, vendorId: string) => Promise<void>;
  approveWorkflow: (workflowId: string, comment: string) => Promise<void>;
  rejectWorkflow: (workflowId: string, comment: string) => Promise<void>;
  setSelectedRfqForQuote: (rfqId: string | null) => void;
  setSelectedRfqForCompare: (rfqId: string | null) => void;
  setSelectedRfqForApproval: (rfqId: string | null) => void;
  addActivity: (
    user: string,
    action: string,
    category: "User" | "System" | "Error",
    details: string
  ) => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal must be used within a PortalProvider");
  return context;
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("login");
  const [theme, setThemeState] = useState<"white" | "black">("white");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "Procurement Officer",
    phone: "",
    address: "",
    avatarUrl: "",
    avatarGrayscale: false,
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<string | null>(null);
  const [selectedRfqForCompare, setSelectedRfqForCompare] = useState<string | null>(null);
  const [selectedRfqForApproval, setSelectedRfqForApproval] = useState<string | null>(null);

  const setTheme = (newTheme: "white" | "black") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark-theme", newTheme === "black");
      document.body.classList.toggle("dark-theme", newTheme === "black");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark-theme", theme === "black");
      document.body.classList.toggle("dark-theme", theme === "black");
    }
  }, [theme]);

  const applySessionUser = useCallback((sessionUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    avatarGrayscale?: boolean;
  }) => {
    const nextUser = {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
    };
    setUser(nextUser);
    setUserProfile({
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      phone: sessionUser.phone || "",
      address: sessionUser.address || "",
      avatarUrl: sessionUser.avatarUrl || "",
      avatarGrayscale: sessionUser.avatarGrayscale ?? false,
    });
    return nextUser;
  }, []);

  const refreshPortalData = useCallback(async () => {
    const response = await fetch("/api/bootstrap", { credentials: "include" });
    if (!response.ok) {
      if (response.status === 401) {
        setUser(null);
        setCurrentView("login");
      }
      return;
    }

    const data = await response.json();
    if (data.user) {
      applySessionUser(data.user);
      setCurrentView((prev) => (prev === "login" || prev === "register" ? "dashboard" : prev));
    }
    setVendors(data.vendors || []);
    setRfqs(data.rfqs || []);
    setQuotations(data.quotations || []);
    setApprovals(data.approvals || []);
    setPos(data.pos || []);
    setActivityLogs(data.activityLogs || []);
  }, [applySessionUser]);

  const runAction = useCallback(async (action: string, payload: Record<string, unknown>) => {
    const response = await fetch("/api/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "Something went wrong.");
    }

    const data = await response.json().catch(() => ({}));
    await refreshPortalData();
    return data as { id?: string; approvalId?: string; stage?: string; ok?: boolean };
  }, [refreshPortalData]);

  useEffect(() => {
    const initialize = async () => {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const data = await response.json().catch(() => null);

      if (data?.user) {
        applySessionUser(data.user);
        await refreshPortalData();
        setCurrentView("dashboard");
      } else {
        setUser(null);
        setCurrentView("login");
      }
    };

    void initialize();
  }, [refreshPortalData, applySessionUser]);

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    await runAction("updateProfile", {
      userId: user.id,
      ...updatedFields,
    });
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || "Invalid credentials.");
    }

    applySessionUser(data.user);
    setCurrentView("dashboard");
    await refreshPortalData();
  };

  const register = async (name: string, email: string, password: string, role: string, phone = "", address = "") => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, phone, address }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || "Could not create the account.");
    }

    applySessionUser(data.user);
    setCurrentView("dashboard");
    await refreshPortalData();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setUserProfile({
      name: "",
      email: "",
      role: "Procurement Officer",
      phone: "",
      address: "",
      avatarUrl: "",
      avatarGrayscale: false,
    });
    setVendors([]);
    setRfqs([]);
    setQuotations([]);
    setApprovals([]);
    setPos([]);
    setActivityLogs([]);
    setSelectedRfqForQuote(null);
    setSelectedRfqForCompare(null);
    setSelectedRfqForApproval(null);
    setCurrentView("login");
  };

  const addVendor = async (vendorData: Omit<Vendor, "id" | "registeredDate" | "rating">) => {
    await runAction("addVendor", vendorData);
  };

  const addRFQ = async (rfqData: Omit<RFQ, "id" | "status" | "createdAt">) => {
    const result = await runAction("addRFQ", rfqData);
    if (rfqData.selectedSuppliers.length > 0 && result.id) {
      setSelectedRfqForQuote(result.id);
    }
  };

  const submitQuotation = async (
    rfqId: string,
    vendorId: string,
    items: QuoteItem[],
    deliveryTime: string,
    paymentTerms: string,
    remarks: string
  ) => {
    await runAction("submitQuotation", {
      rfqId,
      vendorId,
      items,
      deliveryTime,
      paymentTerms,
      remarks,
    });
    setSelectedRfqForCompare(rfqId);
  };

  const selectQuotationWinner = async (rfqId: string, vendorId: string) => {
    await runAction("selectQuotationWinner", { rfqId, vendorId });
    setSelectedRfqForApproval(rfqId);
    setCurrentView("approvals");
  };

  const approveWorkflow = async (workflowId: string, comment: string) => {
    await runAction("approveWorkflow", { workflowId, comment });
    setCurrentView("pos");
  };

  const rejectWorkflow = async (workflowId: string, comment: string) => {
    await runAction("rejectWorkflow", { workflowId, comment });
  };

  const addActivity = async (userName: string, action: string, category: "User" | "System" | "Error", details: string) => {
    await runAction("addActivity", {
      user: userName,
      actionLabel: action,
      category,
      details,
    });
  };

  return (
    <PortalContext.Provider
      value={{
        user,
        currentView,
        vendors,
        rfqs,
        quotations,
        approvals,
        pos,
        activityLogs,
        selectedRfqForQuote,
        selectedRfqForCompare,
        selectedRfqForApproval,
        theme,
        userProfile,
        setView: setCurrentView,
        setTheme,
        updateProfile,
        login,
        register,
        logout,
        addVendor,
        addRFQ,
        submitQuotation,
        selectQuotationWinner,
        approveWorkflow,
        rejectWorkflow,
        setSelectedRfqForQuote,
        setSelectedRfqForCompare,
        setSelectedRfqForApproval,
        addActivity,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};
