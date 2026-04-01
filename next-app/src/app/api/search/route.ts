import { NextResponse } from "next/server";
import { searchProducts } from "../../lib/queries";

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(query);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      { products: [], error: "Search failed." },
      { status: 500 },
    );
  }
}
