import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileInput,
  FileText,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Settings2,
  ShoppingCart,
  Store,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

export type WorkspaceMode = "buyer" | "supplier";

export type WorkspaceNavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export const buyerNavItems: WorkspaceNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Purchase Requests", icon: ClipboardCheck, badge: "4" },
  { id: "rfqs", label: "RFQs", icon: FileInput, badge: "12" },
  { id: "quotes", label: "Quotes", icon: FileText, badge: "35" },
  { id: "orders", label: "Purchase Orders", icon: ShoppingCart, badge: "18" },
  { id: "shipments", label: "Shipments", icon: Truck, badge: "7" },
  { id: "grn", label: "GRN", icon: PackageCheck },
  { id: "invoices", label: "Invoices", icon: ReceiptText, badge: "24" },
  { id: "payments", label: "Payments", icon: WalletCards },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "catalog", label: "Catalog", icon: Boxes },
  { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export const supplierNavItems: WorkspaceNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "opportunities", label: "RFQ Opportunities", icon: FileInput, badge: "9" },
  { id: "quotes", label: "My Quotes", icon: FileText, badge: "6" },
  { id: "orders", label: "Sales Orders", icon: ShoppingCart, badge: "11" },
  { id: "shipments", label: "Shipments", icon: Truck, badge: "5" },
  { id: "deliveries", label: "Delivery & GRN", icon: PackageCheck },
  { id: "invoices", label: "Invoices", icon: ReceiptText, badge: "3" },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "catalog", label: "Product Catalog", icon: Store },
  { id: "compliance", label: "Compliance", icon: FileCheck2 },
  { id: "analytics", label: "Performance", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export const buyerSectionCopy: Record<string, { title: string; description: string }> = {
  requests: {
    title: "Purchase Requests",
    description:
      "Capture internal demand, route approvals, and convert approved requests into RFQs.",
  },
  rfqs: {
    title: "Requests for Quotation",
    description:
      "Create sourcing events, invite verified suppliers, and monitor response progress.",
  },
  quotes: {
    title: "Quote Comparison",
    description: "Compare pricing, lead time, commercial terms, and supplier trust signals.",
  },
  orders: {
    title: "Purchase Orders",
    description: "Track issued orders from supplier acceptance through final closure.",
  },
  shipments: {
    title: "Inbound Shipments",
    description: "Monitor dispatches, expected arrivals, and delayed deliveries.",
  },
  grn: {
    title: "Goods Receipt Notes",
    description: "Record received quantities, quality checks, shortages, and exceptions.",
  },
  invoices: {
    title: "Invoice Review",
    description: "Match invoices against purchase orders and goods receipts before approval.",
  },
  payments: {
    title: "Payments",
    description: "Follow payable, protected, released, and disputed payment states.",
  },
  suppliers: {
    title: "Supplier Network",
    description: "Invite suppliers, review verification status, and track performance.",
  },
  catalog: {
    title: "Procurement Catalog",
    description: "Organize approved products, specifications, and preferred supplier options.",
  },
  analytics: {
    title: "Reports & Analytics",
    description: "Explore spend, supplier concentration, RFQ conversion, and delivery performance.",
  },
  settings: {
    title: "Buyer Workspace Settings",
    description: "Manage team access, approval rules, notifications, and company preferences.",
  },
};

export const supplierSectionCopy: Record<string, { title: string; description: string }> = {
  opportunities: {
    title: "RFQ Opportunities",
    description:
      "Review buyer requirements, deadlines, specifications, and qualification criteria.",
  },
  quotes: {
    title: "My Quotes",
    description: "Draft, submit, revise, and track commercial offers sent to buyers.",
  },
  orders: {
    title: "Sales Orders",
    description: "Manage accepted purchase orders and fulfilment commitments.",
  },
  shipments: {
    title: "Outbound Shipments",
    description: "Create dispatch records and keep buyers informed about delivery progress.",
  },
  deliveries: {
    title: "Delivery & GRN",
    description: "Track buyer receipts, accepted quantities, quality outcomes, and disputes.",
  },
  invoices: {
    title: "Invoices",
    description: "Submit invoices against delivered orders and follow approval status.",
  },
  payments: {
    title: "Payments",
    description: "See protected amounts, upcoming receivables, releases, and exceptions.",
  },
  catalog: {
    title: "Product Catalog",
    description: "Maintain products, capabilities, minimum order quantities, and lead times.",
  },
  compliance: {
    title: "Compliance",
    description: "Manage GST, PAN, certifications, verification evidence, and expiry dates.",
  },
  analytics: {
    title: "Supplier Performance",
    description: "Review win rate, revenue, delivery reliability, quality, and buyer engagement.",
  },
  settings: {
    title: "Supplier Workspace Settings",
    description: "Manage company profile, notifications, payment details, and account preferences.",
  },
};
