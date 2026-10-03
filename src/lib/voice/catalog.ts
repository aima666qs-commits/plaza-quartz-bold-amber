export type VoiceGender = "male" | "female";

export type NeuralVoice = {
  id: string;
  lang: "ar" | "ru";
  gender: VoiceGender;
  name: string;
  place: string;
  note: string;
};

export const VOICES_AR: NeuralVoice[] = [
  { id: "ar-SA-HamedNeural", lang: "ar", gender: "male", name: "Адам", place: "мужской", note: "Живой голос ElevenLabs, арабский" },
  { id: "ar-SA-ZariyahNeural", lang: "ar", gender: "female", name: "Рэйчел", place: "женский", note: "Один женский голос" },
];

export const VOICES_RU: NeuralVoice[] = [
  { id: "ru-RU-DmitryNeural", lang: "ru", gender: "male", name: "Адам", place: "мужской", note: "Живой голос, русский" },
  { id: "ru-RU-SvetlanaNeural", lang: "ru", gender: "female", name: "Рэйчел", place: "женский", note: "Один женский голос" },
];

export const DEFAULT_VOICE_AR = "ar-SA-HamedNeural";
export const DEFAULT_VOICE_RU = "ru-RU-DmitryNeural";

export function defaultVoice(lang: "ar" | "ru", gender: VoiceGender): string {
  if (lang === "ar") return gender === "female" ? "ar-SA-ZariyahNeural" : DEFAULT_VOICE_AR;
  return gender === "female" ? "ru-RU-SvetlanaNeural" : DEFAULT_VOICE_RU;
}

export function findVoice(id: string | undefined | null): NeuralVoice | undefined {
  if (!id) return undefined;
  return VOICES_AR.find((v) => v.id === id) ?? VOICES_RU.find((v) => v.id === id);
}

const EDGE_ID = /^[a-zA-Z]{2}-[a-zA-Z]{2}-[A-Za-z]+Neural$/;
const LIVE = new Set<string>([...VOICES_AR, ...VOICES_RU].map((v) => v.id));

export function safeVoiceId(id: string | undefined | null, fallback: string): string {
  if (id && EDGE_ID.test(id) && LIVE.has(id)) return id;
  return fallback;
}
