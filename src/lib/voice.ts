import { speakMale } from "@/lib/voice/server.ts";
import { speakPrep } from "@/lib/voice/adab.ts";
import { defaultVoice, safeVoiceId } from "@/lib/voice/catalog.ts";
import { hearAsk as hearAskImpl, hearAvailable, correctHeard } from "@/lib/voice/hear.ts";
import { useMizan, type VoiceGender, type VoiceRate } from "@/stores/mizan-store.ts";

export { hearAvailable, correctHeard };

export function hearAsk(onText: (t: string, final: boolean) => void, lang = "ru-RU"): () => void {
  return hearAskImpl(onText, lang);
}

type Recog = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function Ctor(): (new () => Recog) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function voiceAvailable() {
  return Ctor() !== null || hearAvailable();
}

export function speakAvailable() {
  return typeof window !== "undefined";
}

export function listenRu(onText: (t: string, final: boolean) => void, lang = "ru-RU"): () => void {
  return hearAsk(onText, lang);
}

const FEMALE =
  /female|woman|girl|milena|irina|oksana|tatyana|tatiana|svetlana|daria|dariya|alena|elena|kate|katya|zira|susan|samantha|hazel|karen|moira|fiona|veena|tessa|siri|jane|anna|kendra|joanna|ivy|salli|nicole|raveena|aditi|lupa|natalia|paulina|salma|jenny|emel/i;
const MALE =
  /male|dmitry|dmitri|yuri|yury|pavel|filipp|zahar|ermil|andrei|alexandr|shakir|hamed|hamdan|moaz|bassel|saleh|daniel|david|mark|george|fred|arthur|guy|ahmet|google uk english male/i;

const BROWSER_RATE: Record<VoiceRate, number> = { slow: 0.92, normal: 1.12, fast: 1.32 };
const PLAY_RATE: Record<VoiceRate, number> = { slow: 0.94, normal: 1.06, fast: 1.18 };

function voicePrefs(): { gender: VoiceGender; rate: VoiceRate; voiceAr: string; voiceRu: string } {
  try {
    const s = useMizan.getState().settings;
    const gender = s.voiceGender === "female" ? "female" : "male";
    return {
      gender,
      rate: s.voiceRate === "slow" || s.voiceRate === "fast" ? s.voiceRate : "normal",
      voiceAr: safeVoiceId(s.voiceAr, defaultVoice("ar", gender)),
      voiceRu: safeVoiceId(s.voiceRu, defaultVoice("ru", gender)),
    };
  } catch {
    return {
      gender: "male",
      rate: "fast",
      voiceAr: defaultVoice("ar", "male"),
      voiceRu: defaultVoice("ru", "male"),
    };
  }
}

function pickVoice(lang: string, gender: VoiceGender) {
  if (typeof window === "undefined") return null;
  const all = window.speechSynthesis.getVoices();
  const pool = all.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (gender === "female") return pool.find((v) => FEMALE.test(v.name)) ?? pool[0] ?? null;
  const named = pool.find((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  return named ?? pool.find((v) => !FEMALE.test(v.name) && /male/i.test(v.name)) ?? pool[0] ?? null;
}

function speakBrowser(text: string, lang: string, gender: VoiceGender, rate: VoiceRate): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const voice = pickVoice(lang, gender);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  if (voice) u.voice = voice;
  u.rate = BROWSER_RATE[rate];
  u.pitch = gender === "female" ? 1.04 : 0.92;
  return new Promise((resolve) => {
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function chunkText(s: string, max = 900): string[] {
  if (s.length <= max) return [s];
  const out: string[] = [];
  let rest = s;
  while (rest.length > max) {
    const window = rest.slice(0, max);
    let cut = Math.max(window.lastIndexOf("۔"), window.lastIndexOf("."), window.lastIndexOf("!"), window.lastIndexOf("?"), window.lastIndexOf("،"), window.lastIndexOf(","), window.lastIndexOf(" "));
    if (cut < max * 0.4) cut = max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

function neuralId(lang: string, voiceAr: string, voiceRu: string, gender: VoiceGender): string {
  const code = lang.slice(0, 2).toLowerCase();
  if (code === "ar") return voiceAr;
  if (code === "ru") return voiceRu;
  return defaultVoice("ru", gender);
}

type Clip = { mime: string; b64: string };
const clipCache = new Map<string, Clip>();

function cacheKey(text: string, lang: string, voice: string, rate: VoiceRate, gender: VoiceGender) {
  return `${voice}|${rate}|${gender}|${lang}|${text}`;
}

async function fetchClip(text: string, lang: string, gender: VoiceGender, rate: VoiceRate, voice: string): Promise<Clip | null> {
  const key = cacheKey(text, lang, voice, rate, gender);
  const hit = clipCache.get(key);
  if (hit) return hit;
  try {
    const res = await speakMale({ data: { text, lang: lang.slice(0, 2), gender, rate, voice } });
    if (res.ok) {
      const clip = { mime: res.mime, b64: res.b64 };
      clipCache.set(key, clip);
      return clip;
    }
  } catch {
    /* browser fallback later */
  }
  return null;
}

function playClip(clip: Clip, rate: VoiceRate, mine: number): Promise<void> {
  if (mine !== seq) return Promise.resolve();
  const bin = Uint8Array.from(atob(clip.b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], { type: clip.mime });
  objectUrl = URL.createObjectURL(blob);
  player = new Audio(objectUrl);
  player.playbackRate = PLAY_RATE[rate];
  return new Promise<void>((resolve) => {
    if (!player) {
      resolve();
      return;
    }
    player.onended = () => resolve();
    player.onerror = () => resolve();
    void player.play().catch(() => resolve());
  });
}

export async function prefetchSpeak(text: string, lang = "ru-RU") {
  if (typeof window === "undefined") return;
  const prepared = speakPrep(text.replace(/[ʿʾ*#_]/g, ""), lang);
  if (!prepared) return;
  const { gender, rate, voiceAr, voiceRu } = voicePrefs();
  const voice = neuralId(lang, voiceAr, voiceRu, gender);
  for (const chunk of chunkText(prepared)) {
    await fetchClip(chunk, lang, gender, rate, voice);
  }
}

export async function speakText(text: string, lang = "ru-RU") {
  if (typeof window === "undefined") return;
  const prepared = speakPrep(text.replace(/[ʿʾ*#_]/g, ""), lang);
  if (!prepared) return;
  stopSpeak();
  const mine = seq;
  const { gender, rate, voiceAr, voiceRu } = voicePrefs();
  const voice = neuralId(lang, voiceAr, voiceRu, gender);
  const chunks = chunkText(prepared);
  for (const chunk of chunks) {
    if (mine !== seq) return;
    const clip = await fetchClip(chunk, lang, gender, rate, voice);
    if (mine !== seq) return;
    if (clip) {
      await playClip(clip, rate, mine);
      continue;
    }
    if (mine !== seq) return;
    await speakBrowser(chunk, lang, gender, rate);
  }
}

let player: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let seq = 0;

export function stopSpeak() {
  seq += 1;
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  if (player) {
    player.pause();
    player.removeAttribute("src");
    player = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}
