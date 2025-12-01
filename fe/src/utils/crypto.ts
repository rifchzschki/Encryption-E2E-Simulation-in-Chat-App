import {
  ecdsa,
  weierstrass,
  type WeierstrassOpts,
} from '@noble/curves/abstract/weierstrass.js';
import { argon2id } from '@noble/hashes/argon2.js';
import { sha3_256 } from '@noble/hashes/sha3.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';
import type { KeyPair, Signature } from '../types/auth';

export const p256_CURVE: WeierstrassOpts<bigint> = /* @__PURE__ */ (() => ({
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

export function toHex(bytes: Uint8Array | string): string {
  const arr =
    typeof bytes === 'string'
      ? new Uint8Array([...bytes].map((ch) => ch.charCodeAt(0)))
      : bytes;
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const fromHex = (hex: string): Uint8Array => {
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
    t: 3,
    m: 16 * 1024,
    p: 1,
    dkLen: 32,
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
export async function generatePubFromPrivKey(priv: string){
  const Point = weierstrass(p256_CURVE);
  const pubKey = Point.BASE.multiply(Point.Fn.fromBytes(fromHex(priv)));
  return {
    x: bigIntToBytesHex(pubKey.x),
    y: bigIntToBytesHex(pubKey.y)
  }
}
const normalizePrivateKeyHex = (hex: string): string => {
  const clean = hex.trim().replace(/^0x/i, '').toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length !== 64) {
    throw new Error('Invalid private key hex (must be 64 hex chars)');
  }
  if (/^0+$/.test(clean)) {
    throw new Error('Invalid private key value');
  }
  return clean;
};

export async function signNonce(
  privateKeyHex: string,
  nonceHex: string
): Promise<Signature> {
  const nonceBytes = fromHex(nonceHex);
  const privateKeyBytes = fromHex(normalizePrivateKeyHex(privateKeyHex));

  const ecdsaInstance = ecdsa(weierstrass(p256_CURVE), sha3_256);
  const signatureBytes = ecdsaInstance.sign(nonceBytes, privateKeyBytes);
  const signature = ecdsaInstance.Signature.fromBytes(signatureBytes);
  return {
    r: signature.r.toString(16).padStart(64, '0'),
    s: signature.s.toString(16).padStart(64, '0'),
  };
}

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

export function hashMessage(parts: {
  message: string;
  timestamp: string;
  sender: string;
  receiver: string;
}): string {
  const concat = `${parts.message}|${parts.timestamp}|${parts.sender}|${parts.receiver}`;
  return toHex(sha3_256(utf8ToBytes(concat)));
}

export async function signHashHex(
  privateKeyHex: string,
  hashHex: string
): Promise<Signature> {
  const hashBytes = fromHex(hashHex);
  const privBytes = fromHex(normalizePrivateKeyHex(privateKeyHex));
  const ecdsaInstance = ecdsa(weierstrass(p256_CURVE), sha3_256);
  const signatureBytes = ecdsaInstance.sign(hashBytes, privBytes);
  const signature = ecdsaInstance.Signature.fromBytes(signatureBytes);
  return {
    r: signature.r.toString(16).padStart(64, '0'),
    s: signature.s.toString(16).padStart(64, '0'),
  };
}

export async function signHash(
  privateKey: CryptoKey,
  hexHash: string
): Promise<{ r: string; s: string }> {
  const hashBytes = hexToBytes(hexHash);
  const digest = await crypto.subtle.digest('SHA-256', hashBytes.buffer);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    digest
  );
  return derToRS(new Uint8Array(signature));
}


export async function verifySignature(
  publicKey: { x: string; y: string },
  hexHash: string,
  rHex: string,
  sHex: string
): Promise<boolean> {
  const hashBytes = fromHex(hexHash);
  const Curve = weierstrass(p256_CURVE);
  const ecdsaInstance = ecdsa(Curve, sha3_256);
  const signatureBytes = fromHex(
    `${normalizeHex64(rHex)}${normalizeHex64(sHex)}`
  );
  const pubBytes = fromHex(
    `04${normalizeHex64(publicKey.x)}${normalizeHex64(publicKey.y)}`
  );
  return ecdsaInstance.verify(signatureBytes, hashBytes, pubBytes);
}

function derToRS(der: Uint8Array): { r: string; s: string } {
  let i = 0;
  if (der[i++] !== 0x30) throw new Error('bad der');
  if (der[i++] !== 0x02) throw new Error('bad der');
  const rLen = der[i++];
  const r = der.slice(i, i + rLen);
  i += rLen;
  if (der[i++] !== 0x02) throw new Error('bad der');
  const sLen = der[i++];
  const s = der.slice(i, i + sLen);
  const toHex = (u: Uint8Array) =>
    Array.from(u)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return { r: toHex(r), s: toHex(s) };
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');


const importPrivateKeyHex = async (hex: string, usages: KeyUsage[]) => {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(clean)) throw new Error('Invalid private key hex');

  const dBytes = Uint8Array.from(
    clean.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );
  const Point = weierstrass(p256_CURVE);
  const pub = Point.BASE.multiply(Point.Fn.fromBytes(dBytes));
  const xBytes = fromHex(normalizeHex64(pub.x.toString(16)));
  const yBytes = fromHex(normalizeHex64(pub.y.toString(16)));

  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d: base64Url(dBytes),
    x: base64Url(xBytes),
    y: base64Url(yBytes),
    ext: true,
  };

  const algo = usages.includes('sign')
    ? { name: 'ECDSA', namedCurve: 'P-256' }
    : { name: 'ECDH', namedCurve: 'P-256' };

  return crypto.subtle.importKey('jwk', jwk, algo, false, usages);
};


function toB64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export async function importPublicKeyFromXY(
  xHex: string,
  yHex: string
): Promise<CryptoKey> {
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: toB64Url(fromHex(normalizeHex64(xHex))),
    y: toB64Url(fromHex(normalizeHex64(yHex))),
    ext: true,
  };
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  );
}


