import type { Env } from "..";
import type { DynamicItem } from "../scheduled/types/dynamics";

export default async (env: Env): Promise<Response> => {
  try {
    const result = await env.DB.prepare("SELECT * FROM dynamic ORDER BY id DESC;").all<{
      id: number;
      dynamicID: string;
      ts: number;
      raw: string;
    }>();
    if (!result.success) {
      console.error("DB Error: get dynamic, success false, message: ", result.error);
      return new Response(JSON.stringify({
        code: 500,
        message: `DB Error: get dynamic, success false, message: ${result.error}`,
      }));
    } else {
      console.log(`get ${result.results?.length} dynamic`);
      const dynamicList = result.results?.map((item): [string, DynamicItem?] => {
        if (item.raw) {
          return [item.dynamicID, JSON.parse(item.raw)];
        } else {
          return [item.dynamicID];
        }
      });
      const resp = new Response(JSON.stringify({
        code: 200,
        message: "OK",
        data: dynamicList,
      }), {
        headers: {
          "Content-Encoding": "gzip",
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
      return resp;
    }
  } catch (e: any) {
    console.error("DB Error: get dynamic, message: ", e.message);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB Error: get dynamic, message: ${e.message}`,
    }));
  }
};
