import type { Env } from "../../..";
import { getAuthenticator } from "../manageAuthenticator";

export const getAllAuthenticator = async (env: Env): Promise<Response> => {
  const authenticators = await getAuthenticator(env);
  if (typeof authenticators === "string") return new Response(JSON.stringify({
    code: 500,
    message: authenticators,
  }));
  else return new Response(JSON.stringify({
    code: 200,
    message: "",
    data: authenticators.map((v) => ({
      id: v.id,
      name: v.name,
      rpID: v.rpID,
    })),
  }));
};
