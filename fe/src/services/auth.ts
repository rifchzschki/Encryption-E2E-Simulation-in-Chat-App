import type { BaseResponse } from '../types';
import type { AuthInput, CredentialInfo, ResponseChallenge } from '../types/auth';
import { generateKeyPair, signNonce } from '../utils/crypto';
import { getEnv } from '../utils/env';
import { ApiClient } from './api';

export class authService extends ApiClient {
  constructor(token?: string) {
    super(getEnv('VITE_API_BASE_URL', 'http:/localhost:8080/api/'), token);
  }

  //register
  async register({ username, password }: AuthInput) {
    const { privateKeyHex, publicKeyHex } = await generateKeyPair(
      username,
      password
    );

    this.post<CredentialInfo>(
      '/register',
      { username, publicKeyHex },
      { withCredentials: true }
    ).then((res) => {
      localStorage.setItem('privateKey', privateKeyHex);
      return res;
    });
  }

  //login
  async login({ username, password }: AuthInput) {
    const nonceRes = await this.get<BaseResponse<ResponseChallenge>>(
      `/nonce?username=${username}`
    );
    const nonce = nonceRes.data.nonce;
    const { privateKeyHex } = await generateKeyPair(username, password);
    const signature = await signNonce(privateKeyHex, nonce);
    return await this.post(
      '/login',
      { username, signature: signature },
      { withCredentials: true }
    ).then((res) => {
      localStorage.setItem('privateKey', privateKeyHex);
      return res;
    });
  }
}
