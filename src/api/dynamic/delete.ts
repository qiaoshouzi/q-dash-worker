import { Env } from "../..";

export const deleteDynamic = async (env: Env, url: URL): Promise<Response> => {
  const scope = String(url.searchParams.get("scope") ?? "");
  if (Number.isNaN(Number(scope))) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("DELETE FROM dynamic WHERE ts >= ?").bind(Number(scope)).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "删除成功",
    }));
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB Error: ${e.message}`,
    }));
  }
};
