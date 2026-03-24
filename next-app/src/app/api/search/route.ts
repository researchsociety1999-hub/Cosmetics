import { NextResponse } from "next/server";
import { searchProducts } from "../../lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  const products = await searchProducts(query);

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price_cents: product.price_cents,
      sale_price_cents: product.sale_price_cents,
      routine_step: product.routine_step ?? "Ritual",
    })),
  });
}
