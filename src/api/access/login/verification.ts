import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/typescript-types";
import type { Env } from "../../..";
import { getAuthenticator, updateAuthenticatorCounter } from "../manageAuthenticator";
import { createToken } from "../../../utils";

export const accessLoginVerification = async (
  env: Env,
  body: { [key: string]: any },
): Promise<Response> => {
  const { userName, rpID, expectedChallenge } = body;
  const browserResponse: AuthenticationResponseJSON = body.browserResponse;
  if (
    !["localhost", "dash.cfm.moe"].includes(rpID) ||
    typeof browserResponse !== "object" ||
    userName !== "qiaoshouzi"
  ) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));
  const authenticator = await getAuthenticator(env, browserResponse.id);
  if (typeof authenticator === "string") return new Response(JSON.stringify({
    code: 500,
    message: authenticator,
  }));
  else if (authenticator.length !== 1) return new Response(JSON.stringify({
    code: 400,
    message: "未找到 authenticator",
  }));

  try {
    const verification = await verifyAuthenticationResponse({
      response: browserResponse,
      expectedChallenge,
      expectedOrigin: rpID === "localhost" ? `http://${rpID}:6892` : `https://${rpID}`,
      expectedRPID: rpID,
      authenticator: {
        credentialID: authenticator[0].credentialID,
        credentialPublicKey: authenticator[0].credentialPublicKey,
        counter: authenticator[0].counter,
        transports: authenticator[0].transports,
      },
    });

    if (verification.verified) {
      try {
        await updateAuthenticatorCounter(env, browserResponse.id, verification.authenticationInfo.newCounter);
      } catch (e) {
        return new Response(JSON.stringify({
          code: 500,
          message: e,
        }));
      }

      const SESSDATA = await createToken(env, { userName });
      const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      const headers = new Headers();
      headers.append("Set-Cookie", `SESSDATA=${SESSDATA}; expires=${expires}; domain=api-dash.cfm.moe; path=/; HttpOnly; Secure; SameSite=None`)
      return new Response(JSON.stringify({
        code: 200,
        message: "登陆成功",
      }), { headers });
    } else {
      return new Response(JSON.stringify({
        code: 403,
        message: "登陆失败",
      }));
    }
  } catch (e: any) {
    console.error(`WebAuth Error: ${e.name}: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `WebAuth Error: ${e.name}`,
    }));
  }
};
