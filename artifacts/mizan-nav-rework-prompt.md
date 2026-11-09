# Мизан — промпт и чеклист: мощная навигация

**Дата:** 2026-11-06 (Africa/Cairo, UTC+2)  
**Цель:** готовый system/prompt + чеклист для AI/разработчика, чтобы переделать навигацию Мизана «мощнее», без смены production без отдельного approve.  
**Не делать в этом задании:** перевод хадисов, деплой на live, правки master.

---

## 0. Где лежит текущая навигация (аудит)

### A) Основной исходник (mizanx.pro / Grok App Builder) — **цель правок**

Репозиторий: `aima666qs-commits/plaza-quartz-bold-amber`

| Что | Путь |
|-----|------|
| App shell + `BottomNav` + `Header` + tab keep | `src/components/mizan/mizan-app.tsx` |
| Плитки дома / «комнаты» | `src/lib/house/catalog.ts` (`HOUSE_MAIN`, `HOUSE_MORE`) |
| Вкладки (`AppTab`) + `navLayout` | `src/stores/mizan-store.ts` |
| Подписи nav (ru/en/ar/tr/uz/tg/kk) | `src/lib/i18n/dict.ts` (`nav.*`, `NAV_LAYOUTS`) |
| Стили dock / sidebar / rail / top | `src/styles.css` (`.bottom-dock`, `[data-nav="sidebar"]`, `.nav-glow`) |
| Намаз + кибла (не отдельный tab) | `src/components/mizan/salah-board.tsx`, `salah-card.tsx`, `home-view.tsx` |
| Закят | `src/components/mizan/zakat-view.tsx` |
| Настройки раскладки | `src/components/mizan/panels.tsx` |

**Сейчас (plaza):**
- Bottom dock: ровно **5** вкладок — `home | zakat | quran | hisn | learn` (`TABS` в `mizan-app.tsx`).
- Нет кнопки «Ещё» в dock; вторичные разделы — плитки `HOUSE_MAIN` / `HOUSE_MORE` на главной.
- `navLayout`: `theme | bottom | top | rail | sidebar` (sidebar уже есть в CSS как узкий sticky rail 4.5rem).
- `AppTab = "home" | "zakat" | "quran" | "hisn" | "learn"`.
- Намаз/кибла/тасбих **не** отдельные вкладки: намаз+кибла живут на home (`#salah`), хадисы — через house rooms / hadith reader.
- Логотип — весы (`ScalesFilm`), **без полумесяца**. Палитра: emerald `#04140e` / `#04100c`, gold `#e3c27a` / `#d4a843`, cream, mint `#2fbf86`.

### B) Параллельный live SPA (xservis.app/mizan) — **справочно, не ломать**

На сервере `82.26.94.154`: `/root/Xservis/landing/mizan/` (staging: `mizan-next/`).  
Сборка Vite; исходников TSX на сервере нет — логика в бандле `assets/index-B52Zix17-voice10.js` (layout `Dm()`).

| Что | Как устроено |
|-----|----------------|
| Каталог разделов | `Nl = [{to,k,ic}, …]` — home, prayer, hadith, hadeeth-enc, quran, hifz, learn, hisn, qibla, tasbih, zakat, sheikh, downloads, bookmarks, install, settings |
| Primary bottom | `Cm = ["/", "/prayer", "/quran", "/hadith"]` + кнопка «Ещё» → sheet `grid-cols-3` |
| Desktop | `aside.sticky` `md:flex` w-64, полный `Nl.map` |
| Mobile bottom | `nav.fixed.bottom-0` `md:hidden` `grid-cols-5` |
| Basename | `/mizan/` |
| i18n keys | `nav.home`, `nav.prayer`, `nav.hadith`, `nav.quran`, `nav.qibla`, `nav.tasbih`, `nav.zakat`, `nav.more`, … |

Промпт ниже **в первую очередь** для plaza (`mizan-app.tsx`). Если позже унифицируете с xservis SPA — сохраняйте те же IA-решения и пути.

---

## 1. SYSTEM PROMPT (скопировать целиком)

