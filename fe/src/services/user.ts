import { ApiClient } from './api';
import { getEnv } from '../utils/env';

export class UserApi extends ApiClient {
  constructor(token: string) {
    super(getEnv('VITE_API_BASE_URL', 'http://localhost:8080/api/'), token);
  }
  async fetchMe(): Promise<{ username: string }> {
    return this.get('/me');
  }
  async fetchPublicKey(
    username: string
  ): Promise<{ username: string; public_key_pem: string }> {
    return this.get(`/users/${username}/public-key`);
  }

  async fetchAllMessages(
    username: string
  ): Promise<{ messages: Array<{ sender: string; content: string }> }> {
    return this.get(`/users/${username}/messages`);
  }
}

const token = localStorage.getItem('authToken') || '';
export const userApi = new UserApi(token);
export const fetchMe = () => userApi.fetchMe();
export const fetchPublicKey = (u: string) => userApi.fetchPublicKey(u);
export const fetchAllMessages = (u: string) => userApi.fetchAllMessages(u);
