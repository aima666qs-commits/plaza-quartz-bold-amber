//#region node_modules/.nitro/vite/services/ssr/assets/catalog-D9Li5LlU.js
var VOICES_AR = [{
	id: "ar-SA-HamedNeural",
	lang: "ar",
	gender: "male",
	name: "Адам",
	place: "мужской",
	note: "Живой голос ElevenLabs, арабский"
}, {
	id: "ar-SA-ZariyahNeural",
	lang: "ar",
	gender: "female",
	name: "Рэйчел",
	place: "женский",
	note: "Один женский голос"
}];
var VOICES_RU = [{
	id: "ru-RU-DmitryNeural",
	lang: "ru",
	gender: "male",
	name: "Адам",
	place: "мужской",
	note: "Живой голос, русский"
}, {
	id: "ru-RU-SvetlanaNeural",
	lang: "ru",
	gender: "female",
	name: "Рэйчел",
	place: "женский",
	note: "Один женский голос"
}];
var DEFAULT_VOICE_AR = "ar-SA-HamedNeural";
var DEFAULT_VOICE_RU = "ru-RU-DmitryNeural";
function defaultVoice(lang, gender) {
	if (lang === "ar") return gender === "female" ? "ar-SA-ZariyahNeural" : DEFAULT_VOICE_AR;
	return gender === "female" ? "ru-RU-SvetlanaNeural" : DEFAULT_VOICE_RU;
}
var EDGE_ID = /^[a-zA-Z]{2}-[a-zA-Z]{2}-[A-Za-z]+Neural$/;
var LIVE = new Set([...VOICES_AR, ...VOICES_RU].map((v) => v.id));
function safeVoiceId(id, fallback) {
	if (id && EDGE_ID.test(id) && LIVE.has(id)) return id;
	return fallback;
}
//#endregion
export { safeVoiceId as i, VOICES_RU as n, defaultVoice as r, VOICES_AR as t };
