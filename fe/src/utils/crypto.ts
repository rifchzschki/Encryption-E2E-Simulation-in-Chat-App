import { p256 } from "@noble/curves/nist.js";
import { argon2id } from "@noble/hashes/argon2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import { sha3_256 } from "@noble/hashes/sha3.js";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function kdfArgon2(
  username: string,
  password: string
): Promise<Uint8Array> {
  const usernameBytes = utf8ToBytes(username);
  const salt = sha3_256(usernameBytes);

  const key = argon2id(password, salt, {
    t: 3, // time cost (iterations)
    m: 64 * 1024, // memory (64 MB)
    p: 1, // parallel threads
    dkLen: 32, // 32 bytes output
  });

  return key;
}

export async function generateKeyPair(username: string, password: string) {
  const kdfKey = await kdfArgon2(username, password);
  const privKey = kdfKey;
  const pubKey = p256.getPublicKey(privKey, false);
  return {
    privateKeyHex: toHex(privKey),
    publicKeyHex: toHex(pubKey),
  };
}
