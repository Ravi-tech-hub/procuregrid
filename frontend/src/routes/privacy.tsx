import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Footer } from "@/components/site/Footer";

const lastUpdated = "June 22, 2026";

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide directly when you create an account, onboard a company, verify your business, contact support, or use procurement workflows on ProcureGrid.",
      "This may include your name, work email address, phone number, company details, tax and registration information, uploaded documents, procurement activity, and communications sent through the platform.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use your information to operate the platform, authenticate users, secure accounts, support onboarding, verify businesses, enable RFQ and supplier workflows, improve the service, and comply with legal obligations.",
      "We may also use technical and usage data to prevent fraud, detect abuse, investigate incidents, and monitor the reliability and performance of the platform.",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We share information only where needed to provide the service, such as with cloud hosting, authentication, communication, analytics, support, verification, or payment partners acting on our behalf under contractual safeguards.",
      "We may also disclose information if required by law, regulation, legal process, or to protect the rights, safety, and security of ProcureGrid, our users, or the public.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We retain personal and business information for as long as reasonably necessary to provide the service, maintain security and audit records, resolve disputes, enforce our agreements, and meet legal or regulatory requirements.",
      "Retention periods may vary depending on the type of data, the account relationship, and any business, tax, or compliance obligations that apply.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use commercially reasonable technical and organizational measures to protect information from unauthorized access, loss, misuse, alteration, and disclosure. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.",
      "You are responsible for maintaining the confidentiality of your login credentials and for using the platform in accordance with your internal security policies.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "You may update certain profile and company information through the product, and you may contact us to request account support, access, correction, or deletion where applicable under law.",
      "If you receive marketing or service notices from us, you may opt out of non-essential communications where those options are made available.",
    ],
  },
  {
    title: "Children and business use",
    paragraphs: [
      "ProcureGrid is intended for business and professional use. It is not directed to children, and you should not use the platform to submit information relating to children unless you are legally authorized and it is strictly necessary for a permitted business purpose.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "For privacy-related questions, requests, or concerns, contact us at privacy@easybizzy.in.",
      "This page is a practical operating policy for the current product and should be reviewed with legal counsel before large-scale commercial rollout across multiple jurisdictions.",
    ],
  },
];

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | ProcureGrid" },
      {
        name: "description",
        content:
          "Read how ProcureGrid collects, uses, protects, and retains business and personal information.",
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="bg-[image:var(--gradient-subtle)]">
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="rounded-[2rem] border border-border/70 bg-white/92 p-8 shadow-[var(--shadow-lg)] backdrop-blur sm:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Privacy Policy
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy at ProcureGrid
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              This Privacy Policy explains how ProcureGrid and EasyBizzy handle information when you
              access the website, create an account, verify your business, or use our procurement
              workflows.
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
