import type { Metadata } from "next";
import { PolicyPage } from "../components/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of the Mystique website and storefront.",
};

export default async function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      eyebrow="Terms"
      intro="These Terms of Service govern your access to and use of the Mystique website, content, and storefront features. By using the site, you agree to these terms."
      updatedOn="March 27, 2026"
      sections={[
        {
          heading: "Use Of The Site",
          body: (
            <>
              <p>
                You may use this site only for lawful purposes and in accordance
                with these terms. You agree not to misuse the website, interfere
                with its normal operation, attempt unauthorized access, or use
                automated means to scrape, disrupt, or overload our services.
              </p>
              <p>
                We may update, suspend, or discontinue any part of the site at
                any time, including product pages, editorial content, account
                features, checkout flows, and availability information.
              </p>
            </>
          ),
        },
        {
          heading: "Products, Pricing, And Availability",
          body: (
            <>
              <p>
                Product descriptions, pricing, ingredient information, editorial
                content, and availability may change without notice. We aim for
                accuracy, but we do not guarantee that every listing or piece of
                site content is complete, current, or error-free at all times.
              </p>
              <p>
                We reserve the right to correct errors, limit quantities, refuse
                or cancel orders, and update catalog information when needed.
              </p>
            </>
          ),
        },
        {
          heading: "Intellectual Property",
          body: (
            <>
              <p>
                The Mystique brand, logos, site design, photography, editorial
                content, product copy, graphics, and related materials are owned
                by Mystique or its licensors and are protected by applicable
                intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, republish, or exploit
                site content for commercial purposes without prior written
                permission.
              </p>
            </>
          ),
        },
        {
          heading: "Disclaimer And Limitation Of Liability",
          body: (
            <>
              <p>
                The site is provided on an &quot;as is&quot; and &quot;as available&quot;
                basis without warranties of any kind, whether express or implied,
                to the fullest extent permitted by law.
              </p>
              <p>
                To the maximum extent permitted by law, Mystique will not be
                liable for indirect, incidental, special, consequential, or
                punitive damages arising from or related to your use of the site,
                the inability to use the site, or reliance on site content.
              </p>
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <>
              <p>
                Questions about these terms can be sent to
                {" "}
                <a href="mailto:hello@mystique.com" className="text-[#f0d19a] hover:text-[#fff1cc]">
                  hello@mystique.com
                </a>
                .
              </p>
              <p>
                Continued use of the site after changes to these terms become
                effective constitutes acceptance of the revised terms.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
