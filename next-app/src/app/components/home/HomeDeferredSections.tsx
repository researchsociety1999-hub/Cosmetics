"use client";

import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Client-side deferred section wrappers
//
// `ssr: false` is only permitted inside Client Components in the Next.js
// App Router. This file is the designated "use client" boundary for every
// below-fold section that must be excluded from the server bundle.
//
// Usage in page.tsx (Server Component):
//   import { DeferredHomeTrustStrip, ... } from
//     "./components/home/HomeDeferredSections";
// ---------------------------------------------------------------------------

/**
 * Inline skeleton shown while the real section chunk is fetched.
 * Mirrors the SectionLoading layout in page.tsx so the page doesn't shift.
 */
function SectionShell({ title }: { title: string }) {
  return (
    <section className="border-b border-[rgba(17,24,39,0.9)] bg-transparent py-16">
      <div className="mystic-section-shell">
        <div className="mystique-section-surface px-6 py-8 md:px-10 md:py-10">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            {title}
          </p>
          <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="mystic-card min-h-[15.5rem] animate-pulse rounded-[var(--mystic-radius-card)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Below-fold deferred exports ────────────────────────────────────────────

export const DeferredHomeEditorialModules = dynamic(
  () =>
    import("./HomeEditorialModules").then((m) => m.HomeEditorialModules),
  { ssr: false, loading: () => <SectionShell title="Editorial" /> }
);

export const DeferredHomeGuidedDiscovery = dynamic(
  () =>
    import("./HomeGuidedDiscovery").then((m) => m.HomeGuidedDiscovery),
  { ssr: false, loading: () => <SectionShell title="Guided discovery" /> }
);

export const DeferredHomeServicesModule = dynamic(
  () =>
    import("./HomeServicesModule").then((m) => m.HomeServicesModule),
  { ssr: false, loading: () => null }
);

export const DeferredHomeTrustStrip = dynamic(
  () =>
    import("./HomeTrustStrip").then((m) => m.HomeTrustStrip),
  { ssr: false, loading: () => null }
);
