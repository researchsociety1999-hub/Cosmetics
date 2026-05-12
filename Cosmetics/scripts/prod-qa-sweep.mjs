import { chromium } from "playwright";

const BASE_URL = process.env.QA_BASE_URL || "https://cosmetics-wjwz.vercel.app";

function url(path) {
  return `${BASE_URL.replace(/\/$/, "")}${path}`;
}

async function withPage(context, fn) {
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const consoleMessages = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("requestfailed", (req) => {
    const failure = req.failure();
    requestFailures.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      errorText: failure?.errorText || "requestfailed",
    });
  });

  try {
    return await fn(page, { consoleMessages, pageErrors, requestFailures });
  } finally {
    await page.close();
  }
}

async function checkBasics(page) {
  const response = await page.goto(url("/"), { waitUntil: "domcontentloaded" });
  return { status: response?.status() ?? null, finalUrl: page.url() };
}

async function checkDuplicateIds(page, id) {
  await page.goto(url("/"), { waitUntil: "domcontentloaded" });
  const count = await page.locator(`#${id}`).count();
  return { id, count };
}

async function checkMobileNav(page) {
  await page.goto(url("/"), { waitUntil: "domcontentloaded" });
  const menuByRole = page.getByRole("button", {
    name: /menu|open menu|hamburger|open navigation|navigation/i,
  });
  const menuByAria = page.locator(
    'button[aria-label*="menu" i],button[aria-label*="navigation" i],button[aria-controls*="nav" i]',
  );

  const byRoleCount = await menuByRole.count();
  const byAriaCount = await menuByAria.count();

  // Also measure whether the primary nav links overflow the viewport (symptom of missing mobile menu).
  const navOverflow = await page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return null;
    const nav =
      header.querySelector("nav") ||
      header.querySelector('[role="navigation"]') ||
      header;
    const rect = nav.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return {
      navRight: rect.right,
      viewportWidth: vw,
      overflows: rect.right > vw + 2,
    };
  });

  let sampleButton = null;
  if (byRoleCount > 0) {
    sampleButton = await menuByRole.first().evaluate((el) => ({
      ariaLabel: el.getAttribute("aria-label"),
      text: (el.textContent || "").trim().slice(0, 80),
    }));
  } else if (byAriaCount > 0) {
    sampleButton = await menuByAria.first().evaluate((el) => ({
      ariaLabel: el.getAttribute("aria-label"),
      text: (el.textContent || "").trim().slice(0, 80),
    }));
  }

  return {
    hasMenuButton: byRoleCount > 0 || byAriaCount > 0,
    byRoleCount,
    byAriaCount,
    sampleButton,
    navOverflow,
  };
}

async function checkShopImages(page) {
  await page.goto(url("/shop"), { waitUntil: "networkidle" });

  const noImageTextCount = await page.getByText(/^No image$/i).count();
  const images = page.locator("img");
  const imgCount = await images.count();

  // sample first 24 images for load status
  const sample = [];
  const sampleCount = Math.min(imgCount, 24);
  for (let i = 0; i < sampleCount; i++) {
    const img = images.nth(i);
    const src = (await img.getAttribute("src")) || "";
    const naturalWidth = await img.evaluate((el) => el.naturalWidth);
    sample.push({
      src: src.length > 120 ? `${src.slice(0, 100)}…` : src,
      ok: naturalWidth > 0,
      naturalWidth,
    });
  }

  return { noImageTextCount, imgCount, imgSample: sample };
}

