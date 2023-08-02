import type { Env } from "../..";

export const getTodo = async (env: Env): Promise<Response> => {
  const result = await env.DB.prepare("SELECT * FROM todo").all<{ id: number; title: string; list: string }>().catch((e) => {
    console.error(`get todo error: db throw error: ${e.message}`);
    return {
      success: false,
      error: `get todo error: db throw error: ${e.message}`,
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