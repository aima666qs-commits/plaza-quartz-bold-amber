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
  { id: "ar-SA-HamedNeural", lang: "ar", gender: "male", name: "Хамед", place: "Саудия", note: "Хиджаз, ближе к тиляве" },
  { id: "ar-QA-MoazNeural", lang: "ar", gender: "male", name: "Моаз", place: "Катар", note: "Халиджи, тёплый" },
  { id: "ar-AE-HamdanNeural", lang: "ar", gender: "male", name: "Хамдан", place: "Эмираты", note: "Залив, ровный" },
  { id: "ar-EG-ShakirNeural", lang: "ar", gender: "male", name: "Шакир", place: "Египет", note: "Ясный масри" },
  { id: "ar-IQ-BasselNeural", lang: "ar", gender: "male", name: "Басель", place: "Ирак", note: "Багдадский" },
  { id: "ar-YE-SalehNeural", lang: "ar", gender: "male", name: "Салех", place: "Йемен", note: "Йеменский" },
  { id: "ar-SA-ZariyahNeural", lang: "ar", gender: "female", name: "Зария", place: "Саудия", note: "Хиджаз, спокойный" },
  { id: "ar-EG-SalmaNeural", lang: "ar", gender: "female", name: "Сальма", place: "Египет", note: "Ясный масри" },
  { id: "ar-AE-FatimaNeural", lang: "ar", gender: "female", name: "Фатима", place: "Эмираты", note: "Залив" },
];

export const VOICES_RU: NeuralVoice[] = [
  { id: "ru-RU-DmitryNeural", lang: "ru", gender: "male", name: "Дмитрий", place: "русский", note: "Ровный, для смысла" },
  { id: "ru-RU-SvetlanaNeural", lang: "ru", gender: "female", name: "Светлана", place: "русский", note: "Спокойный" },
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

export function safeVoiceId(id: string | undefined | null, fallback: string): string {
  if (id && EDGE_ID.test(id)) return id;
  return fallback;
}
