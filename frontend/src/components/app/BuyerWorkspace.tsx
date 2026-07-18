import { useRef, useState } from "react";
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
import { useTranslation } from "@/lib/translation";
import {
  DashboardPanel,
  DataTable,
  EmptyModule,
  MetricCard,
  StatusPill,
} from "@/components/app/DashboardPrimitives";
import { buyerSectionCopy } from "@/components/app/workspace-data";
import { Button } from "@/components/ui/button";
import { CreateRfqDialog } from "@/components/app/CreateRfqDialog";
import { BuyerRfqsSection } from "@/components/app/BuyerRfqsSection";

const recentRfqData = [
  ["RFQ-00024", "Stainless Steel Sheets", "Raw Materials", "12", "2", "sent", "03 Jun 2026"],
  ["RFQ-00023", "Bearing Assemblies", "Components", "8", "1", "review", "02 Jun 2026"],
  ["RFQ-00022", "Hydraulic Cylinders", "Machinery", "10", "3", "sent", "01 Jun 2026"],
  ["RFQ-00021", "Allen Bolts & Nuts", "Fasteners", "15", "3", "review", "31 May 2026"],
  ["RFQ-00020", "Packaging Materials", "Packaging", "6", "0", "draft", "30 May 2026"],
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
  const { t } = useTranslation();
  const [rfqOpen, setRfqOpen] = useState(false);
  const rfqListRefreshRef = useRef<(() => void) | null>(null);

  if (activeSection !== "dashboard") {
    // RFQ section — real page
    if (activeSection === "rfqs") {
      return (
        <>
          <BuyerRfqsSection
            onOpenCreateDialog={() => setRfqOpen(true)}
            onRfqCreated={(refresh) => { rfqListRefreshRef.current = refresh; }}
          />
          <CreateRfqDialog
            open={rfqOpen}
            onClose={() => setRfqOpen(false)}
            onSuccess={() => {
              setRfqOpen(false);
              // Small delay so success screen is visible, then refresh
              setTimeout(() => rfqListRefreshRef.current?.(), 1200);
            }}
          />
        </>
      );
    }

    // All other sections — placeholder
    const section = buyerSectionCopy[activeSection] ?? {
      titleKey: "workspace.sections.buyer.default.title",
      descriptionKey: "workspace.sections.buyer.default.description",
    };
    return (
      <EmptyModule
        title={t(section.titleKey)}
        description={t(section.descriptionKey)}
        accent="buyer"
      />
    );
  }

  const firstName = displayName.split(" ")[0] || "there";
  const recentRfqs = recentRfqData.map(([id, title, category, sentTo, quotes, status, date]) => [
    id,
    title,
    category,
    t("workspace.buyer.table.suppliersCount", { count: sentTo }),
    quotes,
    <StatusPill
      key={`${id}-${status}`}
      tone={status === "review" ? "amber" : status === "draft" ? "slate" : "blue"}
    >
      {t(`workspace.status.${status}`)}
    </StatusPill>,
    date,
  ]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">
            {t("workspace.buyer.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
            {t("workspace.buyer.welcome", { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-[#718197]">{t("workspace.buyer.subtitle")}</p>
        </div>
        <Button
          type="button"
          onClick={() => setRfqOpen(true)}
          variant="buyer"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("workspace.buyer.createRfq")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label={t("workspace.buyer.metrics.activeRfqs")}
          value="12"
          delta={t("workspace.buyer.metrics.activeRfqsDelta")}
          icon={<FileInput className="h-5 w-5" />}
        />
        <MetricCard
          label={t("workspace.buyer.metrics.pendingQuotes")}
          value="35"
          delta={t("workspace.buyer.metrics.pendingQuotesDelta")}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label={t("workspace.buyer.metrics.openPos")}
          value="18"
          delta={t("workspace.buyer.metrics.openPosDelta")}
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label={t("workspace.buyer.metrics.pendingInvoices")}
          value="24"
          delta={t("workspace.buyer.metrics.pendingInvoicesDelta")}
          icon={<ReceiptText className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label={t("workspace.buyer.metrics.monthlySpend")}
          value="₹48.6L"
          delta={t("workspace.buyer.metrics.monthlySpendDelta")}
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr_0.85fr]">
        <DashboardPanel title={t("workspace.buyer.rfqOverview")}>
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
                  <p className="text-[10px] text-[#7b8b9d]">{t("workspace.buyer.totalRfqs")}</p>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3">
              {[
                [t("workspace.status.draft"), "5", "#d6e8f7"],
                [t("workspace.status.sent"), "12", "#1f5e97"],
                [t("workspace.status.review"), "6", "#82b6e7"],
                [t("workspace.status.closed"), "5", "#4d8bc5"],
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

        <DashboardPanel
          title={t("workspace.buyer.recentActivity")}
          action={t("workspace.common.viewAll")}
        >
          <div className="divide-y divide-[#edf1f5]">
            {[
              [
                FileInput,
                t("workspace.buyer.activity.rfqCreated"),
                t("workspace.buyer.activity.byYou"),
              ],
              [FileText, t("workspace.buyer.activity.quotesReceived"), "Precision Parts · 4h"],
              [
                ShoppingCart,
                t("workspace.buyer.activity.poConfirmed"),
                "Industrial Components · 1d",
              ],
              [
                ReceiptText,
                t("workspace.buyer.activity.invoiceApproval"),
                t("workspace.buyer.activity.assigned"),
              ],
            ].map(([Icon, title, meta]) => {
              const ActivityIcon = Icon as typeof FileInput;
              return (
                <Button
                  key={String(title)}
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-none px-4 py-3.5 text-left sm:px-5"
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
                </Button>
              );
            })}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title={t("workspace.buyer.topSuppliers")}
          action={t("workspace.common.viewAll")}
        >
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
        <DashboardPanel
          title={t("workspace.buyer.recentRfqs")}
          action={t("workspace.buyer.viewAllRfqs")}
        >
          <DataTable
            columns={[
              t("workspace.table.rfqNo"),
              t("workspace.table.title"),
              t("workspace.table.category"),
              t("workspace.table.sentTo"),
              t("workspace.table.quotes"),
              t("workspace.table.status"),
              t("workspace.table.created"),
            ]}
            rows={recentRfqs}
          />
        </DashboardPanel>

        <DashboardPanel title={t("workspace.buyer.quickActions")}>
          <div className="space-y-2 p-3">
            {[
              [
                FileInput,
                t("workspace.buyer.actions.createRfq"),
                t("workspace.buyer.actions.createRfqSub"),
                "__rfq_dialog__",
              ],
              [
                ShoppingCart,
                t("workspace.buyer.actions.createPo"),
                t("workspace.buyer.actions.createPoSub"),
                "orders",
              ],
              [
                UserPlus,
                t("workspace.buyer.actions.addSupplier"),
                t("workspace.buyer.actions.addSupplierSub"),
                "suppliers",
              ],
              [
                ClipboardCheck,
                t("workspace.buyer.actions.purchaseRequest"),
                t("workspace.buyer.actions.purchaseRequestSub"),
                "requests",
              ],
              [
                Truck,
                t("workspace.buyer.actions.trackShipment"),
                t("workspace.buyer.actions.trackShipmentSub"),
                "shipments",
              ],
              [
                PackageCheck,
                t("workspace.buyer.actions.recordGrn"),
                t("workspace.buyer.actions.recordGrnSub"),
                "grn",
              ],
            ].map(([Icon, title, subtitle, section]) => {
              const ActionIcon = Icon as typeof FileInput;
              const isRfqAction = section === "__rfq_dialog__";
              return (
                <Button
                  key={String(title)}
                  type="button"
                  onClick={() => isRfqAction ? setRfqOpen(true) : onSectionChange(String(section))}
                  variant="ghost"
                  className="h-auto w-full justify-start border border-transparent p-3 text-left hover:border-[#dfe7ef] hover:bg-[#f8fafc]"
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
                </Button>
              );
            })}
          </div>
        </DashboardPanel>
      </div>

      <CreateRfqDialog open={rfqOpen} onClose={() => setRfqOpen(false)} />
    </div>
  );
}
