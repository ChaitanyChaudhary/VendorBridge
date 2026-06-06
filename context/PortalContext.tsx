"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  user: { name: string; email: string; role: string } | null;
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
  updateProfile: (profile: Partial<UserProfile>) => void;
  login: (name: string, email: string, role: string) => void;
  register: (name: string, email: string, role: string) => void;
  logout: () => void;
  addVendor: (vendor: Omit<Vendor, "id" | "registeredDate" | "rating">) => void;
  addRFQ: (rfq: Omit<RFQ, "id" | "status" | "createdAt">) => void;
  submitQuotation: (rfqId: string, vendorId: string, items: QuoteItem[], deliveryTime: string, paymentTerms: string, remarks: string) => void;
  selectQuotationWinner: (rfqId: string, vendorId: string) => void;
  approveWorkflow: (workflowId: string, comment: string) => void;
  rejectWorkflow: (workflowId: string, comment: string) => void;
  setSelectedRfqForQuote: (rfqId: string | null) => void;
  setSelectedRfqForCompare: (rfqId: string | null) => void;
  setSelectedRfqForApproval: (rfqId: string | null) => void;
  addActivity: (user: string, action: string, category: "User" | "System" | "Error", details: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal must be used within a PortalProvider");
  return context;
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("login");
  const [theme, setThemeState] = useState<"white" | "black">("white");

  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "Procurement Officer",
    phone: "+1 (555) 019-2834",
    address: "100 Gateway Blvd, Suite 250, San Jose, CA",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=david",
    avatarGrayscale: false,
  });

  // Toggle DOM styling based on theme
  const setTheme = (newTheme: "white" | "black") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      if (newTheme === "black") {
        document.documentElement.classList.add("dark-theme");
        document.body.classList.add("dark-theme");
      } else {
        document.documentElement.classList.remove("dark-theme");
        document.body.classList.remove("dark-theme");
      }
    }
  };

  // Sync theme class on mount/reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "black") {
        document.documentElement.classList.add("dark-theme");
        document.body.classList.add("dark-theme");
      } else {
        document.documentElement.classList.remove("dark-theme");
        document.body.classList.remove("dark-theme");
      }
    }
  }, [theme]);

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const merged = { ...prev, ...updatedFields };
      // Sync with user session state if name/email/role changes
      if (user && (updatedFields.name || updatedFields.email || updatedFields.role)) {
        setUser({
          name: merged.name,
          email: merged.email,
          role: merged.role,
        });
      }
      return merged;
    });

    addActivity(
      user?.name || "System",
      "Update Profile",
      "User",
      `User updated profile credentials (grayscale mode: ${updatedFields.avatarGrayscale !== undefined ? updatedFields.avatarGrayscale : userProfile.avatarGrayscale}).`
    );
  };

  // Mock Databases
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "VND-001",
      name: "Info Supplies Ltd",
      category: "Office Supplies & Furniture",
      status: "Approved",
      rating: 4.8,
      email: "sales@infosupplies.com",
      phone: "+1 (555) 123-4567",
      address: "123 Supply Ave, Suite 400",
      country: "United States",
      registeredDate: "2025-01-15",
    },
    {
      id: "VND-002",
      name: "GlobalOffice Inc",
      category: "Furniture & Decor",
      status: "Approved",
      rating: 4.2,
      email: "contracts@globaloffice.com",
      phone: "+1 (555) 987-6543",
      address: "456 Executive Way",
      country: "Canada",
      registeredDate: "2025-02-10",
    },
    {
      id: "VND-003",
      name: "OfficeDepot Corp",
      category: "Office Supplies & Paper",
      status: "Approved",
      rating: 4.5,
      email: "gov@officedepot.com",
      phone: "+1 (555) 456-7890",
      address: "789 Stationery Blvd",
      country: "United States",
      registeredDate: "2025-03-01",
    },
    {
      id: "VND-004",
      name: "TechCorp Solutions",
      category: "IT Hardware & Software",
      status: "Approved",
      rating: 4.6,
      email: "procurement@techcorp.com",
      phone: "+1 (555) 890-1234",
      address: "101 Silicon Valley Road",
      country: "United States",
      registeredDate: "2025-04-12",
    },
    {
      id: "VND-005",
      name: "FastDelivery Logistics",
      category: "Logistics & Shipping",
      status: "Pending",
      rating: 3.9,
      email: "partners@fastdel.com",
      phone: "+1 (555) 234-5678",
      address: "55 Cargo Way",
      country: "United Kingdom",
      registeredDate: "2026-05-20",
    },
  ]);

  const [rfqs, setRfqs] = useState<RFQ[]>([
    {
      id: "RFQ-2025-001",
      title: "Office furniture procurement Q2",
      description: "Procurement of desks, ergonomic chairs, and conference room tables for the headquarters expansion project.",
      category: "Office Supplies & Furniture",
      deadline: "2025-06-15",
      status: "Comparing",
      items: [
        { description: "Ergonomic Office Chairs", qty: 120, unit: "Pcs", estimatedPrice: 450 },
        { description: "Adjustable Standing Desks", qty: 100, unit: "Pcs", estimatedPrice: 600 },
        { description: "Conference Room Tables (10 seater)", qty: 5, unit: "Pcs", estimatedPrice: 1500 },
        { description: "Lounge Soft Seating Sofa Sets", qty: 8, unit: "Sets", estimatedPrice: 1200 },
      ],
      selectedSuppliers: ["VND-001", "VND-002", "VND-003"],
      createdAt: "2025-05-15",
    },
    {
      id: "RFQ-2025-002",
      title: "IT Hardware Refresh",
      description: "Laptops, monitors, and peripherals for engineering team new hires.",
      category: "IT Hardware & Software",
      deadline: "2025-06-20",
      status: "Open",
      items: [
        { description: "Developer Laptops (32GB RAM, 1TB SSD)", qty: 25, unit: "Pcs", estimatedPrice: 2000 },
        { description: "4K Monitors 27-inch", qty: 50, unit: "Pcs", estimatedPrice: 400 },
        { description: "USB-C Docking Stations", qty: 25, unit: "Pcs", estimatedPrice: 180 },
      ],
      selectedSuppliers: ["VND-004"],
      createdAt: "2025-05-22",
    },
    {
      id: "RFQ-2025-003",
      title: "Stationery Supplies Annual Contract",
      description: "Annual replenishment of standard office paper, folders, writing utilities, and notebooks.",
      category: "Office Supplies & Paper",
      deadline: "2025-07-01",
      status: "Draft",
      items: [
        { description: "A4 Copy Paper Reams", qty: 1000, unit: "Reams", estimatedPrice: 5 },
        { description: "Assorted Writing Pens (Box of 50)", qty: 200, unit: "Boxes", estimatedPrice: 15 },
        { description: "Arch File Folders", qty: 500, unit: "Pcs", estimatedPrice: 3 },
      ],
      selectedSuppliers: ["VND-001", "VND-003"],
      createdAt: "2025-06-01",
    },
  ]);

  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: "QTN-001",
      rfqId: "RFQ-2025-001",
      vendorId: "VND-001",
      vendorName: "Info Supplies Ltd",
      items: [
        { description: "Ergonomic Office Chairs", qty: 120, unit: "Pcs", unitPrice: 420, totalPrice: 50400 },
        { description: "Adjustable Standing Desks", qty: 100, unit: "Pcs", unitPrice: 550, totalPrice: 55000 },
        { description: "Conference Room Tables (10 seater)", qty: 5, unit: "Pcs", unitPrice: 1400, totalPrice: 7000 },
        { description: "Lounge Soft Seating Sofa Sets", qty: 8, unit: "Sets", unitPrice: 1100, totalPrice: 8800 },
      ],
      deliveryTime: "10 Days",
      paymentTerms: "Net 30",
      additionalRemarks: "All furniture includes a 5-year comprehensive manufacturer warranty. Assembly and installation are free of charge.",
      status: "Pending Review",
      submittedAt: "2025-05-20",
    },
    {
      id: "QTN-002",
      rfqId: "RFQ-2025-001",
      vendorId: "VND-002",
      vendorName: "GlobalOffice Inc",
      items: [
        { description: "Ergonomic Office Chairs", qty: 120, unit: "Pcs", unitPrice: 450, totalPrice: 54000 },
        { description: "Adjustable Standing Desks", qty: 100, unit: "Pcs", unitPrice: 580, totalPrice: 58000 },
        { description: "Conference Room Tables (10 seater)", qty: 5, unit: "Pcs", unitPrice: 1500, totalPrice: 7500 },
        { description: "Lounge Soft Seating Sofa Sets", qty: 8, unit: "Sets", unitPrice: 1200, totalPrice: 9600 },
      ],
      deliveryTime: "15 Days",
      paymentTerms: "Net 45",
      additionalRemarks: "Premium quality wooden finishes. Free delivery included. Installation charged at $1,200 flat fee.",
      status: "Pending Review",
      submittedAt: "2025-05-22",
    },
    {
      id: "QTN-003",
      rfqId: "RFQ-2025-001",
      vendorId: "VND-003",
      vendorName: "OfficeDepot Corp",
      items: [
        { description: "Ergonomic Office Chairs", qty: 120, unit: "Pcs", unitPrice: 440, totalPrice: 52800 },
        { description: "Adjustable Standing Desks", qty: 100, unit: "Pcs", unitPrice: 570, totalPrice: 57000 },
        { description: "Conference Room Tables (10 seater)", qty: 5, unit: "Pcs", unitPrice: 1450, totalPrice: 7250 },
        { description: "Lounge Soft Seating Sofa Sets", qty: 8, unit: "Sets", unitPrice: 1150, totalPrice: 9200 },
      ],
      deliveryTime: "12 Days",
      paymentTerms: "Net 30",
      additionalRemarks: "Ready to ship immediately from regional warehouse. 3-year standard warranty.",
      status: "Pending Review",
      submittedAt: "2025-05-21",
    },
  ]);

  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([
    {
      id: "APRV-001",
      rfqId: "RFQ-2025-001",
      rfqTitle: "Office furniture procurement Q2",
      vendorId: "VND-001",
      vendorName: "Info Supplies Ltd",
      amount: 121200, // Total: 50400 + 55000 + 7000 + 8800 = 121200
      stage: "Reviewed",
      comments: [
        { user: "Sarah Jenkins (Buyer)", text: "Verified Info Supplies Ltd's compliance documentation. They offer the lowest pricing and quickest delivery time.", date: "2025-05-25 14:30" },
        { user: "David Miller (Procurement Manager)", text: "Reviewed the quotation comparison. Technical specifications meet our HQ guidelines. Forwarding to Procurement Director for approval.", date: "2025-05-26 10:15" },
      ],
      updatedAt: "2025-05-26 10:15",
    },
  ]);

  const [pos, setPos] = useState<PurchaseOrder[]>([
    {
      id: "PO-2025-999",
      rfqId: "RFQ-2024-080",
      vendorId: "VND-004",
      vendorName: "TechCorp Solutions",
      vendorEmail: "procurement@techcorp.com",
      vendorPhone: "+1 (555) 890-1234",
      vendorAddress: "101 Silicon Valley Road",
      vendorCountry: "United States",
      amount: 85000,
      status: "Delivered",
      date: "2025-04-15",
      items: [
        { description: "Developer Workstations", qty: 40, unit: "Pcs", unitPrice: 1500, totalPrice: 60000 },
        { description: "Dual-arm Monitor Mounts", qty: 100, unit: "Pcs", unitPrice: 250, totalPrice: 25000 },
      ],
    },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "LOG-001",
      timestamp: "2026-06-06 09:10:05",
      user: "System",
      action: "Portal Initialization",
      category: "System",
      details: "Procurement database synched with supplier registry API.",
    },
    {
      id: "LOG-002",
      timestamp: "2026-06-06 09:25:00",
      user: "David Miller",
      action: "Login",
      category: "User",
      details: "User David Miller (Procurement Manager) successfully logged into the system.",
    },
    {
      id: "LOG-003",
      timestamp: "2026-06-06 09:30:15",
      user: "David Miller",
      action: "Create RFQ Draft",
      category: "User",
      details: "Created draft RFQ: Office furniture procurement Q2 (RFQ-2025-001).",
    },
    {
      id: "LOG-004",
      timestamp: "2026-06-06 09:35:40",
      user: "David Miller",
      action: "Publish RFQ",
      category: "User",
      details: "RFQ-2025-001 published to Info Supplies, GlobalOffice, and OfficeDepot.",
    },
    {
      id: "LOG-005",
      timestamp: "2026-06-06 09:45:10",
      user: "Info Supplies Ltd",
      action: "Submit Quotation",
      category: "User",
      details: "Quotation submitted for RFQ-2025-001. Total bid: $121,200.00.",
    },
    {
      id: "LOG-006",
      timestamp: "2026-06-06 09:50:30",
      user: "GlobalOffice Inc",
      action: "Submit Quotation",
      category: "User",
      details: "Quotation submitted for RFQ-2025-001. Total bid: $129,100.00.",
    },
    {
      id: "LOG-007",
      timestamp: "2026-06-06 09:55:00",
      user: "OfficeDepot Corp",
      action: "Submit Quotation",
      category: "User",
      details: "Quotation submitted for RFQ-2025-001. Total bid: $126,250.00.",
    },
  ]);

  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<string | null>("RFQ-2025-002");
  const [selectedRfqForCompare, setSelectedRfqForCompare] = useState<string | null>("RFQ-2025-001");
  const [selectedRfqForApproval, setSelectedRfqForApproval] = useState<string | null>("RFQ-2025-001");

  const setView = (view: ViewType) => {
    setCurrentView(view);
  };

  const login = (name: string, email: string, role: string) => {
    setUser({ name, email, role });
    setUserProfile((prev) => ({
      ...prev,
      name,
      email,
      role: role || prev.role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name.replace(/\s+/g, "").toLowerCase()}`,
    }));
    setCurrentView("dashboard");
    addActivity(name, "Login", "User", `User ${name} (${role}) logged in.`);
  };

  const register = (name: string, email: string, role: string) => {
    setUser({ name, email, role });
    setUserProfile((prev) => ({
      ...prev,
      name,
      email,
      role: role || prev.role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name.replace(/\s+/g, "").toLowerCase()}`,
    }));
    setCurrentView("dashboard");
    addActivity(name, "Registration & Login", "User", `New user ${name} registered and logged in as ${role}.`);
  };

  const logout = () => {
    if (user) {
      addActivity(user.name, "Logout", "User", `User ${user.name} logged out.`);
    }
    setUser(null);
    setCurrentView("login");
  };

  const addVendor = (vendorData: Omit<Vendor, "id" | "registeredDate" | "rating">) => {
    const nextId = `VND-00${vendors.length + 1}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: nextId,
      registeredDate: new Date().toISOString().split("T")[0],
      rating: 4.0, // default rating
    };
    setVendors((prev) => [...prev, newVendor]);
    addActivity(
      user?.name || "System",
      "Add Vendor",
      "User",
      `New supplier registered: ${newVendor.name} (ID: ${newVendor.id}, Category: ${newVendor.category}).`
    );
  };

  const addRFQ = (rfqData: Omit<RFQ, "id" | "status" | "createdAt">) => {
    const nextId = `RFQ-2025-00${rfqs.length + 1}`;
    const newRfq: RFQ = {
      ...rfqData,
      id: nextId,
      status: "Open",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRfqs((prev) => [...prev, newRfq]);
    addActivity(
      user?.name || "System",
      "Publish RFQ",
      "User",
      `Published new RFQ: "${newRfq.title}" (ID: ${newRfq.id}) to ${newRfq.selectedSuppliers.length} suppliers.`
    );
    // Auto-generate a draft quotation for a supplier to show interactive workflow
    if (newRfq.selectedSuppliers.length > 0) {
      // Set this RFQ as selected for submission
      setSelectedRfqForQuote(newRfq.id);
    }
  };

  const submitQuotation = (
    rfqId: string,
    vendorId: string,
    items: QuoteItem[],
    deliveryTime: string,
    paymentTerms: string,
    remarks: string
  ) => {
    const matchedVendor = vendors.find((v) => v.id === vendorId);
    const vendorName = matchedVendor ? matchedVendor.name : "Unknown Vendor";
    const nextId = `QTN-00${quotations.length + 1}`;

    const newQuotation: Quotation = {
      id: nextId,
      rfqId,
      vendorId,
      vendorName,
      items,
      deliveryTime,
      paymentTerms,
      additionalRemarks: remarks,
      status: "Pending Review",
      submittedAt: new Date().toISOString().split("T")[0],
    };

    setQuotations((prev) => [...prev, newQuotation]);

    // Update RFQ status to "Comparing" if there are multiple submissions
    setRfqs((prev) =>
      prev.map((r) => {
        if (r.id === rfqId) {
          return { ...r, status: "Comparing" };
        }
        return r;
      })
    );

    addActivity(
      vendorName,
      "Submit Quotation",
      "User",
      `Submitted quotation for RFQ "${rfqs.find((r) => r.id === rfqId)?.title}" (${rfqId}). Bid: $${items
        .reduce((sum, item) => sum + item.totalPrice, 0)
        .toLocaleString()}.`
    );

    // If it's the first quote for this RFQ, set it up as a draft comparison
    setSelectedRfqForCompare(rfqId);
  };

  const selectQuotationWinner = (rfqId: string, vendorId: string) => {
    const q = quotations.find((quote) => quote.rfqId === rfqId && quote.vendorId === vendorId);
    if (!q) return;

    // Reject all other quotations for this RFQ, set this one to Selected
    setQuotations((prev) =>
      prev.map((item) => {
        if (item.rfqId === rfqId) {
          if (item.vendorId === vendorId) {
            return { ...item, status: "Selected" };
          } else {
            return { ...item, status: "Rejected" };
          }
        }
        return item;
      })
    );

    // Update RFQ Status to "Under Review"
    setRfqs((prev) =>
      prev.map((r) => {
        if (r.id === rfqId) {
          return { ...r, status: "Under Review" };
        }
        return r;
      })
    );

    // Calculate total amount
    const totalAmount = q.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create a new Approval Workflow
    const nextId = `APRV-00${approvals.length + 1}`;
    const newWorkflow: ApprovalWorkflow = {
      id: nextId,
      rfqId,
      rfqTitle: rfqs.find((r) => r.id === rfqId)?.title || "Office Furniture Procurement",
      vendorId,
      vendorName: q.vendorName,
      amount: totalAmount,
      stage: "Prepared",
      comments: [
        {
          user: user?.name || "System Manager",
          text: `Selected ${q.vendorName} as winner. Technical parameters and pricing approved. Submitting to management for final workflow approval.`,
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      ],
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setApprovals((prev) => [...prev, newWorkflow]);
    setSelectedRfqForApproval(rfqId);

    addActivity(
      user?.name || "System",
      "Select RFQ Winner",
      "User",
      `Selected ${q.vendorName} as the winner for RFQ "${rfqs.find((r) => r.id === rfqId)?.title}". Initiated approval workflow ${nextId}.`
    );

    setCurrentView("approvals");
  };

  const approveWorkflow = (workflowId: string, comment: string) => {
    const workflow = approvals.find((a) => a.id === workflowId);
    if (!workflow) return;

    let nextStage: "Reviewed" | "Approved" | "Completed" = "Reviewed";
    if (workflow.stage === "Prepared") nextStage = "Reviewed";
    else if (workflow.stage === "Reviewed") nextStage = "Approved";
    else if (workflow.stage === "Approved") nextStage = "Completed";

    const isFinished = nextStage === "Completed";

    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id === workflowId) {
          return {
            ...a,
            stage: nextStage,
            comments: [
              ...a.comments,
              {
                user: user?.name || "Director",
                text: comment || "Approved.",
                date: new Date().toISOString().replace("T", " ").substring(0, 16),
              },
            ],
            updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        }
        return a;
      })
    );

    addActivity(
      user?.name || "System",
      `Approve Stage: ${nextStage}`,
      "User",
      `Approved workflow ${workflowId} to stage "${nextStage}".`
    );

    // If fully approved, generate Purchase Order
    if (isFinished || nextStage === "Approved") {
      // Let's generate the PO immediately on "Approved" state to match Screen 9!
      const matchedVendor = vendors.find((v) => v.id === workflow.vendorId) || {
        email: "contact@vendor.com",
        phone: "+1 (555) 000-0000",
        address: "Vendor Address",
        country: "Vendor Country",
      };

      const matchedQuotation = quotations.find(
        (q) => q.rfqId === workflow.rfqId && q.vendorId === workflow.vendorId
      );

      const nextPoId = `PO-2025-00${pos.length + 1}`;
      const newPo: PurchaseOrder = {
        id: nextPoId,
        rfqId: workflow.rfqId,
        vendorId: workflow.vendorId,
        vendorName: workflow.vendorName,
        vendorEmail: matchedVendor.email,
        vendorPhone: matchedVendor.phone,
        vendorAddress: matchedVendor.address,
        vendorCountry: matchedVendor.country,
        amount: workflow.amount,
        status: "Issued",
        date: new Date().toISOString().split("T")[0],
        items: matchedQuotation?.items || [],
      };

      setPos((prev) => [newPo, ...prev]);

      // Update RFQ Status to "Approved"
      setRfqs((prev) =>
        prev.map((r) => {
          if (r.id === workflow.rfqId) {
            return { ...r, status: "Approved" };
          }
          return r;
        })
      );

      addActivity(
        "System",
        "PO Generated",
        "System",
        `Purchase Order ${newPo.id} has been automatically generated after final approval of RFQ: ${workflow.rfqTitle}.`
      );

      setCurrentView("pos");
    }
  };

  const rejectWorkflow = (workflowId: string, comment: string) => {
    const workflow = approvals.find((a) => a.id === workflowId);
    if (!workflow) return;

    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id === workflowId) {
          return {
            ...a,
            stage: "Prepared", // Reset back to prepared
            comments: [
              ...a.comments,
              {
                user: user?.name || "System",
                text: `REJECTED/RETURNED: ${comment}`,
                date: new Date().toISOString().replace("T", " ").substring(0, 16),
              },
            ],
            updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        }
        return a;
      })
    );

    // Set RFQ back to open / comparing
    setRfqs((prev) =>
      prev.map((r) => {
        if (r.id === workflow.rfqId) {
          return { ...r, status: "Comparing" };
        }
        return r;
      })
    );

    addActivity(
      user?.name || "System",
      "Reject Workflow Stage",
      "User",
      `Workflow ${workflowId} was returned/rejected. Reason: ${comment}`
    );
  };

  const addActivity = (user: string, action: string, category: "User" | "System" | "Error", details: string) => {
    const nextId = `LOG-0${activityLogs.length + 1 + Math.floor(Math.random() * 105)}`;
    const newLog: ActivityLog = {
      id: nextId,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user,
      action,
      category,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
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
        setView,
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
