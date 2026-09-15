/** Adab for the Prophet ﷺ and a speech lexicon so names are not flattened. */

export const SALAWAT_GLYPH = "ﷺ";
export const SALAWAT_AR = "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ";
export const SALAWAT_RU = "саллалла́ху алейхи́ ва саллям";
export const SALAWAT_EN = "salla Llahu alayhi wa sallam";

const MARK_HEAD =
  /^(ﷺ|صلى\s*الله\s*عليه\s*وسلم|صلّى\s*الله\s*عليه\s*وسلم|صَلَّى[\s\u00a0]*اللَّهُ[\s\u00a0]*عَلَيْهِ[\s\u00a0]*وَسَلَّمَ|саллаллах[уа]? алейхи ва\s*саллям|салляллах[уа]? алейхи ва\s*саллям|sallallahu alayhi wa sallam|عليه الصلاة والسلام)/i;

function alreadyHonored(rest: string) {
  return MARK_HEAD.test(rest.trimStart().slice(0, 48));
}

function honorAfter(src: string, re: RegExp, mark: string): string {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const rx = new RegExp(re.source, flags);
  return src.replace(rx, (m, ...args) => {
    const off = args[args.length - 2] as number;
    const rest = src.slice(off + m.length);
    if (alreadyHonored(rest)) return m;
    return `${m} ${mark}`;
  });
}

function isAr(lang: string) {
  return lang.toLowerCase().startsWith("ar");
}

function isEn(lang: string) {
  return lang.toLowerCase().startsWith("en");
}

/** Insert ﷺ / Arabic salawat after the Prophet's titles and name. Idempotent. */
export function markSalawat(text: string, lang = "ru"): string {
  if (!text) return text;
  const mark = isAr(lang) ? SALAWAT_AR : SALAWAT_GLYPH;
  let s = text;

  if (isAr(lang)) {
    s = honorAfter(s, /رسول[\s\u00a0]+الله/g, mark);
    s = honorAfter(s, /النبي(?![\u0640-\u06FF])/g, mark);
    s = honorAfter(s, /يا[\s\u00a0]+محمد/g, mark);
    s = honorAfter(s, /(?<![\u0600-\u06FF])محمد(?![\s\u00a0]+بن)(?![\u0600-\u06FF])/g, mark);
    return s;
  }

  s = honorAfter(s, /Посланник(?:а|у|ом|е)?[\s\u00a0]+Аллаха/giu, mark);
  s = honorAfter(s, /Пророк(?:а|у|ом|е)?[\s\u00a0]+Аллаха/giu, mark);
  s = honorAfter(s, /(?<![\p{L}])Пророк(?:а|у|ом|е)?(?![\p{L}])/giu, mark);
  s = honorAfter(s, /the Messenger of Allah/gi, mark);
  s = honorAfter(s, /the Prophet(?!s)/gi, mark);
  s = honorAfter(
    s,
    /(?<!Абу[\s\u00a0])(?<!Нур[\s\u00a0])(?<!ибн[\s\u00a0])(?<!Ibn[\s\u00a0])(?<!Abu[\s\u00a0])Мухаммад(?:а|у|ом|е)?(?![\p{L}])/giu,
    mark,
  );
  s = honorAfter(s, /(?<!Abu[\s\u00a0])(?<!Ibn[\s\u00a0])Muhammad(?![A-Za-z])/g, mark);
  return s;
}

function spokenSalawat(lang: string) {
  if (isAr(lang)) return SALAWAT_AR;
  if (isEn(lang)) return SALAWAT_EN;
  return SALAWAT_RU;
}

function expandHonorifics(text: string, lang: string): string {
  const spoken = spokenSalawat(lang);
  return text
    .replace(/ﷺ/g, ` ${spoken} `)
    .replace(/صَلَّى[\s\u00a0]*اللَّهُ[\s\u00a0]*عَلَيْهِ[\s\u00a0]*وَسَلَّمَ/g, ` ${spoken} `)
    .replace(/صلّى\s*الله\s*عليه\s*وسلم/g, ` ${spoken} `)
    .replace(/صلى\s*الله\s*عليه\s*وسلم/g, ` ${spoken} `)
    .replace(/عليه الصلاة والسلام/g, ` ${spoken} `)
    .replace(/салляллах[уа]?\s+алейхи\s+ва\s*саллям/gi, spoken)
    .replace(/саллаллах[уа]?\s+алейхи\s+ва\s*саллям/gi, spoken)
    .replace(/sallallahu\s+alayhi\s+wa\s+sallam/gi, spoken);
}

