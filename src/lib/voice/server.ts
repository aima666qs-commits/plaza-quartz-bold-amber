import { spawn } from "node:child_process";
import { createServerFn } from "@tanstack/react-start";
import { defaultVoice, safeVoiceId } from "@/lib/voice/catalog.ts";

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
      const buf = await synth(text, lang, gender, rate, voice);
      return { ok: true as const, mime: "audio/mpeg" as const, b64: buf.toString("base64") };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "tts" };
    }
  });
