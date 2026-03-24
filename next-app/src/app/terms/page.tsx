import { LegalPage } from "../components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      eyebrow="Terms"
      intro="These terms govern the use of the Mystique website, including browsing the storefront, placing orders, and interacting with site content or communications."
      sections={[
        {
          heading: "Use of the site",
          paragraphs: [
            "By using this site, you agree to use it only for lawful purposes and in a way that does not interfere with the operation, security, or availability of the storefront.",
            "Mystique may update product information, pricing, promotional offers, and site content at any time without prior notice.",
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
          heading: "Product information",
          paragraphs: [
            "Mystique aims to present product details, imagery, and ingredient information as accurately as possible, but minor variations may occur.",
            "Skincare results vary by person. Product descriptions are for general informational purposes and are not medical advice.",
          ],
        },
        {
          heading: "Liability and contact",
          paragraphs: [
            "To the fullest extent permitted by law, Mystique is not liable for indirect, incidental, or consequential damages arising from use of the site or products purchased through it.",
            "Questions about these terms can be directed through the contact page for review by the Mystique team.",
          ],
        },
      ]}
    />
  );
}
