import type { Env } from "..";

export default async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const status: boolean | undefined = (() => {
    const t = body.status;
    if (t === "true" || t === true) return true;
    else if (t === "false" || t === false) return false;
    else return undefined;
  })();
  if (status === undefined) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'updateSwitch'").bind(String(status)).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "",
    }));
  } catch (e: any) {
    return new Response(JSON.stringify({
      code: 500,
      message: e.message,
    }));
  }
};
