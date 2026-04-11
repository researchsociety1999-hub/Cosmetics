import { expect, test } from "@playwright/test";
import { expectHeading, gotoAndWait } from "./helpers";

test.describe("account, legal, and status routes", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("routines page renders starter sequences", async ({ page }) => {
    await gotoAndWait(page, "/routines");

    await expectHeading(page, "Not sure where to start?");
    await expect(page.getByRole("heading", { name: "Morning routine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Evening routine" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop the collection" })).toBeVisible();
  });

  test("login page renders auth entry points and status copy", async ({ page }) => {
    await gotoAndWait(page, "/account/login?status=missing-email");

    await expectHeading(page, "Sign in to Mystique");
    await expect(page.getByRole("button", { name: "Send magic link" })).toBeVisible();
    await expect(page.getByText(/Enter the email address you want to use/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Create an account" })).toBeVisible();
  });

  test("login page surfaces auth send failures clearly", async ({ page }) => {
    await gotoAndWait(
      page,
      "/account/login?status=error&message=Too%20many%20requests%20from%20this%20browser.",
    );

    await expectHeading(page, "Sign in to Mystique");
    await expect(page.getByText(/couldn't send the magic link right now/i)).toBeVisible();
    await expect(
      page.getByText(/Too many requests from this browser/i),
    ).toBeVisible();
  });

  test("signup page renders account creation flow and status copy", async ({ page }) => {
    await gotoAndWait(page, "/account/signup?status=missing-email");

    await expectHeading(page, "Create your Mystique account");
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByText(/Enter the email address you want to use/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to sign in" })).toBeVisible();
  });

  test("signup page surfaces auth send failures clearly", async ({ page }) => {
    await gotoAndWait(
      page,
      "/account/signup?status=error&message=Too%20many%20requests%20from%20this%20browser.",
    );

    await expectHeading(page, "Create your Mystique account");
    await expect(page.getByText(/couldn't send the account link right now/i)).toBeVisible();
    await expect(
      page.getByText(/Too many requests from this browser/i),
    ).toBeVisible();
  });

  test("account root redirects guests to login with next path", async ({ page }) => {
    await gotoAndWait(page, "/account");

    await expect(page).toHaveURL(/\/account\/login\?next=\/account$/);
    await expectHeading(page, "Sign in to Mystique");
  });

  test("orders route redirects guests to login", async ({ page }) => {
    await gotoAndWait(page, "/account/orders");

    await expect(page).toHaveURL(/\/account\/login\?next=%2Faccount%2Forders$/);
    await expectHeading(page, "Sign in to Mystique");
  });

  test("journal detail page renders full editorial content", async ({ page }) => {
    await gotoAndWait(page, "/journal/bloom-skin-guide");

    await expectHeading(page, "The Bloom Skin Guide");
    await expect(page.getByRole("heading", { name: "Bloom skin is glow with restraint" })).toBeVisible();
    await expect(page.getByText(/Protect the finish in the morning/i)).toBeVisible();
  });

  test("unknown journal entries fall back to the site 404 page", async ({ page }) => {
    await gotoAndWait(page, "/journal/not-a-real-entry");

    await expectHeading(page, "This ritual does not exist.");
    await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse shop" })).toBeVisible();
  });

  test("press and careers pages render live support content", async ({ page }) => {
    await gotoAndWait(page, "/press");
    await expectHeading(page, "Press & media");
    await expect(page.getByText(/Coverage appears here only/i)).toBeVisible();

    await gotoAndWait(page, "/careers");
    await expectHeading(page, "Join the Mystic team");
    await expect(page.getByText(/valid route instead of a broken link/i)).toBeVisible();
  });

  test("legal routes render privacy, terms, and cookies content", async ({ page }) => {
    await gotoAndWait(page, "/privacy");
    await expectHeading(page, "Privacy Policy");
    await expect(page.getByText(/Information we collect/i)).toBeVisible();

    await gotoAndWait(page, "/terms");
    await expectHeading(page, "Terms of Service");
    await expect(page.getByText(/Orders and availability/i)).toBeVisible();

    await gotoAndWait(page, "/cookies");
    await expectHeading(page, "Cookie Policy");
    await expect(page.getByText(/Essential cookies/i)).toBeVisible();
  });

  test("contact and checkout status routes surface their state messages", async ({ page }) => {
    await gotoAndWait(page, "/contact?status=missing");
    await expectHeading(page, "The studio is listening.");
    await expect(page.getByText(/Please complete every field/i)).toBeVisible();

    await gotoAndWait(page, "/checkout/cancel?order_id=demo-123");
    await expectHeading(page, "Your bag is still waiting.");
    await expect(page.getByText(/Secure checkout closed/i)).toBeVisible();

    await gotoAndWait(page, "/checkout/success");
    await expectHeading(page, "We're confirming your payment.");
    await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact support" })).toBeVisible();
  });
});
