import { Env } from "../..";
import { FetchCount, getParams } from "../../utils";
import type { DynamicsAPIResponse } from "../types/dynamics";

/**
 * 从BiliAPI获取动态数据
 */
export default async (
  env: Env,
  fetchCount: FetchCount,
  cookie: string,
  offset?: string | number,
  needError: boolean = false,
): Promise<DynamicsAPIResponse | undefined> => {
  try {
    fetchCount.add();
  } catch (e) {
    if (needError) throw new Error("Fetch Count >= 50");
    return undefined;
  }
  // 请求BAPI
  const resp = await fetch("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?" + getParams({
    timezone_offset: "-480",
    type: "all",
    features: "itemOpusStyle",
    offset,
  }), {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh;q=0.9",
      Origin: "https://t.bilibili.com",
      Referer: "https://t.bilibili.com/",
      "User-Agent": env.ua,
      Cookie: cookie,
    }
  }).catch((e) => {
    console.error("BAPI Error: fetch", `offset: ${offset}`, e);
    if (needError) throw new Error(`BAPI Error: fetch, offset: ${offset}, ${String(e)}`);
    return undefined;
  });
  if (resp === undefined) return;
  // 获取body
  const resp_json = await resp.json().catch((e) => {
    console.error("BAPI Error: json", `offset: ${offset}`, e);
    if (needError) throw new Error(`BAPI Error: json, offset: ${offset}, ${String(e)}`);
    return undefined;
  }) as undefined | DynamicsAPIResponse;
  if (resp_json === undefined) return;
  // 判断code
  if (resp_json.code !== 0) {
    console.error("BAPI Error: code error", `code: ${resp_json.code}`, `message: ${resp_json.message}`, `offset: ${offset}`);
    if (needError) throw new Error(`BAPI Error: code error, code: ${resp_json.code}, message: ${resp_json.message}, offset: ${offset}`);
    return undefined;
  } else {
    console.log("BAPI Success", `code: ${resp_json.code}`, `message: ${resp_json.message}`, `offset: ${offset}`);
    return resp_json;
  }
};