```
Ты — senior product engineer + a11y-minded UI engineer для «Мизан» (Mizan Islamic Companion).

КОНТЕКСТ ПРОДУКТА
- Исламский companion: закят, намаз (время молитв), кибла, Коран, хадисы (перевод/проверка), тасбих, халяль/харам финансы (анализ, НЕ фетва), Хисн, обучение.
- Стек: React 19 + Vite / TanStack Router (plaza), Zustand stores, framer-motion, Lucide; параллельно есть Vite SPA на xservis.app/mizan.
- Бренд: emerald #04140e (фон), gold #e3c27a / #d4a843 (акцент), cream/ivory текст, mint #2fbf86 (успех/online). Логотип — весы (mizan/scales), БЕЗ полумесяца и без «мечетьевых» клише.
- Язык UI по умолчанию: русский. i18n уже есть (ru/en/ar/tr/uz/tg/kk) — любые новые строки добавляй во все локали через тот же паттерн, что в src/lib/i18n/dict.ts.
- Тон: спокойный, уважительный, без прозелитизма и без выдачи фетв. Финансовый блок — «справочный анализ по критериям», с явным дисклеймером.

ИСХОДНЫЙ КОД НАВИГАЦИИ (НЕ ВЫДУМЫВАЙ ПУТИ)
- Shell: src/components/mizan/mizan-app.tsx — Header, BottomNav (portal .bottom-dock), KeepTab, parseHash/goBack.
- Вкладки: const TABS + AppTab в src/stores/mizan-store.ts.
- Дом/плитки: src/lib/house/catalog.ts (HOUSE_MAIN, HOUSE_MORE).
- Стили dock/sidebar: src/styles.css (.bottom-dock, [data-nav="sidebar"|"top"|"rail"], .nav-glow).
- Намаз/кибла: salah-board.tsx / salah-card.tsx / home-view.tsx (якорь #salah).
- Подписи: src/lib/i18n/dict.ts ключи nav.*.

ЦЕЛЬ РЕФАКТОРА
Сделать навигацию «мощнее»: умные переходы между разделами, контекстные подсказки, быстрые ярлыки, единый поиск по контенту, mobile-first bottom nav (5 primary + overflow), desktop sticky sidebar с полным деревом, бренд-консистентный UI, a11y, плавные переходы. Сохранить существующие hash/tab контракты где возможно.

════════════════════════════════════════
ДЕФОЛТЫ (уже приняты владельцем / агентом — не спрашивай)
════════════════════════════════════════
1) UI-копирайт примеров и новых строк — на русском (плюс ключи i18n).
2) Сохранить текущие маршруты/вкладки: home, zakat, quran, hisn, learn. Не ломать #quran/#hisn/#learn/#house/#zakat/#settings.
3) Bottom nav: РОВНО 5 primary + отдельный overflow «Ещё» (итого 6 слотов в dock на mobile; на <360px — 4 primary + Ещё, 5-й primary уходит в overflow).
4) Desktop (md+ или navLayout=sidebar): sticky sidebar слева, полный список разделов + группы; bottom-dock скрыт или превращён в sidebar (как уже делает [data-nav="sidebar"]).
5) Новые first-class разделы (добавить в IA, не обязательно сразу в 5 primary):
   - namaz (намаз) — сейчас на home; сделать deep-linkable tab/room `#salah` или `#house/salah` + пункт в overflow и sidebar.
   - qibla — рядом с намазом (сейчас toggle в SalahBoard).
   - tasbih — room/tab `#house/tasbih` (если ещё нет — создать заглушку-комнату).
   - finance — халяль/харам анализ `#finance` или tab `finance` (дисклеймер «не фетва»).
6) Primary 5 (mobile): home, namaz, quran, hadith (или hisn→hadith entry), zakat.
   Overflow «Ещё»: hisn, learn, qibla, tasbih, finance, books/9 сборников, bookmarks-equivalent, settings, install/cabinet.
   Если hadith ещё не AppTab — primary «Хадисы» открывает house room `books` или hadith library; не дублируй два разных «хадисных» primary.
7) Не деплоить на production; PR/ветка non-main. Не трогать master/main без явного approve.
8) Не использовать полумесяц в иконках. Для намаза — clock/compass/beads/scale/book/scroll/shield.

