import type { Env } from "../..";

export const getAnime = async (env: Env): Promise<Response> => {
  const result = await env.DB
    .prepare("SELECT * FROM anime ORDER BY id ASC")
    .all<{ id: number, data: string }>()
    .catch((e) => `DB Error: ${e.message}`);
  if (typeof result === "string") {
    console.error(result);
    return new Response(JSON.stringify({
      code: 500,
      message: result,
    }));
  }

  const animeList: {
    id: number; // 管理 ID
    cover: string; // cover url
    title: string; // 标题
    type: "follow" | "repair" | "want" | "end"; // 追番 补番 想看
    startTime: string | null; // 2023.01.01
    updateTime: string | null; // 五
    ep: number; // 总集数
  }[] = [];
  for (const i of result.results ?? []) {
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
