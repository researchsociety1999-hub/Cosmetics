import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";
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
      <PageContainer as="main" variant="default">
        <PageHeader
          eyebrow="Careers"
          title="Join Mystique"
          subtitle="We are building a small, senior team around formulation, operations, and storytelling. When a role opens, it will be listed here first."
        />
        <div className="mystic-panel mt-10 max-w-2xl space-y-4 p-6 text-sm leading-relaxed text-[#b8ab95] md:p-8 md:text-base">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#d6a85f]">
            Studio
          </p>
          <p className="text-[#e8dcc8]">
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
      </PageContainer>
    </SiteChrome>
  );
}
