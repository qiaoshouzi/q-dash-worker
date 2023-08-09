import type { Env } from "..";

// https://github.com/tsndr/cloudflare-worker-jwt 修改

const base64UrlParse = (s: string): Uint8Array => {
  return new Uint8Array(
    Array.prototype.map.call(
      atob(s.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')),
      c => c.charCodeAt(0)
    ) as number[],
  );
};

const _utf8ToUint8Array = (str: string): Uint8Array => {
  return base64UrlParse(btoa(decodeURIComponent(encodeURIComponent(str))));
};

const base64UrlStringify = (a: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(a)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const algorithm = { name: 'HMAC', hash: { name: 'SHA-384' } };

export const jwt = {
  sign: async (payload: { [key: string]: any }, secret: string): Promise<string> => {
    payload["exp"] = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7d
    const payloadAsJSON = JSON.stringify(payload);
    const partialToken = `${base64UrlStringify(_utf8ToUint8Array(JSON.stringify({
      alg: "HS384",
      typ: "JWT",
    })))}.${base64UrlStringify(_utf8ToUint8Array(payloadAsJSON))}`;

    const key = await crypto.subtle.importKey("raw", _utf8ToUint8Array(secret), algorithm, false, ['sign']);
    const signature = await crypto.subtle.sign(algorithm, key, _utf8ToUint8Array(partialToken));

    return `${partialToken}.${base64UrlStringify(new Uint8Array(signature))}`;
  },
  verify: async (token: string, secret: string): Promise<{ [key: string]: any } | null> => {
    const [header, payload, signature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", _utf8ToUint8Array(secret), algorithm, false, ['verify']);
    const isValid = await crypto.subtle.verify(algorithm, key, base64UrlParse(signature), _utf8ToUint8Array(`${header}.${payload}`));

    if (isValid) {
      const payloadAsJSON = JSON.parse(atob(payload));
      if (payloadAsJSON.exp > Math.floor(Date.now() / 1000)) {
        return payloadAsJSON;
      }
    }
    return null;
  },
};

// 加密
export const createToken = async (env: Env, data: { [key: string]: any }): Promise<string> => {
  const token = await jwt.sign(data, env.jwt_secret);
  return token;
};

// 校验
export const verifyToken = async (env: Env, token: string): Promise<{ [key: string]: any } | null> => {
  return await jwt.verify(token, env.jwt_secret);
};
