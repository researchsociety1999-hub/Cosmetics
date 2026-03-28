import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Mystique uses cookies and similar technologies on the site.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      eyebrow="Cookies"
      intro="Mystique uses cookies and similar technologies to keep the storefront working, remember shopping activity and preferences, and understand how visitors use the site."
      sections={[
        {
          heading: "Essential cookies",
          paragraphs: [
            "Some cookies are necessary for core storefront functions such as cart persistence, session continuity, page rendering, and security-related features.",
            "Without these cookies, parts of the shopping experience may not work correctly, including remembering items added to the cart.",
          ],
        },
        {
          heading: "Performance and analytics",
          paragraphs: [
            "Mystique may use analytics technologies to understand page views, product interest, search behavior, cart activity, checkout starts, and general storefront performance.",
            "This information helps improve navigation, merchandising, site reliability, and the overall customer experience.",
          ],
        },
        {
          heading: "Managing cookie choices",
          paragraphs: [
            "Most browsers allow you to review, block, or delete cookies through browser settings. Restricting cookies may affect how parts of the storefront behave.",
            "If Mystique introduces additional cookie controls or consent tools in the future, they will be reflected in this policy.",
          ],
        },
      ]}
    />
  );
}
