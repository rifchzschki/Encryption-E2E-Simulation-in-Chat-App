import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { ecdh, weierstrass } from '@noble/curves/abstract/weierstrass.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha3_256 } from '@noble/hashes/sha3.js';
import { fromHex, p256_CURVE, toHex } from './crypto.ts';
import { useChatMetaStore } from '../stores/useChatMetadataStore.ts';
import { UserApi } from '../services/user.ts';

const ECDH = ecdh(weierstrass(p256_CURVE));
const CURVE_N = p256_CURVE.n;

export type IdentityKeyPair = {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
};

export async function generateDeterministicIdentityKeyPair(seed: Uint8Array) {
  const hashed = sha3_256(seed);
  const skBig = (BigInt('0x' + toHex(hashed)) % (CURVE_N - 1n)) + 1n;
  const skHex = skBig.toString(16).padStart(64, '0');
  const secretKey = fromHex(skHex);
  const publicKey = ECDH.getPublicKey(secretKey, true);
  return {
    privateKeyEcdh: secretKey,
    publicKeyEcdh: publicKey,
  };
}

export function deriveSharedSecret(
  mySecretKey: Uint8Array,
  theirPublicKey: Uint8Array
): Uint8Array {
  const shared = ECDH.getSharedSecret(mySecretKey, theirPublicKey, true);
  return shared;
}

export function deriveSymmetricKey(sharedSecret: Uint8Array): Uint8Array {
  const salt = new Uint8Array([]);
  const info = new TextEncoder().encode('chatapp-ecc-ecdh-v1');
  const okm = hkdf(sha3_256, sharedSecret, salt, info, 32);
  return okm;
}

export type EncryptedPayload = {
  nonce: string;
  ct: string;
};

export async function encryptMessage(
  mySecretKey: Uint8Array,
  theirPublicKey: Uint8Array,
  message: string
): Promise<string> {
  const shared = deriveSharedSecret(mySecretKey, theirPublicKey);
  const key = deriveSymmetricKey(shared);
  const nonce = randomBytes(24);
  const chacha = xchacha20poly1305(key, nonce);
  const plaintext = new TextEncoder().encode(message);
  const ciphertext = chacha.encrypt(plaintext);
  return btoa(
    JSON.stringify({
      nonce: toHex(nonce),
      ct: toHex(ciphertext),
    })
  );
}

export async function decryptMessage(
  mySecretKey: Uint8Array,
  theirPublicKey: Uint8Array,
  ciphertext_b64: string
) {
  try{
    const decoded = JSON.parse(atob(ciphertext_b64));
    const nonce = fromHex(decoded.nonce);
    const ciphertext = fromHex(decoded.ct);
    const shared = deriveSharedSecret(mySecretKey, theirPublicKey);
    const key = deriveSymmetricKey(shared);
    const chacha = xchacha20poly1305(key, nonce);
    const plaintext = chacha.decrypt(ciphertext);
    return new TextDecoder().decode(plaintext);
  }catch(error){
    console.error(error)
  }
}

export async function resolveBulkMetadataEncryption(
  token: string,
  privEcdhHex: string
) {
  const { updateMeta } = useChatMetaStore.getState();
  const api = new UserApi(token);

  for (const [contact, meta] of Object.entries(
    useChatMetaStore.getState().metas
  )) {
    if (!meta.latestMessage) continue;

    try {
      const pubRes = await api.fetchPublicKey(contact);
      const plain = await decryptMessage(
        fromHex(privEcdhHex),
        fromHex(pubRes.publicKeyHex.ecdh as string),
        meta.latestMessage
      );

      updateMeta(contact, plain as string, meta.latestTimestamp!);
    } catch (e) {
      console.error(`Decrypt failed for ${contact}`, e);
    }
  }
}
