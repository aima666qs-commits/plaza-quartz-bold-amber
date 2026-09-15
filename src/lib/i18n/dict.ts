export type Locale = "ru" | "en" | "ar" | "tr" | "uz" | "tg" | "kk";

export const LOCALES: { id: Locale; native: string; nameRu: string; dir: "ltr" | "rtl" }[] = [
  { id: "ru", native: "Русский", nameRu: "Русский", dir: "ltr" },
  { id: "en", native: "English", nameRu: "Английский", dir: "ltr" },
  { id: "ar", native: "العربية", nameRu: "Арабский", dir: "rtl" },
  { id: "tr", native: "Türkçe", nameRu: "Турецкий", dir: "ltr" },
  { id: "uz", native: "Oʻzbekcha", nameRu: "Узбекский", dir: "ltr" },
  { id: "tg", native: "Тоҷикӣ", nameRu: "Таджикский", dir: "ltr" },
  { id: "kk", native: "Қазақша", nameRu: "Казахский", dir: "ltr" },
];

export const NAV_LAYOUTS = [
  { id: "theme", ru: "Как в оформлении" },
  { id: "bottom", ru: "Снизу" },
  { id: "top", ru: "Сверху" },
  { id: "rail", ru: "Только значки" },
  { id: "sidebar", ru: "Сбоку" },
] as const;

export type NavLayout = (typeof NAV_LAYOUTS)[number]["id"];

type Pack = Record<string, string>;

const ru: Pack = {
  "nav.home": "Главная",
  "nav.zakat": "Закят",
  "nav.quran": "Коран",
  "nav.hisn": "Хисн",
  "nav.learn": "Учить",
  settings: "Настройки",
  language: "Язык",
  "nav.layout": "Раскладка вкладок",
  sheikh: "Шейх",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Мир тебе.",
  "ask.ph": "Шейху…",
  "hisn.book": "Книга",
  "hisn.listen": "Слушать",
  "hisn.chapter": "Глава",
  "hisn.hide": "Скрыть смысл",
  "hisn.show": "Смысл",
  "hisn.reset": "С начала",
  "hisn.done": "готово",
  "hisn.note": "hisnmuslim.com · счётчик на сегодня · тап по тексту или кругу",
  "hisn.meaning.src": "Смысл: арабский матн — hisnmuslim.com. Русский — по английскому изданию той же книги, не замена арабскому.",
  more: "Дополнительно",
  "tile.names": "Имена",
  "tile.quran": "Коран",
  "tile.hisn": "Крепость",
  "tile.nawawi": "40 хадисов",
  "tile.index": "Указатели",
  "tile.zakat": "Закят",
  "tile.alphabet": "Алфавит",
  "tile.quiz": "Викторина",
  "tile.dict": "Словарь",
  "tile.reminder": "Напоминание",
  "tile.wisdom": "Мудрость",
  "tile.calendar": "Календарь",
  "tile.recite": "Красивое чтение",
  "tile.tajweed": "Таджвид",
  "tile.tafsir": "Тафсир",
  "tile.books": "9 сборников",
  "tile.mecca": "Мекка",
  "tile.madina": "Медина",
  "tile.learn": "Учить",
};

const en: Pack = {
  "nav.home": "Home",
  "nav.zakat": "Zakat",
  "nav.quran": "Quran",
  "nav.hisn": "Hisn",
  "nav.learn": "Learn",
  settings: "Settings",
  language: "Language",
  "nav.layout": "Tab layout",
  sheikh: "Sheikh",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Peace be upon you.",
  "ask.ph": "Ask the sheikh…",
  "hisn.book": "Book",
  "hisn.listen": "Listen",
  "hisn.chapter": "Chapter",
  "hisn.hide": "Hide meaning",
  "hisn.show": "Meaning",
  "hisn.reset": "From start",
  "hisn.done": "done",
  "hisn.note": "hisnmuslim.com · daily counter · tap the text or the ring",
  "hisn.meaning.src": "Arabic from hisnmuslim.com. English is the same edition.",
  more: "More",
  "tile.names": "Names",
  "tile.quran": "Quran",
  "tile.hisn": "Fortress",
  "tile.nawawi": "40 hadiths",
  "tile.index": "Index",
  "tile.zakat": "Zakat",
  "tile.alphabet": "Alphabet",
  "tile.quiz": "Quiz",
  "tile.dict": "Dictionary",
  "tile.reminder": "Reminder",
  "tile.wisdom": "Wisdom",
  "tile.calendar": "Calendar",
  "tile.recite": "Recitation",
  "tile.tajweed": "Tajweed",
  "tile.tafsir": "Tafsir",
  "tile.books": "9 collections",
  "tile.mecca": "Makkah",
  "tile.madina": "Madinah",
  "tile.learn": "Learn",
};

const ar: Pack = {
  "nav.home": "الرئيسية",
  "nav.zakat": "الزكاة",
  "nav.quran": "القرآن",
  "nav.hisn": "الحصن",
  "nav.learn": "تعلّم",
  settings: "الإعدادات",
  language: "اللغة",
  "nav.layout": "ترتيب الأبواب",
  sheikh: "الشيخ",
  "peace.ar": "السلام عليكم",
  "peace.ru": "سلامٌ عليك.",
  "ask.ph": "اكتب للشيخ…",
  "hisn.book": "الكتاب",
  "hisn.listen": "استمع",
  "hisn.chapter": "الباب",
  "hisn.hide": "إخفاء المعنى",
  "hisn.show": "المعنى",
  "hisn.reset": "من أول",
  "hisn.done": "تم",
  "hisn.note": "hisnmuslim.com · العداد لليوم · اضغط النص أو الحلقة",
  "hisn.meaning.src": "المتن العربي من hisnmuslim.com.",
  more: "المزيد",
  "tile.names": "الأسماء",
  "tile.quran": "القرآن",
  "tile.hisn": "الحصن",
  "tile.nawawi": "الأربعون",
  "tile.index": "الفهارس",
  "tile.zakat": "الزكاة",
  "tile.alphabet": "الحروف",
  "tile.quiz": "اختبار",
  "tile.dict": "المعجم",
  "tile.reminder": "التذكير",
  "tile.wisdom": "حكمة",
  "tile.calendar": "التقويم",
  "tile.recite": "التلاوة",
  "tile.tajweed": "التجويد",
  "tile.tafsir": "التفسير",
  "tile.books": "تسعة كتب",
  "tile.mecca": "مكة",
  "tile.madina": "المدينة",
  "tile.learn": "تعلّم",
};

