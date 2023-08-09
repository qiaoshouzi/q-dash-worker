import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { Env } from "../../..";
import type { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { addAuthenticator } from "../manageAuthenticator";

export const accessRegistrationVerification = async (
  env: Env,
  body: { [key: string]: any },
): Promise<Response> => {
  const { userName, rpID, expectedChallenge } = body;
  const browserResponse: RegistrationResponseJSON = body.browserResponse;
  if (
    !["localhost", "dash.cfm.moe"].includes(rpID) ||
    typeof browserResponse !== "object" ||
    userName !== "qiaoshouzi"
  ) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  try {
    console.log("test");
    const verification = await verifyRegistrationResponse({
      response: browserResponse,
      expectedChallenge,
      expectedOrigin: rpID === "localhost" ? `http://${rpID}:38920` : `https://${rpID}`,
      expectedRPID: rpID,
    });
    console.log("test");

    if (verification.verified && verification.registrationInfo) {
      const registrationInfo = verification.registrationInfo;
      try {
        await addAuthenticator(env, rpID, browserResponse, registrationInfo);
      } catch (e) {
        return new Response(JSON.stringify({
          code: 500,
          message: e,
        }));
      }

      return new Response(JSON.stringify({
        code: 200,
        message: "注册成功",
        data: {
          id: browserResponse.id,
          name: browserResponse.id,
          rpID,
        },
      }));
    } else {
      throw {
        name: "VerifiedFalse",
        message: "Verified is False",
      };
    }
  } catch (e: any) {
    console.error(`WebAuth Error: ${e.name}: ${e.message}`);
    return new Response(JSON.stringify({
      code: 500,
      message: `WebAuth Error: ${e.name}`,
    }));
  }
};