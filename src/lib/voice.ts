import { speakMale } from "@/lib/voice/server.ts";
import { useMizan, type VoiceGender, type VoiceRate } from "@/stores/mizan-store.ts";

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
  return Ctor() !== null;
}

export function speakAvailable() {
  return typeof window !== "undefined";
}

export function listenRu(onText: (t: string, final: boolean) => void, lang = "ru-RU"): () => void {
  const Cls = Ctor();
  if (!Cls) return () => undefined;
  const rec = new Cls();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (ev) => {
    const last = ev.results[ev.results.length - 1];
    if (!last) return;
    onText(last[0].transcript, last.isFinal);
  };
  rec.onerror = () => undefined;
  rec.start();
  return () => rec.stop();
}

const FEMALE =
  /female|woman|girl|milena|irina|oksana|tatyana|tatiana|svetlana|daria|dariya|alena|elena|kate|katya|zira|susan|samantha|hazel|karen|moira|fiona|veena|tessa|siri|jane|anna|kendra|joanna|ivy|salli|nicole|raveena|aditi|lupa|natalia|paulina|salma|jenny|emel/i;
const MALE =
  /male|dmitry|dmitri|yuri|yury|pavel|filipp|zahar|ermil|andrei|alexandr|shakir|daniel|david|mark|george|fred|arthur|guy|ahmet|google uk english male/i;

const BROWSER_RATE: Record<VoiceRate, number> = { slow: 0.84, normal: 1.0, fast: 1.18 };

function voicePrefs(): { gender: VoiceGender; rate: VoiceRate } {
  try {
    const s = useMizan.getState().settings;
    return {
      gender: s.voiceGender === "female" ? "female" : "male",
      rate: s.voiceRate === "slow" || s.voiceRate === "fast" ? s.voiceRate : "normal",
    };
  } catch {
    return { gender: "male", rate: "normal" };
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

function chunkText(s: string, max = 640): string[] {
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

export async function speakText(text: string, lang = "ru-RU") {
  if (typeof window === "undefined") return;
  const clean = text.replace(/[ʿʾ*#_]/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return;
  stopSpeak();
  const mine = seq;
  const { gender, rate } = voicePrefs();
  const chunks = chunkText(clean);
  for (const chunk of chunks) {
    if (mine !== seq) return;
    try {
      const res = await speakMale({ data: { text: chunk, lang: lang.slice(0, 2), gender, rate } });
      if (mine !== seq) return;
      if (res.ok) {
        const bin = Uint8Array.from(atob(res.b64), (c) => c.charCodeAt(0));
        const blob = new Blob([bin], { type: res.mime });
        objectUrl = URL.createObjectURL(blob);
        player = new Audio(objectUrl);
        await new Promise<void>((resolve) => {
          if (!player) {
            resolve();
            return;
          }
          player.onended = () => resolve();
          player.onerror = () => resolve();
          void player.play().catch(() => resolve());
        });
        continue;
      }
    } catch {
      /* browser voice if neural failed */
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
