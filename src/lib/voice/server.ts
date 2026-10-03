import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServerFn } from "@tanstack/react-start";
import { defaultVoice, safeVoiceId } from "@/lib/voice/catalog.ts";

const ELEVEN_MALE = "pNInz6obpgDQGcFmaJgB";
const ELEVEN_FEMALE = "21m00Tcm4TlvDq8ikWAM";

function readEnvMap(): Record<string, string> {
  try {
    const raw = readFileSync(".env", "utf8");
    const map: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const i = line.indexOf("=");
      if (i <= 0 || line.startsWith("#")) continue;
      map[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return map;
  } catch {
    return {};
  }
}

const blockedKeys = new Set<string>();

function elevenKeys(): string[] {
  const file = readEnvMap();
  const keys: string[] = [];
  for (const name of ["ELEVENLABS_API_KEY", "ELEVENLABS_API_KEY_NEXT"]) {
    const key = file[name] || process.env[name]?.trim() || "";
    if (key && !keys.includes(key) && !blockedKeys.has(key)) keys.push(key);
  }
  return keys;
}

async function synthEleven(text: string, gender: string, lang: string): Promise<Buffer> {
  const keys = elevenKeys();
  if (!keys.length) throw new Error("eleven-off");
  const voice = gender === "female" ? ELEVEN_FEMALE : ELEVEN_MALE;
  let last = "eleven";
  for (const key of keys) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: lang === "ar" ? "ar" : lang === "ru" ? "ru" : undefined,
        voice_settings: { stability: 0.4, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
      }),
    });
    if (res.status === 401 || res.status === 403) {
      blockedKeys.add(key);
      last = "eleven-auth";
      continue;
    }
    if (!res.ok) {
      last = "eleven";
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 200) return buf;
    last = "eleven-empty";
  }
  throw new Error(last);
}

function synth(text: string, lang: string, gender: string, rate: string, voice: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const p = spawn("python3", ["scripts/speak_male.py", lang, gender, rate, voice], { cwd: process.cwd() });
    const chunks: Buffer[] = [];
    const err: Buffer[] = [];
    p.stdout.on("data", (c: Buffer) => chunks.push(c));
    p.stderr.on("data", (c: Buffer) => err.push(c));
    p.on("error", reject);
    p.on("close", (code) => {
      const audio = Buffer.concat(chunks);
      if (code === 0 && audio.length > 200) resolve(audio);
      else reject(new Error(Buffer.concat(err).toString() || "tts"));
    });
    p.stdin.write(text);
    p.stdin.end();
  });
}

export const speakMale = createServerFn({ method: "POST" })
  .validator((input: { text: string; lang?: string; gender?: string; rate?: string; voice?: string }) => input)
  .handler(async ({ data }) => {
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, 700);
    if (!text) return { ok: false as const, error: "пусто" };
    const lang = (data.lang ?? "ru").slice(0, 2);
    const gender = data.gender === "female" ? "female" : "male";
    const rate = data.rate === "slow" || data.rate === "fast" ? data.rate : "normal";
    const fallback = defaultVoice(lang === "ar" ? "ar" : "ru", gender);
    const voice = safeVoiceId(data.voice, fallback);
    try {
      const buf = await synthEleven(text, gender, lang).catch(() => synth(text, lang, gender, rate, voice));
      return { ok: true as const, mime: "audio/mpeg" as const, b64: buf.toString("base64") };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "tts" };
    }
  });
