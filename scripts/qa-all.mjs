import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = [];
const consoles = [];
page.on("pageerror", e => errors.push("PAGE "+e.message));
page.on("console", m => { if (m.type()==="error") consoles.push(m.text()); });

async function shot(name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}.png` });
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1200);
const home = await page.innerText("body");
await shot("fix-home");

const tabs = ["Закят","Коран","Хисн","Учить"];
const tabText = {};
for (const t of tabs) {
  const btn = page.getByRole("button", { name: t }).last();
  await btn.click({ force: true }).catch(()=>{});
  await page.waitForTimeout(900);
  tabText[t] = (await page.innerText("body")).slice(0, 280);
  await shot("fix-"+t);
}

// hisn reader via hash
await page.goto("http://127.0.0.1:8080/#hisn/27", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const hisn = await page.innerText("body");
await shot("fix-hisn27");
const count = await page.locator(".hisn-count").count();

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);

console.log(JSON.stringify({
  errors: errors.slice(0,8),
  consoles: consoles.slice(0,8),
  homeHasWrong: ["Something went wrong","Maximum update","Айма","здравствуй"].filter(x=>home.includes(x)),
  homeHas: ["Мир тебе","Закят","Хисн"].filter(x=>home.includes(x)),
  tabHeads: tabText,
  hisnHead: hisn.slice(0,350),
  hisnCount: count,
  hisnBroken: hisn.includes("Something went wrong") || hisn.includes("Maximum update"),
  overflow,
}, null, 2));
await browser.close();