════════════════════════════════════════
ИНФОРМАЦИОННАЯ АРХИТЕКТУРА
════════════════════════════════════════
A. Primary (bottom, 5):
   1. Главная — home
   2. Намаз — deep link к SalahBoard/SalahCard (#salah); если удобнее — новый AppTab "namaz"
   3. Коран — quran
   4. Хадисы — вход в библиотеку/9 сборников (house books) или hisn, если books ещё сырой; предпочтительно отдельный hadith entry
   5. Закят — zakat

B. Overflow sheet «Ещё» (mobile bottom sheet, как на xservis SPA: rounded-t-3xl, grid 3 колонки):
   Хисн, Учить, Кибла, Тасбих, Финансы (халяль/харам), 40 хадисов, 9 сборников, Имена, Словарь, Таджвид, Тафсир, Мекка/Медина, Кабинет/Настройки, Установка PWA.

C. Desktop sidebar (sticky):
   Группы с заголовками (label uppercase gold/muted):
   - Сегодня: Главная, Намаз, Кибла, Тасбих
   - Писание: Коран, Хисн, Хадисы, Учить
   - Имущество: Закят, Финансы
   - Ещё: остальные HOUSE_* + Настройки
   Активный пункт: gold text + ring/nav-glow; aria-current="page".

D. Сохранить HOUSE_MAIN / HOUSE_MORE как источник плиток на home, но вынести единый NAV_CATALOG (single source of truth), из которого строятся: TABS primary, overflow, sidebar, home tiles, search index.

════════════════════════════════════════
КОНТЕКСТНЫЕ ПОДСКАЗКИ (ContextualSuggestions)
════════════════════════════════════════
Компонент <ContextualRail /> (горизонтальный chip-row под header или над bottom-dock; на desktop — блок в sidebar «Сейчас полезно»).

Правила (приоритет сверху вниз; max 3 чипа):
1) Если сейчас в пределах ±30 мин до азана / на странице намаза → «Кибла», «Тасбих», «Дуа после намаза» (hisn chapter if known).
2) После просмотра намаза ≥15 сек или закрытия salah → «Посчитать закят?» (zakat).
3) На вкладке Коран после чтения аята → «Тафсир», «Заучить» (learn/hifz), «Похожий хадис» (search).
4) На закяте после результата расчёта → «Сохранить», «Финансы: проверить актив» (finance), «Хадис о закяте».
5) На hisn утром/вечером по локальному времени → главы утра/вечера.
6) Если геолокации нет → «Указать место» (для намаза/киблы).
7) Никогда не предлагать фетву; для finance chip текст: «Разбор актива (не фетва)».

Чип: min-h-11, border gold/30, bg white/3, tap → navigate + close. Учитывать prefers-reduced-motion.

════════════════════════════════════════
БЫСТРЫЕ ЯРЛЫКИ (Quick Access)
════════════════════════════════════════
1) Cmd/Ctrl+K или кнопка «Поиск» в header → Command Palette / Search Omnibox.
2) Long-press (400ms) на primary icon → мини-меню частых действий этого раздела (напр. Намаз → «Кибла», «Метод расчёта»).
3) Home: блок «Недавние» (last 5 destinations from sessionStorage mizan.v1.navRecents).
4) Swipe-down на home → открыть поиск (опционально, только если не ломает scroll).

════════════════════════════════════════
ПОИСК ПО ВСЕМУ КОНТЕНТУ
════════════════════════════════════════
Единый SearchOmnibox:
- Источники: суры/аяты (quran index), hisn chapters, HOUSE tiles labels, hadith Nawawi 40, bookmarks if any, settings entries, finance topics list.
- Результат: {type, title, subtitle, href/hash, icon}.
- Пустой query → показать «Частые» + contextual suggestions.
- Debounce 150ms; клавиатура: ↑↓ Enter Esc; aria-activedescendant.
- Русский + арабский ввод; нормализация е/ё, ташкиль optional strip.
- Не ходи в сеть без нужды; локальный индекс. Qdrant/RAG — только если уже есть client helper; иначе пометь TODO.

════════════════════════════════════════
MOBILE BOTTOM NAV
════════════════════════════════════════
- Portal в document.body (как сейчас BottomNav).
- class: bottom-dock glass; safe-area-inset-bottom; z-index выше контента, ниже модалок settings/cabinet/sheikh (≥80, модалки выше).
- grid-cols-6 на ≥360px: 5 primary + «Ещё»; <360px: grid-cols-5 с 4 primary + Ещё.
- Активный: nav-glow / text accent; aria-current="page".
- «Ещё» открывает bottom sheet (focus trap, Esc закрывает, restore focus).
- Скрывать dock на полноэкранных ридерах при scroll-down (опционально .is-tucked), но не на намазе/кибле.
- Крупная зона тапа ≥44×44 (settings.largeTap → ещё больше).