const tr: Pack = {
  "nav.home": "Ana sayfa",
  "nav.zakat": "Zekât",
  "nav.quran": "Kur’an",
  "nav.hisn": "Hisn",
  "nav.learn": "Öğren",
  settings: "Ayarlar",
  language: "Dil",
  "nav.layout": "Sekme düzeni",
  sheikh: "Şeyh",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Selâm üzerine olsun.",
  "ask.ph": "Şeyhe yaz…",
  "hisn.book": "Kitap",
  "hisn.listen": "Dinle",
  "hisn.chapter": "Bölüm",
  "hisn.hide": "Anlamı gizle",
  "hisn.show": "Anlam",
  "hisn.reset": "Baştan",
  "hisn.done": "tamam",
  "hisn.note": "hisnmuslim.com · günlük sayaç · metne veya halkaya dokun",
  "hisn.meaning.src": "Arapça metin hisnmuslim.com. Türkçe anlam Islamic-Pro Azkar.",
  more: "Daha fazla",
  "tile.names": "İsimler",
  "tile.quran": "Kur’an",
  "tile.hisn": "Kale",
  "tile.nawawi": "40 hadis",
  "tile.index": "Dizin",
  "tile.zakat": "Zekât",
  "tile.alphabet": "Alfabe",
  "tile.quiz": "Quiz",
  "tile.dict": "Sözlük",
  "tile.reminder": "Hatırlatma",
  "tile.wisdom": "Hikmet",
  "tile.calendar": "Takvim",
  "tile.recite": "Tilavet",
  "tile.tajweed": "Tecvid",
  "tile.tafsir": "Tefsir",
  "tile.books": "9 eser",
  "tile.mecca": "Mekke",
  "tile.madina": "Medine",
  "tile.learn": "Öğren",
};

const uz: Pack = {
  "nav.home": "Bosh sahifa",
  "nav.zakat": "Zakot",
  "nav.quran": "Qur’on",
  "nav.hisn": "Hisn",
  "nav.learn": "O‘rganish",
  settings: "Sozlamalar",
  language: "Til",
  "nav.layout": "Varaqlar joylashuvi",
  sheikh: "Shayx",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Senga tinchlik.",
  "ask.ph": "Shayxga yozing…",
  "hisn.book": "Kitob",
  "hisn.listen": "Tinglash",
  "hisn.chapter": "Bob",
  "hisn.hide": "Ma’noni yashirish",
  "hisn.show": "Ma’no",
  "hisn.reset": "Boshidan",
  "hisn.done": "tayyor",
  "hisn.note": "hisnmuslim.com · bugungi hisoblagich",
  "hisn.meaning.src": "Duo matni arabcha. Qobiq o‘zbekcha; duo tarjimasi rus/ingliz/turk.",
  more: "Qo‘shimcha",
  "tile.names": "Ismlar",
  "tile.quran": "Qur’on",
  "tile.hisn": "Qal’a",
  "tile.nawawi": "40 hadis",
  "tile.index": "Ko‘rsatkich",
  "tile.zakat": "Zakot",
  "tile.alphabet": "Alifbo",
  "tile.quiz": "Viktorina",
  "tile.dict": "Lug‘at",
  "tile.reminder": "Eslatma",
  "tile.wisdom": "Hikmat",
  "tile.calendar": "Taqvim",
  "tile.recite": "Qiroat",
  "tile.tajweed": "Tajvid",
  "tile.tafsir": "Tafsir",
  "tile.books": "9 to‘plam",
  "tile.mecca": "Makka",
  "tile.madina": "Madina",
  "tile.learn": "O‘rganish",
};

const tg: Pack = {
  "nav.home": "Асосӣ",
  "nav.zakat": "Закот",
  "nav.quran": "Қуръон",
  "nav.hisn": "Ҳисн",
  "nav.learn": "Омӯхтан",
  settings: "Танзимот",
  language: "Забон",
  "nav.layout": "Тартиби варақаҳо",
  sheikh: "Шайх",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Салом бар ту.",
  "ask.ph": "Ба шайх нависед…",
  "hisn.book": "Китоб",
  "hisn.listen": "Шунидан",
  "hisn.chapter": "Боб",
  "hisn.hide": "Пинҳон кардани маъно",
  "hisn.show": "Маъно",
  "hisn.reset": "Аз аввал",
  "hisn.done": "тайёр",
  "hisn.note": "hisnmuslim.com · ҳисобкунаки имрӯз",
  "hisn.meaning.src": "Матни дуо арабӣ. Забони барнома тоҷикӣ; тарҷумаи дуо русӣ/англисӣ/туркӣ.",
  more: "Иловагӣ",
  "tile.names": "Номҳо",
  "tile.quran": "Қуръон",
  "tile.hisn": "Қалъа",
  "tile.nawawi": "40 ҳадис",
  "tile.index": "Нишондиҳанда",
  "tile.zakat": "Закот",
  "tile.alphabet": "Алифбо",
  "tile.quiz": "Викторина",
  "tile.dict": "Луғат",
  "tile.reminder": "Ёдрас",
  "tile.wisdom": "Ҳикмат",
  "tile.calendar": "Тақвим",
  "tile.recite": "Қироат",
  "tile.tajweed": "Таҷвид",
  "tile.tafsir": "Тафсир",
  "tile.books": "9 маҷмӯа",
  "tile.mecca": "Макка",
  "tile.madina": "Мадина",
  "tile.learn": "Омӯхтан",
};

const kk: Pack = {
  "nav.home": "Басты",
  "nav.zakat": "Зекет",
  "nav.quran": "Құран",
  "nav.hisn": "Хисн",
  "nav.learn": "Оқу",
  settings: "Баптау",
  language: "Тіл",
  "nav.layout": "Қойындылар",
  sheikh: "Шейх",
  "peace.ar": "السلام عليكم",
  "peace.ru": "Саған сәлем.",
  "ask.ph": "Шейхке жаз…",
  "hisn.book": "Кітап",
  "hisn.listen": "Тыңдау",
  "hisn.chapter": "Тарау",
  "hisn.hide": "Мағынаны жасыру",
  "hisn.show": "Мағына",
  "hisn.reset": "Басынан",
  "hisn.done": "дайын",
  "hisn.note": "hisnmuslim.com · бүгінгі есептеуіш",
  "hisn.meaning.src": "Дұға мәтіні арабша. Қолданба қазақша; дұға аудармасы орыс/ағылшын/түрік.",
  more: "Қосымша",
  "tile.names": "Есімдер",
  "tile.quran": "Құран",
  "tile.hisn": "Қамал",
  "tile.nawawi": "40 хадис",
  "tile.index": "Көрсеткіш",
  "tile.zakat": "Зекет",
  "tile.alphabet": "Әліпби",
  "tile.quiz": "Викторина",
  "tile.dict": "Сөздік",
  "tile.reminder": "Еске салу",
  "tile.wisdom": "Даналық",
  "tile.calendar": "Күнтізбе",
  "tile.recite": "Қирағат",
  "tile.tajweed": "Тәжуид",
  "tile.tafsir": "Тәпсір",
  "tile.books": "9 жинақ",
  "tile.mecca": "Мекке",
  "tile.madina": "Мәдина",
  "tile.learn": "Оқу",
};

