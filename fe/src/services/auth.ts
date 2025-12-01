import type { BaseResponse } from '../types';
import type {
  AuthInput,
  AuthResponse,
  ResponseChallenge,
  Token,
} from '../types/auth';
import { fromHex, generateKeyPair, signNonce, toHex } from '../utils/crypto';
import { generateDeterministicIdentityKeyPair } from '../utils/ecc-ecdh';
import { getEnv } from '../utils/env';
import { ApiClient } from './api';

export class AuthService extends ApiClient {
  constructor(token: Token) {
    super(getEnv('VITE_API_BASE_URL', 'http:/localhost:8080/api/'), token);
  }

  async register({ username, password }: AuthInput): Promise<string> {
    const { privateKeyHex, publicKeyHex } = await generateKeyPair(
      username,
      password
    );
    const { publicKeyEcdh } =
        await generateDeterministicIdentityKeyPair(fromHex(privateKeyHex));
    const publicEcdhHex = toHex(publicKeyEcdh)
    publicKeyHex.ecdh = publicEcdhHex

    return this.post<BaseResponse<string>>(
      '/register',
      { username, publicKeyHex },
      { withCredentials: true }
    ).then((res) => {
      return res.data;
    });
  }

  async login({ username, password }: AuthInput): Promise<AuthResponse> {
    try {
      const nonceRes = await this.get<BaseResponse<ResponseChallenge>>(
        `/nonce?username=${username}`
      );
      const nonce = nonceRes.data.nonce;
      const { privateKeyHex } = await generateKeyPair(username, password);
      const signature = await signNonce(privateKeyHex, nonce);
      const { privateKeyEcdh } = await generateDeterministicIdentityKeyPair(fromHex(privateKeyHex))
      return this.post<BaseResponse<AuthResponse>>(
        '/login',
        { username, signature: signature },
        { withCredentials: true }
      ).then((res) => {
        localStorage.setItem('privateKey', privateKeyHex);
        localStorage.setItem('privateKeyEcdh', toHex(privateKeyEcdh));
        return res.data;
      });
    } catch (err) {
      throw err;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.get<BaseResponse<AuthResponse>>('/refresh', {
      withCredentials: true,
    }).then((res) => res.data);
  }

  async logout() {
    this.post(
      'protected/logout',
      {},
      {
        withCredentials: true,
      }
    );
  }
}
