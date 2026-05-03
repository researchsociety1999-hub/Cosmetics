import { chromium } from "playwright";

const url = "https://cosmetics-wjwz.vercel.app/";

async function captureAtViewport(name, viewport) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: `proof/home-${name}.png`, fullPage: false });

  const featured = page.locator("section").filter({ hasText: "Featured" }).first();
  if ((await featured.count()) > 0) {
    await featured.screenshot({ path: `proof/featured-${name}.png` });
  }

  const productCard = page
    .locator("article")
    .filter({ has: page.locator("a[href^=\"/products/\"]") })
    .first();
  if ((await productCard.count()) > 0) {
    await productCard.screenshot({ path: `proof/product-card-1-${name}.png` });
  }

  const editorial = page.locator("section").filter({ hasText: "Editorial moments" }).first();
  if ((await editorial.count()) > 0) {
    await editorial.screenshot({ path: `proof/editorial-${name}.png` });
  }

  const newsletter = page.locator("section").filter({ hasText: "Newsletter" }).first();
  if ((await newsletter.count()) > 0) {
    await newsletter.screenshot({ path: `proof/newsletter-${name}.png` });
  }

  const footer = page.locator("footer").first();
  if ((await footer.count()) > 0) {
    await footer.screenshot({ path: `proof/footer-${name}.png` });
  }

  await browser.close();
}

await captureAtViewport("desktop-1440", { width: 1440, height: 900 });
await captureAtViewport("tablet-1024", { width: 1024, height: 768 });
await captureAtViewport("mobile-390", { width: 390, height: 844 });

