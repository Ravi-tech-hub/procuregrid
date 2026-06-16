import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Problem } from "@/components/site/Problem";
import { Modules } from "@/components/site/Modules";
import { Workflow } from "@/components/site/Workflow";
import { TrustLayer } from "@/components/site/TrustLayer";
import { Verticals } from "@/components/site/Verticals";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { LoaderCircle } from "lucide-react";

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
      {
        property: "og:title",
        content: "ProcureGrid — Protected Procurement for Modern Businesses",
      },
      {
        property: "og:description",
        content:
          "Verified suppliers, escrow-backed payments and full RFQ-to-payment workflow built for Indian manufacturing.",
      },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  const { user, company, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (company) {
      navigate({ to: "/app", replace: true });
      return;
    }
    navigate({ to: "/onboarding/company", replace: true });
  }, [company, loading, navigate, user]);

  if (loading || user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
