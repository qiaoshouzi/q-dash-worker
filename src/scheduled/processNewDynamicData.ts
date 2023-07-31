import { Env } from "..";
import { FetchCount } from "../utils";
import { getDynamics, parseDynamicData, putDynamicToR2 } from "./utils";

/**
 * 获取最新动态数据并写入数据库, 同时创建递归任务
 */
export default async (env: Env, fetchCount: FetchCount, cookie: string): Promise<string[]> => {
  const tasks: string[] = [];
  const dynamicList: {
    dynamicID: string;
    ts: number;
    raw: string | undefined;
  }[] = [];

  const latestDynamicsID = await env.DB
    .prepare("SELECT * FROM dynamic ORDER BY id DESC LIMIT 3;")
    .all<{
      id: number;
      dynamicID: string;
      ts: number;
      raw: string | null;
    }>().then((r) => {
      if (!r.success) {
        console.error("DB Error: SELECT dynamic info", r.error);
        return null;
      } else {
        return r.results?.map((v) => v.dynamicID) ?? null;
      }
    }).catch((e) => {
      console.error("DB Error: SELECT dynamic info", e.message);
      return null;
    });
  if (latestDynamicsID === null) return [];
  console.log(`latestDynamicID: ${JSON.stringify(latestDynamicsID)}`);
  let offset: string | undefined = undefined;
  while (true) {
    const newDynamicsResponse = await getDynamics(env, fetchCount, cookie, offset).catch(async (e: Error) => {
      await env.DB.prepare("INSERT INTO dynamic (dynamicID, ts, raw) VALUES (?,?,?)").bind(-1, -1, JSON.stringify({
        type: "SYSTEM_MESSAGE_ERROR",
        ts: Math.floor(Date.now()),
        message: `BAPI Error: ${e.message}`,
      })).run().catch((e) => { });
      return undefined;
    });
    if (newDynamicsResponse === undefined) break;
    offset = newDynamicsResponse.data.offset as string;
    let needBreak: boolean = latestDynamicsID.length === 0; // 是否需要跳出循环 兼容第一次获取数据
    for (const item of newDynamicsResponse.data.items) {
      const { dynamicID, dynamicTypeCheck, ts, raw, origDynamic } = parseDynamicData(item);
      if (!dynamicTypeCheck) continue; // 跳过不需要的动态
      if (latestDynamicsID.includes(dynamicID)) {
        // 动态ID相同, 说明已经更新到最新
        needBreak = true;
        break;
      } else {
        if (origDynamic) {
          // 转发动态
          await putDynamicToR2(env, origDynamic.dynamicID, origDynamic.raw); // 将转发动态写入 R2
          tasks.push(origDynamic.dynamicID); // 创建递归任务
        }
        const R2Result = await putDynamicToR2(env, dynamicID, raw);
        dynamicList.unshift({
          dynamicID,
          ts,
          raw: R2Result === undefined ? undefined : raw,
        });
      }
    }
    if (needBreak) break;
  }

  for (const i of dynamicList) { // 写入 dynamicID 和 ts 到数据库
    const { dynamicID, ts, raw } = i;
    try {
      const sql = raw !== undefined ?
        env.DB.prepare("INSERT INTO dynamic (dynamicID, ts, raw) VALUES (?,?,?)").bind(dynamicID, ts, raw) :
        env.DB.prepare("INSERT INTO dynamic (dynamicID, ts) VALUES (?,?)").bind(dynamicID, ts);
      const result = await sql.run();
      if (!result.success) {
        throw {
          type: "SUCCESS_FALSE",
          message: result.error,
        };
      }
      tasks.push(dynamicID);
      console.log("DB Success: INSERT dynamic info", `dynamicID: ${dynamicID}`, `ts: ${ts}`);
    } catch (e: any) {
      let errorMessage: string;
      if (e.type === "SUCCESS_FALSE") errorMessage = `DB Error: INSERT dynamic info, success false, ${e.message}`;
      else errorMessage = `DB Error: INSERT dynamic info, ${e.message}`;
      console.error(errorMessage);
      // 写入错误信息
      await env.DB.prepare("INSERT INTO dynamic (dynamic_id, ts, raw) VALUES (?,?,?)").bind(-1, -1, JSON.stringify({
        type: "SYSTEM_MESSAGE_ERROR",
        ts: Math.floor(Date.now()),
        message: errorMessage,
      })).run().catch((e) => { });
    }
  }

  return tasks;
};
