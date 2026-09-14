import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const dir = "/workspace/.grok/og-build";
const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function shot(html, out, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h, deviceScaleFactor: 1 } });
  await page.goto(pathToFileURL(join(dir, html)).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(dir, out), type: "png" });
  await page.close();
}

await shot("og-card.html", "og-comp.png", 1200, 630);
await shot("x-banner.html", "banner-comp.png", 1200, 264);
await browser.close();
console.log("ok");
