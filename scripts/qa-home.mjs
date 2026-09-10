import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "ru-RU",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
await page.evaluate(() => {
  localStorage.removeItem("mizan.v1.sheikhMet");
  localStorage.removeItem("mizan.v1.aimaMet");
  const s = JSON.parse(localStorage.getItem("mizan.v1.settings") || "{}");
  s.themeId = "mizan-emerald";
  localStorage.setItem("mizan.v1.settings", JSON.stringify(s));
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1400);

const body = await page.innerText("body");
const bad = ["здравствуй", "Здравствуй", "Привет, я Айма", "Айма ·", "Спросите Айму", "Я здесь"];
const foundBad = bad.filter((b) => body.includes(b));
const good = ["Мир тебе", "Шейх", "السلام عليكم", "Мизан"].filter((g) => body.includes(g));

await page.screenshot({ path: "/workspace/screenshots/home-sheikh.png", fullPage: true });

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
);

await page.click('button[aria-label="Спросить шейха"]');
await page.waitForTimeout(700);
await page.screenshot({ path: "/workspace/screenshots/sheikh-sheet.png" });
const sheet = await page.innerText("body");
const sheetBad = ["Айма", "здравствуй", "Здравствуй"].filter((b) => sheet.includes(b));

const desk = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  locale: "ru-RU",
});
const p2 = await desk.newPage();
await p2.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await p2.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("mizan.v1.settings") || "{}");
  s.themeId = "mizan-emerald";
  localStorage.setItem("mizan.v1.settings", JSON.stringify(s));
});
await p2.reload({ waitUntil: "networkidle" });
await p2.waitForTimeout(900);
await p2.screenshot({ path: "/workspace/screenshots/home-sheikh-desktop.png" });

console.log(JSON.stringify({ foundBad, good, sheetBad, overflow, errors, bodySnippet: body.slice(0, 700) }, null, 2));
await browser.close();
