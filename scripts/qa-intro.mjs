import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "ru-RU" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
await page.evaluate(() => {
  localStorage.removeItem("mizan.v1.sheikhMet");
  const s = JSON.parse(localStorage.getItem("mizan.v1.settings") || "{}");
  s.themeId = "mizan-emerald";
  localStorage.setItem("mizan.v1.settings", JSON.stringify(s));
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const body = await page.innerText("body");
const bad = ["здравствуй", "Здравствуй", "Привет, я Айма", "Айма", "Я здесь."];
const foundBad = bad.filter((b) => body.includes(b));
const good = ["Мир тебе", "Шейх", "السلام عليكم", "Хисн", "Крепость", "Пути обучения"].filter((g) => body.includes(g));
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
await page.screenshot({ path: "/workspace/screenshots/home-intro.png", fullPage: false });

// hisn tab
await page.getByRole("button", { name: "Хисн" }).last().click();
await page.waitForTimeout(1200);
const hisn = await page.innerText("body");
const hisnOk = hisn.includes("حصن") || hisn.includes("Крепость") || hisn.includes("hisnmuslim");
await page.screenshot({ path: "/workspace/screenshots/hisn-open.png" });

// learn
await page.getByRole("button", { name: "Учить" }).last().click();
await page.waitForTimeout(800);
const learn = await page.innerText("body");
const learnOk = learn.includes("Пути") || learn.includes("Иткан") || learn.includes("Арабский");
await page.screenshot({ path: "/workspace/screenshots/learn-tracks.png" });

// home ping
await page.getByRole("button", { name: "Главная" }).last().click();
await page.waitForTimeout(600);
const ping = page.getByRole("button", { name: "Сверить сейчас" });
if (await ping.count()) {
  await ping.click();
  await page.waitForTimeout(8000);
}
await page.screenshot({ path: "/workspace/screenshots/home-pulse.png" });
const pulse = await page.innerText("body");

console.log(JSON.stringify({
  foundBad, good, overflow, errors: errors.slice(0, 12),
  hisnOk, learnOk,
  pulseHas: ["связь есть", "нет ответа", "Спрашиваю"].filter(x => pulse.includes(x)),
  tabs: ["Главная","Закят","Коран","Хисн","Учить"].filter(t => body.includes(t) || hisn.includes(t)),
}, null, 2));
await browser.close();
