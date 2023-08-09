import type { Env } from "../../..";

export const editAuthenticatorName = async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const { id, name } = body;

  try {
    await env.DB.prepare("UPDATE login SET name = ? WHERE id = ?").bind(name, id).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "编辑成功",
    }));
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB Error: ${e.message}`,
    }));
  }
};
