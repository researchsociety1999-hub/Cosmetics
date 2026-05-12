import { getConfiguredSiteUrl } from "./lib/siteUrl";

function originFromUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return null;
  }
}

export default function Head() {
  const supabaseOrigin =
    originFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    originFromUrl(process.env.SUPABASE_URL);
  const siteUrl = getConfiguredSiteUrl();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mystique",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl.replace(/\/$/, "")}/search?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;

  return (
    <>
      <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      {supabaseOrigin ? (
        <>
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
          <link rel="dns-prefetch" href={supabaseOrigin} />
        </>
      ) : null}
      <script
        type="application/ld+json"
        // Static JSON-LD; no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
    </>
  );
}

