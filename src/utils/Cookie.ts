type CookieData = {
  name: string;
  value: string;
  domain: string;
  // sameSite: [string, string];
};

export class Cookie {
  cookies: CookieData[] = [];

  constructor(value?: {
    header: Headers;
    reqOrigin: string;
    respOrigin: string;
  }) {
    if (value) {
      this.addHeader(value.header, value.reqOrigin, value.respOrigin);
    }
  };

  /**
   * 解析 headers 并提取 Cookie 存储到 this.cookies
   * @param header Headers
   */
  addHeader(header: Headers, reqOrigin: string, respOrigin: string) {
    header.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        console.log(value);
        const result = this.parseHeaderValue(value, reqOrigin, respOrigin);
        if (result) this.cookies.push(result);
      }
    });
  };

  getCookie(domain: string) {
    return this.cookies
      .filter((v) => domain === v.domain || domain.endsWith(`.${v.domain}`))
      .map((v) => `${v.name}=${v.value}`)
      .join("; ");
  };

  /**
   * 解析 Header 的 value
   * @param value header value
   * @returns cookie data
   */
  parseHeaderValue(value: string, reqOrigin: string, respOrigin: string): CookieData | null {
    const t: [string, string][] = value.split("; ").map((v) => {
      const t = v.split("=");
      return [t[0], t.splice(1).join("=")];
    });
    console.log(JSON.stringify(t));
    const [cookieName, cookieValue] = t[0];
    const domain = (t.splice(1).find((v) => v[0] === "domain")?.[1] as string).replace(/^\./, "");
    const sameSite = t.splice(1).find((v) => v[0] === "SameSite")?.[1] as string;
    if (sameSite === "Strict") {
      if (reqOrigin !== respOrigin) return null;
    } else if (sameSite === "Lax") {
      if (
        new URL(reqOrigin).hostname !== new URL(respOrigin).hostname
      ) return null;
    }

    return {
      name: cookieName,
      value: cookieValue,
      domain,
      // sameSite: [t.splice(1).find((v) => v[0] === "SameSite")?.[1] as string, respOrigin],
    };
  };
};
