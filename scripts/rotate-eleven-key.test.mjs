import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEnv, planRotation, rotateKeys, upsertEnv } from "./rotate-eleven-key.mjs";

test("keeps a living primary and adds an empty spare slot", async () => {
  const result = await rotateKeys({
    envText: "ELEVENLABS_API_KEY=sk_primary\n",
    probeKey: async () => "ok",
  });
  assert.equal(result.action, "keep");
  assert.equal(result.exit, 0);
  assert.match(result.envText, /ELEVENLABS_API_KEY=sk_primary/);
  assert.match(result.envText, /ELEVENLABS_API_KEY_NEXT=$/m);
});

test("promotes the spare key when the primary is dead", async () => {
  const result = await rotateKeys({
    envText: "ELEVENLABS_API_KEY=sk_old\nELEVENLABS_API_KEY_NEXT=sk_new\n",
    probeKey: async (key) => (key === "sk_new" ? "ok" : "dead"),
  });
  assert.equal(result.action, "promote");
  const env = parseEnv(result.envText);
  assert.equal(env.ELEVENLABS_API_KEY, "sk_new");
  assert.equal(env.ELEVENLABS_API_KEY_NEXT, "");
});

test("does not rotate when the primary is only unstable", () => {
  const plan = planRotation({ primary: "a", next: "b", primaryStatus: "unstable", nextStatus: "ok" });
  assert.equal(plan.action, "none");
  assert.equal(plan.exit, 3);
});

test("upsert keeps unrelated lines", () => {
  const text = upsertEnv("OTHER=1\nELEVENLABS_API_KEY=old\n", { ELEVENLABS_API_KEY: "new", ELEVENLABS_API_KEY_NEXT: "" });
  assert.match(text, /^OTHER=1/m);
  assert.match(text, /ELEVENLABS_API_KEY=new/);
});
