import type { Env } from "../..";

export const pinDynamic = async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const dynamicID = String(body.dynamicID);
  const action = String(body.action);
  if (!/^\d+$/.test(dynamicID) || (action !== 'add' && action !== 'delete')) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'pin'").bind(action === 'add' ? dynamicID : null).run();
    return new Response(JSON.stringify({
      code: 200,
      message: action === 'add' ? '设置固定动态成功' : '删除固定动态成功',
      data: {
        dynamicID,
      },
    }));
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    return new Response(JSON.stringify({
      code: 200,
      message: `DB Error: ${e.message}`,
    }));
  }
};