async function checkPdpAndQuickView(page) {
  await page.goto(url("/shop?search=dryness"), { waitUntil: "networkidle" });

  // Try to open the first "Quick view" / "Quick View" button we can find.
  const quickViewButton = page.getByRole("button", { name: /quick view/i }).first();
  const hasQuickView = (await quickViewButton.count()) > 0;
  let quickViewNoImage = null;
  if (hasQuickView) {
    await quickViewButton.click();
    const dialog = page.getByRole("dialog").first();
    await dialog.waitFor({ state: "visible" });
    quickViewNoImage = (await dialog.getByText(/^No image$/i).count()) > 0;
    // Close (try button named close, then escape)
    const closeButton = dialog.getByRole("button", { name: /close|×|x/i }).first();
    if ((await closeButton.count()) > 0) await closeButton.click();
    else await page.keyboard.press("Escape");
  }

  // Navigate to a PDP from the grid (first product link)
  const productLink = page.locator('a[href^="/products/"]').first();
  await productLink.click();
  await page.waitForLoadState("domcontentloaded");
  const pdpUrl = page.url();
  const pdpImgCount = await page.locator("img").count();
  const pdpNoImageText = (await page.getByText(/^No image$/i).count()) > 0;

  return { hasQuickView, quickViewNoImage, pdpUrl, pdpImgCount, pdpNoImageText };
}

async function checkCartBadgeStaleness(page) {
  await page.goto(url("/shop"), { waitUntil: "networkidle" });
  const firstAdd = page.getByRole("button", { name: /add to bag/i }).first();
  if ((await firstAdd.count()) === 0) {
    return { supported: false, reason: "No ADD TO BAG button found on /shop" };
  }
  await firstAdd.click();
  await page.waitForLoadState("networkidle");
  await page.goto(url("/cart"), { waitUntil: "networkidle" });

  // Capture any numeric badge in header near cart link/icon (heuristic).
  const header = page.locator("header").first();
  const beforeBadge = await header.textContent();

  const removeButton = page.getByRole("button", { name: /^remove$/i }).first();
  if ((await removeButton.count()) === 0) {
    return { supported: false, reason: "No REMOVE button found on /cart" };
  }
  await removeButton.click();
  await page.waitForTimeout(1500);
  const afterBadge = await header.textContent();

  return {
    supported: true,
    headerTextBefore: (beforeBadge || "").slice(0, 400),
    headerTextAfter: (afterBadge || "").slice(0, 400),
    changed: beforeBadge !== afterBadge,
  };
}

async function checkPromoPlaceholder(page) {
  await page.goto(url("/cart"), { waitUntil: "networkidle" });
  const promoInput =
    page.locator('input[name*="promo" i]').first() ||
    page.locator('input[id*="promo" i]').first();
  const fallback = page.locator('input[placeholder]').filter({ hasNotText: "" });
  const input =
    (await promoInput.count()) > 0 ? promoInput : fallback.nth(0);

  const placeholder = (await input.getAttribute("placeholder")) || null;

  // If placeholder suggests MYSTIQUE10, try applying it.
  let promoResult = null;
  if (placeholder && /mystique10/i.test(placeholder)) {
    await input.fill("MYSTIQUE10");
    const apply = page.getByRole("button", { name: /apply/i }).first();
    if ((await apply.count()) > 0) {
      await apply.click();
      await page.waitForTimeout(1500);
      promoResult = {
        url: page.url(),
        hasUnavailableMessage:
          (await page.getByText(/not configured|unavailable/i).count()) > 0,
      };
    }
  }

  return { placeholder, promoResult };
}

async function checkCheckoutStripeSession(page) {
  let lastCheckoutSession = null;
  page.on("response", async (res) => {
    try {
      const u = res.url();
      if (!u.includes("/api/create-checkout-session")) return;
      const status = res.status();
      let bodyText = null;
      try {
        bodyText = await res.text();
      } catch {
        bodyText = null;
      }
      lastCheckoutSession = { status, bodyText: bodyText?.slice(0, 2000) ?? null };
    } catch {
      // ignore
    }
  });

  await page.goto(url("/shop"), { waitUntil: "networkidle" });
  const add = page.getByRole("button", { name: /add to bag/i }).first();
  if ((await add.count()) === 0) {
    return { supported: false, reason: "No ADD TO BAG button found on /shop" };
  }
  await add.click();
  await page.waitForLoadState("networkidle");
  await page.goto(url("/checkout"), { waitUntil: "networkidle" });

  // Fill the visible shipping form fields (best-effort labels).
  const fields = [
    ["Full Name", "Test User"],
    ["Email", "localtest+mystique@example.com"],
    ["Address Line 1", "123 Test St"],
    ["City", "San Francisco"],
    ["State", "CA"],
    ["Postal Code", "94105"],
    ["Country", "United States"],
  ];
  for (const [label, value] of fields) {
    const input = page.getByLabel(new RegExp(`^${label}$`, "i"));
    if ((await input.count()) > 0) {
      await input.fill(value);
    }
  }

  const continueButton = page.getByRole("button", { name: /continue to payment/i }).first();
  if ((await continueButton.count()) === 0) {
    return { supported: false, reason: "No CONTINUE TO PAYMENT button found" };
  }

  // Click and wait for either redirect attempt or an error message.
  await continueButton.click();
  await page.waitForTimeout(2500);
  const errorTextCandidates = [
    /prepare your order for payment/i,
    /secure payment/i,
    /couldn't open the secure payment window/i,
    /temporarily unavailable/i,
  ];
  let errorText = null;
  for (const re of errorTextCandidates) {
    const loc = page.getByText(re).first();
    if ((await loc.count()) > 0) {
      errorText = (await loc.textContent())?.trim() || String(re);
      break;
    }
  }

  const currentUrl = page.url();
  return { supported: true, currentUrl, errorText, checkoutSessionResponse: lastCheckoutSession };
}

