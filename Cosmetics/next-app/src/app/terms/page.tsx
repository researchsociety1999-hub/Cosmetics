import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { getPublicStudioEmail } from "../lib/siteConfig";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Mystique website, accounts, orders, intellectual property, and limitations of liability.",
};

export default async function TermsPage() {
  const studioEmail = getPublicStudioEmail();
  const termsContactLine = studioEmail
    ? `Questions about these terms can be sent to ${studioEmail} or through the Contact form for review by the Mystique team.`
    : "Questions about these terms can be sent through the Contact form for review by the Mystique team.";

  return (
    <LegalPage
      title="Terms of Service"
      eyebrow="Terms"
      intro="These Terms of Service (“Terms”) govern access to and use of the Mystique website and related services, including browsing, account registration, purchases, and communications. If you do not agree, please discontinue use of the site."
      sections={[
        {
          heading: "Use of the site",
          paragraphs: [
            "By using this site, you agree to use it only for lawful purposes and in a way that does not interfere with the operation, security, or availability of the storefront.",
            "Mystique may update, suspend, or discontinue product pages, pricing, editorial content, promotional offers, account features, or site functionality at any time without prior notice.",
          ],
        },
        {
          heading: "Orders and availability",
          paragraphs: [
            "Submitting an order does not guarantee acceptance. Mystique may review, decline, or cancel orders for reasons including stock availability, suspected fraud, pricing issues, or incomplete customer information.",
            "If payment has already been taken for an order that cannot be fulfilled, the customer will be contacted and any eligible refund will be issued through the original payment method.",
          ],
        },
        {
          heading: "Product information and ownership",
          paragraphs: [
            "Mystique aims to present product details, imagery, ingredient information, and editorial content as accurately as possible, but minor variations or occasional errors may occur. Skincare information on the site is provided for general informational purposes and is not medical advice.",
            "The Mystique brand, site design, logos, photography, product copy, graphics, and related content are owned by Mystique or its licensors and may not be reproduced or used commercially without permission.",
          ],
        },
        {
          heading: "Liability and contact",
          paragraphs: [
            "To the fullest extent permitted by law, Mystique is not liable for indirect, incidental, special, or consequential damages arising from use of the site, inability to use the site, or reliance on site content.",
            termsContactLine,
          ],
        },
      ]}
    />
  );
}
