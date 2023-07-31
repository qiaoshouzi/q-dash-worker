import { Env } from "../..";
import { FetchCount } from "../../utils";

/**
 * 将 *.hdslb.com 下的资源保存到 R2 中并返回 assets.bili-dyn.cfm.moe 下的资源url
 */
export default async (env: Env, cookie: string, url: string, fetchCount: FetchCount): Promise<string | undefined> => {
  // http://hdslb.com/xxx -> https://hdslb.com/xxx
  if (!url.startsWith("https://")) url = url.replace("http://", "https://");
  const newUrl = (() => {
    if (url.startsWith("//")) {
      // //hdslb.com/xxx -> https://hdslb.com/xxx
      return `https:${url}`;
    }
    return url;
  })();

  const newUrlArray = new TextEncoder().encode(newUrl);
  const newUrlHashBuffer = await crypto.subtle.digest("SHA-256", newUrlArray);
  const newUrlHashArray = Array.from(new Uint8Array(newUrlHashBuffer));
  const newUrlHashHex = newUrlHashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const path = `assets/${newUrlHashHex}`;
  const replaceUrl = url.replace(/\/\/.*\.?hdslb\.com\/.+$/, `//assets-dash.cfm.moe/${path}`);

  // 校验是否已经下载
  if (await env.R2.head(path) !== null) return replaceUrl;
  else {
    try {
      fetchCount.add();
    } catch (e) {
      return;
    }
  }

  // 下载资源
  const resp = await fetch(newUrl, {
    headers: {
      Referer: "https://t.bilibili.com/",
      "User-Agent": env.ua,
      Cookie: cookie,
    },
  }).then((resp) => {
    if (resp.status !== 200) {
      console.error(
        "Assets Error: fetch response.status !== 200",
        `url: ${url} | ${newUrl}`,
        `status: ${resp.status}`,
        `statusText: ${resp.statusText}`
      );
      return null;
    }
    else return resp.body;
  }).catch((e) => {
    console.error("Assets Error: fetch", `url: ${url} | ${newUrl}`, e);
    return null;
  });
  if (resp === null) return;

  try {
    await env.R2.put(path, resp);
  } catch (e) {
    console.error("Assets Error: put", `url: ${url} | ${newUrl}`, e);
  }

  return replaceUrl;
};
