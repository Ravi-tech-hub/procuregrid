import { useState, useEffect } from "react";
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
import { useTranslation } from "@/lib/translation";
import {
  DashboardPanel,
  DataTable,
  EmptyModule,
  MetricCard,
  StatusPill,
} from "@/components/app/DashboardPrimitives";
import { SupplierMyInfoSection } from "@/components/app/SupplierMyInfoSection";
import { SupplierCatalogSection } from "@/components/app/SupplierCatalogSection";
import { SupplierRfqsSection } from "@/components/app/SupplierRfqsSection";
import { supplierSectionCopy } from "@/components/app/workspace-data";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getMatchingRfqs } from "@/lib/rfq-marketplace-service";
import { getMyQuotes } from "@/lib/quote-service";
import type { MarketplaceRfq } from "@/lib/rfq-marketplace-service";
import type { RfqQuote } from "@/lib/quote-service";


export function SupplierWorkspace({
  activeSection,
  onSectionChange,
  displayName,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  displayName: string;
}) {
  const { t, i18n } = useTranslation();
  const { company } = useAuth();

  const [liveRfqs, setLiveRfqs] = useState<MarketplaceRfq[]>([]);
  const [liveQuotes, setLiveQuotes] = useState<RfqQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    async function loadData() {
      if (!company) return;
      try {
        const [rfqsData, quotesData] = await Promise.all([
          getMatchingRfqs(company.id),
          getMyQuotes(company.id),
        ]);
        setLiveRfqs(rfqsData);
        setLiveQuotes(quotesData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [company, activeSection]);

  if (activeSection === "my-info") {
    return <SupplierMyInfoSection />;
  }

  if (activeSection === "catalog") {
    return <SupplierCatalogSection />;
  }

  if (activeSection === "opportunities") {
    return <SupplierRfqsSection />;
  }

  if (activeSection !== "dashboard") {
    const section = supplierSectionCopy[activeSection] ?? {
      titleKey: "workspace.sections.supplier.default.title",
      descriptionKey: "workspace.sections.supplier.default.description",
    };
    return (
      <EmptyModule
        title={t(section.titleKey)}
        description={t(section.descriptionKey)}
        accent="supplier"
      />
    );
  }

  const firstName = displayName.split(" ")[0] || "there";
  const monthFormatter = new Intl.DateTimeFormat(i18n.language, { month: "short" });

  const opportunities = liveRfqs.slice(0, 5).map((rfq) => [
    rfq.rfq_number,
    rfq.product_name,
    rfq.buyer_company_name || "Verified Buyer",
    `${Number(rfq.quantity).toLocaleString("en-IN")} ${rfq.unit}`,
    new Date(rfq.expected_delivery_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    <StatusPill
      key={`${rfq.id}-${rfq.status}`}
      tone={
        rfq.alreadyQuoted
          ? "green"
          : rfq.status === "open"
            ? "blue"
            : "slate"
      }
    >
      {rfq.alreadyQuoted ? "Quoted" : rfq.status === "open" ? "Open" : rfq.status}
    </StatusPill>,
  ]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">
            {t("workspace.supplier.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
            {t("workspace.supplier.welcome", { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-[#718197]">{t("workspace.supplier.subtitle")}</p>
        </div>
        <Button
          type="button"
          onClick={() => onSectionChange("catalog")}
          variant="supplier"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("workspace.supplier.addProduct")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label={t("workspace.supplier.metrics.openOpportunities")}
          value={loading ? "..." : String(liveRfqs.filter(r => !r.alreadyQuoted).length)}
          delta={t("workspace.supplier.metrics.openOpportunitiesDelta")}
          icon={<FileInput className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label={t("workspace.supplier.metrics.quotesSubmitted")}
          value={loading ? "..." : String(liveQuotes.length)}
          delta={t("workspace.supplier.metrics.quotesSubmittedDelta")}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          label={t("workspace.supplier.metrics.activeOrders")}
          value="11"
          delta={t("workspace.supplier.metrics.activeOrdersDelta")}
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="green"
        />
        <MetricCard
          label={t("workspace.supplier.metrics.dispatchesDue")}
          value="5"
          delta={t("workspace.supplier.metrics.dispatchesDueDelta")}
          icon={<Truck className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label={t("workspace.supplier.metrics.receivables")}
          value="₹18.2L"
          delta={t("workspace.supplier.metrics.receivablesDelta")}
          icon={<BadgeIndianRupee className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr_0.8fr]">
        <DashboardPanel title={t("workspace.supplier.revenuePipeline")}>
          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[#77879a]">{t("workspace.supplier.pipelineValue")}</p>
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
              {[6, 8, 10, 0, 2, 5].map((month) => (
                <span key={month}>{monthFormatter.format(new Date(2026, month, 1))}</span>
              ))}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title={t("workspace.supplier.orderFulfilment")}>
          <div className="space-y-5 p-5">
            {[
              [t("workspace.status.accepted"), 11, 100, "#176b5a"],
              [t("workspace.status.inProduction"), 8, 73, "#2c82a5"],
              [t("workspace.status.readyDispatch"), 5, 45, "#d49a2c"],
              [t("workspace.status.delivered"), 3, 27, "#73869a"],
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

        <DashboardPanel
          title={t("workspace.supplier.trustProfile")}
          action={t("workspace.supplier.viewProfile")}
        >
          <div className="p-5 text-center">
            <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(#176b5a_0_88%,#e7eef3_88%_100%)]">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
                <div>
                  <p className="text-3xl font-bold text-[#15384a]">88</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#8594a4]">
                    {t("workspace.supplier.trustScore")}
                  </p>
                </div>
              </div>
            </div>
            <StatusPill tone="green">{t("workspace.supplier.verifiedSupplier")}</StatusPill>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-lg bg-[#f6f9fb] p-3">
                <p className="text-[9px] uppercase tracking-wider text-[#8997a7]">
                  {t("workspace.supplier.onTime")}
                </p>
                <p className="mt-1 text-sm font-bold text-[#244259]">94%</p>
              </div>
              <div className="rounded-lg bg-[#f6f9fb] p-3">
                <p className="text-[9px] uppercase tracking-wider text-[#8997a7]">
                  {t("workspace.supplier.quality")}
                </p>
                <p className="mt-1 text-sm font-bold text-[#244259]">97%</p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
        <DashboardPanel
          title={t("workspace.supplier.latestOpportunities")}
          action={t("workspace.supplier.viewAllOpportunities")}
        >
          <DataTable
            columns={[
              t("workspace.table.rfqNo"),
              t("workspace.table.requirement"),
              t("workspace.table.buyer"),
              t("workspace.table.estimatedValue"),
              t("workspace.table.dueDate"),
              t("workspace.table.status"),
            ]}
            rows={opportunities}
          />
        </DashboardPanel>

        <DashboardPanel title={t("workspace.supplier.actionCenter")}>
          <div className="space-y-1 p-3">
            {[
              [
                Clock3,
                t("workspace.supplier.actions.quotesExpire"),
                t("workspace.supplier.actions.reviewSubmit"),
                "quotes",
              ],
              [
                Truck,
                t("workspace.supplier.actions.dispatchUpdates"),
                t("workspace.supplier.actions.updateShipments"),
                "shipments",
              ],
              [
                ReceiptText,
                t("workspace.supplier.actions.invoiceUpload"),
                t("workspace.supplier.actions.createInvoice"),
                "invoices",
              ],
              [
                Boxes,
                t("workspace.supplier.actions.catalogIncomplete"),
                t("workspace.supplier.actions.completeListings"),
                "catalog",
              ],
              [
                PackageCheck,
                t("workspace.supplier.actions.grnAcknowledged"),
                t("workspace.supplier.actions.reviewReceipts"),
                "deliveries",
              ],
              [
                CircleCheck,
                t("workspace.supplier.actions.complianceCurrent"),
                t("workspace.supplier.actions.nextExpiry"),
                "compliance",
              ],
            ].map(([Icon, title, subtitle, section]) => {
              const ActionIcon = Icon as typeof Clock3;
              return (
                <Button
                  key={String(title)}
                  type="button"
                  onClick={() => onSectionChange(String(section))}
                  variant="ghost"
                  className="h-auto w-full justify-start p-3 text-left hover:bg-[#f7faf9]"
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
                </Button>
              );
            })}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
