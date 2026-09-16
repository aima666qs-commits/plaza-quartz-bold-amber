import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const pullStudy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const clock = await sql<{ study_ms: number }>`select study_ms from study_clock where user_id = ${context.userId}`;
    const mem = await sql<{ id: number; body: string; created_at: string }>`
      select id, body, created_at from study_memory where user_id = ${context.userId} order by created_at desc limit 40
    `;
    const progress = await sql<{ lane: string; payload: string }>`
      select lane, payload::text as payload from study_progress where user_id = ${context.userId}
    `;
    return { studyMs: clock[0]?.study_ms ?? 0, memories: mem, progress };
  });

export const pushStudyMs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { studyMs: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const ms = Math.max(0, Math.min(data.studyMs, 1e12));
    await sql`
      insert into study_clock (user_id, study_ms, updated_at)
      values (${context.userId}, ${ms}, now())
      on conflict (user_id) do update set study_ms = greatest(study_clock.study_ms, excluded.study_ms), updated_at = now()
    `;
    return { ok: true as const };
  });

export const addMemory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { body: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 2000);
    if (!body) return { ok: false as const };
    const sql = await getSql();
    await sql`insert into study_memory (user_id, body) values (${context.userId}, ${body})`;
    return { ok: true as const };
  });

export const pushProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { lane: string; payload: string }) => input)
  .handler(async ({ context, data }) => {
    const lane = data.lane.trim().slice(0, 40) || "none";
    const payload = data.payload.slice(0, 20000);
    try {
      JSON.parse(payload);
    } catch {
      return { ok: false as const };
    }
    const sql = await getSql();
    await sql.query(
      `insert into study_progress (user_id, lane, payload, updated_at)
       values ($1, $2, $3::jsonb, now())
       on conflict (user_id, lane) do update set payload = excluded.payload, updated_at = now()`,
      [context.userId, lane, payload],
    );
    return { ok: true as const };
  });

export const dumpStudy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const clock = await sql<{ study_ms: number; updated_at: string }>`select study_ms, updated_at from study_clock where user_id = ${context.userId}`;
    const mem = await sql<{ body: string; created_at: string }>`select body, created_at from study_memory where user_id = ${context.userId} order by created_at`;
    const progress = await sql<{ lane: string; payload: string }>`select lane, payload::text as payload from study_progress where user_id = ${context.userId}`;
    return {
      userId: context.userId,
      savedAt: new Date().toISOString(),
      clock: clock[0] ?? null,
      memories: mem,
      progress,
    };
  });
