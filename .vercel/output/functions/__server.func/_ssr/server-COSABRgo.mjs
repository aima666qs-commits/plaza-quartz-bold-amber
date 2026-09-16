import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DWLuC8e1.mjs";
import { t as authMiddleware } from "./middleware-CyVD-EzA.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-COSABRgo.js
var pullStudy_createServerFn_handler = createServerRpc({
	id: "632e6b3574baf124d217555a917cdeb5629e78482b89d6c7db7c3418438d4ff4",
	name: "pullStudy",
	filename: "src/lib/study/server.ts"
}, (opts) => pullStudy.__executeServer(opts));
var pullStudy = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(pullStudy_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const clock = await sql`select study_ms from study_clock where user_id = ${context.userId}`;
	const mem = await sql`
      select id, body, created_at from study_memory where user_id = ${context.userId} order by created_at desc limit 40
    `;
	const progress = await sql`
      select lane, payload::text as payload from study_progress where user_id = ${context.userId}
    `;
	return {
		studyMs: clock[0]?.study_ms ?? 0,
		memories: mem,
		progress
	};
});
var pushStudyMs_createServerFn_handler = createServerRpc({
	id: "13fe003aadd8fd4d8a8764d84bfb5d4785cc6dfff0b2a3c91500b7839edf93a8",
	name: "pushStudyMs",
	filename: "src/lib/study/server.ts"
}, (opts) => pushStudyMs.__executeServer(opts));
var pushStudyMs = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(pushStudyMs_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const ms = Math.max(0, Math.min(data.studyMs, 0xe8d4a51000));
	await sql`
      insert into study_clock (user_id, study_ms, updated_at)
      values (${context.userId}, ${ms}, now())
      on conflict (user_id) do update set study_ms = greatest(study_clock.study_ms, excluded.study_ms), updated_at = now()
    `;
	return { ok: true };
});
var addMemory_createServerFn_handler = createServerRpc({
	id: "5b10fd58501f96779c0fd12f08dcd0dfcc347317a52ad23e89b6abb45165bd65",
	name: "addMemory",
	filename: "src/lib/study/server.ts"
}, (opts) => addMemory.__executeServer(opts));
var addMemory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addMemory_createServerFn_handler, async ({ context, data }) => {
	const body = data.body.trim().slice(0, 2e3);
	if (!body) return { ok: false };
	await (await getSql())`insert into study_memory (user_id, body) values (${context.userId}, ${body})`;
	return { ok: true };
});
var pushProgress_createServerFn_handler = createServerRpc({
	id: "2e220885203c181624c99621ca46915e434842c25103a3f7091e3e83dd1210d3",
	name: "pushProgress",
	filename: "src/lib/study/server.ts"
}, (opts) => pushProgress.__executeServer(opts));
var pushProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(pushProgress_createServerFn_handler, async ({ context, data }) => {
	const lane = data.lane.trim().slice(0, 40) || "none";
	const payload = data.payload.slice(0, 2e4);
	try {
		JSON.parse(payload);
	} catch {
		return { ok: false };
	}
	await (await getSql()).query(`insert into study_progress (user_id, lane, payload, updated_at)
       values ($1, $2, $3::jsonb, now())
       on conflict (user_id, lane) do update set payload = excluded.payload, updated_at = now()`, [
		context.userId,
		lane,
		payload
	]);
	return { ok: true };
});
var dumpStudy_createServerFn_handler = createServerRpc({
	id: "6bbe3ef2221119cd0ae0c4dd6679ff612ee071912de4f964be7359e16ed43bbb",
	name: "dumpStudy",
	filename: "src/lib/study/server.ts"
}, (opts) => dumpStudy.__executeServer(opts));
var dumpStudy = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(dumpStudy_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const clock = await sql`select study_ms, updated_at from study_clock where user_id = ${context.userId}`;
	const mem = await sql`select body, created_at from study_memory where user_id = ${context.userId} order by created_at`;
	const progress = await sql`select lane, payload::text as payload from study_progress where user_id = ${context.userId}`;
	return {
		userId: context.userId,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		clock: clock[0] ?? null,
		memories: mem,
		progress
	};
});
//#endregion
export { addMemory_createServerFn_handler, dumpStudy_createServerFn_handler, pullStudy_createServerFn_handler, pushProgress_createServerFn_handler, pushStudyMs_createServerFn_handler };