async function checkMagicLinkRequest(page) {
  await page.goto(url("/account/login"), { waitUntil: "networkidle" });
  const email = `localtest+mystique+${Date.now()}@example.com`;
  const emailInput = page.locator('input[name="email"]').first();
  if ((await emailInput.count()) === 0) {
    return { supported: false, reason: "No email input found on /account/login" };
  }
  await emailInput.fill(email);
  const submit = page.getByRole("button", { name: /send magic link/i }).first();
  if ((await submit.count()) === 0) {
    return { supported: false, reason: "No 'Send magic link' button found" };
  }

  await submit.click();
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  // capture visible status copy if present
  const checkEmailCopy =
    (await page.getByText(/check .* inbox/i).first().textContent().catch(() => null)) ||
    null;
  const errorCopy =
    (await page.getByText(/couldn.*send the magic link/i).first().textContent().catch(() => null)) ||
    null;

  return { supported: true, currentUrl, checkEmailCopy, errorCopy };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = { baseUrl: BASE_URL, timestamp: new Date().toISOString(), checks: {} };

  try {
    // Desktop context
    const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    results.checks.desktop = {};

    results.checks.desktop.basics = await withPage(desktop, async (page, meta) => {
      const basics = await checkBasics(page);
      return { ...basics, meta };
    });

    results.checks.desktop.duplicateIds = await withPage(desktop, async (page) =>
      checkDuplicateIds(page, "newsletter-email"),
    );

    results.checks.desktop.shopImages = await withPage(desktop, async (page, meta) => {
      const res = await checkShopImages(page);
      return { ...res, meta };
    });

    results.checks.desktop.pdpQuickView = await withPage(desktop, async (page, meta) => {
      const res = await checkPdpAndQuickView(page);
      return { ...res, meta };
    });

    results.checks.desktop.promo = await withPage(desktop, async (page, meta) => {
      const res = await checkPromoPlaceholder(page);
      return { ...res, meta };
    });

    results.checks.desktop.cartBadge = await withPage(desktop, async (page, meta) => {
      const res = await checkCartBadgeStaleness(page);
      return { ...res, meta };
    });

    results.checks.desktop.checkout = await withPage(desktop, async (page, meta) => {
      const res = await checkCheckoutStripeSession(page);
      return { ...res, meta };
    });

    results.checks.desktop.magicLink = await withPage(desktop, async (page, meta) => {
      const res = await checkMagicLinkRequest(page);
      return { ...res, meta };
    });

    await desktop.close();

    // Mobile context
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      isMobile: true,
      hasTouch: true,
    });
    results.checks.mobile = {};
    results.checks.mobile.nav = await withPage(mobile, async (page, meta) => {
      const res = await checkMobileNav(page);
      return { ...res, meta };
    });
    await mobile.close();
  } finally {
    await browser.close();
  }

  // Print as compact JSON so it’s easy to paste into issues.
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error("prod-qa-sweep failed:", err);
  process.exitCode = 1;
});

