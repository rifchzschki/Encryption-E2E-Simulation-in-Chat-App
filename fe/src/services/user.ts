import type { Token } from '../types/auth';
import { ApiClient } from './api';

export class UserApi extends ApiClient {
    constructor(token: Token) {
        super(import.meta.env.VITE_PROTECTED_BASE_URL, token);
    }
    async fetchMe(): Promise<{ username: string }> {
        return this.get('/me');
    }
    async fetchPublicKey(
        username: string
    ): Promise<{ username: string; public_key_pem: string }> {
        return this.get(`/users/${username}/public-key`);
    }
    async fetchMessages(
        username: string
    ): Promise<Array<{
        id: number;
        sender: string;
        receiver: string;
        ciphertext: string;
        timestamp: string;
    }>> {
        return this.get(`/users/${username}/messages`);
    }
}