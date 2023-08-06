import type { Env } from "../..";

export const postTodo = async (env: Env, body: { [key: string]: any }): Promise<Response> => {
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
      await env.DB.prepare("INSERT INTO todo (title, list) VALUES (?, ?)").bind(title, JSON.stringify(list)).run();
      return new Response(JSON.stringify({
        code: 200,
        message: "新建待办成功",
      }));
    } catch (e: any) {
      console.error(`DB Error: ${e.message}`);
      return new Response(JSON.stringify({
        code: 500,
        message: `DB Error: ${e.message}`,
      }));
    }
  } else {
    // 更新
    try {
      await env.DB.prepare("UPDATE todo SET title = ?, list = ? WHERE id = ?").bind(title, JSON.stringify(list), id).run();
      return new Response(JSON.stringify({
        code: 200,
        message: "更新待办成功",
      }));
    } catch (e: any) {
      console.error(`DB Error: ${e.message}`);
      return new Response(JSON.stringify({
        code: 500,
        message: `DB Error: ${e.message}`,
      }));
    }
  }
};
