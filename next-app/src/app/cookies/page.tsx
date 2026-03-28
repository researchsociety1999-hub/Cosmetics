import type { Metadata } from "next";
import { PolicyPage } from "../components/PolicyPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Mystique uses cookies and similar technologies on the site.",
};

export default async function CookiesPage() {
  return (
    <PolicyPage
      title="Cookie Policy"
      eyebrow="Cookies"
      intro="This Cookie Policy describes how Mystique uses cookies and similar technologies to keep the storefront working, remember shopping activity, and understand how visitors use the site."
      updatedOn="March 27, 2026"
      sections={[
        {
          heading: "What Cookies Are",
          body: (
            <>
              <p>
                Cookies are small text files stored on your device when you visit
                a website. Similar technologies may include local storage,
                session storage, pixels, and analytics identifiers that help a
                site recognize activity or preferences.
              </p>
            </>
          ),
        },
        {
          heading: "How We Use Cookies",
          body: (
            <>
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#d6a85f]">
                <li>keep core storefront features working;</li>
                <li>remember cart contents and shopping session state;</li>
                <li>measure page views, searches, product engagement, and checkout activity; and</li>
                <li>improve reliability, performance, and customer experience.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Types Of Cookies We May Use",
          body: (
            <>
              <p>
                Essential cookies support functions such as navigation, session
                continuity, and cart behavior. Analytics cookies help us
                understand traffic patterns, product interest, and overall site
                performance.
              </p>
              <p>
                Depending on future storefront integrations, we may also use
                functional cookies to remember user preferences and service
                provider cookies needed for commerce, customer support, or fraud
                prevention.
              </p>
            </>
          ),
        },
        {
          heading: "Managing Cookies",
          body: (
            <>
              <p>
                Most browsers let you review, block, or delete cookies through
                browser settings. Disabling some cookies may affect product
                browsing, cart persistence, checkout flow, or other storefront
                features.
              </p>
              <p>
                If you have questions about our cookie practices, email
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
