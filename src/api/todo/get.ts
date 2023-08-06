import type { Env } from "../..";

export const getTodo = async (env: Env): Promise<Response> => {
  const result = await env.DB
    .prepare("SELECT * FROM todo")
    .all<{ id: number; title: string; list: string }>()
    .catch((e) => `DB Error: ${e.message}`);
  if (typeof result === "string") {
    console.error(result);
    return new Response(JSON.stringify({
      code: 500,
      message: result,
    }));
  } else {
    return new Response(JSON.stringify({
      code: 200,
      message: "",
      data: result.results.map((v) => ({
        ...v,
        list: JSON.parse(v.list),
      })),
    }))
  }
};