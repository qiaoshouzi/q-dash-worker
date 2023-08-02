import type { Env } from "../../..";

export const getTodoTemplate = async (env: Env): Promise<Response> => {
  const result = await env.DB.prepare("SELECT * FROM todo_template")
    .all<{ id: number; title: string; list: string }>().catch((e) => {
      console.error(`获取 Todo Template 错误: db throw error: ${e.message}`);
      return {
        success: false,
        error: `获取 Todo Template 错误: db throw error: ${e.message}`,
      } as {
        success: false;
        error: string;
      };
    });
  if (result.success === false) {
    return new Response(JSON.stringify({
      code: 500,
      message: result.error,
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