import { t as createServerFn } from "./ssr.mjs";
import { i as safeVoiceId, r as defaultVoice } from "./catalog-BXA7W0Vo.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { spawn } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/server-D6YcwJkY.js
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
			b64: (await synth(text, lang, gender, rate, voice)).toString("base64")
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
