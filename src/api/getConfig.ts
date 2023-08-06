import type { Env } from "..";

export const getConfig = async (env: Env): Promise<Response> => {
  const result = await env.DB.prepare("SELECT * FROM config").all<{
    key: string;
    value: string;
  }>().catch((e: any) => {
    return `DB Error: ${e.message}`;
  });

  if (typeof result === "string") {
    console.error(result);
    return new Response(JSON.stringify({
      code: 500,
      message: result,
    }));
  } else {
    const data: { [key: string]: string } = {};
    for (const i of result.results ?? []) {
      data[i.key] = i.value;
    }
    return new Response(JSON.stringify({
      code: 200,
      message: "",
      data: data,
    }));
  }
};
