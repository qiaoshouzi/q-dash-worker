import type { Env } from "../..";

export default async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const coverData = body.cover;
  const data = body.data;
  const data_json = (() => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return undefined;
    }
  })() as {
    id: number; // -1 新建 Other 编辑
    title: string; // 标题
    type: "follow" | "repair" | "want"; // 追番 补番 想看
    startTime: string | null; // 2023.01.01
    updateTime: string | null; // 五
    ep: number; // 总集数
  };
  if (
    !(coverData instanceof File || coverData.startsWith("https://")) ||
    data_json === undefined
  ) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  const coverUrl = await (async () => {
    if (typeof coverData === "string") return coverData;
    const coverData_arrayBuffer = await coverData.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest("SHA-256", coverData_arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const coverKey = `animeCover/${hashHex}`;
    try {
      await env.R2.put(coverKey, coverData_arrayBuffer);
      return `https://assets-dash.cfm.moe/${coverKey}`;
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({
        code: 500,
        message: `上传图片时出现错误: ${String(e)}`,
      }));
    }
  })();
  if (coverUrl instanceof Response) return coverUrl;

  try {
    const newData = JSON.stringify({
      cover: coverUrl,
      title: data_json.title,
      type: data_json.type,
      startTime: data_json.startTime,
      updateTime: data_json.updateTime,
      ep: data_json.ep,
    });
    if (data_json.id === -1)
      await env.DB.prepare(`INSERT INTO anime (data) VALUES (?)`).bind(newData).run();
    else
      await env.DB.prepare(`UPDATE anime SET data = ? WHERE id = ?`).bind(newData, data_json.id).run();
    return new Response(JSON.stringify({
      code: 200,
      message: "",
    }));
  } catch (e: any) {
    return new Response(JSON.stringify({
      code: 500,
      message: `DB throw Error: ${e.message}`,
    }));
  }
};
