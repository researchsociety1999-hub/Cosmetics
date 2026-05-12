import { test, expect } from "@playwright/test";

test.describe("/api/health/integrations", () => {
  test("returns JSON with probes, readiness, newsletter, and missing-env hints", async ({
    request,
  }) => {
    const response = await request.get("/api/health/integrations");

    expect(response.status(), await response.text()).toBe(200);

    const body = (await response.json()) as {
      probes?: {
        supabaseCatalog?: { ok?: boolean; count?: number | null; error?: string | null };
        stripe?: { skipped?: boolean; ok?: boolean; error?: string | null };
        resend?: { skipped?: boolean; ok?: boolean; error?: string | null };
      };
      readiness?: {
        supabaseCatalog?: boolean;
        supabaseAuth?: boolean;
        stripeCheckout?: boolean;
        stripeWebhooks?: boolean;
        resendEmail?: boolean;
        supabaseServiceRole?: boolean;
        newsletter?: boolean;
      };
      missingEnv?: {
        catalog?: string[];
        auth?: string[];
        checkout?: string[];
        supabaseServiceRole?: string[];
        orderEmails?: string[];
        contactForm?: string[];
        stripeWebhooks?: string[];
        newsletter?: string[];
      };
      supabase?: {
        urlConfigured?: boolean;
        productsPublishedCount?: { ok?: boolean };
      };
      stripe?: { secretConfigured?: boolean; publishableConfigured?: boolean };
      resend?: { apiKeyConfigured?: boolean };
      newsletter?: { backendConfigured?: boolean };
      hints?: string[];
    };

    expect(body).toHaveProperty("readiness");
    expect(body.readiness).toMatchObject({
      supabaseCatalog: expect.any(Boolean),
      supabaseAuth: expect.any(Boolean),
      stripeCheckout: expect.any(Boolean),
      stripeWebhooks: expect.any(Boolean),
      resendEmail: expect.any(Boolean),
      supabaseServiceRole: expect.any(Boolean),
      newsletter: expect.any(Boolean),
    });

    expect(body).toHaveProperty("probes");
    expect(body.probes).toHaveProperty("supabaseCatalog");
    expect(body.probes).toHaveProperty("stripe");
    expect(body.probes).toHaveProperty("resend");
    expect(body.supabase?.productsPublishedCount).toEqual(body.probes?.supabaseCatalog);

    expect(body).toHaveProperty("missingEnv");
    expect(body.missingEnv).toHaveProperty("catalog");
    expect(body.missingEnv).toHaveProperty("checkout");
    expect(body.missingEnv).toHaveProperty("newsletter");

    expect(body).toHaveProperty("newsletter");
    expect(body.newsletter).toMatchObject({
      backendConfigured: expect.any(Boolean),
    });

    expect(body).toHaveProperty("supabase");
    expect(body).toHaveProperty("stripe");
    expect(body).toHaveProperty("resend");

    expect(Array.isArray(body.hints)).toBe(true);
    expect((body.hints?.length ?? 0) > 0).toBe(true);
  });
});