════════════════════════════════════════
DESKTOP SIDEBAR
════════════════════════════════════════
- При navLayout=sidebar ИЛИ viewport ≥md: показать sticky sidebar.
- Ширина: компакт 4.5rem (иконки) / expanded 16rem (иконка+подпись) — toggle «Закрепить подписи».
- Sticky top-0 h-dvh; border-inline-end gold/15; фон emerald/70 + blur.
- Сверху мини-весы + «Мизан» / الميزان gold-flow.
- Снизу футер: версия / «офлайн» если SW.
- Не дублировать header brand на ultra-wide без нужды.

════════════════════════════════════════
СТИЛЬ / БРЕНД
════════════════════════════════════════
- Цвета только из theme tokens (--bg, --accent, --muted, --line) + бренд emerald/gold/mint.
- Активный пункт: золотой градиент текста или soft gold wash; лёгкий nav-pulse если motion on.
- Sheet/sidebar: glass, border gold/25–35, без резкого белого.
- Иконки Lucide stroke-2, size-5; не заполнять полумесяцем.
- framer-motion: fade/slide 180–280ms; уважать useReducedMotion / data-motion=off.

════════════════════════════════════════
A11Y
════════════════════════════════════════
- nav aria-label="Основная навигация" / translate(locale,"nav.home") как сейчас, но точнее «Главное меню».
- Фокус-видимость: outline gold 2px offset 2 (уже в продукте — не ломай).
- Sheet: role="dialog" aria-modal="true" aria-label="Ещё разделы".
- Порядок фокуса логичный; не оставляй focus в hidden KeepTab.
- Контраст: режим highContrast уже есть — проверяй active/inactive.
- Screen reader: не дублируй «вкладка» в каждом label.

════════════════════════════════════════
СМОУТ ПЕРЕХОДЫ / СОСТОЯНИЕ
════════════════════════════════════════
- KeepTab сохранить (не размонтировать посещённые вкладки).
- goBack() расширить: finance/namaz/qibla/tasbih/search.
- parseHash(): добавить #namaz|#salah, #qibla, #tasbih, #finance, #search?q=.
- Писать recents при каждом setAppTab / setHouseNav.
- При смене tab — window.scrollTo(0,0) как в xservis Dm; закрывать overflow sheet.

════════════════════════════════════════
ФИНАНСЫ (halal/haram) — NAV ONLY В ЭТОМ ПРОМПТЕ
════════════════════════════════════════
- Пункт «Финансы» в overflow + sidebar + search.
- Экран-заглушка допустим: заголовок «Халяль / харам · разбор», дисклеймер «Это не фетва и не шариатское заключение», CTA к будущему анализатору.
- Иконка Scale или Landmark — не crescent.

════════════════════════════════════════
ФАЙЛЫ, КОТОРЫЕ ОЖИДАЮТСЯ К ИЗМЕНЕНИЮ
════════════════════════════════════════
1. src/lib/nav/catalog.ts (НОВЫЙ) — единый NAV_CATALOG
2. src/components/mizan/mizan-app.tsx — BottomNav, SidebarNav, OverflowSheet, wiring
3. src/components/mizan/contextual-rail.tsx (НОВЫЙ)
4. src/components/mizan/search-omnibox.tsx (НОВЫЙ)
5. src/lib/house/catalog.ts — реэкспорт/совместимость с NAV_CATALOG
6. src/stores/mizan-store.ts — расширить AppTab при необходимости; recents
7. src/lib/i18n/dict.ts — nav.more, nav.namaz, nav.qibla, nav.tasbih, nav.finance, nav.search, …
8. src/styles.css — dock 6 cols, sidebar expanded, sheet, chips
9. src/components/mizan/home-view.tsx — recent + chips; не ломать SalahCard
10. Тесты/стори не обязательны; ручной чеклист ниже.

