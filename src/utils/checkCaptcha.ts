import type { Env } from "..";

export const checkCaptcha = async (env: Env, request: Request, token: any, action: string): Promise<Response | undefined> => {
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip === null || typeof token !== "string") {
    return new Response(JSON.stringify({
      code: 400,
      message: "参数错误",
    }));
  }

  try {
    const formData = new FormData();
    formData.append("secret", env.captcha_key);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const resp_json = await resp.json() as {
      success: boolean;
      challenge_ts: string;
      "error-codes": string[];
      action: string,
      cdata: string;
    };

    if (resp_json.success && resp_json.action === action) return undefined;
    else return new Response(JSON.stringify({
      code: 400,
      message: `人机验证失败: ${resp_json["error-codes"].join()}`
    }));
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({
      code: 500,
      message: "验证 Captcha Token 时出现错误",
    }));
  }
};
