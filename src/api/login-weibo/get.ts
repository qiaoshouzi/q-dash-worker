import type { Env } from "../..";
import { parseRespBody } from "./parseRespBody";

export const loginWeiboGet = async (env: Env): Promise<Response> => {
  const callback = `STK_${Date.now() * 100}`;

  try {
    const resp = await fetch(
      `https://login.sina.com.cn/sso/qrcode/image?entry=weibo&size=300&callback=${callback}`,
      { headers: { Referer: "https://weibo.com", "User-Agent": env.ua } }
    );
    if (resp.status !== 200) throw `resp.status === ${resp.status}(${resp.statusText})`;
    const resp_text = await resp.text();
    const resp_json = parseRespBody<{
      retcode: number;
      msg: string;
      data: {
        qrid: string;
        image: string;
      };
    }>(resp_text, callback);
    if (resp_json === null) throw "解析 resp_text 出现错误";
    else if (resp_json.retcode !== 20000000) throw `${resp_json.retcode}: ${resp_json.msg}`;
    else return new Response(JSON.stringify({
      code: 200,
      message: "获取二维码成功",
      data: resp_json.data,
    }));
  } catch (e: any) {
    console.error(`Weibo API Error: ${e}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `Weibo API Error: ${e}`,
    }));
  }
};
