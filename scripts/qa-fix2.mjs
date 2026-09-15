import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto("http://127.0.0.1:8080/#zakat", { waitUntil: "networkidle", timeout: 30000 });
await page.evaluate(() => { localStorage.clear(); });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const empty = await page.innerText("body");
const inputs = page.locator("input");
const n = await inputs.count();
// fill first decimal-looking input
for (let i = 0; i < n; i++) {
  const ph = await inputs.nth(i).getAttribute("placeholder");
  const mode = await inputs.nth(i).getAttribute("inputmode");
  if (mode === "decimal" || ph === "0") {
    await inputs.nth(i).fill("1000");
    break;
  }
}
await page.waitForTimeout(600);
const below = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-zakat-below.png" });
for (let i = 0; i < n; i++) {
  const mode = await inputs.nth(i).getAttribute("inputmode");
  if (mode === "decimal") {
    await inputs.nth(i).fill("2000000");
    break;
  }
}
const selects = page.locator("select");
const sc = await selects.count();
for (let i = 0; i < sc; i++) {
  const t = await selects.nth(i).innerText();
  if (t.includes("год")) {
    await selects.nth(i).selectOption("yes");
    break;
  }
}
await page.waitForTimeout(500);
const due = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-zakat-due.png" });
console.log(JSON.stringify({
  errors,
  emptyHint: empty.slice(0, 250),
  hasPrice: /золота|нисаб|₽/.test(empty),
  belowHas: below.includes("Не подпадает"),
  belowSlice: below.match(/Не подпадает[\s\S]{0,80}|Пока не считаем[\s\S]{0,80}|К уплате[\s\S]{0,80}|Введите сумму[\s\S]{0,80}/)?.[0],
  dueHas: due.includes("К уплате") || due.includes("Нужно заплатить"),
  dueSlice: due.match(/К уплате[\s\S]{0,60}|Не подпадает[\s\S]{0,60}|Пока не[\s\S]{0,60}/)?.[0],
}, null, 2));
await browser.close();
