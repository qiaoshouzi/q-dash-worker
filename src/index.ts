import { addTasksToDB, processNewDynamicData, processTasks } from "./scheduled";
import { FetchCount } from "./utils";

import { getAllDynamicData, getConfig, deleteDynamic } from "./api";
import { addAnime, deleteAnime, getAnime } from "./api/anime";
import { BiliBiliLogin, getBiliBiliLoginQRCode } from "./api/login-bilibili";
import { postPin } from "./api/pin";
import setUpdateSwitch from "./api/setUpdateSwitch";
import { deleteTodo, getTodo, postTodo } from "./api/todo";
import { deleteTodoTemplate, getTodoTemplate, postTodoTemplate } from "./api/todo/template";

export interface Env {
  R2: R2Bucket;
  DB: D1Database;
  // Env Variables
  ua: string;
  cookie: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // POST 请求的 body
    const body: { [key: string]: any } = await (async () => {
      if (request.method === "POST") {
        try {
          if (request.headers.get("Content-Type")?.startsWith("multipart/form-data; ")) {
            // FormData
            const formData = await request.formData();
            const body: { [key: string]: any } = {};
            for (const [key, value] of formData.entries()) {
              body[key] = value;
            }
            return body;
          } else {
            // JSON
            return await request.json();
          }
        } catch (e) {
          return {};
        }
      } else return {};
    })();

    const resp = await (async (): Promise<Response> => {
      if (request.method === "OPTIONS") {
        const resp = new Response(null);
        // CORS
        resp.headers.set("Access-Control-Allow-Methods", "HEAD,GET,POST,DELETE");
        resp.headers.set("Access-Control-Allow-Credentials", "true");
        resp.headers.set("Access-Control-Allow-Headers", "*");
        resp.headers.set("Access-Control-Max-Age", "86400");

        return resp;
      }

      if (pathname === "/api/getAllDynamicData" && request.method === "GET") {
        return await getAllDynamicData(env);
      } else if (pathname === "/api/deleteDynamic" && request.method === "GET") {
        return await deleteDynamic(env, url);
      } else if (pathname === "/api/getConfig" && request.method === "GET") {
        return await getConfig(env);
      } else if (pathname === "/api/setUpdateSwitch" && request.method === "POST") {
        return await setUpdateSwitch(env, body);
      }
      // /api/pin
      if (pathname === "/api/pin") {
        if (request.method === "POST") return await postPin(env, body);
      }
      // /api/login-bilibili/login
      if (pathname === "/api/login-bilibili/login" && request.method === "GET") {
        return await BiliBiliLogin(env, url);
      }
      // /api/login-bilibili/get-qrcode
      if (pathname === "/api/login-bilibili/get-qrcode" && request.method === "GET") {
        return await getBiliBiliLoginQRCode(env);
      }
      // /api/anime
      if (pathname === "/api/anime") {
        if (request.method === "GET") return await getAnime(env);
        else if (request.method === "POST") return await addAnime(env, body);
        else if (request.method === "DELETE") return await deleteAnime(env, url);
      }
      if (pathname === "/api/todo") {
        if (request.method === "GET") return await getTodo(env);
        else if (request.method === "POST") return await postTodo(env, body);
        else if (request.method === "DELETE") return await deleteTodo(env, url);
      }
      if (pathname === "/api/todo/template") {
        if (request.method === "GET") return await getTodoTemplate(env);
        else if (request.method === "POST") return await postTodoTemplate(env, body);
        else if (request.method === "DELETE") return await deleteTodoTemplate(env, url);
      }

      return new Response(null, { status: 404 });
    })();

    resp.headers.set("Access-Control-Allow-Origin", "*");

    return resp;
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log("Run!");

    try {
      const result = await env.DB.prepare("SELECT value FROM config WHERE key = 'updateSwitch'").first<{ value: string }>();
      if (result === null) {
        console.error("get config.updateSwitch error, result is null");
        return;
      }
      if (result.value !== "true") {
        console.error("config.updateSwitch !== true", result.value);
        return;
      } else {
        console.log("config.updateSwitch === true");
      }
    } catch (e: any) {
      console.error("get config.updateSwitch error", e.message);
      return;
    }

    let cookie: string = "";
    try {
      const result = await env.DB.prepare("SELECT value FROM config WHERE key = 'bilibili-login'").first<{ value: string }>();
      if (result === null) {
        console.error("get config.bilibili-login error, result is null");
        return;
      } else {
        const result_json = JSON.parse(result.value);
        cookie = result_json.cookie;
      }
    } catch (e: any) { }

    const fetchCount = new FetchCount();

    const tasks = await processNewDynamicData(env, fetchCount, cookie);
    await addTasksToDB(env, tasks);
    await processTasks(env, cookie, fetchCount);

    console.log("Done!");
  },
};
