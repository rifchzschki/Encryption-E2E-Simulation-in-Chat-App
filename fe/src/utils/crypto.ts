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


export function toHex(bytes: Uint8Array | string): string {
  const arr =
    typeof bytes === 'string'
      ? new Uint8Array([...bytes].map((ch) => ch.charCodeAt(0)))
      : bytes;
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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
  const currentTime = Date.now();
  const kdfKey = await kdfArgon2(username, password);
  console.log('KDF time:', Date.now() - currentTime);
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
  
function pemBody(pem: string) {
  return pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
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
  // return sha3_256(utf8ToBytes(concat));
  return concat;
}

export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const raw = b64ToBytes(pemBody(pem));
  return crypto.subtle.importKey(
    'pkcs8',
    raw.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const raw = b64ToBytes(pemBody(pem));
  return crypto.subtle.importKey(
    'spki',
    raw.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  );
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
  publicKey: CryptoKey,
  hexHash: string,
  rHex: string,
  sHex: string
): Promise<boolean> {
  const hashBytes = hexToBytes(hexHash);
  const digest = await crypto.subtle.digest('SHA-256', hashBytes.buffer);
  const der = rsToDer(rHex, sHex);
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    publicKey,
    der,
    digest
  );
}

function derToRS(der: Uint8Array): { r: string; s: string } {
  let i = 0;
  if (der[i++] !== 0x30) throw new Error('bad der');
  const seqLen = der[i++];
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

function rsToDer(rHex: string, sHex: string): ArrayBuffer {
  const r = hexToBytes(rHex)
  const s = hexToBytes(sHex)
  const encInt = (v: Uint8Array) => {
    const pad = v.length > 0 && (v[0] & 0x80) ? 1 : 0
    const out = new Uint8Array(2 + pad + v.length)
    out[0] = 0x02
    out[1] = pad + v.length
    if (pad) out[2] = 0x00
    out.set(v, 2 + pad)
    return out
  }
  const rInt = encInt(r)
  const sInt = encInt(s)
  const out = new Uint8Array(2 + rInt.length + sInt.length)
  out[0] = 0x30
  out[1] = rInt.length + sInt.length
  out.set(rInt, 2)
  out.set(sInt, 2 + rInt.length)
  return out.buffer
}

async function importPublicKeyECDH(pem: string): Promise<CryptoKey> {
  const raw = b64ToBytes(pemBody(pem));
  return crypto.subtle.importKey(
    'spki',
    raw.buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
}

async function importPrivateKeyECDH(pem: string): Promise<CryptoKey> {
  const raw = b64ToBytes(pemBody(pem));
  return crypto.subtle.importKey(
    'pkcs8',
    raw.buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  );
}

async function exportSpkiB64(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey('spki', key);
  return bytesToB64(new Uint8Array(spki));
}

export async function eccEncrypt(
  message: string,
  receiverPublicKeyPem: string
): Promise<string> {
  const receiverPub = await importPublicKeyECDH(receiverPublicKeyPem);
  const eph = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: receiverPub },
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
  const ctBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(message)
  );
  const payload = {
    iv: bytesToB64(iv),
    ct: bytesToB64(new Uint8Array(ctBuf)),
    epk: await exportSpkiB64(eph.publicKey),
  };
  return btoa(JSON.stringify(payload));
}

export async function eccDecrypt(encoded: string): Promise<string> {
  const raw = JSON.parse(atob(encoded));
  const iv = b64ToBytes(raw.iv);
  const ct = b64ToBytes(raw.ct);
  const epk = await crypto.subtle.importKey(
    'spki',
    b64ToBytes(raw.epk).buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  const privPem = localStorage.getItem('privateKey') || '';
  const priv = await importPrivateKeyECDH(privPem);
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: epk },
    priv,
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
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ct.buffer
  );
  return new TextDecoder().decode(pt);
}
