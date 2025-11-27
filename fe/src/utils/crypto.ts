import {
  ecdsa,
  weierstrass,
  type WeierstrassOpts,
} from '@noble/curves/abstract/weierstrass.js';
import { argon2id } from '@noble/hashes/argon2.js';
import { sha3_256 } from '@noble/hashes/sha3.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';
import type { KeyPair, Signature } from '../types/auth';

const p256_CURVE: WeierstrassOpts<bigint> = /* @__PURE__ */ (() => ({
  p: BigInt(
    '0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'
  ),
  n: BigInt(
    '0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'
  ),
  h: BigInt(1),
  a: BigInt(
    '0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'
  ),
  b: BigInt(
    '0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'
  ),
  Gx: BigInt(
    '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'
  ),
  Gy: BigInt(
    '0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'
  ),
}))();

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const fromHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

const bigIntToBytesHex = (big: bigint): string =>
  toHex(
    Uint8Array.from(
      big
        .toString(16)
        .match(/.{1,2}/g)!
        .map((b) => parseInt(b, 16))
    )
  );

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

export async function generateKeyPair(
  username: string,
  password: string
): Promise<KeyPair> {
  const kdfKey = await kdfArgon2(username, password);
  const privKey = kdfKey;
  const Point = weierstrass(p256_CURVE);
  const pubKey = Point.BASE.multiply(Point.Fn.fromBytes(privKey));

  return {
    privateKeyHex: toHex(privKey),
    publicKeyHex: {
      x: bigIntToBytesHex(pubKey.x),
      y: bigIntToBytesHex(pubKey.y),
    },
  };
}

export async function signNonce(
  privateKeyHex: string,
  nonceHex: string
): Promise<Signature> {
  const nonceBytes = fromHex(nonceHex);
  const privateKeyBytes = fromHex(privateKeyHex);
  
  const ecdsaInstance = ecdsa(weierstrass(p256_CURVE), sha3_256); 
  const signatureBytes = ecdsaInstance.sign(nonceBytes, privateKeyBytes);
  const signature = ecdsaInstance.Signature.fromBytes(signatureBytes);
  return {
    r: signature.r.toString(16).padStart(64, '0'),
    s: signature.s.toString(16).padStart(64, '0'),
  };
}
