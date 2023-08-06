import type { Env } from "../..";
import type { DynamicItem } from "../../scheduled/types/dynamics";

export const getAllDynamic = async (env: Env): Promise<Response> => {
  const result = await env.DB
    .prepare("SELECT * FROM dynamic ORDER BY id DESC")
    .all<{
      id: number;
      dynamicID: string;
      ts: number;
      raw: string;
    }>()
    .catch((e) => `DB Error: ${e.message}`);

  if (typeof result === "string") {
    console.error(result);
    return new Response(JSON.stringify({
      code: 500,
      message: result,
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
    return new Response(JSON.stringify({
      code: 200,
      message: "",
      data: dynamicList,
    }), {
      headers: {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
};
