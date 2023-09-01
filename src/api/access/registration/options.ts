import { generateRegistrationOptions } from '@simplewebauthn/server';
import { Env } from '../../..';
import { nanoid } from "../../../utils";
import { getAuthenticator } from '../manageAuthenticator';

export const accessRegistrationOptions = async (
  env: Env,
  body: { [key: string]: any },
): Promise<Response> => {
  const { rpID, userName } = body;
  if (
    !["localhost", "dash.cfm.moe"].includes(rpID) ||
    userName !== "qiaoshouzi"
  ) return new Response(JSON.stringify({
    code: 400,
    message: "参数错误",
  }));

  const authenticators = await getAuthenticator(env);
  if (typeof authenticators === "string") return new Response(JSON.stringify({
    code: 500,
    message: authenticators,
  }));

  const options = await generateRegistrationOptions({
    rpName: "Qiao's Dash",
    rpID,
    userID: "1",
    userName,
    supportedAlgorithmIDs: [-7, -257],
    attestationType: 'none',
    challenge: nanoid(),
    excludeCredentials: authenticators.map((value) => ({
      id: value.credentialID,
      type: "public-key",
      transports: value.transports,
    })),
  });
  return new Response(JSON.stringify({
    code: 200,
    message: "",
    data: options,
  }));
};
