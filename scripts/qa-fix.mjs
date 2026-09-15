import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type()==="error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/#zakat", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1000);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
const empty = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-zakat-empty.png" });

const amount = page.getByLabel("Сумма").first();
await amount.fill("1000");
await page.waitForTimeout(400);
const below = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-zakat-below.png" });

await amount.fill("2000000");
const hawl = page.getByLabel("Деньги уже год?");
await hawl.selectOption("yes");
await page.waitForTimeout(400);
const due = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-zakat-due.png" });

await page.getByRole("button", { name: "Учить" }).last().click({ force: true });
await page.waitForTimeout(600);
const learn = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-learn.png" });

await page.getByRole("button", { name: "Главная" }).last().click({ force: true });
await page.waitForTimeout(500);
const home = await page.innerText("body");
await page.screenshot({ path: "/workspace/screenshots/fix-home2.png" });

await page.getByRole("button", { name: "Хисн" }).last().click({ force: true });
await page.waitForTimeout(700);
const hisn = await page.innerText("body");

console.log(JSON.stringify({
  errors: errors.slice(0, 8),
  emptyHead: empty.includes("Введите сумму") || empty.includes("Пока нет цифры"),
  emptyHasTrillion: /млрд|трлн|000 000 000/.test(empty),
  belowHas: below.includes("Не подпадает"),
  dueHasPay: due.includes("К уплате") || due.includes("Нужно заплатить"),
  learnMethods: ["Нурания", "3 + 10 + 1", "Мураджа"].filter(x => learn.includes(x)),
  homeSheikhOpen: home.includes("Пиши сюда полностью"),
  homeGreeting: home.includes("Мир тебе"),
  hisnOk: hisn.includes("Крепость"),
  dockCount: await page.locator("nav[aria-label=Разделы] button").count(),
}, null, 2));
await browser.close();
