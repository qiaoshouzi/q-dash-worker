import { parse as cookieParse } from "cookie";
import { addTasksToDB, processNewDynamicData, processTasks } from "./scheduled";
import { FetchCount, verifyToken } from "./utils";

import { getConfig, setUpdateSwitch } from "./api";
import {
  accessLoginFromGithub,
  accessLoginOptions,
  accessLoginVerification,
  accessRegistrationOptions,
  accessRegistrationVerification,
  deleteAuthenticator,
  editAuthenticatorName,
  getAllAuthenticator,
} from "./api/access";
import { addAnime, deleteAnime, getAnime } from "./api/anime";
import { deleteDynamic, getAllDynamic, pinDynamic } from "./api/dynamic";
import { BiliBiliLogin, getBiliBiliLoginQRCode } from "./api/login-bilibili";
import { deleteTodo, getTodo, postTodo } from "./api/todo";
import { deleteTodoTemplate, getTodoTemplate, postTodoTemplate } from "./api/todo/template";

export interface Env {
  R2: R2Bucket;
  DB: D1Database;
  // Env Variables
  ua: string;
  cookie: string;
  jwt_secret: string;
  captcha_key: string;
  github_key: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const originUrl = new URL(request.headers.get("Origin") ?? "https://test.com");
    const { pathname } = url;

    if (!["dash.cfm.moe", "localhost"].includes(originUrl.hostname))
      return new Response(null, { status: 403 });

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
        resp.headers.set("Access-Control-Allow-Headers", "*");
        resp.headers.set("Access-Control-Max-Age", "86400");

        return resp;
      }

      /* 无需Cookie验证 */
      // Access Login
      if (pathname === "/api/access/login/options" && request.method === "POST") {
        return await accessLoginOptions(env, body);
      } else if (pathname === "/api/access/login/verification" && request.method === "POST") {
        return await accessLoginVerification(env, body, request);
      } else if (pathname === "/api/access/login/github" && request.method === "POST") {
        return await accessLoginFromGithub(env, body, request);
      }

      /* 需要Cookie验证 */
      // Cookie验证
      const checkResult = await (async (): Promise<boolean> => {
        const cookies = cookieParse(request.headers.get("cookie") ?? "");
        const token = cookies.SESSDATA;
        if (typeof token !== "string" || token.split(".").length !== 3) return false;
        const tokenData = await verifyToken(env, token);
        if (tokenData === null) return false;
        if (tokenData.userName !== "qiaoshouzi") return false;
        return true;
      })();
      if (!checkResult) return new Response(JSON.stringify({
        code: 403,
        message: "SESSDATA过期",
      }));

      // Access Registration
      if (pathname === "/api/access/registration/options" && request.method === "POST") {
        return await accessRegistrationOptions(env, body);
      } else if (pathname === "/api/access/registration/verification" && request.method === "POST") {
        return await accessRegistrationVerification(env, body);
      }
      // Access Manager Authenticator
      if (pathname === "/api/access/authenticator") {
        if (request.method === "GET") {
          return await getAllAuthenticator(env);
        } else if (request.method === "POST") {
          return await editAuthenticatorName(env, body);
        } else if (request.method === "DELETE") {
          return await deleteAuthenticator(env, url);
        }
      }

      if (pathname === "/api/getConfig" && request.method === "GET") {
        return await getConfig(env);
      } else if (pathname === "/api/setUpdateSwitch" && request.method === "POST") {
        return await setUpdateSwitch(env, body);
      }
      // /api/dynamic
      if (pathname === "/api/dynamic") {
        if (request.method === "GET") {
          return await getAllDynamic(env);
        } else if (request.method === "DELETE") {
          return await deleteDynamic(env, url);
        }
      }
      // /api/dynamic/pin
      if (pathname === "/api/dynamic/pin" && request.method === "POST") {
        return await pinDynamic(env, body);
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

    resp.headers.set("Access-Control-Allow-Origin", originUrl.origin);
    resp.headers.set("Access-Control-Allow-Credentials", "true");

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
