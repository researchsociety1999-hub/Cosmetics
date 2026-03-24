import { LegalPage } from "../components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Privacy"
      intro="This policy explains how Mystique collects, uses, and protects personal information when you browse the site, place an order, join the newsletter, or contact the team."
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "We may collect details you provide directly, including your name, email address, shipping information, and any message you send through the contact form or checkout flow.",
            "We may also collect basic technical information such as browser type, device details, referral source, and on-site activity to understand how the storefront is being used.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "Mystique uses this information to respond to inquiries, process and confirm orders, provide customer support, send transactional emails, and improve the shopping experience.",
            "If you subscribe to marketing updates, your email may also be used for launch notes, editorial updates, and promotional announcements until you unsubscribe.",
          ],
        },
        {
          heading: "Sharing and retention",
          paragraphs: [
            "We share data only with service providers that help operate the storefront, such as payment processors, email delivery providers, analytics tools, and hosting platforms.",
            "We keep information only as long as needed for customer support, legal compliance, fraud prevention, tax or accounting records, and normal business operations.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You may request access, correction, or deletion of personal information by contacting the Mystique team. Marketing emails also include an unsubscribe option.",
            "If you have privacy questions, please reach out through the contact page so the team can review your request.",
          ],
        },
      ]}
    />
  );
}
