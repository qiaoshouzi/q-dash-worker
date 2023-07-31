import type { Env } from "..";

export default async (env: Env): Promise<Response> => {
  const result = (await env.DB.prepare("SELECT * FROM config").all().catch((e) => {
    return {
      success: false,
      error: `DB throw Error: ${e.message}`,
    };
  })) as D1Result<{
    key: string;
    value: string;
  }>;

  if (!result.success) {
    return new Response(JSON.stringify({
      code: 500,
      message: result.error,
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
