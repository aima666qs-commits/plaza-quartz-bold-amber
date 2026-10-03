import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ru-GAU6Ylvy.js
var cache = /* @__PURE__ */ new Map();
async function piece(q) {
	const hit = cache.get(q);
	if (hit) return hit;
	const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(q)}`;
	const r = await fetch(url);
	if (!r.ok) throw new Error("translate");
	const text = ((await r.json())[0] ?? []).map((row) => row[0] ?? "").join("").trim();
	if (!text) throw new Error("empty");
	cache.set(q, text);
	return text;
}
function chunks(s) {
	const out = [];
	let rest = s.replace(/\s+/g, " ").trim();
	while (rest.length > 420) {
		const window = rest.slice(0, 420);
		let cut = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
		if (cut < 160) cut = 420;
		out.push(rest.slice(0, cut + 1).trim());
		rest = rest.slice(cut + 1).trim();
	}
	if (rest) out.push(rest);
	return out;
}
var translateEnRu_createServerFn_handler = createServerRpc({
	id: "060fe230db8b8ad17c6b461eb60fac702fb3dbc2fafb70c0bf8da33fb18b7032",
	name: "translateEnRu",
	filename: "src/lib/hadith/ru.ts"
}, (opts) => translateEnRu.__executeServer(opts));
var translateEnRu = createServerFn({ method: "POST" }).validator((input) => input).handler(translateEnRu_createServerFn_handler, async ({ data }) => {
	const text = data.text.replace(/\s+/g, " ").trim().slice(0, 4e3);
	if (!text) return {
		ok: false,
		text: ""
	};
	try {
		const parts = [];
		for (const bit of chunks(text)) parts.push(await piece(bit));
		return {
			ok: true,
			text: parts.join(" ")
		};
	} catch {
		return {
			ok: false,
			text: ""
		};
	}
});
//#endregion
export { translateEnRu_createServerFn_handler };
