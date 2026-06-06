import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  CircleCheck,
  Clock3,
  FileInput,
  FileText,
  PackageCheck,
  Plus,
  ReceiptText,
  ShoppingCart,
  Truck,
} from "lucide-react";
import {
  DashboardPanel,
  DataTable,
  EmptyModule,
  MetricCard,
  StatusPill,
} from "@/components/app/DashboardPrimitives";
import { supplierSectionCopy } from "@/components/app/workspace-data";

const opportunities = [
  [
    "RFQ-00418",
    "CNC Machined Housings",
    "Orion Mobility",
    "₹9.8L",
    "08 Jun 2026",
    <StatusPill key="open" tone="green">
      Open
    </StatusPill>,
  ],
  [
    "RFQ-00411",
    "Powder-coated Brackets",
    "Axis Engineering",
    "₹4.2L",
    "07 Jun 2026",
    <StatusPill key="draft" tone="amber">
      Quote draft
    </StatusPill>,
  ],
  [
    "RFQ-00403",
    "Precision Turned Parts",
    "Veda Industrial",
    "₹12.6L",
    "06 Jun 2026",
    <StatusPill key="submitted">Submitted</StatusPill>,
  ],
  [
    "RFQ-00396",
    "Laser-cut Enclosures",
    "Northstar Controls",
    "₹7.1L",
    "05 Jun 2026",
    <StatusPill key="closing" tone="red">
      Closing soon
    </StatusPill>,
  ],
];

export function SupplierWorkspace({
  activeSection,
  onSectionChange,
  displayName,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  displayName: string;
}) {
  if (activeSection !== "dashboard") {
    const section = supplierSectionCopy[activeSection] ?? {
      title: "Supplier Workspace",
      description: "This supplier module is ready for backend integration.",
    };
    return (
      <EmptyModule title={section.title} description={section.description} accent="supplier" />
    );
  }

  const firstName = displayName.split(" ")[0] || "there";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">
            Supplier opportunity desk
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#718197]">
            New opportunities, active orders, and receivables are all in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSectionChange("catalog")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176b5a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125b4c]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Open Opportunities"
          value="9"
          delta="3 new since yesterday"
          icon={<FileInput className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label="Quotes Submitted"
          value="16"
          delta="+14% this month"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Orders"
          value="11"
          delta="₹31.4L order value"
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label="Dispatches Due"
          value="5"
          delta="2 due this week"
          icon={<Truck className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label="Receivables"
          value="₹18.2L"
          delta="₹6.4L due in 7 days"
          icon={<BadgeIndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr_0.8fr]">
        <DashboardPanel title="Revenue Pipeline">
          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[#77879a]">Potential + confirmed value</p>
                <p className="mt-1 text-2xl font-bold text-[#16334b]">₹72.8L</p>
              </div>
              <StatusPill tone="green">+18.4%</StatusPill>
            </div>
            <div className="mt-7 flex h-36 items-end gap-2">
              {[38, 54, 46, 72, 61, 88, 76, 95, 82, 108, 96, 124].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end">
                  <div
                    className="rounded-t-sm bg-gradient-to-t from-[#176b5a] to-[#66b49f]"
                    style={{ height }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[9px] uppercase tracking-wider text-[#94a0ae]">
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Jan</span>
              <span>Mar</span>
              <span>Jun</span>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Order Fulfilment">
          <div className="space-y-5 p-5">
            {[
              ["Accepted", 11, 100, "#176b5a"],
              ["In production", 8, 73, "#2c82a5"],
              ["Ready to dispatch", 5, 45, "#d49a2c"],
              ["Delivered", 3, 27, "#73869a"],
            ].map(([label, value, width, color]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#53667b]">{label}</span>
                  <span className="font-bold text-[#243a50]">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf1f5]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${width}%`, backgroundColor: String(color) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Trust Profile" action="View profile">
          <div className="p-5 text-center">
            <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(#176b5a_0_88%,#e7eef3_88%_100%)]">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
                <div>
                  <p className="text-3xl font-bold text-[#15384a]">88</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#8594a4]">Trust score</p>
                </div>
              </div>
            </div>
            <StatusPill tone="green">Verified supplier</StatusPill>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-lg bg-[#f6f9fb] p-3">
                <p className="text-[9px] uppercase tracking-wider text-[#8997a7]">On-time</p>
                <p className="mt-1 text-sm font-bold text-[#244259]">94%</p>
              </div>
              <div className="rounded-lg bg-[#f6f9fb] p-3">
                <p className="text-[9px] uppercase tracking-wider text-[#8997a7]">Quality</p>
                <p className="mt-1 text-sm font-bold text-[#244259]">97%</p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
        <DashboardPanel title="Latest RFQ Opportunities" action="View all opportunities">
          <DataTable
            columns={["RFQ No.", "Requirement", "Buyer", "Est. Value", "Due Date", "Status"]}
            rows={opportunities}
          />
        </DashboardPanel>

        <DashboardPanel title="Action Center">
          <div className="space-y-1 p-3">
            {[
              [Clock3, "2 quotes expire today", "Review and submit", "quotes"],
              [Truck, "3 dispatch updates due", "Update shipments", "shipments"],
              [ReceiptText, "1 invoice needs upload", "Create invoice", "invoices"],
              [Boxes, "4 catalog items incomplete", "Complete listings", "catalog"],
              [PackageCheck, "2 GRNs acknowledged", "Review receipts", "deliveries"],
              [CircleCheck, "Compliance is current", "Next expiry in 48 days", "compliance"],
            ].map(([Icon, title, subtitle, section]) => {
              const ActionIcon = Icon as typeof Clock3;
              return (
                <button
                  key={String(title)}
                  type="button"
                  onClick={() => onSectionChange(String(section))}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[#f7faf9]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f5f1] text-[#176b5a]">
                    <ActionIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[#273b52]">
                      {String(title)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#8997a7]">
                      {String(subtitle)}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#99a6b4]" />
                </button>
              );
            })}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