const PACKS: Record<Locale, Pack> = { ru, en, ar, tr, uz, tg, kk };

function fill(key: string, values: Partial<Record<Locale, string>> & { ru: string }) {
  (Object.keys(PACKS) as Locale[]).forEach((loc) => {
    PACKS[loc][key] = values[loc] ?? values.ru;
  });
}

fill("hisn.col.morning", { ru: "Утро и вечер", en: "Morning & evening", ar: "الصباح والمساء", tr: "Sabah ve akşam", uz: "Tong va kech", tg: "Субҳ ва шом", kk: "Таң мен кеш" });
fill("hisn.col.prayer", { ru: "После намаза", en: "After prayer", ar: "بعد الصلاة", tr: "Namazdan sonra", uz: "Namozdan keyin", tg: "Баъди намоз", kk: "Намаздан кейін" });
fill("hisn.col.sleep", { ru: "Перед сном", en: "Before sleep", ar: "قبل النوم", tr: "Uyumadan önce", uz: "Uxlamasdan oldin", tg: "Пеш аз хоб", kk: "Ұйқы алдында" });
fill("hisn.col.wake", { ru: "Пробуждение", en: "Upon waking", ar: "عند الاستيقاظ", tr: "Uyanınca", uz: "Uyg‘onganda", tg: "Бедоршавӣ", kk: "Оянғанда" });
fill("hisn.col.home", { ru: "Дом", en: "Home", ar: "المنزل", tr: "Ev", uz: "Uy", tg: "Хона", kk: "Үй" });
fill("hisn.col.mosque", { ru: "Мечеть", en: "Mosque", ar: "المسجد", tr: "Cami", uz: "Masjid", tg: "Масҷид", kk: "Мешіт" });
fill("hisn.col.food", { ru: "Еда", en: "Food", ar: "الطعام", tr: "Yemek", uz: "Ovqat", tg: "Хӯрок", kk: "Тамақ" });
fill("hisn.col.travel", { ru: "В пути", en: "Travel", ar: "السفر", tr: "Yolculuk", uz: "Safar", tg: "Сафар", kk: "Жол" });
fill("hisn.col.dhikr", { ru: "Зикр", en: "Dhikr", ar: "الذكر", tr: "Zikir", uz: "Zikr", tg: "Зикр", kk: "Зікір" });
fill("hisn.col.tawba", { ru: "Тауба", en: "Repentance", ar: "التوبة", tr: "Tövbe", uz: "Tavba", tg: "Тавба", kk: "Тәубе" });
fill("hisn.wird", { ru: "Главный вирд", en: "Main wird", ar: "الورد الأكبر", tr: "Ana vird", uz: "Asosiy wird", tg: "Вирди асосӣ", kk: "Негізгі вірд" });
fill("hisn.daych", { ru: "Глава дня", en: "Chapter of the day", ar: "باب اليوم", tr: "Günün bölümü", uz: "Kun bobı", tg: "Боби рӯз", kk: "Күн тарауы" });
fill("hisn.fav", { ru: "Избранное", en: "Favorites", ar: "المفضلة", tr: "Favoriler", uz: "Sevimlilar", tg: "Интихобшуда", kk: "Таңдаулы" });
fill("hisn.find", {
  ru: "Найти главу: арабский, русский, номер",
  en: "Find a chapter: Arabic, English, number",
  ar: "ابحث: عربي أو رقم",
  tr: "Bölüm ara: Arapça, Türkçe, numara",
  uz: "Bob qidirish: arabcha, ruscha, raqam",
  tg: "Ҷустуҷӯи боб: арабӣ, русӣ, рақам",
  kk: "Тарау іздеу: арабша, орысша, нөмір",
});
fill("hisn.more", { ru: "Ещё главы", en: "More chapters", ar: "المزيد من الأبواب", tr: "Daha fazla bölüm", uz: "Yana boblar", tg: "Боз бобҳо", kk: "Тағы тараулар" });
fill("hisn.today", { ru: "Сегодня", en: "Today", ar: "اليوم", tr: "Bugün", uz: "Bugun", tg: "Имрӯз", kk: "Бүгін" });
fill("hisn.chapters", { ru: "глав", en: "chapters", ar: "باباً", tr: "bölüm", uz: "bob", tg: "боб", kk: "тарау" });
fill("hisn.duas", { ru: "дуа", en: "duas", ar: "دعاء", tr: "dua", uz: "duo", tg: "дуо", kk: "дұға" });
fill("hisn.fortress", {
  ru: "Крепость мусульманина",
  en: "Fortress of the Muslim",
  ar: "حصن المسلم",
  tr: "Müslümanın kalesi",
  uz: "Musulmon qal’asi",
  tg: "Қалъаи мусулмон",
  kk: "Мұсылман қамалы",
});
fill("hisn.all", { ru: "Все 132 главы", en: "All 132 chapters", ar: "كل الأبواب", tr: "132 bölümün tümü", uz: "132 bobning barchasi", tg: "Ҳамаи 132 боб", kk: "132 тараудың бәрі" });
fill("set.lang", { ru: "Язык приложения", en: "App language", ar: "لغة التطبيق", tr: "Uygulama dili", uz: "Ilova tili", tg: "Забони барнома", kk: "Қолданба тілі" });
fill("set.start", { ru: "Стартовая вкладка", en: "Start tab", ar: "التبويب عند الفتح", tr: "Açılış sekmesi", uz: "Boshlash varag‘i", tg: "Варақаи оғоз", kk: "Бастапқы қойынды" });
fill("set.keep", { ru: "Помнить последнюю вкладку", en: "Remember last tab", ar: "تذكّر آخر تبويب", tr: "Son sekmeyi hatırla", uz: "Oxirgi varaqni eslab qol", tg: "Варақаи охиринро ёд дор", kk: "Соңғы қойындыны есте сақта" });
fill("set.nav", { ru: "Раскладка вкладок", en: "Tab layout", ar: "ترتيب الأبواب", tr: "Sekme düzeni", uz: "Varaqlar joylashuvi", tg: "Тартиби варақаҳо", kk: "Қойындылар орны" });
fill("set.scheme", { ru: "Свет / тень", en: "Light / dark", ar: "فاتح / داكن", tr: "Açık / koyu", uz: "Yorug‘ / qorong‘u", tg: "Равшан / торик", kk: "Жарық / қараңғы" });
fill("set.font", { ru: "Размер текста", en: "Text size", ar: "حجم الخط", tr: "Yazı boyutu", uz: "Matn o‘lchami", tg: "Андозаи матн", kk: "Мәтін өлшемі" });
fill("set.density", { ru: "Плотность", en: "Density", ar: "الكثافة", tr: "Sıklık", uz: "Zichlik", tg: "Зичӣ", kk: "Тығыздық" });
fill("set.home", { ru: "Сетка главной", en: "Home grid", ar: "شبكة الرئيسية", tr: "Ana sayfa ızgarası", uz: "Bosh sahifa panjarasi", tg: "Тӯри асосӣ", kk: "Басты тор" });
fill("set.reciter", { ru: "Чтец Корана", en: "Quran reciter", ar: "قارئ القرآن", tr: "Kur’an okuyucusu", uz: "Qur’on qorisi", tg: "Қории Қуръон", kk: "Құран қариі" });
fill("set.sabrhour", { ru: "Час аята сабра", en: "Sabr ayah hour", ar: "ساعة آية الصبر", tr: "Sabır ayeti saati", uz: "Sabr oyat soati", tg: "Соати ояти сабр", kk: "Сабыр аяты сағаты" });
fill("set.motion", { ru: "Без анимаций", en: "Reduce motion", ar: "بدون حركة", tr: "Animasyonsuz", uz: "Animatsiyasiz", tg: "Бе ҳаракат", kk: "Анимациясыз" });
fill("set.meaning", { ru: "Показывать смысл / перевод", en: "Show meaning / translation", ar: "إظهار المعنى", tr: "Anlamı göster", uz: "Ma’noni ko‘rsat", tg: "Маъноро нишон деҳ", kk: "Мағынаны көрсет" });
fill("set.hijri", { ru: "Показывать хиджру", en: "Show Hijri date", ar: "إظهار التاريخ الهجري", tr: "Hicri tarihi göster", uz: "Hijriy sanani ko‘rsat", tg: "Таърихи ҳиҷриро нишон деҳ", kk: "Һижри күнді көрсет" });
fill("set.favfirst", { ru: "Избранное Хисн сверху", en: "Hisn favorites first", ar: "المفضلة أولاً", tr: "Favoriler üstte", uz: "Sevimlilar tepada", tg: "Интихобшуда боло", kk: "Таңдаулы жоғарыда" });
fill("set.autoplay", { ru: "Коран: следующий аят сам", en: "Quran: auto-play next ayah", ar: "تشغيل الآية التالية تلقائياً", tr: "Sonraki ayeti otomatik çal", uz: "Keyingi oyatni o‘zi qo‘ysin", tg: "Ояти навбатиро худ пахш кун", kk: "Келесі аятты өзі ойнатып" });
fill("set.contrast", { ru: "Сильнее контраст", en: "Higher contrast", ar: "تباين أقوى", tr: "Daha yüksek kontrast", uz: "Kuchliroq kontrast", tg: "Контрасти қавитар", kk: "Күштірек контраст" });
fill("set.largetap", { ru: "Крупные кнопки", en: "Larger tap targets", ar: "أزرار أكبر", tr: "Daha büyük düğmeler", uz: "Kattaroq tugmalar", tg: "Тугмаҳои калонтар", kk: "Үлкенірек батырмалар" });
fill("set.notify", { ru: "Аят сабра каждый день на телефон", en: "Daily sabr ayah on the phone", ar: "آية الصبر يومياً على الهاتف", tr: "Her gün telefona sabır ayeti", uz: "Har kuni telefonga sabr oyati", tg: "Ҳар рӯз ояти сабр ба телефон", kk: "Күн сайын телефонға сабыр аяты" });
fill("set.theme", { ru: "Оформление", en: "Appearance", ar: "المظهر", tr: "Görünüm", uz: "Ko‘rinish", tg: "Намуд", kk: "Көрініс" });
fill("set.data", { ru: "Данные на этом устройстве", en: "Data on this device", ar: "بيانات هذا الجهاز", tr: "Bu cihazdaki veriler", uz: "Ushbu qurilmadagi ma’lumot", tg: "Маълумоти ҳамин дастгоҳ", kk: "Осы құрылғыдағы дерек" });
fill("set.reset.hisn", { ru: "Сбросить счётчики Хисн за сегодня", en: "Reset today’s Hisn counters", ar: "تصفير عدّاد الحصن اليوم", tr: "Bugünün Hisn sayaçlarını sıfırla", uz: "Bugungi Hisn hisoblagichini noldan", tg: "Ҳисобкунаки имрӯзи Ҳиснро сифр кун", kk: "Бүгінгі Хисн есептегішін тазалау" });
fill("set.reset.all", { ru: "Стереть все локальные данные", en: "Erase all local data", ar: "مسح كل البيانات المحلية", tr: "Tüm yerel verileri sil", uz: "Barcha mahalliy ma’lumotni o‘chirish", tg: "Ҳамаи маълумоти маҳаллиро пок кун", kk: "Барлық жергілікті деректерді өшіру" });
fill("set.test.notify", { ru: "Проверить уведомление сейчас", en: "Send a test notification now", ar: "إرسال إشعار تجريبي الآن", tr: "Şimdi deneme bildirimi gönder", uz: "Hozir sinov bildirishnomasini yubor", tg: "Ҳозир огоҳии санҷишӣ фирист", kk: "Қазір сынақ хабарламасын жібер" });
fill("set.as.theme", { ru: "Как в оформлении", en: "Follow theme", ar: "حسب المظهر", tr: "Temaya göre", uz: "Mavzuga qarab", tg: "Мувофиқи намуд", kk: "Без бойынша" });
fill("set.dark", { ru: "Тёмная", en: "Dark", ar: "داكن", tr: "Koyu", uz: "Qorong‘u", tg: "Торик", kk: "Қараңғы" });
fill("set.light", { ru: "Светлая", en: "Light", ar: "فاتح", tr: "Açık", uz: "Yorug‘", tg: "Равшан", kk: "Жарық" });
fill("set.compact", { ru: "Компактно", en: "Compact", ar: "مضغوط", tr: "Sıkışık", uz: "Ixcham", tg: "Фишурда", kk: "Ықшам" });
fill("set.regular", { ru: "Обычно", en: "Regular", ar: "عادي", tr: "Normal", uz: "Oddiy", tg: "Оддӣ", kk: "Қалыпты" });
fill("set.airy", { ru: "Воздушно", en: "Airy", ar: "واسع", tr: "Ferah", uz: "Keng", tg: "Васеъ", kk: "Кең" });
fill("set.roomy", { ru: "Просторно", en: "Roomy", ar: "فسيح", tr: "Geniş", uz: "Kengroq", tg: "Фарох", kk: "Кеңірек" });
fill("tab.home", { ru: "Главная", en: "Home", ar: "الرئيسية", tr: "Ana sayfa", uz: "Bosh sahifa", tg: "Асосӣ", kk: "Басты" });
fill("tab.zakat", { ru: "Закят", en: "Zakat", ar: "الزكاة", tr: "Zekât", uz: "Zakot", tg: "Закот", kk: "Зекет" });
fill("tab.quran", { ru: "Коран", en: "Quran", ar: "القرآن", tr: "Kur’an", uz: "Qur’on", tg: "Қуръон", kk: "Құран" });
fill("tab.hisn", { ru: "Хисн", en: "Hisn", ar: "الحصن", tr: "Hisn", uz: "Hisn", tg: "Ҳисн", kk: "Хисн" });
fill("tab.learn", { ru: "Учить", en: "Learn", ar: "تعلّم", tr: "Öğren", uz: "O‘rganish", tg: "Омӯхтан", kk: "Оқу" });
fill("set.section.lang", { ru: "Язык и вид", en: "Language & look", ar: "اللغة والمظهر", tr: "Dil ve görünüm", uz: "Til va ko‘rinish", tg: "Забон ва намуд", kk: "Тіл және көрініс" });
fill("set.section.quran", { ru: "Коран и Хисн", en: "Quran & Hisn", ar: "القرآن والحصن", tr: "Kur’an ve Hisn", uz: "Qur’on va Hisn", tg: "Қуръон ва Ҳисн", kk: "Құран және Хисн" });
fill("set.section.notify", { ru: "Напоминания", en: "Reminders", ar: "التذكير", tr: "Hatırlatmalar", uz: "Eslatmalar", tg: "Ёдраскуниҳо", kk: "Еске салғыштар" });
fill("set.section.voice", { ru: "Озвучка", en: "Voice", ar: "الصوت", tr: "Ses", uz: "Ovoz", tg: "Овоз", kk: "Дауыс" });
fill("set.voice.gender", { ru: "Голос", en: "Voice", ar: "الصوت", tr: "Ses", uz: "Ovoz", tg: "Овоз", kk: "Дауыс" });
fill("set.voice.male", { ru: "Мужской", en: "Male", ar: "ذكر", tr: "Erkek", uz: "Erkak", tg: "Мардона", kk: "Ер" });
fill("set.voice.female", { ru: "Женский", en: "Female", ar: "أنثى", tr: "Kadın", uz: "Ayol", tg: "Занона", kk: "Әйел" });
fill("set.voice.rate", { ru: "Темп", en: "Pace", ar: "السرعة", tr: "Tempo", uz: "Sur’at", tg: "Суръат", kk: "Қарқын" });
fill("set.voice.slow", { ru: "Медленно", en: "Slow", ar: "بطيء", tr: "Yavaş", uz: "Sekin", tg: "Оҳиста", kk: "Баяу" });
fill("set.voice.normal", { ru: "Обычно", en: "Normal", ar: "عادي", tr: "Normal", uz: "Oddiy", tg: "Оддӣ", kk: "Қалыпты" });
fill("set.voice.fast", { ru: "Быстро", en: "Fast", ar: "سريع", tr: "Hızlı", uz: "Tez", tg: "Тез", kk: "Жылдам" });
fill("set.voice.test", { ru: "Прослушать", en: "Listen", ar: "استمع", tr: "Dinle", uz: "Tingla", tg: "Шунав", kk: "Тыңда" });
fill("set.voice.note", {
  ru: "Салават произносится всегда: «саллаллаху алейхи ва саллям». Имена с шаддой: Хатта́б, не «хатаба». Чтецы Корана — отдельно, выше.",
  en: "The salawat is always spoken. Names keep the shadda: Khaṭṭāb, not «khataba». Quran reciters are above.",
  ar: "الصلاة على النبي تُنطق دائمًا. أسماء بشدة: الخطّاب. قرّاء القرآن أعلاه.",
  tr: "Salavat her zaman okunur. İsimlerde şedde durur: Hattâb. Kur’an okuyucuları yukarıda.",
  uz: "Salavot doim aytiladi. Ismda shadda: Hattob, «hataba» emas. Qur’on qorilari yuqorida.",
  tg: "Салавот ҳамеша гуфта мешавад. Номҳо бо шадда: Хаттоб. Қориҳои Қуръон болотар.",
  kk: "Салауат әрдайым айтылады. Есімде шәддә: Хаттаб. Құран қарилары жоғарыда.",
});
fill("set.voice.probe", {
  ru: "Передают со слов Умара ибн аль-Хаттаба, да будет доволен им Аллах, что Посланник Аллаха сказал: поистине, дела — по намерениям.",
  en: "From Umar ibn al-Khattab, may Allah be pleased with him: the Messenger of Allah said that deeds are only by intentions.",
  ar: "عن عمر بن الخطاب رضي الله عنه أن رسول الله قال إنما الأعمال بالنيات.",
  tr: "Ömer ibnü’l-Hattâb’dan: Allah’ın Elçisi buyurdu ki ameller niyetlere göredir.",
  uz: "Umar ibn al-Hattob roziyallohu anhudan: Allohning Elchisi aytdilar, amallar niyatga ko‘ra.",
  tg: "Аз Умар ибни ал-Хаттоб: Паёмбари Аллоҳ гуфт, ки амалҳо ба ниятҳоянд.",
  kk: "Омар ибн әл-Хаттабтан: Алланың Елшісі айтты, істер ниетке қарай.",
});
fill("set.voice.ar", { ru: "Арабский матн", en: "Arabic matn", ar: "المتن العربي", tr: "Arapça metin", uz: "Arabcha matn", tg: "Матни арабӣ", kk: "Араб мәтіні" });
fill("set.voice.ru", { ru: "Русский смысл", en: "Russian meaning", ar: "المعنى الروسي", tr: "Rusça mana", uz: "Ruscha ma’no", tg: "Маънои русӣ", kk: "Орысша мағына" });
fill("set.voice.pick", { ru: "Нажми карточку — услышишь сразу", en: "Tap a card to hear it", ar: "اضغط البطاقة لتسمع", tr: "Kartı bas, hemen duy", uz: "Kartani bos — darhol eshitasan", tg: "Кортро пахш кун — фавран мешунавӣ", kk: "Карточканы бас — бірден естисің" });
fill("set.voice.sample.ar", { ru: "عَنْ عُمَرَ بْنِ الْخَطَّابِ أَنَّ رَسُولَ اللَّهِ قَالَ", en: "عَنْ عُمَرَ بْنِ الْخَطَّابِ أَنَّ رَسُولَ اللَّهِ قَالَ", ar: "عَنْ عُمَرَ بْنِ الْخَطَّابِ أَنَّ رَسُولَ اللَّهِ قَالَ" });
fill("set.close", { ru: "Закрыть", en: "Close", ar: "إغلاق", tr: "Kapat", uz: "Yopish", tg: "Пӯшидан", kk: "Жабу" });
fill("set.saved", { ru: "Сохранённые расчёты", en: "Saved calculations", ar: "الحسابات المحفوظة", tr: "Kayıtlı hesaplar", uz: "Saqlangan hisoblar", tg: "Ҳисобҳои захирашуда", kk: "Сақталған есептер" });
fill("set.saved.open", { ru: "Открыть", en: "Open", ar: "فتح", tr: "Aç", uz: "Ochish", tg: "Кушодан", kk: "Ашу" });
fill("set.saved.copy", { ru: "Копия", en: "Copy", ar: "نسخة", tr: "Kopya", uz: "Nusxa", tg: "Нусха", kk: "Көшірме" });
fill("set.saved.delete", { ru: "Удалить", en: "Delete", ar: "حذف", tr: "Sil", uz: "O‘chirish", tg: "Нест кардан", kk: "Жою" });
fill("set.import", { ru: "Открыть сохранённый расчёт", en: "Open a saved calculation", ar: "فتح حساب محفوظ", tr: "Kayıtlı hesabı aç", uz: "Saqlangan hisobni ochish", tg: "Ҳисоби захирашударо кушо", kk: "Сақталған есепті ашу" });
fill("set.note", {
  ru: "Язык меняет подписи и смысл. Арабский матн не трогаем. Это не фетва.",
  en: "Language changes labels and meanings. Arabic text stays. Not a fatwa.",
  ar: "اللغة تغيّر العناوين والمعنى. المتن العربي يبقى. ليست فتوى.",
  tr: "Dil etiketleri ve anlamı değiştirir. Arapça metin durur. Fetva değildir.",
  uz: "Til yozuvlar va ma’noni o‘zgartiradi. Arabcha matn qoladi. Fatvo emas.",
  tg: "Забон имзоҳо ва маъноро иваз мекунад. Матни арабӣ мемонад. Фатво нест.",
  kk: "Тіл жазу мен мағынаны өзгертеді. Араб мәтіні қалады. Пәтуа емес.",
});

