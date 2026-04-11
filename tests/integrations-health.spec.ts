import { test, expect } from "@playwright/test";

test.describe("/api/health/integrations", () => {
  test("returns JSON with probes and readiness", async ({ request }) => {
    const response = await request.get("/api/health/integrations");

    expect(response.status(), await response.text()).toBe(200);

    const body = (await response.json()) as {
      probes?: {
        supabaseCatalog?: { ok?: boolean };
        stripe?: { skipped?: boolean; ok?: boolean };
        resend?: { skipped?: boolean; ok?: boolean };
      };
      readiness?: Record<string, boolean>;
      supabase?: { productsPublishedCount?: { ok?: boolean } };
    };

    expect(body).toHaveProperty("readiness");
    expect(body).toHaveProperty("probes");
    expect(body.probes).toHaveProperty("supabaseCatalog");
    expect(body.probes).toHaveProperty("stripe");
    expect(body.probes).toHaveProperty("resend");
    expect(body.supabase?.productsPublishedCount).toEqual(body.probes?.supabaseCatalog);
  });
});
