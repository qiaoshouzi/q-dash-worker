import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { Env } from '../../..';
import { nanoid } from "../../../utils";
import { getAuthenticator } from '../manageAuthenticator';

export const accessLoginOptions = async (
  env: Env,
  body: { [key: string]: any },
): Promise<Response> => {
  const { userName } = body;
  if (userName !== "qiaoshouzi") return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  const authenticators = await getAuthenticator(env);
  if (typeof authenticators === "string") return new Response(JSON.stringify({
    code: 500,
    message: authenticators,
  }));

  const options = await generateAuthenticationOptions({
    challenge: nanoid(),
    allowCredentials: authenticators.map((value) => ({
      id: value.credentialID,
      type: "public-key",
      transports: value.transports,
    })),
    userVerification: "preferred",
  });
  return new Response(JSON.stringify({
    code: 200,
    message: "",
    data: options,
  }));
};
