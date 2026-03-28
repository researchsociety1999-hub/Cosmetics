import type { Metadata } from "next";
import { PolicyPage } from "../components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Mystique collects, uses, and protects customer information.",
};

export default async function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      eyebrow="Privacy"
      intro="This Privacy Policy explains how Mystique collects, uses, shares, and protects information when you browse our site, contact our team, search products, or begin shopping with us."
      updatedOn="March 27, 2026"
      sections={[
        {
          heading: "Information We Collect",
          body: (
            <>
              <p>
                We may collect information you provide directly to us, including
                your name, email address, and message content when you submit the
                contact form or join our newsletter.
              </p>
              <p>
                We also collect limited technical and storefront usage data such
                as page visits, product views, search activity, cart activity,
                checkout starts, and related event details needed to understand
                site performance and improve the shopping experience.
              </p>
            </>
          ),
        },
        {
          heading: "How We Use Information",
          body: (
            <>
              <p>We use collected information to:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#d6a85f]">
                <li>respond to customer support, editorial, and partnership inquiries;</li>
                <li>operate the storefront and remember shopping cart activity;</li>
                <li>monitor product interest, searches, and site performance;</li>
                <li>improve our catalog, customer experience, and communications; and</li>
                <li>protect the site against misuse, fraud, or technical abuse.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "How Information Is Shared",
          body: (
            <>
              <p>
                We do not sell personal information for money. We may share data
                with service providers that help us host the site, process
                storefront data, measure analytics, or support customer
                communications.
              </p>
              <p>
                We may also disclose information when required by law, to enforce
                our terms, or to protect the rights, safety, and security of
                Mystique, our customers, or the public.
              </p>
            </>
          ),
        },
        {
          heading: "Retention And Security",
          body: (
            <>
              <p>
                We retain information only for as long as reasonably necessary to
                provide our services, comply with legal obligations, resolve
                disputes, and maintain business records.
              </p>
              <p>
                We use reasonable administrative, technical, and organizational
                safeguards to protect information. No internet transmission or
                storage system is completely secure, so we cannot guarantee
                absolute security.
              </p>
            </>
          ),
        },
        {
          heading: "Your Choices",
          body: (
            <>
              <p>
                You may request access to, correction of, or deletion of the
                personal information we hold about you, subject to legal and
                operational limitations. You may also opt out of promotional
                emails by using the unsubscribe link in those messages.
              </p>
              <p>
                For privacy requests or questions, contact us at
                {" "}
                <a href="mailto:hello@mystique.com" className="text-[#f0d19a] hover:text-[#fff1cc]">
                  hello@mystique.com
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
