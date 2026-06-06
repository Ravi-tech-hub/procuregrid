import {
  ArrowRight,
  ClipboardCheck,
  FileInput,
  FileText,
  IndianRupee,
  PackageCheck,
  Plus,
  ReceiptText,
  ShoppingCart,
  Truck,
  UserPlus,
} from "lucide-react";
import {
  DashboardPanel,
  DataTable,
  EmptyModule,
  MetricCard,
  StatusPill,
} from "@/components/app/DashboardPrimitives";
import { buyerSectionCopy } from "@/components/app/workspace-data";

const recentRfqs = [
  [
    "RFQ-00024",
    "Stainless Steel Sheets",
    "Raw Materials",
    "12 suppliers",
    "2",
    <StatusPill key="sent">Sent</StatusPill>,
    "03 Jun 2026",
  ],
  [
    "RFQ-00023",
    "Bearing Assemblies",
    "Components",
    "8 suppliers",
    "1",
    <StatusPill key="review" tone="amber">
      Under review
    </StatusPill>,
    "02 Jun 2026",
  ],
  [
    "RFQ-00022",
    "Hydraulic Cylinders",
    "Machinery",
    "10 suppliers",
    "3",
    <StatusPill key="sent">Sent</StatusPill>,
    "01 Jun 2026",
  ],
  [
    "RFQ-00021",
    "Allen Bolts & Nuts",
    "Fasteners",
    "15 suppliers",
    "3",
    <StatusPill key="review" tone="amber">
      Under review
    </StatusPill>,
    "31 May 2026",
  ],
  [
    "RFQ-00020",
    "Packaging Materials",
    "Packaging",
    "6 suppliers",
    "0",
    <StatusPill key="draft" tone="slate">
      Draft
    </StatusPill>,
    "30 May 2026",
  ],
];

export function BuyerWorkspace({
  activeSection,
  onSectionChange,
  displayName,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  displayName: string;
}) {
  if (activeSection !== "dashboard") {
    const section = buyerSectionCopy[activeSection] ?? {
      title: "Buyer Workspace",
      description: "This buyer module is ready for backend integration.",
    };
    return <EmptyModule title={section.title} description={section.description} accent="buyer" />;
  }

  const firstName = displayName.split(" ")[0] || "there";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">
            Buyer command center
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#718197]">
            Here is what is moving through your procurement pipeline today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSectionChange("rfqs")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b3158] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123f6e]"
        >
          <Plus className="h-4 w-4" />
          Create RFQ
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Active RFQs"
          value="12"
          delta="+20% vs last 30 days"
          icon={<FileInput className="h-5 w-5" />}
        />
        <MetricCard
          label="Pending Quotes"
          value="35"
          delta="+18% vs last 30 days"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Open POs"
          value="18"
          delta="+5% vs last 30 days"
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label="Pending Invoices"
          value="24"
          delta="+12% vs last 30 days"
          icon={<ReceiptText className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label="Spend This Month"
          value="₹48.6L"
          delta="+22% vs last 30 days"
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr_0.85fr]">
        <DashboardPanel title="RFQ Overview">
          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row">
            <div
              className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#1f5e97 0 43%, #4d8bc5 43% 64%, #82b6e7 64% 82%, #d6e8f7 82% 100%)",
              }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-2xl font-bold text-[#13263d]">28</p>
                  <p className="text-[10px] text-[#7b8b9d]">Total RFQs</p>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3">
              {[
                ["Draft", "5", "#d6e8f7"],
                ["Sent", "12", "#1f5e97"],
                ["Under review", "6", "#82b6e7"],
                ["Closed", "5", "#4d8bc5"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center gap-3 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="flex-1 text-[#607186]">{label}</span>
                  <span className="font-semibold text-[#253a52]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Recent Activity" action="View all">
          <div className="divide-y divide-[#edf1f5]">
            {[
              [FileInput, "RFQ-00024 was created", "By you · 2h ago"],
              [FileText, "3 new quotes received for RFQ-00021", "Precision Parts · 4h ago"],
              [ShoppingCart, "PO-00018 confirmed by supplier", "Industrial Components · 1d ago"],
              [ReceiptText, "Invoice INV-00045 needs approval", "Assigned to you · 2d ago"],
            ].map(([Icon, title, meta]) => {
              const ActivityIcon = Icon as typeof FileInput;
              return (
                <button
                  key={String(title)}
                  type="button"
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-[#fbfcfe]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4fb] text-[#25659d]">
                    <ActivityIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-[#253a52]">
                      {String(title)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#8996a7]">{String(meta)}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#9aa6b5]" />
                </button>
              );
            })}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Top Suppliers by Spend" action="View all">
          <div className="divide-y divide-[#edf1f5] px-5">
            {[
              ["Precision Parts Pvt. Ltd.", "₹18.6L"],
              ["Industrial Components Co.", "₹12.4L"],
              ["Metal Works India", "₹7.8L"],
              ["Fasteners Hub", "₹5.2L"],
              ["Techno Supply Co.", "₹4.6L"],
            ].map(([supplier, spend], index) => (
              <div key={supplier} className="flex items-center gap-3 py-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#edf3f9] text-[10px] font-bold text-[#436079]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-[#43566d]">{supplier}</span>
                <span className="text-xs font-semibold text-[#1c334d]">{spend}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
        <DashboardPanel title="Recent RFQs" action="View all RFQs">
          <DataTable
            columns={["RFQ No.", "Title", "Category", "Sent To", "Quotes", "Status", "Created"]}
            rows={recentRfqs}
          />
        </DashboardPanel>

        <DashboardPanel title="Quick Actions">
          <div className="space-y-2 p-3">
            {[
              [FileInput, "Create RFQ", "Start a sourcing event", "rfqs"],
              [ShoppingCart, "Create Purchase Order", "Issue a new PO", "orders"],
              [UserPlus, "Add Supplier", "Invite and onboard", "suppliers"],
              [ClipboardCheck, "Purchase Request", "Capture internal demand", "requests"],
              [Truck, "Track Shipment", "Review inbound logistics", "shipments"],
              [PackageCheck, "Record GRN", "Confirm goods received", "grn"],
            ].map(([Icon, title, subtitle, section]) => {
              const ActionIcon = Icon as typeof FileInput;
              return (
                <button
                  key={String(title)}
                  type="button"
                  onClick={() => onSectionChange(String(section))}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left hover:border-[#dfe7ef] hover:bg-[#f8fafc]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4fb] text-[#225f95]">
                    <ActionIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[#273b52]">
                      {String(title)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#8896a7]">
                      {String(subtitle)}
                    </span>
                  </span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0b3158] text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
