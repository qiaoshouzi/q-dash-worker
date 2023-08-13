import { Env } from "..";
import { FetchCount } from "../utils";
import type { DynamicItem } from "./types/dynamics";
import { addAssets, getAssets } from "./utils";

/**
 * 执行递归任务
 */
export default async (env: Env, cookie: string, fetchCount: FetchCount) => {
  while (true) {
    if (!fetchCount.check()) break;
    let tasks: string[] = [];
    const result = await env.DB.prepare("SELECT * FROM task ORDER BY id ASC LIMIT 1").first<{
      id: number;
      list: string;
    } | null>().catch((e) => null); // 获取任务
    if (result === null) break;
    tasks = JSON.parse(result.list);
    const taskID = result.id;
    console.log(`Get ${tasks.length} Tasks`, tasks);

    for (const dynamicID of tasks) {
      if (!fetchCount.check()) break;
      const result = await env.DB.prepare("SELECT * FROM dynamic WHERE dynamicID = ?").bind(dynamicID).first<{
        id: number;
        dynamicID: string;
        ts: number;
        raw: string | null;
      } | null>().catch((e): false => {
        console.error(`DB Error: SELECT task ${dynamicID}, ${e.message}`);
        return false;
      }); // 从数据库获取动态信息
      if (result === false) continue;
      else if (result) {
        const rawInfo = await (async (): Promise<{
          raw: string;
          item: DynamicItem;
          on: "db" | "r2";
        } | undefined> => {
          if (result.raw !== null) return {
            raw: result.raw,
            item: JSON.parse(result.raw),
            on: "db",
          };
          else {
            try {
              const result = await env.R2.get(`dynamic/${dynamicID}.json`);
              if (result) {
                const item = await result.json() as DynamicItem;
                return {
                  raw: JSON.stringify(item),
                  item,
                  on: "r2",
                };
              }
              else {
                console.error(`R2 Error: get dynamic ${dynamicID} raw, result is null`);
                return undefined;
              }
            } catch (e) {
              console.error(`R2 Error: get dynamic ${dynamicID} raw`, e);
              return undefined;
            }
          }
        })();
        if (rawInfo === undefined) continue;
        const { raw, item, on: rawOn } = rawInfo;
        console.log(`get dynamic ${dynamicID} raw success`);

        let newRaw: string = raw;
        const assetsList = getAssets(item);
        console.log(`dynamic ${dynamicID} has ${assetsList.length} assets need to archive`, assetsList);
        for (const value of assetsList) {
          if (!fetchCount.check()) break;
          const url = await addAssets(env, cookie, value, fetchCount);
          if (url) {
            // 替换资源
            newRaw = newRaw.replace(new RegExp(`"${value}"`, "g"), `"${url}"`);
            console.log(`assets ${value} => ${url}`);
          }
        }

        // 更新raw
        if (rawOn === "db") {
          // 更新数据库
          await env.DB.prepare("UPDATE dynamic SET raw = ? WHERE dynamicID = ?").bind(newRaw, dynamicID).run().catch((e) => { });
        } else {
          // 更新R2
          await env.R2.put(`dynamic/${dynamicID}.json`, newRaw).catch((e) => { });
        }
        console.log(`dynamic ${dynamicID} update success, rawOn: ${rawOn}`);
      }

      // 删除任务
      if (fetchCount.check()) {
        tasks = tasks.filter((v) => v !== dynamicID);
        if (tasks.length === 0) {
          await env.DB.prepare("DELETE FROM task WHERE id = ?")
            .bind(taskID).run()
            .then((result) => result.success ?
              console.log(`task ${taskID} delete`) :
              console.error(`task ${taskID} delete error: success false`, result.error)
            )
            .catch((e: any) => console.error(`task ${taskID} delete error, message: ${e.message}`));
        } else {
          await env.DB.prepare("UPDATE task SET list = ? WHERE id = ?")
            .bind(JSON.stringify(tasks), taskID).run()
            .then((result) => result.success ?
              console.log(`task ${taskID} delete ${dynamicID}`) :
              console.error(`task ${taskID} delete ${dynamicID} error: success false`, result.error)
            )
            .catch((e: any) => console.error(`task ${taskID} delete ${dynamicID} error, message: ${e.message}`));
        }
      }
    }
  }
}