════════════════════════════════════════
КРИТЕРИИ ГОТОВНОСТИ
════════════════════════════════════════
- Mobile: 5 primary видны, «Ещё» открывает все вторичные.
- Desktop sidebar: все группы, sticky, active state.
- Contextual chips появляются на намазе и после намаза (zakat).
- Cmd/Ctrl+K открывает поиск; Enter ведёт в раздел.
- Hash deep links не сломаны; back stack осмысленный.
- Нет полумесяца; дисклеймер finance на месте.
- reduced-motion не анимирует sheet/chips.
- Русские подписи + ключи i18n для всех локалей.

Сначала предложи краткий plan (файлы + diff outline), затем внедряй. Не спрашивай подтверждения по дефолтам выше.
```

---

## 2. Чеклист внедрения (короткий, конкретный)

### Подготовка
- [ ] Ветка от актуального `main` plaza: `aima/mizan-nav-rework` (не пушить в main).
- [ ] Прочитать `mizan-app.tsx` BottomNav / Header / parseHash / goBack целиком.
- [ ] Зафиксировать скриншоты текущего mobile dock + sidebar theme.

### Single source of truth
- [ ] Создать `src/lib/nav/catalog.ts`: primary[], overflow[], sidebarGroups[], searchDocuments[].
- [ ] Перевести `TABS` в `mizan-app.tsx` на `primary` из catalog.
- [ ] `HOUSE_MAIN` / `HOUSE_MORE` оставить, но labels/id сверить с catalog (без дублей).

### Mobile dock
- [ ] BottomNav: 5 primary + кнопка «Ещё» (`nav.more`).
- [ ] Overflow bottom sheet с focus trap + `HOUSE_*` + finance/namaz/qibla/tasbih.
- [ ] Адаптив `<360px`: 4 primary + Ещё.
- [ ] Active styles через `nav-glow` / `aria-current`.

### Desktop
- [ ] Sidebar sticky expanded (≥md или `navLayout==="sidebar"`): группы «Сегодня / Писание / Имущество / Ещё».
- [ ] Toggle compact/expanded; не ломать `[data-nav="rail"|"top"]`.

### Контекст и поиск
- [ ] `ContextualRail` с правилами намаз→кибла/тасбих, намаз→закят, коран→тафсир/учить.
- [ ] `SearchOmnibox` (Ctrl/Cmd+K), локальный индекс, recents.
- [ ] `mizan.v1.navRecents` в sessionStorage/localStorage.

### Deep links / store
- [ ] Расширить `parseHash` / `goBack` для namaz/qibla/tasbih/finance/search.
- [ ] При добавлении `AppTab` — обновить `mizan-store.ts` map hash ↔ tab.
- [ ] Заглушка Finance view + дисклеймер «не фетва».

### i18n / a11y / brand
- [ ] Ключи: `nav.more`, `nav.namaz`, `nav.qibla`, `nav.tasbih`, `nav.finance`, `nav.search`, `finance.disclaimer` во все 7 локалей.
- [ ] Проверить focus, aria-modal sheet, min tap 44px, reduced-motion.
- [ ] Иконки без crescent; весы/clock/compass/book/scroll/shield/beads/scale.

### Регрессии
- [ ] KeepTab не размонтирует quran/hisn/learn при переключении.
- [ ] SalahCard `#salah` и кибла работают с home и из overflow.
- [ ] Settings / Cabinet / Sheikh sheets выше dock по z-index.
- [ ] PWA safe-area: dock не перекрывает жест «домой» на iOS.
- [ ] Не деплоить на xservis live / не вызывать `promote-mizan.sh`.

### Сдача
- [ ] Краткий summary diff + GIF/скрины mobile+desktop.
- [ ] Оставить этот файл в `artifacts/mizan-nav-rework-prompt.md`.

---

## 3. Заметки агента (defaults)

| Решение | Выбор |
|---------|--------|
| Целевой репозиторий | `plaza-quartz-bold-amber` (mizanx.pro) |
| Справочный live | xservis.app/mizan (`Dm`/`Nl`/`Cm`) — не менять в этой задаче |
| Primary 5 | Главная, Намаз, Коран, Хадисы, Закят |
| Overflow | Ещё → sheet |
| Desktop | sticky sidebar |
| UI language в примерах | RU |
| Финансы | пункт + заглушка, без фетвы |
| Production | без деплоя |

**Пуш в GitHub:** у текущего PAT/аккаунта `push:false` на plaza — файл лежит локально в clone + `/workspace/mizan-nav-rework-prompt.md`. Залить в remote ветку нужно аккаунтом с write или вручную.
