import { r as createServerFn } from "./ssr.mjs";
import { i as safeVoiceId, r as defaultVoice } from "./catalog-D9Li5LlU.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DOGuMUFX.js
var ELEVEN_MALE = "pNInz6obpgDQGcFmaJgB";
var ELEVEN_FEMALE = "21m00Tcm4TlvDq8ikWAM";
function readEnvMap() {
	try {
		const raw = readFileSync(".env", "utf8");
		const map = {};
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
var blockedKeys = /* @__PURE__ */ new Set();
function elevenKeys() {
	const file = readEnvMap();
	const keys = [];
	for (const name of ["ELEVENLABS_API_KEY", "ELEVENLABS_API_KEY_NEXT"]) {
		const key = file[name] || process.env[name]?.trim() || "";
		if (key && !keys.includes(key) && !blockedKeys.has(key)) keys.push(key);
	}
	return keys;
}
async function synthEleven(text, gender, lang) {
	const keys = elevenKeys();
	if (!keys.length) throw new Error("eleven-off");
	const voice = gender === "female" ? ELEVEN_FEMALE : ELEVEN_MALE;
	let last = "eleven";
	for (const key of keys) {
		const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
			method: "POST",
			headers: {
				"xi-api-key": key,
				"Content-Type": "application/json",
				Accept: "audio/mpeg"
			},
			body: JSON.stringify({
				text,
				model_id: "eleven_multilingual_v2",
				language_code: lang === "ar" ? "ar" : lang === "ru" ? "ru" : void 0,
				voice_settings: {
					stability: .4,
					similarity_boost: .82,
					style: .35,
					use_speaker_boost: true
				}
			})
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
function synth(text, lang, gender, rate, voice) {
	return new Promise((resolve, reject) => {
		const p = spawn("python3", [
			"scripts/speak_male.py",
			lang,
			gender,
			rate,
			voice
		], { cwd: process.cwd() });
		const chunks = [];
		const err = [];
		p.stdout.on("data", (c) => chunks.push(c));
		p.stderr.on("data", (c) => err.push(c));
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
var speakMale_createServerFn_handler = createServerRpc({
	id: "e65b42a77c6a45af9ae12e2154647b3ad5ef2db9414dcd60b75174db8dfdcf0d",
	name: "speakMale",
	filename: "src/lib/voice/server.ts"
}, (opts) => speakMale.__executeServer(opts));
var speakMale = createServerFn({ method: "POST" }).validator((input) => input).handler(speakMale_createServerFn_handler, async ({ data }) => {
	const text = data.text.replace(/\s+/g, " ").trim().slice(0, 700);
	if (!text) return {
		ok: false,
		error: "пусто"
	};
	const lang = (data.lang ?? "ru").slice(0, 2);
	const gender = data.gender === "female" ? "female" : "male";
	const rate = data.rate === "slow" || data.rate === "fast" ? data.rate : "normal";
	const fallback = defaultVoice(lang === "ar" ? "ar" : "ru", gender);
	const voice = safeVoiceId(data.voice, fallback);
	try {
		return {
			ok: true,
			mime: "audio/mpeg",
			b64: (await synthEleven(text, gender, lang).catch(() => synth(text, lang, gender, rate, voice))).toString("base64")
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "tts"
		};
	}
});
//#endregion
export { speakMale_createServerFn_handler };
