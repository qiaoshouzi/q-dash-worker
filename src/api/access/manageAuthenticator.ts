import type { AttestationFormat } from "@simplewebauthn/server/dist/helpers";
import type { AuthenticationExtensionsAuthenticatorOutputs } from "@simplewebauthn/server/dist/helpers/decodeAuthenticatorExtensions";
import type { AuthenticatorTransport, CredentialDeviceType, RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { Env } from "../..";

export type Authenticator = {
  name: string;
  id: string;
  rpID: string;
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Uint8Array;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  credentialPublicKey: Uint8Array;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  credentialDeviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  credentialBackedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
};
export type RegistrationInfo = {
  fmt: AttestationFormat;
  counter: number;
  aaguid: string;
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  credentialType: 'public-key';
  attestationObject: Uint8Array;
  userVerified: boolean;
  credentialDeviceType: CredentialDeviceType;
  credentialBackedUp: boolean;
  origin: string;
  rpID?: string;
  authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;
};

/*
CREATE TABLE login (
  name TEXT,
  credentialID TEXT PRIMARY KEY,
  credentialPublicKey TEXT,
  counter INTEGER
  credentialDeviceType TEXT,
  credentialBackedUp TEXT,
  transports TEXT
);
*/

export const addAuthenticator = async (
  env: Env,
  rpID: string,
  browserResponse: RegistrationResponseJSON,
  registrationInfo: RegistrationInfo,
): Promise<void> => {
  try {
    console.log(JSON.stringify(browserResponse.response));
    await env.DB
      .prepare(`INSERT INTO login (
        name,
        id,
        rpID,
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
        transports
      ) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(
        browserResponse.id,
        browserResponse.id,
        rpID,
        JSON.stringify(registrationInfo.credentialID),
        JSON.stringify(registrationInfo.credentialPublicKey),
        registrationInfo.counter,
        registrationInfo.credentialDeviceType,
        String(registrationInfo.credentialBackedUp),
        browserResponse.response.transports ?? null ? JSON.stringify(browserResponse.response.transports) : null,
      )
      .run();
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    throw `DB Error: ${e.message}`;
  }
};

export const updateAuthenticatorCounter = async (env: Env, id: string, counter: number): Promise<void> => {
  try {
    await env.DB
      .prepare("UPDATE login SET counter = ? WHERE id = ?")
      .bind(counter, id)
      .run();
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    throw `DB Error: ${e.message}`;
  }
};

export const getAuthenticator = async (env: Env, id?: string): Promise<Authenticator[] | string> => {
  const sql = id ?
    env.DB.prepare("SELECT * FROM login WHERE id = ?").bind(id) :
    env.DB.prepare("SELECT * FROM login");

  try {
    const result = await sql.all<{
      name: string;
      id: string;
      rpID: string;
      credentialID: string;
      credentialPublicKey: string;
      counter: number;
      credentialDeviceType: string;
      credentialBackedUp: string;
      transports: string;
    }>();

    return result.results.map((value) => ({
      name: value.name,
      id: value.id,
      rpID: value.rpID,
      credentialID: new Uint8Array(Object.values(JSON.parse(value.credentialID)).map(Number)),
      credentialPublicKey: new Uint8Array(Object.values(JSON.parse(value.credentialPublicKey)).map(Number)),
      counter: value.counter,
      credentialDeviceType: value.credentialDeviceType as CredentialDeviceType,
      credentialBackedUp: Boolean(value.credentialBackedUp),
      transports: value.transports ? JSON.parse(value.transports) as AuthenticatorTransport[] : undefined,
    }));
  } catch (e: any) {
    console.error(`DB Error: ${e.message}`);
    return `DB Error: ${e.message}`;
  }
};
