// import qs from 'qs';

export class TelegramAPI {
  api: string;

  /**
   * 初始化
   * @param token Telegram bot token
   */
  constructor(token: string) {
    this.api = `https://api.telegram.org/bot${token}`;
  };

  /**
   * SendMessage
   * @param chat_id 聊天 ID
   * @param text 文本
   * @param parse_mode (选)解析模式
   * @returns Data
   */
  async sendMessage(chat_id: string | number, text: string, parse_mode = 'MarkdownV2') {
    try {
      const resp = await fetch(`${this.api}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: String(chat_id),
          text,
          parse_mode
        }),
      });
      const resp_json = await resp.json() as any;
      if (!resp_json.ok) {
        throw `${resp_json.error_code}: ${resp_json.description}`;
      }
    } catch (e) {
      console.error("请求 Telegram API 失败", e);
    };
  };
};
