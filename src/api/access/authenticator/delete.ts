import type { Env } from "../../..";

export const deleteAuthenticator = async (env: Env, url: URL): Promise<Response> => {
  const id = url.searchParams.get("id");

  try {
    await env.DB.prepare("DELETE FROM login WHERE id = ?").bind(id).run();
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
