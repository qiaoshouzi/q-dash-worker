import type { Env } from "../..";

export default async (env: Env, url: URL): Promise<Response> => {
  const animeID = url.searchParams.get("id");
  if (animeID === null || !/^\d+$/.test(animeID)) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("DELETE FROM anime WHERE id = ?").bind(Number(animeID)).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "",
    }));
  } catch (e: any) {
    console.error(`DB throw Error: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB throw Error: ${e.message}`,
    }));
  }
};
