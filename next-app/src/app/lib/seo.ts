import type { Metadata } from "next";

type BuildPageMetadataInput = {
  title: string;
  description?: string;
  canonicalPath: string;
  openGraphType?: "website" | "article";
  images?: Array<{ url: string; alt?: string }>;
};

export function buildPageMetadata({
  title,
  description,
  canonicalPath,
  openGraphType = "website",
  images,
}: BuildPageMetadataInput): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: canonicalPath,
      siteName: "Mystique",
      type: openGraphType,
      ...(images && images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: images && images.length > 0 ? "summary_large_image" : "summary",
      title,
      ...(description ? { description } : {}),
      ...(images && images.length > 0
        ? { images: images.map((image) => image.url) }
        : {}),
    },
  };
}

