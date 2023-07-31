import type { Env } from "../..";

export default async (env: Env): Promise<Response> => {
  const result = await (async () => {
    let errorMessage = "";
    try {
      const result = await env.DB
        .prepare("SELECT * FROM anime ORDER BY id ASC")
        .all<{ id: number, data: string }>();
      if (!result.success) errorMessage = `result.success === false, ${result.error}`;
      return result.results;
    } catch (e: any) {
      errorMessage = `DB throw Error: SELECT anime data, ${e.message}`;
    }
    console.error(errorMessage);
    return false;
  })();
  if (result === false) return new Response(JSON.stringify({
    code: 500,
    message: "从数据库获取数据出现错误",
  }));

  const animeList: {
    id: number; // 管理 ID
    cover: string; // cover url
    title: string; // 标题
    type: "follow" | "repair" | "want"; // 追番 补番 想看
    startTime: string | null; // 2023.01.01
    updateTime: string | null; // 五
    ep: number; // 总集数
  }[] = [];
  for (const i of result ?? []) {
    animeList.push({
      id: i.id,
      ...JSON.parse(i.data),
    });
  }

  return new Response(JSON.stringify({
    code: 200,
    message: "",
    data: animeList,
  }));
};
