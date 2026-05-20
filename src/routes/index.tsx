import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Problem } from "@/components/site/Problem";
import { Modules } from "@/components/site/Modules";
import { Workflow } from "@/components/site/Workflow";
import { TrustLayer } from "@/components/site/TrustLayer";
import { Verticals } from "@/components/site/Verticals";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ProcureGrid — Protected Procurement for Modern Businesses" },
      {
        name: "description",
        content:
          "Verified suppliers, escrow-backed payments and full RFQ-to-payment workflow. The procurement operating system for Indian SMEs and manufacturers.",
      },
      { property: "og:title", content: "ProcureGrid — Protected Procurement for Modern Businesses" },
      {
        property: "og:description",
        content:
          "Verified suppliers, escrow-backed payments and full RFQ-to-payment workflow built for Indian manufacturing.",
      },
    ],
  }),
});

function Index() {
  return (
    <div>
      <main>
        <Hero />
        <Stats />
        <Problem />
        <Modules />
        <Workflow />
        <TrustLayer />
        <Verticals />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
