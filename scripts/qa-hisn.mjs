import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "ru-RU" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/#hisn", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: "/workspace/screenshots/hisn-app.png" });
const home = await page.innerText("body");

// open morning
const morning = page.getByText("Главный вирд").first();
const hasHero = await morning.count();
if (hasHero) {
  await page.locator(".hisn-hero").first().click();
  await page.waitForTimeout(700);
}
await page.screenshot({ path: "/workspace/screenshots/hisn-reader.png" });
const reader = await page.innerText("body");

const counter = page.locator(".hisn-count");
let before = "", after = "";
if (await counter.count()) {
  before = (await counter.innerText()).trim();
  await counter.click();
  await page.waitForTimeout(250);
  after = (await counter.innerText()).trim();
}
await page.screenshot({ path: "/workspace/screenshots/hisn-tapped.png" });

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);

// back to book
const back = page.getByText("Книга").first();
if (await back.count()) await back.click();
await page.waitForTimeout(400);

console.log(JSON.stringify({
  errors: errors.slice(0, 10),
  overflow,
  homeHas: ["حصن", "Крепость", "Утро", "hisnmuslim", "После намаза"].filter(t => home.includes(t)),
  readerHas: ["повтор", "hisnmuslim", "готово"].filter(t => reader.includes(t) || after.includes(t)),
  before, after,
  bad: ["Айма", "здравствуй"].filter(t => home.includes(t) || reader.includes(t)),
}, null, 2));
await browser.close();
