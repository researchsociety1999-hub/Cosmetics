import type { Metadata } from "next";
import { submitContactAction } from "../actions/contact";
import { SiteChrome } from "../components/SiteChrome";

type SearchParams = Promise<{ status?: string }>;

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mystique for support, partnerships, or editorial inquiries.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Contact
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Reach the Mystique team.
          </h1>
        </header>
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <form action={submitContactAction} className="mystic-card grid gap-5 p-6">
            <Field label="Name" name="name" />
            <Field label="Email" name="email" type="email" />
            <label>
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                Message
              </span>
              <textarea
                name="message"
                rows={6}
                className="mystic-input w-full text-sm"
                placeholder="Tell us how we can help."
              />
            </label>
            <button
              type="submit"
              className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Send message
            </button>
            {params.status === "sent" ? (
              <p className="text-sm text-[#d6a85f]">
                Thank you for reaching out. Our team will get back to you within
                1–2 business days.
              </p>
            ) : null}
            {params.status === "missing" ? (
              <p className="text-sm text-[#d6a85f]">
                Please complete all fields before submitting.
              </p>
            ) : null}
            {params.status === "email-error" ? (
              <p className="text-sm text-[#d6a85f]">
                We could not send your message right now. Please check the email
                configuration and try again.
              </p>
            ) : null}
          </form>
          <aside className="mystic-card p-6 text-sm text-[#b8ab95]">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#d6a85f]">
              Support
            </p>
            <p className="mt-4">Email: hello@mystique.com</p>
            <p className="mt-2">Press: hello@mystique.com</p>
            <p className="mt-2">Hours: Monday – Friday, 9am – 6pm PT</p>
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
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        className="mystic-input w-full text-sm"
      />
    </label>
  );
}
