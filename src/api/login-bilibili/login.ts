import type { Env } from "../..";
import { getQRCodeJSON } from "./get-qrcode";

export const BiliBiliLogin = async (env: Env, url: URL): Promise<Response> => {
  const qrcode_key = url.searchParams.get("qrcode_key");
  if (typeof qrcode_key !== "string" || qrcode_key.length !== 32) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    const resp = await fetch(`https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcode_key}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": env.ua,
        Origin: "https://www.bilibili.com",
        Referer: "https://www.bilibili.com/",
      },
    });
    if (resp.status !== 200) throw `resp status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number; // 0 OK
      message: string;
      data: {
        code: 0 | 86038 | 86090 | 86101; // 0 登录成功 86038 二维码失效 86090 已扫码未确认 86101 未扫码
        message: string;
        url: string;
        refresh_token: string;
        timestamp: number;
      },
    };
    if (resp_json.code !== 0) throw `resp_json code error: (${resp_json.code})${resp_json.message}`;

    console.log(`resp_json.data.code: ${resp_json.data.code}`);
    if (resp_json.data.code === 0) {
      // 登录成功, 保存凭证
      const cookies: string[] = [];
      resp.headers.forEach((value, key) => {
        if (key === "set-cookie") {
          cookies.push(value.split("; ")[0]);
        }
      });
      try {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'bilibili-login'").bind(JSON.stringify({
          ts: resp_json.data.timestamp,
          cookie: cookies.join("; "),
        })).run();
      } catch (e: any) {
        throw `Save bilibili-login Error: DB Error: ${e.message}`;
      }
      return new Response(JSON.stringify({
        code: 200,
        message: "",
        data: resp_json.data,
      }));
    } else if (resp_json.data.code === 86038) {
      // 二维码失效, 重新返回二维码
      const qrcodeReturn = await getQRCodeJSON(env);
      return new Response(JSON.stringify({
        code: 200,
        message: "",
        data: {
          code: 86038,
          message: resp_json.data.message,
          data: qrcodeReturn.data,
        },
      }));
    } else {
      // 已扫码未确认 | 未扫码
      return new Response(JSON.stringify({
        code: 200,
        message: "",
        data: resp_json.data,
      }));
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({
      code: 500,
      message: String(e),
    }));
  }
};
