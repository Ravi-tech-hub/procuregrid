import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { Footer } from "@/components/site/Footer";

const lastUpdated = "June 22, 2026";

const sections = [
  {
    title: "Acceptance of these terms",
    paragraphs: [
      "By accessing or using ProcureGrid, you agree to these Terms of Service on behalf of yourself and, where applicable, the business or organization you represent. If you do not agree, do not use the platform.",
    ],
  },
  {
    title: "Eligibility and business authority",
    paragraphs: [
      "You must be legally capable of entering into a binding agreement and, if you are acting for a business, you must have authority to bind that business to these terms.",
      "You are responsible for ensuring that account details, company information, and verification submissions are accurate, current, and lawfully provided.",
    ],
  },
  {
    title: "Accounts and security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials, restricting access to your devices and accounts, and promptly notifying us of any suspected unauthorized access or misuse.",
      "We may suspend or restrict access where we believe an account has been compromised, used fraudulently, or operated in breach of these terms or applicable law.",
    ],
  },
  {
    title: "Use of the platform",
    paragraphs: [
      "ProcureGrid is provided to help businesses manage sourcing, supplier interactions, RFQs, quotations, purchase workflows, and related operational processes.",
      "You must not use the platform to commit fraud, impersonate another entity, upload unlawful or infringing material, interfere with the service, bypass security controls, or misuse data belonging to other users or companies.",
    ],
  },
  {
    title: "Verification, onboarding, and restricted actions",
    paragraphs: [
      "We may require business verification, document submission, administrator review, or additional checks before enabling certain features, transactions, or network participation.",
      "We reserve the right to reject, defer, or revoke verification status if information is incomplete, misleading, suspicious, or inconsistent with our trust and compliance requirements.",
    ],
  },
  {
    title: "Subscriptions and paid features",
    paragraphs: [
      "Some product features may be offered under paid subscriptions, tiered plans, pilot terms, or negotiated commercial agreements. Pricing, feature limits, billing terms, and renewal terms will be communicated separately or through the product.",
      "Unless otherwise agreed in writing, fees paid for access to the service are non-refundable except where required by law.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      "ProcureGrid, including the software, branding, interfaces, workflows, and related materials, is owned by ProcureGrid Technologies Pvt. Ltd. or its licensors and is protected by applicable intellectual property laws.",
      "Subject to these terms, we grant you a limited, non-exclusive, non-transferable right to access and use the platform for your internal business purposes.",
    ],
  },
  {
    title: "Disclaimers and limitation of liability",
    paragraphs: [
      "The platform is provided on an as-is and as-available basis. To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, and error-free operation.",
      "To the extent permitted by law, ProcureGrid will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, business opportunity, or anticipated savings arising from use of the platform.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "You may stop using the platform at any time. We may suspend or terminate access if you breach these terms, create legal or security risk, fail verification requirements, or where continued access is not commercially or operationally feasible.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "For questions about these terms, contact legal@easybizzy.in.",
      "These terms are a strong operational baseline for launch, but they should be reviewed by qualified legal counsel before broad commercial deployment or onboarding customers across multiple jurisdictions.",
    ],
  },
];

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service | ProcureGrid" },
      {
        name: "description",
        content:
          "Review the terms governing use of ProcureGrid, including account responsibilities, verification, and acceptable use.",
      },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="bg-[image:var(--gradient-subtle)]">
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-8 shadow-[var(--shadow-lg)] backdrop-blur sm:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <FileCheck2 className="h-3.5 w-3.5 text-primary" />
              Terms of Service
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Terms for using ProcureGrid
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              These terms describe the rules, responsibilities, and limitations that apply when
              individuals and businesses use ProcureGrid and related EasyBizzy services.
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
