import { markSalawat } from "@/lib/voice/adab.ts";

type Recog = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: {
    resultIndex: number;
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  onerror: ((ev?: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function Ctor(): (new () => Recog) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function hearAvailable() {
  return Ctor() !== null;
}

/** Free on-device/browser ear (Google on Android Chrome). No paid Whisper. */
export function hearAsk(onText: (t: string, final: boolean) => void, lang = "ru-RU"): () => void {
  const Cls = Ctor();
  if (!Cls) return () => undefined;
  const rec = new Cls();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 3;
  let stopped = false;
  rec.onresult = (ev) => {
    let piece = "";
    let fin = false;
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const row = ev.results[i];
      if (!row) continue;
      piece += row[0].transcript;
      if (row.isFinal) fin = true;
    }
    const raw = piece.trim();
    if (!raw) return;
    onText(fin ? correctHeard(raw) : raw, fin);
    if (fin && !stopped) rec.stop();
  };
  rec.onerror = () => undefined;
  rec.onend = () => undefined;
  try {
    rec.start();
  } catch {
    /* already started */
  }
  return () => {
    stopped = true;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}

const HEARD: [RegExp, string][] = [
  [/хатаба/gi, "Хаттаба"],
  [/хатаб/gi, "Хаттаб"],
  [/хаттаба/gi, "Хаттаба"],
  [/мухамед[аеуом]*/gi, "Мухаммад"],
  [/магомед[аеуом]*/gi, "Мухаммад"],
  [/мухаммеда?/gi, "Мухаммад"],
  [/аллаха/gi, "Аллаха"],
  [/аллах/gi, "Аллах"],
  [/бухари/gi, "Бухари"],
  [/навави/gi, "Навави"],
  [/муслим/gi, "Муслим"],
  [/закят[аеу]*/gi, "закят"],
  [/нисаб/gi, "нисаб"],
  [/рамадан/gi, "Рамадан"],
  [/хиджр[аеуы]/gi, "хиджра"],
  [/хисн/gi, "Хисн"],
  [/коран/gi, "Коран"],
  [/хадис/gi, "хадис"],
  [/ибн умар/gi, "Ибн Умар"],
  [/абу хурайр/gi, "Абу Хурайр"],
  [/посланник аллаха/gi, "Посланник Аллаха"],
  [/пророк аллаха/gi, "Пророк Аллаха"],
];

export function correctHeard(text: string): string {
  let s = text.trim();
  if (!s) return s;
  for (const [re, to] of HEARD) s = s.replace(re, to);
  s = s.replace(/(?<![\p{L}])а?с{1,3}алям[уа]?\s*алейкум(?![\p{L}])/giu, "ассаляму алейкум");
  s = s.replace(/(?<![\p{L}])салам\s*алейкум(?![\p{L}])/giu, "ассаляму алейкум");
  s = s.replace(/\s+/g, " ").trim();
  return markSalawat(s, "ru");
}
