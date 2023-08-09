import type { Env } from "../../..";
import { checkCaptcha, createToken } from "../../../utils";

export const accessLoginFromGithub = async (env: Env, body: { [key: string]: any }, request: Request): Promise<Response> => {
  const checkCaptchaResp = await checkCaptcha(env, request, body.captchaToken, "Github");
  if (checkCaptchaResp) return checkCaptchaResp;

  const code = body.code;
  if (!code) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  // 获取 accessToken
  const accessToken = await (async (): Promise<string> => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    const resp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: JSON.stringify({
        client_id: "ce4f35536f672153f7aa",
        client_secret: env.github_key,
        code,
      }),
      headers,
    });
    if (resp.status !== 200) throw `resp.status === ${resp.status}: ${await resp.text().catch(() => "null")}`;
    const resp_json = await resp.json() as {
      access_token: string;
    } | {
      error: string;
      error_description: string;
      error_uri: string;
    };
    if ("error" in resp_json) {
      console.error(`Github API Error(accessToken): ${resp_json.error}: ${resp_json.error_description}(${resp_json.error_uri})`);
      throw resp_json.error;
    } else return resp_json.access_token;
  })().catch((e) => new Response(JSON.stringify({
    code: 500,
    message: `Github API Error(accessToken): ${e}`,
  })));
  if (accessToken instanceof Response) return accessToken;

  const userInfo = await (async (): Promise<{
    id: number;
    email: string;
  }> => {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);
    headers.append("Content-Type", "application/json");
    headers.append("User-Agent", "dash.cfm.moe");
    const resp = await fetch("https://api.github.com/user", { headers });
    if (resp.status !== 200) throw `resp.status === ${resp.status}: ${await resp.text().catch(() => "null")}`;
    const resp_json = await resp.json() as {
      id: number;
      email: string;
    };
    return resp_json;
  })().catch((e) => new Response(JSON.stringify({
    code: 500,
    message: `Github API Error(getUserInfo): ${e}`,
  })));
  if (userInfo instanceof Response) return userInfo;
  if (userInfo.id === 61568944 && userInfo.email === "qiaoshouzi@cfm.moe") {
    const SESSDATA = await createToken(env, { userName: "qiaoshouzi" });
    const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    const headers = new Headers();
    headers.append("Set-Cookie", `SESSDATA=${SESSDATA}; expires=${expires}; domain=api-dash.cfm.moe; path=/; HttpOnly; Secure; SameSite=None`)
    return new Response(JSON.stringify({
      code: 200,
      message: "登陆成功",
    }), { headers });
  } else {
    return new Response(null, { status: 403 });
  }
};
