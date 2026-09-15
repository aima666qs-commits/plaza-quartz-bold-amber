import { chromium } from "playwright";

const url = "http://127.0.0.1:8080/#home";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => {
  localStorage.setItem(
    "mizan.v1.settings",
    JSON.stringify({
      themeId: "mizan-emerald",
      favorites: [],
      reducedMotion: true,
      densityOverride: "theme",
      colorScheme: "dark",
      fontScale: 1,
      locale: "ru",
      navLayout: "bottom",
      sabrNotify: false,
      sabrHour: 8,
      startTab: "home",
      showMeaning: true,
    }),
  );
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);

const out = {};

const t0 = Date.now();
await page.locator('[data-go="settings"]').click({ timeout: 5000 });
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 4000 });
out.settingsMs = Date.now() - t0;
out.settingsTitle = await page.locator("#settings-title").innerText();
out.hasStart = (await page.locator("text=Стартовая вкладка").count()) > 0;
out.hasReciter = (await page.locator("text=Чтец Корана").count()) > 0;
out.hasLang = (await page.locator("text=Язык приложения").count()) > 0;
out.hasKeep = (await page.locator("text=Помнить последнюю вкладку").count()) > 0;
out.hasLarge = (await page.locator("text=Крупные кнопки").count()) > 0;
await page.getByRole("button", { name: "Закрыть" }).click();
await page.waitForTimeout(200);

await page.locator('[data-go="nawawi"]').click();
await page.waitForTimeout(400);
const naw = await page.locator("h1").first().innerText();
out.nawawi = naw;
out.nawawiNotHisn = !/Крепость|حصن/.test(await page.locator("main").innerText());
await page.locator('[aria-label="Назад"]').click();
await page.waitForTimeout(200);

await page.locator('[data-go="tab-hisn"]').click();
await page.waitForTimeout(800);
const hisnText = await page.locator("main").innerText();
out.hisnHasMorningRu = hisnText.includes("Утро и вечер");
out.hisnHasEnglishMorning = /Words of remembrance/i.test(hisnText);
out.hisnHasEvilEyeEn = /evil eye/i.test(hisnText);
out.hisnHasFindRu = /Найти главу/.test(hisnText);
out.hisnFindHasEnglishWord = /english/i.test(hisnText);
out.sample = hisnText.slice(0, 400);

await page.screenshot({ path: "/workspace/screenshots/qa-hisn-ru.png", fullPage: false });
console.log(JSON.stringify(out, null, 2));
await browser.close();
if (
  !out.hisnHasMorningRu ||
  out.hisnHasEnglishMorning ||
  out.hisnHasEvilEyeEn ||
  out.hisnFindHasEnglishWord ||
  !out.nawawiNotHisn ||
  !out.hasStart
) {
  process.exit(1);
}
