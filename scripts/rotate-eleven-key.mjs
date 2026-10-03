#!/usr/bin/env node
/**
 * Проверка и переключение ключа ElevenLabs.
 *
 *   node scripts/rotate-eleven-key.mjs
 *
 * В .env две строки:
 *   ELEVENLABS_API_KEY=текущий
 *   ELEVENLABS_API_KEY_NEXT=запасной
 *
 * Текущий жив — файл не трогаем.
 * Текущий мёртв (401/403), запасной жив — запасной становится текущим, слот NEXT пустеет.
 * Личный ключ сам скрипт не создаёт: новый выпускается в кабинете ElevenLabs.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env");
const VOICE = "pNInz6obpgDQGcFmaJgB";

export function parseEnv(text) {
  const map = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf("=");
    if (i <= 0 || line.startsWith("#")) continue;
    map[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return map;
}

export function upsertEnv(text, updates) {
  const lines = text.split("\n");
  const seen = new Set();
  const next = lines.map((line) => {
    const i = line.indexOf("=");
    if (i <= 0 || line.startsWith("#")) return line;
    const name = line.slice(0, i).trim();
    if (!Object.prototype.hasOwnProperty.call(updates, name)) return line;
    seen.add(name);
    return `${name}=${updates[name]}`;
  });
  for (const [name, value] of Object.entries(updates)) {
    if (!seen.has(name)) next.push(`${name}=${value}`);
  }
  return `${next.filter((line, i) => line !== "" || i < next.length - 1).join("\n").replace(/\n+$/, "")}\n`;
}

export function planRotation({ primary, next, primaryStatus, nextStatus }) {
  if (!primary) return { action: "none", reason: "no-primary", exit: 2 };
  if (primaryStatus === "ok") return { action: "keep", reason: "primary-ok", exit: 0 };
  const spare = next && next !== primary ? next : "";
  if (primaryStatus === "dead" && spare && nextStatus === "ok") return { action: "promote", reason: "primary-dead", exit: 0 };
  if (primaryStatus === "dead" && !spare) return { action: "none", reason: "need-next", exit: 2 };
  if (primaryStatus === "dead") return { action: "none", reason: "both-dead", exit: 1 };
  return { action: "none", reason: "primary-unstable", exit: 3 };
}

function tail(key) {
  return key ? `…${key.slice(-4)}` : "нет";
}

async function probe(key) {
  if (!key) return "missing";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: "а",
      model_id: "eleven_multilingual_v2",
      language_code: "ru",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
  });
  if (res.status === 401 || res.status === 403) return "dead";
  if (!res.ok) return "unstable";
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > 200 ? "ok" : "unstable";
}

function writeEnv(text) {
  const tmp = `${ENV_PATH}.tmp`;
  writeFileSync(tmp, text, { mode: 0o600 });
  renameSync(tmp, ENV_PATH);
}

export async function rotateKeys({ envText, probeKey }) {
  const env = parseEnv(envText);
  const primary = env.ELEVENLABS_API_KEY || "";
  const next = env.ELEVENLABS_API_KEY_NEXT || "";
  const primaryStatus = await probeKey(primary);
  let nextStatus = "missing";
  if (primaryStatus !== "ok" && next && next !== primary) nextStatus = await probeKey(next);
  const plan = planRotation({ primary, next, primaryStatus, nextStatus });
  if (plan.action === "promote") {
    return {
      ...plan,
      envText: upsertEnv(envText, { ELEVENLABS_API_KEY: next, ELEVENLABS_API_KEY_NEXT: "" }),
      primary: tail(next),
      next: "пусто",
    };
  }
  const withSlot = envText.includes("ELEVENLABS_API_KEY_NEXT=")
    ? envText
    : upsertEnv(envText, { ELEVENLABS_API_KEY_NEXT: "" });
  return { ...plan, envText: withSlot, changed: withSlot !== envText, primary: tail(primary), next: next ? tail(next) : "пусто" };
}

async function main() {
  let raw = "";
  try {
    raw = readFileSync(ENV_PATH, "utf8");
  } catch {
    console.error("Нет файла .env");
    process.exit(2);
  }
  const result = await rotateKeys({ envText: raw, probeKey: probe });
  if (result.action === "promote" || result.changed) writeEnv(result.envText);
  if (result.action === "promote") console.log(`Переключил на запасной ключ ${result.primary}. Старый слот пуст.`);
  else if (result.reason === "primary-ok") console.log(`Текущий ключ жив ${result.primary}. Запасной: ${result.next}.`);
  else if (result.reason === "need-next") console.error("Текущий ключ молчит. Положи новый в ELEVENLABS_API_KEY_NEXT и запусти скрипт снова.");
  else if (result.reason === "both-dead") console.error("Оба ключа молчат. Нужен новый ключ с правом Text to Speech.");
  else console.error(`Ключ не сменён: ${result.reason}.`);
  process.exit(result.exit);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : "rotate");
    process.exit(1);
  });
}
