import type { Env } from "../..";

export const deleteTodo = async (env: Env, url: URL): Promise<Response> => {
  let id = Number(url.searchParams.get("id") ?? -1);
  if (Number.isNaN(id)) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("DELETE FROM todo WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "删除待办成功",
    }));
  } catch (e: any) {
    return new Response(JSON.stringify({
      code: 500,
      message: `删除待办错误: db throw error: ${e.message}`,
    }));
  }
};
