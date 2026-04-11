import type { Metadata } from "next";
import Link from "next/link";
import { submitContactAction } from "../actions/contact";
import { SiteChrome } from "../components/SiteChrome";
import { getPublicStudioEmail } from "../lib/siteConfig";
import { getProductBySlug } from "../lib/queries";

type SearchParams = Promise<{ status?: string; topic?: string; ref?: string }>;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Mystique for orders, press, wholesale, and product questions. Replies in one to two business days.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const prefilledMessage = await buildContactPrefill(params);
  const studioEmail = getPublicStudioEmail();

  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Contact
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Write the studio.
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            Orders, press, wholesale, or help choosing a texture—we read every note and
            reply within one to two business days, Pacific time.
          </p>
        </header>
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <form action={submitContactAction} className="mystic-card grid gap-5 p-6 md:p-8">
            <Field label="Name" name="name" autoComplete="name" />
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <label htmlFor="contact-message">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                Message
              </span>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                required
                className="mystic-input w-full text-sm"
                placeholder="Include your order number if you have one, plus the question you want solved."
                autoComplete="off"
                defaultValue={prefilledMessage}
              />
            </label>
            <button
              type="submit"
              className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Send message
            </button>
            <div aria-live="polite">
              {params.status === "sent" ? (
                <p className="text-sm text-[#d6a85f]">
                  Thank you. A member of the Mystique team will reply within one to two
                  business days, Pacific time.
                </p>
              ) : null}
              {params.status === "missing" ? (
                <p className="text-sm text-[#d6a85f]" role="status">
                  Please complete every field so we can respond with the right detail.
                </p>
              ) : null}
              {params.status === "email-error" ? (
                <p className="text-sm text-[#d6a85f]" role="alert">
                  We could not send your message just now. Please try again shortly
                  {studioEmail ? (
                    <>
                      , or write directly to{" "}
                      <a
                        href={`mailto:${studioEmail}`}
                        className="text-[#f0d19a] underline-offset-4 hover:underline"
                      >
                        {studioEmail}
                      </a>
                      .
                    </>
                  ) : (
                    "."
                  )}
                </p>
              ) : null}
            </div>
          </form>
          <aside className="mystic-card space-y-5 p-6 text-sm leading-relaxed text-[#b8ab95] md:p-8">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Studio inbox
              </p>
              {studioEmail ? (
                <>
                  <p className="mt-4">
                    Care, orders, press, and wholesale:{" "}
                    <a
                      href={`mailto:${studioEmail}`}
                      className="text-[#f0d19a] underline-offset-4 hover:underline"
                    >
                      {studioEmail}
                    </a>
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#7a7265]">
                    Monday – Friday · 9am – 6pm Pacific
                  </p>
                </>
              ) : (
                <p className="mt-4 leading-relaxed">
                  We reply through this form—add the email you check most often so our note
                  reaches you. A public studio address will appear here once it is live and
                  monitored.
                </p>
              )}
            </div>
            <div className="border-t border-[rgba(214,168,95,0.12)] pt-5">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
                Quick links
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/faq" className="text-[#f0d19a] underline-offset-4 hover:underline">
                    FAQ &amp; shipping overview
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-[#f0d19a] underline-offset-4 hover:underline">
                    Shop the collection
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </SiteChrome>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  const id = `contact-field-${name}`;
  return (
    <label htmlFor={id}>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        required
        className="mystic-input w-full text-sm"
        autoComplete={autoComplete}
      />
    </label>
  );
}

async function buildContactPrefill(params: {
  topic?: string;
  ref?: string;
}): Promise<string> {
  if (params.topic !== "restock") {
    return "";
  }
  const ref = params.ref?.trim();
  if (!ref) {
    return [
      "Hello Mystique,",
      "",
      "I'd love a note when this ritual is available again.",
      "",
      "Thank you.",
    ].join("\n");
  }
  const product = await getProductBySlug(ref);
  const title =
    product?.name?.trim() ||
    ref
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return [
    "Hello Mystique,",
    "",
    `I'm interested in: ${title}.`,
    "",
    "Please let me know when it's back in the collection.",
    "",
    "Thank you.",
  ].join("\n");
}
