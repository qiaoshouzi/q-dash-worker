import type { Env } from "../../..";

export const postTodoTemplate = async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const id = body.id ?? -1;
  const title = body.title;
  const list = body.list;
  if (Number.isNaN(Number(id)) || typeof title !== "string" || !Array.isArray(list))
    return new Response(JSON.stringify({
      code: 400,
      message: "参数错误",
    }));

  if (id === -1) {
    // 新建
    try {
      await env.DB.prepare("INSERT INTO todo_template (title, list) VALUES (?, ?)").bind(title, JSON.stringify(list)).run();
      return new Response(JSON.stringify({
        code: 200,
        message: "新建 Todo模板 成功",
      }));
    } catch (e: any) {
      return new Response(JSON.stringify({
        code: 500,
        message: `新建 Todo模板 失败: db throw error: ${e.message}`,
      }));
    }
  } else {
    // 更新
    try {
      await env.DB.prepare("UPDATE todo_template SET title = ?, list = ? WHERE id = ?")
        .bind(title, JSON.stringify(list), id).run();
      return new Response(JSON.stringify({
        code: 200,
        message: "更新 Todo模板 成功",
      }));
    } catch (e: any) {
      return new Response(JSON.stringify({
        code: 500,
        message: `更新 Todo模板 失败: db throw error: ${e.message}`,
      }));
    }
  }
};