export const eccEncrypt = async (
  message: string,
  publicKey: { x: string; y: string }
) => {
  const receiver = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(xyToPoint(publicKey.x, publicKey.y)),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  const eph = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: receiver },
    eph.privateKey,
    256
  );
  const keyBytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', shared)
  );
  const aesKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'AES-GCM',
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(message)
  );
  const epk = await crypto.subtle.exportKey('raw', eph.publicKey);
  return btoa(
    JSON.stringify({
      iv: bytesToB64(iv),
      ct: bytesToB64(new Uint8Array(ct)),
      epk: bytesToB64(new Uint8Array(epk)),
    })
  );
};

export const eccDecrypt = async (payload: string, privateKeyHex: string) => {
  const { iv, ct, epk } = JSON.parse(atob(payload));
  const epkKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(b64ToBytes(epk)),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  const privKey = await importPrivateKeyHex(privateKeyHex, ['deriveBits']);
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: epkKey },
    privKey,
    256
  );
  const keyBytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', shared)
  );
  const aesKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'AES-GCM',
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(iv) },
    aesKey,
    b64ToBytes(ct).buffer
  );
  return new TextDecoder().decode(plain);
};


const toArrayBuffer = (u8: Uint8Array) => {
  const buf = new ArrayBuffer(u8.length);
  new Uint8Array(buf).set(u8);
  return buf;
};

const normalizeHex64 = (hex: string) => {
  const clean = hex.replace(/^0x/i, '').toLowerCase();
  return clean.length > 64 ? clean.slice(-64) : clean.padStart(64, '0');
};

const xyToPoint = (x: string, y: string) => {
  const px = hexToBytes(normalizeHex64(x));
  const py = hexToBytes(normalizeHex64(y));
  if (px.length !== 32 || py.length !== 32)
    throw new Error('Invalid P-256 key');
  const out = new Uint8Array(65);
  out[0] = 0x04;
  out.set(px, 1);
  out.set(py, 33);
  return out;
};

