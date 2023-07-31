import type { Env } from "../..";

export const getQRCodeJSON = async (env: Env): Promise<{
  code: number;
  message: string;
  data?: {
    url: string;
    qrcode_key: string;
  };
}> => {
  try {
    const resp = await fetch("https://passport.bilibili.com/x/passport-login/web/qrcode/generate", {
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": env.ua,
        Origin: "https://www.bilibili.com",
        Referer: "https://www.bilibili.com/",
      },
    });
    if (resp.status !== 200) throw `reps status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number; // 0 OK
      message: string;
      data: {
        url: string; // qr url
        qrcode_key: string;
      };
    };
    if (resp_json.code !== 0) throw `resp_json code error: (${resp_json.code})${resp_json.message}`;
    return {
      code: 200,
      message: "",
      data: resp_json.data,
    };
  } catch (e) {
    console.error(e);
    return {
      code: 500,
      message: String(e),
    };
  }
};

export default async (env: Env): Promise<Response> => {
  const ret = await getQRCodeJSON(env);
  return new Response(JSON.stringify(ret));
};
