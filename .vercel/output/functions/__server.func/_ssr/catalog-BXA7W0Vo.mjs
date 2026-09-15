//#region node_modules/.nitro/vite/services/ssr/assets/catalog-BXA7W0Vo.js
var VOICES_AR = [
	{
		id: "ar-SA-HamedNeural",
		lang: "ar",
		gender: "male",
		name: "Хамед",
		place: "Саудия",
		note: "Хиджаз, ближе к тиляве"
	},
	{
		id: "ar-QA-MoazNeural",
		lang: "ar",
		gender: "male",
		name: "Моаз",
		place: "Катар",
		note: "Халиджи, тёплый"
	},
	{
		id: "ar-AE-HamdanNeural",
		lang: "ar",
		gender: "male",
		name: "Хамдан",
		place: "Эмираты",
		note: "Залив, ровный"
	},
	{
		id: "ar-EG-ShakirNeural",
		lang: "ar",
		gender: "male",
		name: "Шакир",
		place: "Египет",
		note: "Ясный масри"
	},
	{
		id: "ar-IQ-BasselNeural",
		lang: "ar",
		gender: "male",
		name: "Басель",
		place: "Ирак",
		note: "Багдадский"
	},
	{
		id: "ar-YE-SalehNeural",
		lang: "ar",
		gender: "male",
		name: "Салех",
		place: "Йемен",
		note: "Йеменский"
	},
	{
		id: "ar-SA-ZariyahNeural",
		lang: "ar",
		gender: "female",
		name: "Зария",
		place: "Саудия",
		note: "Хиджаз, спокойный"
	},
	{
		id: "ar-EG-SalmaNeural",
		lang: "ar",
		gender: "female",
		name: "Сальма",
		place: "Египет",
		note: "Ясный масри"
	},
	{
		id: "ar-AE-FatimaNeural",
		lang: "ar",
		gender: "female",
		name: "Фатима",
		place: "Эмираты",
		note: "Залив"
	}
];
var VOICES_RU = [{
	id: "ru-RU-DmitryNeural",
	lang: "ru",
	gender: "male",
	name: "Дмитрий",
	place: "русский",
	note: "Ровный, для смысла"
}, {
	id: "ru-RU-SvetlanaNeural",
	lang: "ru",
	gender: "female",
	name: "Светлана",
	place: "русский",
	note: "Спокойный"
}];
var DEFAULT_VOICE_AR = "ar-SA-HamedNeural";
var DEFAULT_VOICE_RU = "ru-RU-DmitryNeural";
function defaultVoice(lang, gender) {
	if (lang === "ar") return gender === "female" ? "ar-SA-ZariyahNeural" : DEFAULT_VOICE_AR;
	return gender === "female" ? "ru-RU-SvetlanaNeural" : DEFAULT_VOICE_RU;
}
var EDGE_ID = /^[a-zA-Z]{2}-[a-zA-Z]{2}-[A-Za-z]+Neural$/;
function safeVoiceId(id, fallback) {
	if (id && EDGE_ID.test(id)) return id;
	return fallback;
}
//#endregion
export { safeVoiceId as i, VOICES_RU as n, defaultVoice as r, VOICES_AR as t };