type Pair = [RegExp, string];

function word(from: string, to: string): Pair {
  return [new RegExp(`(?<![\\p{L}\\p{M}])${from}(?![\\p{L}\\p{M}])`, "giu"), to];
}

/** Russian TTS flattens shadda. Hyphen + stress keeps Хат-та́б, Муха́м-мад. */
const RU_LEXICON: Pair[] = [
  word("аль-Хаттаба", "аль-Хат-та́ба"),
  word("аль-Хаттабом", "аль-Хат-та́бом"),
  word("аль-Хаттабу", "аль-Хат-та́бу"),
  word("аль-Хаттаб", "аль-Хат-та́б"),
  word("Хаттаба", "Хат-та́ба"),
  word("Хаттабом", "Хат-та́бом"),
  word("Хаттабу", "Хат-та́бу"),
  word("Хаттаб", "Хат-та́б"),
  word("Мухаммада", "Муха́м-мада"),
  word("Мухаммаду", "Муха́м-маду"),
  word("Мухаммадом", "Муха́м-мадом"),
  word("Мухаммаде", "Муха́м-маде"),
  word("Мухаммад", "Муха́м-мад"),
  word("Аиши", "Аи́ши"),
  word("Аишу", "Аи́шу"),
  word("Аишей", "Аи́шей"),
  word("Аиша", "Аи́ша"),
  word("Хурайры", "Хурайры́"),
  word("Хурайре", "Хурайре́"),
  word("Хурайру", "Хурайру́"),
  word("Хурайра", "Хурайра́"),
  word("Муаза", "Муа́за"),
  word("Муазу", "Муа́зу"),
  word("Муазом", "Муа́зом"),
  word("Муаз", "Муа́з"),
  word("Джабира", "Джа́бира"),
  word("Джабиру", "Джа́биру"),
  word("Джабир", "Джа́бир"),
  word("Аббаса", "Абба́са"),
  word("Аббасу", "Абба́су"),
  word("Аббас", "Абба́с"),
  word("Умара", "У́мара"),
  word("Умару", "У́мару"),
  word("Умаром", "У́маром"),
  word("Умар", "У́мар"),
  word("Усмана", "Усма́на"),
  word("Усман", "Усма́н"),
  word("Али", "Али́"),
  word("Анаса", "А́наса"),
  word("Анас", "А́нас"),
  word("Малика", "Ма́лика"),
  word("Малик", "Ма́лик"),
  word("Бухари", "Буха́ри"),
  word("ан-Навави", "ан-Нава́ви"),
  word("Навави", "Нава́ви"),
  word("Муслима", "Му́слима"),
  word("Муслим", "Му́слим"),
  word("Рамадан", "Рамада́н"),
  word("закята", "закя́та"),
  word("закят", "закя́т"),
  word("ихсане", "ихса́не"),
  word("ихсан", "ихса́н"),
  word("имане", "има́не"),
  word("иман", "има́н"),
  word("хадж", "хадж"),
  word("Аллаха", "Алла́ха"),
  word("Аллаху", "Алла́ху"),
  word("Аллахом", "Алла́хом"),
  word("Аллах", "Алла́х"),
  word("Мас‘уда", "Мас-у́да"),
  word("Мас'уда", "Мас-у́да"),
  word("Ну‘мана", "Ну-ма́на"),
  word("Ну'мана", "Ну-ма́на"),
  word("ибн", "ибн"),
];

function applyLexicon(text: string, pairs: Pair[]): string {
  let s = text;
  for (const [re, to] of pairs) s = s.replace(re, to);
  return s;
}

/** Text for TTS: salawat spoken in full, names with shadda. */
export function speakPrep(text: string, lang = "ru"): string {
  const marked = markSalawat(text, lang);
  let s = expandHonorifics(marked, lang);
  if (!isAr(lang) && !isEn(lang)) s = applyLexicon(s, RU_LEXICON);
  return s.replace(/\s+/g, " ").trim();
}
