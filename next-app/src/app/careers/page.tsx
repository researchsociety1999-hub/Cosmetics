import Link from "next/link";
import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Careers at Mystique—studio updates and how to reach the team when roles are not publicly listed.",
  robots: { index: true, follow: true },
};

export default function CareersPage() {
  return (
    <SiteChrome>
      <main className="mystic-section-shell mystic-section">
        <header className="mb-8 max-w-3xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Careers
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            Join Mystique
          </h1>
          <p className="text-sm leading-relaxed text-[#b8ab95] md:text-base">
            We are building a small, senior team around formulation, operations, and
            storytelling. When a role opens, it will be listed here first.
          </p>
        </header>
        <div className="mystic-card max-w-2xl space-y-4 p-6 text-sm leading-relaxed text-[#b8ab95] md:p-8 md:text-base">
          <p>
            There are no public openings at the moment. For press, wholesale, or general
            studio inquiries, write us through Contact—we read every note.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/contact"
              className="mystic-button-primary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Contact the studio
            </Link>
            <Link
              href="/shop"
              className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Shop the line
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
