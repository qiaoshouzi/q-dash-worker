import { Env } from "..";

/**
 * 递归任务写入数据库
 */
export default async (env: Env, tasks: string[]) => {
  if (tasks.length > 0) {
    const result = await env.DB
      .prepare("INSERT INTO task (list) VALUES (?)")
      .bind(JSON.stringify(tasks))
      .run()
      .catch((e) => console.error(`DB Error: INSERT task, ${e.message}`));
    console.log(`DB Success: INSERT task, length: ${tasks.length}`);
    if (result?.success === false) {
      console.error(`DB Error: INSERT task success false, ${result.error}`);
    }
  }
};
