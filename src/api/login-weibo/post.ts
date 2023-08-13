import type { Env } from "../..";
import { Cookie } from "../../utils";
import { parseRespBody } from "./parseRespBody";

type CheckQRCodeRespJson = {
  retcode: number;
  msg: string;
  data: {
    alt: string;
  }
};

export const loginWeiboPost = async (env: Env, body: { [key: string]: any }): Promise<Response> => {
  const { qrid, callback } = body as { qrid: string; callback: string };
  if (!/^STK_\d+$/.test(callback)) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  const checkQRCodeResp_json = await (async (): Promise<CheckQRCodeRespJson | Response> => {
    try {
      const resp = await fetch(
        `https://login.sina.com.cn/sso/qrcode/check?entry=weibo&qrid=${qrid}&callback=${callback}`,
        { headers: { Referer: "https://weibo.com", "User-Agent": env.ua } }
      );
      if (resp.status !== 200) throw `resp.status = ${resp.status}`;
      const resp_text = await resp.text();
      const resp_json = parseRespBody<CheckQRCodeRespJson>(resp_text, callback);
      if (!resp_json) throw "解析 resp_text 出现错误";
      else return {
        ...resp_json,
        msg: decodeURI(resp_json.msg),
      };
    } catch (e: any) {
      console.error(`Weibo API Error(checkQRCode): ${e}`);
      return new Response(JSON.stringify({
        code: 500,
        message: `Weibo API Error(checkQRCode): ${e}`,
      }));
    }
  })();
  if (checkQRCodeResp_json instanceof Response) return checkQRCodeResp_json;
  else if (checkQRCodeResp_json.retcode !== 20000000) {
    /**
     * 50114002: 已扫码, 未确定
     * 50114003: 二维码过期
     */
    return new Response(JSON.stringify({
      code: 200,
      message: "",
      data: {
        type: "checkQRCode",
        data: {
          code: checkQRCodeResp_json.retcode,
          message: checkQRCodeResp_json.msg,
        },
      },
    }));
  }

  const ALT = checkQRCodeResp_json.data.alt;

  const crossDomainUrlsResp_json = await (async (): Promise<string[] | Response> => {
    try {
      const resp = await fetch(
        `https://login.sina.com.cn/sso/login.php?entry=weibo&returntype=TEXT&crossdomain=1&cdult=3&domain=weibo.com&alt=${ALT}&savestate=30&callback=${callback}`,
        { headers: { Referer: "https://weibo.com", "User-Agent": env.ua } }
      );
      if (resp.status !== 200) throw `resp.status = ${resp.status}`;
      const resp_text = await resp.text();
      const resp_json = parseRespBody<{
        retcode: string;
        uid: string;
        nick: string; // 用户名
        crossDomainUrlList: string[];
        // reason?: string; // retcode !== "0" 时返回 ""
      }>(resp_text, callback);
      if (!resp_json) throw "解析 resp_text 出现错误";
      if (resp_json.retcode === "0") {
        // 成功
        return resp_json.crossDomainUrlList;
      } else {
        throw `retcode = ${resp_json.retcode}`;
      }
    } catch (e: any) {
      console.error(`Weibo API Error(getCrossDomainUrls): ${e}`);
      return new Response(JSON.stringify({
        code: 500,
        message: `Weibo API Error(getCrossDomainUrls): ${e}`,
      }));
    }
  })();
  if (crossDomainUrlsResp_json instanceof Response) return crossDomainUrlsResp_json;

  const cookie = new Cookie();
  console.log(cookie.cookies);
  for (const url of crossDomainUrlsResp_json) {
    try {
      const resp = await fetch(url, { headers: { Referer: "https://weibo.com", "User-Agent": env.ua } });
      if (resp.status !== 200) throw `resp.status = ${resp.status}`;
      cookie.addHeader(resp.headers, "https://weibo.com", new URL(url).origin);
    } catch (e) {
      console.error(`Weibo API Error(getCookie): ${e}`);
      return new Response(JSON.stringify({
        code: 500,
        message: `Weibo API Error(getCookie): ${e}`,
      }));
    }
  }

  try {
    await env.DB
      .prepare("UPDATE config SET value = ? WHERE key = 'weibo-login'")
      .bind(JSON.stringify({
        ts: Date.now(),
        cookie: cookie.getCookie("weibo.com"),
      }))
      .run();
    return new Response(JSON.stringify({
      code: 200,
      message: "登录成功",
    }));
  } catch (e: any) {
    console.error(`DB Error(saveCookie): ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `DB Error(saveCookie): ${e.message}`,
    }));
  }
};