fill("hadith.day", { ru: "Хадис дня", en: "Hadith of the day", ar: "حديث اليوم", tr: "Günün hadisi", uz: "Kun hadisi", tg: "Ҳадиси рӯз", kk: "Күн хадисі" });
fill("hadith.n", { ru: "Хадис", en: "Hadith", ar: "حديث", tr: "Hadis", uz: "Hadis", tg: "Ҳадис", kk: "Хадис" });
fill("hadith.back", { ru: "Назад", en: "Back", ar: "رجوع", tr: "Geri", uz: "Orqaga", tg: "Бозгашт", kk: "Артқа" });
fill("hadith.prev", { ru: "Предыдущий", en: "Previous", ar: "السابق", tr: "Önceki", uz: "Oldingi", tg: "Қаблӣ", kk: "Алдыңғы" });
fill("hadith.next", { ru: "Дальше", en: "Next", ar: "التالي", tr: "Sonraki", uz: "Keyingi", tg: "Баъдӣ", kk: "Келесі" });
fill("hadith.listen.ar", { ru: "Арабский", en: "Arabic", ar: "العربية", tr: "Arapça", uz: "Arabcha", tg: "Арабӣ", kk: "Арабша" });
fill("hadith.listen.mean", { ru: "Перевод", en: "Meaning", ar: "المعنى", tr: "Anlam", uz: "Ma’no", tg: "Маъно", kk: "Мағына" });
fill("hadith.listen.all", { ru: "Слушать всё", en: "Listen to all", ar: "استمع للكل", tr: "Tümünü dinle", uz: "Hammasini tingla", tg: "Ҳамаро шунав", kk: "Бәрін тыңда" });
fill("hadith.paper.mushaf", { ru: "Мусхаф", en: "Mushaf", ar: "مصحف", tr: "Mushaf", uz: "Mushaf", tg: "Мусҳаф", kk: "Мусхаф" });
fill("hadith.paper.folio", { ru: "Лист", en: "Folio", ar: "ورقة", tr: "Yaprak", uz: "Varaq", tg: "Варақ", kk: "Парақ" });
fill("hadith.paper.night", { ru: "Ночь", en: "Night", ar: "ليل", tr: "Gece", uz: "Tun", tg: "Шаъ", kk: "Түн" });
fill("hadith.paper.vellum", { ru: "Велень", en: "Vellum", ar: "رق", tr: "Parşömen", uz: "Pergament", tg: "Пергамент", kk: "Пергамент" });
fill("hadith.font.naskh", { ru: "Насх", en: "Naskh", ar: "نسخ", tr: "Nesih", uz: "Nasx", tg: "Насх", kk: "Нәсх" });
fill("hadith.font.amiri", { ru: "Амири", en: "Amiri", ar: "أميري", tr: "Amiri", uz: "Amiri", tg: "Амирӣ", kk: "Амири" });
fill("hadith.font.kufi", { ru: "Куфи", en: "Kufi", ar: "كوفي", tr: "Kufi", uz: "Kufiy", tg: "Кӯфӣ", kk: "Куфи" });
fill("hadith.font.scheherazade", { ru: "Шехерезада", en: "Scheherazade", ar: "شهرزاد", tr: "Şehrazat", uz: "Shahrazod", tg: "Шаҳрзода", kk: "Шаһразаде" });
fill("hadith.font.mean.literata", { ru: "Книга", en: "Book", ar: "كتاب", tr: "Kitap", uz: "Kitob", tg: "Китоб", kk: "Кітап" });
fill("hadith.font.mean.fraunces", { ru: "Антиква", en: "Antique", ar: "عتيق", tr: "Antik", uz: "Antikva", tg: "Антиква", kk: "Антиква" });
fill("hadith.font.mean.newsreader", { ru: "Газета", en: "News", ar: "صحيفة", tr: "Gazete", uz: "Gazeta", tg: "Рӯзнома", kk: "Газет" });
fill("hadith.font.mean.plex", { ru: "Гротеск", en: "Sans", ar: "sans", tr: "Sans", uz: "Sans", tg: "Гротеск", kk: "Гротеск" });
fill("hadith.listen", { ru: "Слушать", en: "Listen", ar: "استمع", tr: "Dinle", uz: "Tingla", tg: "Шунав", kk: "Тыңда" });
fill("hadith.stop", { ru: "Стоп", en: "Stop", ar: "قف", tr: "Dur", uz: "To‘xta", tg: "Ист", kk: "Тоқта" });
fill("hadith.more", { ru: "полностью", en: "full", ar: "كامل", tr: "tamamı", uz: "to‘liq", tg: "пурра", kk: "толық" });
fill("hadith.less", { ru: "свернуть", en: "less", ar: "أقل", tr: "kısalt", uz: "qisqa", tg: "пӯшидан", kk: "жию" });
fill("hadith.whence", { ru: "откуда", en: "source", ar: "المصدر", tr: "kaynak", uz: "qayerdan", tg: "аз куҷо", kk: "қайдан" });
fill("hadith.lang.ar", { ru: "ع", en: "ع", ar: "ع", tr: "ع", uz: "ع", tg: "ع", kk: "ع" });
fill("hadith.lang.ru", { ru: "рус", en: "RU", ar: "روس", tr: "RU", uz: "RU", tg: "RU", kk: "RU" });
fill("hadith.chain", { ru: "Цепочка", en: "Chain", ar: "السند", tr: "Sened", uz: "Isnod", tg: "Силсила", kk: "Тізбек" });
fill("hadith.chain.narrator", { ru: "Равий", en: "Narrator", ar: "الراوي", tr: "Râvi", uz: "Roviy", tg: "Ровӣ", kk: "Рауи" });
fill("hadith.chain.then", { ru: "от", en: "from", ar: "عن", tr: "den", uz: "dan", tg: "аз", kk: "дан" });
fill("mic.listen", { ru: "Говори", en: "Speak", ar: "تكلم", tr: "Konuş", uz: "Gapir", tg: "Гӯй", kk: "Сөйле" });
fill("mic.hearing", { ru: "Слышу…", en: "Hearing…", ar: "أسمع…", tr: "Dinliyorum…", uz: "Eshitaman…", tg: "Мешунавам…", kk: "Естимін…" });
fill("hadith.filter.sahih", { ru: "только сахих", en: "sahih only", ar: "الصحيح فقط", tr: "yalnız sahih", uz: "faqat sahih", tg: "танҳо саҳеҳ", kk: "тек сахих" });
fill("hadith.filter.all", { ru: "все 42", en: "all 42", ar: "الكل ٤٢", tr: "42’si", uz: "42 ta", tg: "ҳамаи 42", kk: "барлығы 42" });
fill("set.font.family", { ru: "Шрифт", en: "Typeface", ar: "الخط", tr: "Yazı tipi", uz: "Shrift", tg: "Ҳуруф", kk: "Қаріп" });
fill("set.font.theme", { ru: "Как в оформлении", en: "Follow theme", ar: "حسب المظهر", tr: "Temaya göre", uz: "Mavzuga qarab", tg: "Мувофиқи намуд", kk: "Без бойынша" });
fill("set.font.fraunces", { ru: "Антиква", en: "Antique serif", ar: "serif", tr: "Antik serif", uz: "Antikva", tg: "Антиква", kk: "Антиква" });
fill("set.font.literata", { ru: "Книга", en: "Book", ar: "كتاب", tr: "Kitap", uz: "Kitob", tg: "Китоб", kk: "Кітап" });
fill("set.font.newsreader", { ru: "Газета", en: "News", ar: "صحيفة", tr: "Gazete", uz: "Gazeta", tg: "Рӯзнома", kk: "Газет" });
fill("set.font.serif", { ru: "Классика", en: "Classic", ar: "كلاسيكي", tr: "Klasik", uz: "Klassik", tg: "Классикӣ", kk: "Классика" });
fill("set.font.plex", { ru: "Гротеск", en: "Sans", ar: "sans", tr: "Sans", uz: "Sans", tg: "Гротеск", kk: "Гротеск" });
fill("set.font.mono", { ru: "Узкий", en: "Narrow", ar: "ضيق", tr: "Dar", uz: "Tor", tg: "Танг", kk: "Тар" });
fill("set.nav.bottom", { ru: "Снизу", en: "Bottom", ar: "أسفل", tr: "Altta", uz: "Pastda", tg: "Поён", kk: "Төменде" });
fill("set.nav.top", { ru: "Сверху", en: "Top", ar: "أعلى", tr: "Üstte", uz: "Tepada", tg: "Боло", kk: "Жоғарыда" });
fill("set.nav.rail", { ru: "Только значки", en: "Icons only", ar: "أيقونات فقط", tr: "Yalnız simgeler", uz: "Faqat belgi", tg: "Танҳо нишона", kk: "Тек белгі" });
fill("set.nav.sidebar", { ru: "Сбоку", en: "Side", ar: "جانب", tr: "Yanda", uz: "Yonida", tg: "Паҳлӯ", kk: "Жақта" });
fill("room.names", { ru: "99 имён", en: "99 names", ar: "الأسماء الحسنى", tr: "99 isim", uz: "99 ism", tg: "99 ном", kk: "99 есім" });
fill("room.nawawi", { ru: "40 хадисов ан-Навави", en: "40 Hadith of an-Nawawi", ar: "الأربعون النووية", tr: "Nevevî’nin 40 hadisi", uz: "Navaviy 40 hadis", tg: "40 ҳадиси Навави", kk: "Навауидің 40 хадисі" });
fill("room.index", { ru: "Указатели", en: "Indexes", ar: "الفهارس", tr: "Dizinler", uz: "Ko‘rsatkichlar", tg: "Нишондиҳандаҳо", kk: "Көрсеткіштер" });
fill("room.alphabet", { ru: "Алфавит", en: "Alphabet", ar: "الحروف", tr: "Alfabe", uz: "Alifbo", tg: "Алифбо", kk: "Әліпби" });
fill("room.quiz", { ru: "Викторина", en: "Quiz", ar: "اختبار", tr: "Quiz", uz: "Viktorina", tg: "Викторина", kk: "Викторина" });
fill("room.dict", { ru: "Словарь", en: "Dictionary", ar: "المعجم", tr: "Sözlük", uz: "Lug‘at", tg: "Луғат", kk: "Сөздік" });
fill("room.reminder", { ru: "Напоминание", en: "Reminder", ar: "التذكير", tr: "Hatırlatma", uz: "Eslatma", tg: "Ёдрас", kk: "Еске салу" });
fill("room.wisdom", { ru: "Мудрость", en: "Wisdom", ar: "حكمة", tr: "Hikmet", uz: "Hikmat", tg: "Ҳикмат", kk: "Даналық" });
fill("room.calendar", { ru: "Календарь", en: "Calendar", ar: "التقويم", tr: "Takvim", uz: "Taqvim", tg: "Тақвим", kk: "Күнтізбе" });
fill("room.recite", { ru: "Красивое чтение", en: "Recitation", ar: "التلاوة", tr: "Tilavet", uz: "Qiroat", tg: "Қироат", kk: "Қирағат" });
fill("room.tajweed", { ru: "Таджвид", en: "Tajweed", ar: "التجويد", tr: "Tecvid", uz: "Tajvid", tg: "Таҷвид", kk: "Тәжуид" });
fill("room.books", { ru: "9 сборников", en: "9 collections", ar: "تسعة كتب", tr: "9 eser", uz: "9 to‘plam", tg: "9 маҷмӯа", kk: "9 жинақ" });
fill("room.mecca", { ru: "Мекканские суры", en: "Meccan surahs", ar: "السور المكية", tr: "Mekkî sureler", uz: "Makka suralari", tg: "Сураҳои Макка", kk: "Мекке сүрелері" });
fill("room.madina", { ru: "Мединские суры", en: "Medinan surahs", ar: "السور المدنية", tr: "Medenî sureler", uz: "Madina suralari", tg: "Сураҳои Мадина", kk: "Мәдина сүрелері" });
fill("room.index.note", { ru: "Три указателя дома: суры, 40 хадисов, имена.", en: "Three indexes: surahs, 40 hadiths, names.", ar: "ثلاثة فهارس: السور والأربعون والأسماء.", tr: "Üç dizin: sureler, 40 hadis, isimler.", uz: "Uch ko‘rsatkich: suralar, 40 hadis, ismlar.", tg: "Се нишондиҳанда: сураҳо, 40 ҳадис, номҳо.", kk: "Үш көрсеткіш: сүрелер, 40 хадис, есімдер." });
fill("room.alphabet.note", { ru: "28 букв. Урок — во вкладке Учить.", en: "28 letters. The lesson is in Learn.", ar: "٢٨ حرفاً. الدرس في تبويب تعلّم.", tr: "28 harf. Ders Öğren sekmesinde.", uz: "28 harf. Dars — O‘rganish varag‘ida.", tg: "28 ҳарф. Дарс дар варақаи Омӯхтан.", kk: "28 әріп. Сабақ — Оқу қойындысында." });
fill("room.quiz.note", { ru: "Имя по смыслу.", en: "Name by meaning.", ar: "الاسم بالمعنى.", tr: "Anlama göre isim.", uz: "Ma’noga ko‘ra ism.", tg: "Ном аз рӯи маъно.", kk: "Мағынасы бойынша есім." });
fill("room.dict.note", { ru: "Короткий список коранических слов дома.", en: "A short list of Quranic words.", ar: "قائمة قصيرة من كلمات القرآن.", tr: "Kısa bir Kur’an kelime listesi.", uz: "Qur’on so‘zlarining qisqa ro‘yxati.", tg: "Рӯйхати кӯтоҳи калимаҳои Қуръон.", kk: "Құран сөздерінің қысқа тізімі." });
fill("room.recite.note", { ru: "Чтецы дома.", en: "Reciters in the house.", ar: "قرّاء البيت.", tr: "Evdeki okuyucular.", uz: "Uydagi qorilar.", tg: "Қориҳои хона.", kk: "Үйдегі қарилар." });
fill("room.tajweed.note", { ru: "Карточки правил. Не иджаза.", en: "Rule cards. Not an ijazah.", ar: "بطاقات القواعد. ليست إجازة.", tr: "Kural kartları. İcazet değildir.", uz: "Qoida kartochkalari. Ijoza emas.", tg: "Корти қоидаҳо. Иҷоза нест.", kk: "Ереже карточкалары. Иджаза емес." });
fill("room.books.note", { ru: "Каталог известных сборников. Полный текст «40 хадисов ан-Навави» — в доме.", en: "Catalogue of well-known collections. The full Forty Hadith is in the house.", ar: "فهرس الكتب المشهورة. الأربعون كاملة في البيت.", tr: "Meşhur eserlerin kataloğu. Kırk hadis evde tam.", uz: "Mashhur to‘plamlar. 40 hadis uyda to‘liq.", tg: "Феҳристи маҷмӯаҳои машҳур. 40 ҳадис дар хона пурра.", kk: "Белгілі жинақтар каталогы. 40 хадис үйде толық." });

