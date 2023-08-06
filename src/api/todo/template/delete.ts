import type { Env } from "../../..";

export const deleteTodoTemplate = async (env: Env, url: URL): Promise<Response> => {
  let id = Number(url.searchParams.get("id") ?? -1);
  if (Number.isNaN(id)) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("DELETE FROM todo_template WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "删除 Todo模板 成功",
    }));
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB Error: ${e.message}`,
    }));
  }
};
