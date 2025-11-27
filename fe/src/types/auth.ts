export type CredentialInfo = {
  username: string;
  publicKey: string;
};

export type AuthInput = {
  username: string;
  password: string;
};

export type LoginPayload = {
  username: string;
  signature: Signature;
};

export type Signature = {
  r: string;
  s: string;
};

export type PublicKey = {
  x: string;
  y: string;
};

export type ResponseChallenge = {
  nonce: string
}

export type KeyPair = {
  privateKeyHex: string;
  publicKeyHex: PublicKey;
};