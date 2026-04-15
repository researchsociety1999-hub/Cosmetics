/**
 * TODO (legal counsel): Align cookie categories and consent approach with your privacy program
 * and any analytics or marketing tools you enable.
 */
import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Mystique uses cookies and similar technologies for essential storefront functions, preferences, and performance measurement.",
};

export default async function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      eyebrow="Cookies"
      intro="Mystique uses cookies, local storage, and similar technologies to operate the storefront, keep you signed in where applicable, remember cart contents, honor preferences, and measure how the site performs. This policy explains what those technologies do and how you can manage them."
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
            "Most browsers let you block or delete cookies through their privacy or security settings. Blocking strictly necessary cookies may prevent checkout, cart persistence, or sign-in from working as expected.",
            "Because Mystique is a small studio, we rely on browser controls rather than a separate consent banner today. If that changes, we will update this policy and surface any new controls where you can see them.",
          ],
        },
      ]}
    />
  );
}
