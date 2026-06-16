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
  labelKey: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export const buyerNavItems: WorkspaceNavItem[] = [
  { id: "dashboard", labelKey: "workspace.nav.dashboard", icon: LayoutDashboard },
  { id: "requests", labelKey: "workspace.nav.purchaseRequests", icon: ClipboardCheck, badge: "4" },
  { id: "rfqs", labelKey: "workspace.nav.rfqs", icon: FileInput, badge: "12" },
  { id: "quotes", labelKey: "workspace.nav.quotes", icon: FileText, badge: "35" },
  { id: "orders", labelKey: "workspace.nav.purchaseOrders", icon: ShoppingCart, badge: "18" },
  { id: "shipments", labelKey: "workspace.nav.shipments", icon: Truck, badge: "7" },
  { id: "grn", labelKey: "workspace.nav.grn", icon: PackageCheck },
  { id: "invoices", labelKey: "workspace.nav.invoices", icon: ReceiptText, badge: "24" },
  { id: "payments", labelKey: "workspace.nav.payments", icon: WalletCards },
  { id: "suppliers", labelKey: "workspace.nav.suppliers", icon: Users },
  { id: "catalog", labelKey: "workspace.nav.catalog", icon: Boxes },
  { id: "analytics", labelKey: "workspace.nav.reports", icon: BarChart3 },
  { id: "settings", labelKey: "workspace.nav.settings", icon: Settings2 },
];

export const supplierNavItems: WorkspaceNavItem[] = [
  { id: "dashboard", labelKey: "workspace.nav.dashboard", icon: LayoutDashboard },
  { id: "opportunities", labelKey: "workspace.nav.opportunities", icon: FileInput, badge: "9" },
  { id: "quotes", labelKey: "workspace.nav.myQuotes", icon: FileText, badge: "6" },
  { id: "orders", labelKey: "workspace.nav.salesOrders", icon: ShoppingCart, badge: "11" },
  { id: "shipments", labelKey: "workspace.nav.shipments", icon: Truck, badge: "5" },
  { id: "deliveries", labelKey: "workspace.nav.deliveryGrn", icon: PackageCheck },
  { id: "invoices", labelKey: "workspace.nav.invoices", icon: ReceiptText, badge: "3" },
  { id: "payments", labelKey: "workspace.nav.payments", icon: CreditCard },
  { id: "catalog", labelKey: "workspace.nav.productCatalog", icon: Store },
  { id: "compliance", labelKey: "workspace.nav.compliance", icon: FileCheck2 },
  { id: "analytics", labelKey: "workspace.nav.performance", icon: BarChart3 },
  { id: "settings", labelKey: "workspace.nav.settings", icon: Settings2 },
];

export const buyerSectionCopy: Record<string, { titleKey: string; descriptionKey: string }> = {
  requests: {
    titleKey: "workspace.sections.buyer.requests.title",
    descriptionKey: "workspace.sections.buyer.requests.description",
  },
  rfqs: {
    titleKey: "workspace.sections.buyer.rfqs.title",
    descriptionKey: "workspace.sections.buyer.rfqs.description",
  },
  quotes: {
    titleKey: "workspace.sections.buyer.quotes.title",
    descriptionKey: "workspace.sections.buyer.quotes.description",
  },
  orders: {
    titleKey: "workspace.sections.buyer.orders.title",
    descriptionKey: "workspace.sections.buyer.orders.description",
  },
  shipments: {
    titleKey: "workspace.sections.buyer.shipments.title",
    descriptionKey: "workspace.sections.buyer.shipments.description",
  },
  grn: {
    titleKey: "workspace.sections.buyer.grn.title",
    descriptionKey: "workspace.sections.buyer.grn.description",
  },
  invoices: {
    titleKey: "workspace.sections.buyer.invoices.title",
    descriptionKey: "workspace.sections.buyer.invoices.description",
  },
  payments: {
    titleKey: "workspace.sections.buyer.payments.title",
    descriptionKey: "workspace.sections.buyer.payments.description",
  },
  suppliers: {
    titleKey: "workspace.sections.buyer.suppliers.title",
    descriptionKey: "workspace.sections.buyer.suppliers.description",
  },
  catalog: {
    titleKey: "workspace.sections.buyer.catalog.title",
    descriptionKey: "workspace.sections.buyer.catalog.description",
  },
  analytics: {
    titleKey: "workspace.sections.buyer.analytics.title",
    descriptionKey: "workspace.sections.buyer.analytics.description",
  },
  settings: {
    titleKey: "workspace.sections.buyer.settings.title",
    descriptionKey: "workspace.sections.buyer.settings.description",
  },
};

export const supplierSectionCopy: Record<string, { titleKey: string; descriptionKey: string }> = {
  opportunities: {
    titleKey: "workspace.sections.supplier.opportunities.title",
    descriptionKey: "workspace.sections.supplier.opportunities.description",
  },
  quotes: {
    titleKey: "workspace.sections.supplier.quotes.title",
    descriptionKey: "workspace.sections.supplier.quotes.description",
  },
  orders: {
    titleKey: "workspace.sections.supplier.orders.title",
    descriptionKey: "workspace.sections.supplier.orders.description",
  },
  shipments: {
    titleKey: "workspace.sections.supplier.shipments.title",
    descriptionKey: "workspace.sections.supplier.shipments.description",
  },
  deliveries: {
    titleKey: "workspace.sections.supplier.deliveries.title",
    descriptionKey: "workspace.sections.supplier.deliveries.description",
  },
  invoices: {
    titleKey: "workspace.sections.supplier.invoices.title",
    descriptionKey: "workspace.sections.supplier.invoices.description",
  },
  payments: {
    titleKey: "workspace.sections.supplier.payments.title",
    descriptionKey: "workspace.sections.supplier.payments.description",
  },
  catalog: {
    titleKey: "workspace.sections.supplier.catalog.title",
    descriptionKey: "workspace.sections.supplier.catalog.description",
  },
  compliance: {
    titleKey: "workspace.sections.supplier.compliance.title",
    descriptionKey: "workspace.sections.supplier.compliance.description",
  },
  analytics: {
    titleKey: "workspace.sections.supplier.analytics.title",
    descriptionKey: "workspace.sections.supplier.analytics.description",
  },
  settings: {
    titleKey: "workspace.sections.supplier.settings.title",
    descriptionKey: "workspace.sections.supplier.settings.description",
  },
};
