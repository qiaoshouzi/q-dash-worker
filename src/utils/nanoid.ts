import { customAlphabet } from "nanoid";

const alphabet = "@#$%&*_+-=:?\\;.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const nanoid = (): string => {
  return customAlphabet(alphabet, 86)();
};
