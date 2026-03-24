import { LegalPage } from "../components/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      eyebrow="Cookies"
      intro="Mystique uses cookies and similar technologies to keep the storefront working, remember preferences, support cart behavior, and understand how shoppers use the site."
      sections={[
        {
          heading: "Essential cookies",
          paragraphs: [
            "Some cookies are necessary for core storefront functions such as cart persistence, session continuity, page rendering, and security-related features.",
            "Without these cookies, parts of the shopping experience may not work correctly.",
          ],
        },
        {
          heading: "Performance and analytics",
          paragraphs: [
            "Mystique may use analytics technologies to understand page views, product interest, checkout activity, and general storefront performance.",
            "This information helps improve navigation, merchandising, and overall user experience.",
          ],
        },
        {
          heading: "Managing cookie choices",
          paragraphs: [
            "Most browsers allow you to review, block, or delete cookies through browser settings. Restricting cookies may affect how parts of the site behave.",
            "If Mystique introduces additional cookie controls or consent tools, they will be reflected here.",
          ],
        },
      ]}
    />
  );
}
