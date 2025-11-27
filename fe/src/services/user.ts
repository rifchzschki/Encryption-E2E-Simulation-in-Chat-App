import { ApiClient } from './api';

class UserApi extends ApiClient {
    async fetchMe(): Promise<{ username: string }> {
        return this.get('/me');
    }
    async fetchPublicKey(
        username: string
    ): Promise<{ username: string; public_key_pem: string }> {
        return this.get(`/users/${username}/public-key`);
    }
}

const baseURL = import.meta.env.VITE_PROTECTED_BASE_URL;
const token = localStorage.getItem('authToken') || '';
export const userApi = new UserApi(baseURL, token);
export const fetchMe = () => userApi.fetchMe();
export const fetchPublicKey = (u: string) => userApi.fetchPublicKey(u);