fill("set.section.install", { ru: "На телефон", en: "On your phone", ar: "على الهاتف", tr: "Telefona", uz: "Telefonga", tg: "Ба телефон", kk: "Телефонға" });
fill("set.install.title", { ru: "Поставить как приложение", en: "Install as an app", ar: "ثبّت كتطبيق", tr: "Uygulama olarak kur", uz: "Ilova qilib o‘rnat", tg: "Чун барнома насб кун", kk: "Қолданба ретінде орнат" });
fill("set.install.lead", {
  ru: "На Android — настоящий пакет APK: скачайте и поставьте, как любое приложение. На iPhone — через Safari, на экран «Домой».",
  en: "On Android — a real APK package: download and install like any app. On iPhone — Safari, Add to Home Screen.",
});
fill("set.install.done", { ru: "Мизан уже на экране.", en: "Mizan is already on the home screen.", ar: "الميزان على الشاشة." });
fill("set.install.native", { ru: "Вы уже в приложении Мизан.", en: "You are already in the Mizan app." });
fill("set.install.ok", { ru: "Готово. Иконка на рабочем столе.", en: "Done. The icon is on the home screen." });
fill("set.install.android.title", { ru: "Android", en: "Android", ar: "أندرويد" });
fill("set.install.ios.title", { ru: "iPhone", en: "iPhone", ar: "آيفون" });
fill("set.install.android.apk", {
  ru: "Пакет .apk — иконка весов на рабочем столе. Магазин не нужен. Если телефон спросит — разрешите установку из этого источника.",
  en: "An .apk package — the scales icon on the home screen. No store. If asked, allow installs from this source.",
});
fill("set.install.android.btn", { ru: "Скачать APK", en: "Download APK", ar: "تنزيل APK" });
fill("set.install.android.now", { ru: "Установить сейчас", en: "Install now", ar: "ثبّت الآن" });
fill("set.install.android.chrome", { ru: "Или поставить через Chrome", en: "Or install via Chrome", ar: "أو ثبّت عبر كروم" });
fill("set.install.android.sideload", {
  ru: "Файл скачивается. Откройте его и разрешите установку — иконка весов появится на экране.",
  en: "The file is downloading. Open it and allow the install — the scales icon will appear on the home screen.",
});
fill("set.install.ios.btn", { ru: "Как поставить на iPhone", en: "How to add on iPhone", ar: "كيف تثبّت على آيفون" });
fill("set.install.android.how", {
  ru: "Если файл не качается из этого окна — откройте Мизан в Chrome и нажмите «Скачать APK» ещё раз.",
  en: "If the file does not download here, open Mizan in Chrome and tap Download APK again.",
});
fill("set.install.ios.how", {
  ru: "Только Safari: кнопка «Поделиться» → «На экран Домой». Chrome на iPhone так не умеет.",
  en: "Safari only: Share → Add to Home Screen. Chrome on iPhone cannot do this.",
});
fill("set.install.android.s1", { ru: "Нажмите «Скачать APK» — файл Мизан сохранится на телефон.", en: "Tap Download APK — the Mizan file saves to the phone." });
fill("set.install.android.s2", { ru: "Откройте файл. Если спросит — разрешите установку из этого приложения.", en: "Open the file. If asked, allow installs from this app." });
fill("set.install.android.s3", { ru: "Иконка весов появится на экране, как у обычного приложения.", en: "The scales icon lands on the home screen like any app." });
fill("set.install.ios.s1", { ru: "Откройте Мизан в Safari — не в Chrome и не из Telegram.", en: "Open Mizan in Safari — not Chrome, not Telegram." });
fill("set.install.ios.s2", { ru: "Внизу кнопка «Поделиться» (квадрат со стрелкой).", en: "Tap Share at the bottom (square with an arrow)." });
fill("set.install.ios.s3", { ru: "Пролистайте и нажмите «На экран «Домой»», затем «Добавить».", en: "Scroll to Add to Home Screen, then Add." });

export function translate(locale: Locale, key: string): string {
  return PACKS[locale][key] ?? PACKS.ru[key] ?? key;
}
