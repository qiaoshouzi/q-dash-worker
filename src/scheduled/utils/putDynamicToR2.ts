import type { Env } from "../..";

/**
 * 写入 raw 到 R2
 */
export default async (env: Env, dynamicID: string, raw: string): Promise<D1PreparedStatement | undefined> => {
  try {
    await env.R2.put(`dynamic/${dynamicID}.json`, raw, {
      customMetadata: {
        contentType: "application/json; charset=utf-8"
      }
    });
    console.log("R2 Success: Put dynamic raw", `dynamicID: ${dynamicID}`);
  } catch (e) {
    console.error("R2 Error: put dynamic raw", `dynamicID: ${dynamicID}`, e);
    return env.DB.prepare("INSERT INTO dynamic (dynamic_id, ts, raw) VALUES (?,?,?)").bind(-1, -1, JSON.stringify({
      type: "SYSTEM_MESSAGE_ERROR",
      ts: Math.floor(Date.now()),
      message: `R2 Error: put dynamic raw, dynamicID: ${dynamicID}, ${String(e)}`,
    }));
  }
};
