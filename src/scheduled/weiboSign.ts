import type { Env } from "..";
import { TelegramAPI } from "./utils";

export const signCorns = ["3 1 * * *", "58 1 * * *"];

export const weiboSign = async (controller: ScheduledController, env: Env) => {
  const telegramAPI = new TelegramAPI(env.tg_key);
  const weiboSignConfig_json = await env.DB
    .prepare("SELECT value FROM config WHERE key = 'weibo-sign'")
    .first<{ value: string }>()
    .then((v) => {
      if (v === null) console.error("get config.'weibo-sign' error, result is null");
      else return JSON.parse(v.value) as {
        isSign: boolean;
        nextSignCron: "3 1 * * *" | "58 1 * * *",
        chID: string; // 超话ID
      };
      return v;
    })
    .catch((e) => {
      console.error(`get config.'weibo-sign' error, DB Error: ${e.message}`);
      return null;
    });
  if (weiboSignConfig_json === null) return;

  if (signCorns.indexOf(controller.cron) < signCorns.indexOf(weiboSignConfig_json.nextSignCron)) {
    // 还没到
    return;
  }
  if (
    controller.cron === weiboSignConfig_json.nextSignCron ||
    signCorns.indexOf(controller.cron) > signCorns.indexOf(weiboSignConfig_json.nextSignCron) && !weiboSignConfig_json.isSign
  ) {
    // 到了 | 过了但是没签到
    const weiboCookie = await env.DB
      .prepare("SELECT value FROM config WHERE key = 'weibo-login'")
      .first<{ value: string }>()
      .then((v) => {
        if (v === null) console.error("get config.'weibo-login' error, result is null");
        else return JSON.parse(v.value).cookie as string;
        return v;
      })
      .catch((e) => {
        console.error(`get config.'weibo-login' error, DB Error: ${e.message}`);
        return null;
      });
    if (weiboCookie) {
      const headers = new Headers();
      headers.append("User-Agent", env.ua);
      headers.append("Accept-Encoding", "gzip, deflate, br");
      headers.append("Accept-Language", "zh-CN,zh;q=0.9");
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      headers.append("X-Requested-With", "XMLHttpRequest");
      headers.append("Cookie", weiboCookie);

      try {
        const resp = await fetch(
          `https://weibo.com/p/aj/general/button?ajwvr=6&api=http://i.huati.weibo.com/aj/super/checkin&texta=%E7%AD%BE%E5%88%B0&textb=%E5%B7%B2%E7%AD%BE%E5%88%B0&status=0&id=${weiboSignConfig_json.chID}&location=page_100808_super_index&timezone=GMT+0800&lang=zh-cn&plat=Win32&ua=${encodeURI(env.ua)}&screen=1920*1080&__rnd=${Date.now()}`,
          { headers }
        );
        if (resp.status !== 200) throw `resp.status = ${resp.status}`;
        const resp_json = await resp.json() as {
          code: string | number; // "100000" 签到成功 | 382004 已签到
          msg: string;
        };
        if (resp_json.code === "100000") console.log("签到成功");
        else if (resp_json.code === 382004) console.log("重复签到");
        else throw `签到失败, ${resp_json.code}: ${resp_json.msg}`;

        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'weibo-sign'").bind(JSON.stringify({
          isSign: true,
          nextSignCron: weiboSignConfig_json.nextSignCron,
          chID: weiboSignConfig_json.chID,
        })).run().catch((e) => {
          throw `Update DB Error(signSuccess): ${e.message}`;
        });
      } catch (e: any) {
        console.error(e);
        telegramAPI.sendMessage(env.tg_fatherID, `微博签到失败: ${e}`);
      }
    }
    // 不要 return
  }
  if (controller.cron === signCorns[signCorns.length - 1]) {
    if (!weiboSignConfig_json.isSign) {
      // 签到失败通知
      telegramAPI.sendMessage(env.tg_fatherID, `微博签到失败`);
    }
    // 更新
    await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'weibo-sign'").bind(JSON.stringify({
      isSign: false,
      nextSignCron: signCorns[Math.floor(Math.random() * 4)],
      chID: weiboSignConfig_json.chID,
    })).run().catch((e) => {
      console.error(`Update DB Error(updateData): ${e.message}`);
    });
  }
};
