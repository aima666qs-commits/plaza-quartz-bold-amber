import { AJURRUMIYYA_LESSONS } from "@/lib/learn/ajurrumiyya.ts";

export type ArabicMethodId = "madinah" | "bayna" | "alkitaab" | "immersive" | "nahw";

export type LessonDrill = "letters" | "connect" | "harakat" | "read" | "irab";

export type Lesson = {
  n: number;
  title: string;
  minutes: number;
  goal: string;
  teach: string;
  drill: LessonDrill;
  exampleAr: string;
  exampleRu: string;
  matn?: string;
  i3rab?: { word: string; role: string; mark: string }[];
  quranEx?: string;
  quranRef?: string;
};

export type ArabicMethod = {
  id: ArabicMethodId;
  ru: string;
  ar: string;
  origin: string;
  why: string;
  honest: string;
  lessons: Lesson[];
};

export const ARABIC_METHODS: ArabicMethod[] = [
  {
    id: "madinah",
    ru: "Мединские книги",
    ar: "دروس اللغة العربية",
    origin: "В. Абдур Рахим, Исламский университет Медины. Самый распространённый каттабский курс в мире.",
    why: "Слово сразу в предложении. Падежи с первого месяца. Коранские примеры.",
    honest: "Это учебный путь, не иджаза университета. Живой учитель лучше.",
    lessons: [
      { n: 1, title: "Это / то", minutes: 20, goal: "هذا ذلك", teach: "هذا — близко. ذلك — далеко. Имя после них в именительном.", drill: "letters", exampleAr: "هَٰذَا كِتَابٌ", exampleRu: "Это — книга." },
      { n: 2, title: "Дом и мечеть", minutes: 20, goal: "بيت مسجد", teach: "Имена. Алиф-лям ال делает слово определённым.", drill: "connect", exampleAr: "الْبَيْتُ كَبِيرٌ", exampleRu: "Дом большой." },
      { n: 3, title: "У него / у неё", minutes: 25, goal: "له لها", teach: "Предлог لِ + местоимение. Идафа: كِتَابُ الطَّالِبِ.", drill: "harakat", exampleAr: "لَهُ قَلَمٌ", exampleRu: "У него ручка." },
      { n: 4, title: "Где?", minutes: 20, goal: "أين", teach: "أينَ + اسم. Ответ: في، على، تحت.", drill: "read", exampleAr: "أَيْنَ الْكِتَابُ؟", exampleRu: "Где книга?" },
      { n: 5, title: "Глагол прошедшего", minutes: 25, goal: "فَعَلَ", teach: "Трёхсогласный корень. كَتَبَ — он написал. ذَهَبَ — он пошёл.", drill: "harakat", exampleAr: "كَتَبَ الدَّرْسَ", exampleRu: "Он написал урок." },
      { n: 6, title: "Ты и я", minutes: 25, goal: "أنا أنت", teach: "Местоимения. Глагол меняется: كَتَبْتُ — я написал.", drill: "read", exampleAr: "أَنَا طَالِبٌ", exampleRu: "Я студент." },
      { n: 7, title: "Женский род", minutes: 20, goal: "ـة", teach: "Та-марбута. هذه طالبة. Большинство имён на ة — женский род.", drill: "connect", exampleAr: "هَٰذِهِ مَدْرَسَةٌ", exampleRu: "Это школа." },
      { n: 8, title: "Чтение с мусхафа", minutes: 30, goal: "Фатиха с листа", teach: "Буква + харакат без догадки. Слух Хусари, глаза в мусхафе.", drill: "read", exampleAr: "بِسْمِ ٱللَّهِ", exampleRu: "С именем Аллаха." },
    ],
  },
  {
    id: "bayna",
    ru: "Арабский между твоими руками",
    ar: "العربية بين يديك",
    origin: "Университет короля Сауда. Самый используемый коммуникативный курс в институтах.",
    why: "Диалог, слушание, затем грамматика. Говоришь с первого дня.",
    honest: "Аудио оригинала здесь нет — есть наши диалоги и мусхаф.",
    lessons: [
      { n: 1, title: "Салам", minutes: 15, goal: "السلام عليكم", teach: "Приветствие. وعليكم السلام. كيف حالك؟ — بخير، والحمد لله.", drill: "letters", exampleAr: "السَّلَامُ عَلَيْكُمْ", exampleRu: "Мир вам." },
      { n: 2, title: "Как тебя зовут?", minutes: 20, goal: "ما اسمك", teach: "ما اسمُكَ؟ اسمي… من أين أنت؟", drill: "harakat", exampleAr: "مَا اسْمُكَ؟", exampleRu: "Как тебя зовут?" },
      { n: 3, title: "Семья", minutes: 20, goal: "أب أم", teach: "أَب، أُم، أَخ، أُخْت، ابْن، بِنْت.", drill: "connect", exampleAr: "هَٰذَا أَبِي", exampleRu: "Это мой отец." },
      { n: 4, title: "Еда", minutes: 20, goal: "خبز ماء", teach: "Хочу / не хочу: أُرِيدُ. Просьба: مِنْ فَضْلِكَ.", drill: "read", exampleAr: "أُرِيدُ مَاءً", exampleRu: "Я хочу воду." },
      { n: 5, title: "Время намаза", minutes: 25, goal: "صلاة", teach: "الفجر الظهر العصر المغرب العشاء. Который час: الساعة…", drill: "read", exampleAr: "حَانَ وَقْتُ الصَّلَاةِ", exampleRu: "Наступило время молитвы." },
      { n: 6, title: "Рынок", minutes: 20, goal: "كم", teach: "كَمْ هَٰذَا؟ غَالٍ / رَخِيصٌ. Числа 1–10.", drill: "harakat", exampleAr: "كَمْ هَٰذَا؟", exampleRu: "Сколько это стоит?" },
      { n: 7, title: "Направление", minutes: 20, goal: "يمين يسار", teach: "يَمِين، يَسَار، أَمَام، خَلْف. اِذْهَبْ إِلَى…", drill: "connect", exampleAr: "الْمَسْجِدُ أَمَامَكَ", exampleRu: "Мечеть перед тобой." },
      { n: 8, title: "Короткий диалог", minutes: 25, goal: "говорить 8 фраз", teach: "Собери салам, имя, откуда, куда идёшь. Без бумаги.", drill: "read", exampleAr: "أَيْنَ تَذْهَبُ؟", exampleRu: "Куда ты идёшь?" },
    ],
  },
  {
    id: "alkitaab",
    ru: "Аль-Китаб",
    ar: "الكتاب في تعلم العربية",
    origin: "Брустад / аль-Баталь, Georgetown. Университетский стандарт Запада.",
    why: "Корни, модели, диалект рядом с фусхой. Сильная грамматика.",
    honest: "Курс бумажный и дорогой. Здесь — каркас корней, не пиратская копия.",
    lessons: [
      { n: 1, title: "Корень ك ت ب", minutes: 25, goal: "три буквы", teach: "Арабское слово живёт корнем. كَتَبَ كِتَاب كَاتِب مَكْتَب.", drill: "letters", exampleAr: "كَتَبَ", exampleRu: "написал" },
      { n: 2, title: "Корень د ر س", minutes: 20, goal: "درس", teach: "دَرَسَ — учил. مَدْرَسَة — школа. دَرْس — урок.", drill: "connect", exampleAr: "دَرَسَ الطَّالِبُ", exampleRu: "Студент учил." },
      { n: 3, title: "Исм и фи‘ль", minutes: 25, goal: "اسم فعل", teach: "Имя и глагол. Предложение может начинаться с имени или с глагола.", drill: "harakat", exampleAr: "الْوَلَدُ كَتَبَ", exampleRu: "Мальчик написал." },
      { n: 4, title: "Идафа", minutes: 25, goal: "إضافه", teach: "كِتَابُ الطَّالِبِ — книга студента. Первое без артикля, второе несёт определённость.", drill: "read", exampleAr: "بَابُ الْمَسْجِدِ", exampleRu: "Дверь мечети." },
      { n: 5, title: "Причастие", minutes: 25, goal: "فاعل", teach: "Катиб — пишущий. Модель فَاعِل.", drill: "harakat", exampleAr: "هُوَ كَاتِبٌ", exampleRu: "Он пишущий / писатель." },
      { n: 6, title: "Масдар", minutes: 20, goal: "مصدر", teach: "Отглагольное имя. كِتَابَة — писание.", drill: "read", exampleAr: "كِتَابَةُ الدَّرْسِ", exampleRu: "Написание урока." },
    ],
  },
  {
    id: "immersive",
    ru: "Прямой метод",
    ar: "الطريقة المباشرة",
    origin: "Как учат в Касиде, Диван и живых каттабах: арабский без перевода на первых минутах.",
    why: "Ухо и язык раньше грамматики. Ребёнок так и учит.",
    honest: "Без учителя метод слабее. Здесь — жесты, картинка, повтор за Хусари.",
    lessons: [
      { n: 1, title: "Смотри и называй", minutes: 15, goal: "10 вещей", teach: "Укажи: كِتَاب، قَلَم، بَاب، مَاء، خُبْز. Не переводи вслух.", drill: "letters", exampleAr: "هَٰذَا قَلَمٌ", exampleRu: "Это ручка." },
      { n: 2, title: "Делай", minutes: 15, goal: "5 глаголов", teach: "قُمْ، اجْلِسْ، اقْرَأْ، اكْتُبْ، اسْمَعْ. Сделай, потом скажи.", drill: "harakat", exampleAr: "اِقْرَأْ", exampleRu: "Читай." },
      { n: 3, title: "Слух Фатихи", minutes: 20, goal: "повтор", teach: "Слушай аят, закрой глаза, верни. Глаза потом.", drill: "read", exampleAr: "ٱلْحَمْدُ لِلَّهِ", exampleRu: "Хвала Аллаху." },
    ],
  },
  {
    id: "nahw",
    ru: "Аджуррумия",
    ar: "الآجرومية",
    origin: "Абу Абдуллах Мухаммад ибн Мухаммад ибн Давуд ас-Санхаджи, Ибн Аджуррум (ум. 723 / 1323). Матн, с которого начинают нахв в Магрибе, Хиджазе и каттабах Азхара. Дальше — Катр ан-нада, потом Альфия Ибн Малика.",
    why: "Понимаешь и‘раб Корана, не только базарный диалог. 24 урока закрывают весь матн.",
    honest: "Это матн, не иджаза. Без шейха легко заучить термины и не услышать окончание. Живой разбор сильнее карточки.",
    lessons: AJURRUMIYYA_LESSONS,
  },
];

export function methodById(id: string | null) {
  return ARABIC_METHODS.find((m) => m.id === id) ?? null;
}
