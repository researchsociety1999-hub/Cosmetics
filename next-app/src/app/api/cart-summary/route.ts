import { NextResponse } from "next/server";
import { getCartSummary } from "../../lib/cart";

export const runtime = "nodejs";

export async function GET() {
  try {
    const summary = await getCartSummary();
    return NextResponse.json({ itemCount: summary.itemCount });
  } catch (error) {
    console.error("cart summary error", error);
    return NextResponse.json({ itemCount: 0 }, { status: 200 });
  }
}

