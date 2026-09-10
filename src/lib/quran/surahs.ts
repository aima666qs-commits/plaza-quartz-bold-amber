import type { SurahMeta } from "@/lib/quran/types.ts";

/** n|ayahs|ar|latin|ru|M/D */
const RAW = `
1|7|الفاتحة|Al-Fatiha|Открывающая|M
2|286|البقرة|Al-Baqara|Корова|D
3|200|آل عمران|Ali Imran|Семейство Имрана|D
4|176|النساء|An-Nisa|Женщины|D
5|120|المائدة|Al-Maida|Трапеза|D
6|165|الأنعام|Al-Anam|Скот|M
7|206|الأعراف|Al-Araf|Преграды|M
8|75|الأنفال|Al-Anfal|Добыча|D
9|129|التوبة|At-Tawba|Покаяние|D
10|109|يونس|Yunus|Йунус|M
11|123|هود|Hud|Худ|M
12|111|يوسف|Yusuf|Йусуф|M
13|43|الرعد|Ar-Rad|Гром|D
14|52|إبراهيم|Ibrahim|Ибрахим|M
15|99|الحجر|Al-Hijr|Аль-Хиджр|M
16|128|النحل|An-Nahl|Пчёлы|M
17|111|الإسراء|Al-Isra|Ночной перенос|M
18|110|الكهف|Al-Kahf|Пещера|M
19|98|مريم|Maryam|Марьям|M
20|135|طه|Ta-Ha|Та Ха|M
21|112|الأنبياء|Al-Anbiya|Пророки|M
22|78|الحج|Al-Hajj|Хадж|D
23|118|المؤمنون|Al-Muminun|Верующие|M
24|64|النور|An-Nur|Свет|D
25|77|الفرقان|Al-Furqan|Различение|M
26|227|الشعراء|Ash-Shuara|Поэты|M
27|93|النمل|An-Naml|Муравьи|M
28|88|القصص|Al-Qasas|Рассказ|M
29|69|العنكبوت|Al-Ankabut|Паук|M
30|60|الروم|Ar-Rum|Римляне|M
31|34|لقمان|Luqman|Лукман|M
32|30|السجدة|As-Sajda|Поклон|M
33|73|الأحزاب|Al-Ahzab|Союзники|D
34|54|سبأ|Saba|Саба|M
35|45|فاطر|Fatir|Творец|M
36|83|يس|Ya-Sin|Йа Син|M
37|182|الصافات|As-Saffat|Выстроившиеся|M
38|88|ص|Sad|Сад|M
39|75|الزمر|Az-Zumar|Толпы|M
40|85|غافر|Ghafir|Прощающий|M
41|54|فصلت|Fussilat|Разъяснены|M
42|53|الشورى|Ash-Shura|Совет|M
43|89|الزخرف|Az-Zukhruf|Украшения|M
44|59|الدخان|Ad-Dukhan|Дым|M
45|37|الجاثية|Al-Jathiya|Коленопреклонённые|M
46|35|الأحقاف|Al-Ahqaf|Аль-Ахкаф|M
47|38|محمد|Muhammad|Мухаммад|D
48|29|الفتح|Al-Fath|Победа|D
49|18|الحجرات|Al-Hujurat|Комнаты|D
50|45|ق|Qaf|Каф|M
51|60|الذاريات|Adh-Dhariyat|Рассеивающие|M
52|49|الطور|At-Tur|Гора|M
53|62|النجم|An-Najm|Звезда|M
54|55|القمر|Al-Qamar|Луна|M
55|78|الرحمن|Ar-Rahman|Милостивый|M
56|96|الواقعة|Al-Waqia|Событие|M
57|29|الحديد|Al-Hadid|Железо|D
58|22|المجادلة|Al-Mujadila|Препирающаяся|D
59|24|الحشر|Al-Hashr|Сбор|D
60|13|الممتحنة|Al-Mumtahina|Испытуемая|D
61|14|الصف|As-Saff|Ряды|D
62|11|الجمعة|Al-Jumu'a|Пятница|D
63|11|المنافقون|Al-Munafiqun|Лицемеры|D
64|18|التغابن|At-Taghabun|Взаимный обман|D
65|12|الطلاق|At-Talaq|Развод|D
66|12|التحريم|At-Tahrim|Запрещение|D
67|30|الملك|Al-Mulk|Власть|M
68|52|القلم|Al-Qalam|Письменная трость|M
69|52|الحاقة|Al-Haqqa|Неизбежное|M
70|44|المعارج|Al-Maarij|Ступени|M
71|28|نوح|Nuh|Нух|M
72|28|الجن|Al-Jinn|Джинны|M
73|20|المزمل|Al-Muzzammil|Закутавшийся|M
74|56|المدثر|Al-Muddaththir|Завернувшийся|M
75|40|القيامة|Al-Qiyama|Воскресение|M
76|31|الانسان|Al-Insan|Человек|D
77|50|المرسلات|Al-Mursalat|Посылаемые|M
78|40|النبأ|An-Naba|Весть|M
79|46|النازعات|An-Naziat|Исторгающие|M
80|42|عبس|Abasa|Нахмурился|M
81|29|التكوير|At-Takwir|Скручивание|M
82|19|الانفطار|Al-Infitar|Раскалывание|M
83|36|المطففين|Al-Mutaffifin|Обвешивающие|M
84|25|الانشقاق|Al-Inshiqaq|Разверзнется|M
85|22|البروج|Al-Buruj|Созвездия|M
86|17|الطارق|At-Tariq|Ночной путник|M
87|19|الأعلى|Al-Ala|Всевышний|M
88|26|الغاشية|Al-Ghashiya|Покрывающее|M
89|30|الفجر|Al-Fajr|Заря|M
90|20|البلد|Al-Balad|Город|M
91|15|الشمس|Ash-Shams|Солнце|M
92|21|الليل|Al-Layl|Ночь|M
93|11|الضحى|Ad-Duha|Утро|M
94|8|الشرح|Ash-Sharh|Раскрытие|M
95|8|التين|At-Tin|Смоковница|M
96|19|العلق|Al-Alaq|Сгусток|M
97|5|القدر|Al-Qadr|Могущество|M
98|8|البينة|Al-Bayyina|Ясное знамение|D
99|8|الزلزلة|Az-Zalzala|Сотрясение|D
100|11|العاديات|Al-Adiyat|Скачущие|M
101|11|القارعة|Al-Qaria|Поражающее|M
102|8|التكاثر|At-Takathur|Соперничество|M
103|3|العصر|Al-Asr|Время|M
104|9|الهمزة|Al-Humaza|Хулитель|M
105|5|الفيل|Al-Fil|Слон|M
106|4|قريش|Quraysh|Курайш|M
107|7|الماعون|Al-Maun|Подаяние|M
108|3|الكوثر|Al-Kawthar|Изобилие|M
109|6|الكافرون|Al-Kafirun|Неверующие|M
110|3|النصر|An-Nasr|Помощь|D
111|5|المسد|Al-Masad|Пальмовые волокна|M
112|4|الإخلاص|Al-Ikhlas|Искренность|M
113|5|الفلق|Al-Falaq|Рассвет|M
114|6|الناس|An-Nas|Люди|M
`.trim();

export const SURAHS: SurahMeta[] = RAW.split("\n").map((line) => {
  const [n, ayahs, ar, tr, ru, place] = line.split("|");
  return {
    n: Number(n),
    ayahs: Number(ayahs),
    ar,
    tr,
    ru,
    place: place as SurahMeta["place"],
  };
});

const START: number[] = new Array(115);
{
  let g = 1;
  for (const s of SURAHS) {
    START[s.n] = g;
    g += s.ayahs;
  }
}

export function surahOf(n: number): SurahMeta {
  return SURAHS[n - 1] ?? SURAHS[0];
}

export function refToGlobal(surah: number, ayah: number): number {
  return (START[surah] ?? 1) + ayah - 1;
}

export function globalToRef(g: number): { surah: number; ayah: number } {
  let n = 1;
  for (const s of SURAHS) {
    const start = START[s.n];
    if (g < start + s.ayahs) return { surah: s.n, ayah: g - start + 1 };
    n = s.n;
  }
  return { surah: n, ayah: 1 };
}

export const TOTAL_AYAHS = 6236;
