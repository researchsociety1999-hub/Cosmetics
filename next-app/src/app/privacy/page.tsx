/**
 * TODO (legal counsel): Review for your entity, jurisdiction, data retention, subprocessors,
 * and regional requirements (e.g. CCPA/CPRA-style notices) before relying on this as final.
 */
import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { getPublicStudioEmail } from "../lib/siteConfig";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Mystique collects, uses, stores, and shares personal information when you use our website and storefront.",
};

export default async function PrivacyPage() {
  const studioEmail = getPublicStudioEmail();
  const privacyContactLine = studioEmail
    ? `For privacy questions or requests, write the Mystique team at ${studioEmail} or use the Contact form on this site.`
    : "For privacy questions or requests, use the Contact form on this site.";

  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Privacy"
      intro="This policy describes how Mystique (“we,” “us,” or “our”) collects, uses, discloses, and protects personal information when you visit our website, use the storefront, create or access an account, subscribe to updates, or contact our team. By using the site, you acknowledge this policy."
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "We may collect information you provide directly, including your name, email address, and any message content you send through the contact form or other support communications.",
            "We may also collect limited storefront and technical data such as page views, product interest, search activity, cart activity, checkout starts, browser details, and related usage signals needed to understand site performance and improve the shopping experience.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "Mystique uses this information to respond to inquiries, operate the storefront, remember shopping activity, improve navigation and merchandising, provide customer support, and maintain site security.",
            "If you subscribe to updates, your email may also be used for launch notes, editorial updates, and promotional announcements until you unsubscribe.",
          ],
        },
        {
          heading: "Sharing and retention",
          paragraphs: [
            "We do not sell personal information for money. We may share data with service providers that help us host the site, support analytics, process storefront activity, deliver communications, or protect against fraud and misuse.",
            "We retain information only for as long as reasonably necessary for customer support, legal compliance, dispute resolution, fraud prevention, accounting records, and normal business operations.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You may request access to, correction of, or deletion of personal information we hold about you, subject to legal and operational limitations. Marketing emails also include an unsubscribe option.",
            privacyContactLine,
          ],
        },
      ]}
    />
  );
}
