import type { Env } from "../env.js";

/**
 * Where a story's text lives now.
 *
 * D1 hit its 500 MB ceiling and stopped accepting writes — admin logins
 * included — with `stories` holding 84.9 MB of it, 37 KB to a row. Bodies that
 * size are files, so they went to R2 and D1 kept the key, the same shape the
 * audio, the PDF and the artwork already use.
 *
 * Reading is therefore two-sourced, and stays that way on purpose:
 *
 *  · `body_r2_key` set  → the text is in R2;
 *  · otherwise          → it is still in the `body` column.
 *
 * The fallback is not a transitional nicety. A story whose upload failed, or
 * one written before the mover ran, must still be readable — the alternative
 * is a blank page where a kisah used to be. The mover only ever clears `body`
 * AFTER the object is confirmed in R2, so at no point is a story's text in
 * neither place.
 */
/** The only shape a story-body key may have. Mirrors storyBodyKey below. */
const STORY_BODY_KEY = /^stories\/body\/\d+\.md$/;

export async function readStoryBody(
  env: Env,
  story: { body?: string | null; body_r2_key?: string | null }
): Promise<string> {
  const key = story.body_r2_key;
  // The key comes out of the database, and a database value is not a safe
  // path. Anything that could write a row — a compromised admin, a bad
  // migration, a bug in the mover — could otherwise point this at any object
  // in the bucket, and the Worker would fetch it and serve it as a kisah.
  // Only the exact shape the mover writes is honoured; anything else falls
  // through to the column, which is the safe direction.
  if (key && STORY_BODY_KEY.test(key)) {
    try {
      const obj = await env.MEDIA_R2.get(key);
      if (obj) return await obj.text();
      console.error(`story body missing from R2: ${key}`);
    } catch (e) {
      console.error(`story body unreadable from R2: ${key}`, e);
    }
    // Fall through: whatever is still in the column beats an empty page.
  } else if (key) {
    console.error(`refusing an unexpected story body key: ${JSON.stringify(key)}`);
  }
  return story.body ?? "";
}

/** Where a story's body is kept in R2. Stable, derived from the id, so the
 *  mover is idempotent and a re-run overwrites rather than duplicating. */
export function storyBodyKey(id: number): string {
  return `stories/body/${id}.md`;
}
