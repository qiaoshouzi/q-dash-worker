/**
 * window.callback && callback({...});
 * callback({...});
 */
export const parseRespBody = <T = any>(resp_text: string, callback: string): T | null => {
  try {
    return JSON.parse(resp_text
      .replace(`window.${callback} && ${callback}(`, "")
      .replace(`${callback}(`, "")
      .replace(/\);$/, "")) as T;
  } catch (e) {
    return null;
  }
};
