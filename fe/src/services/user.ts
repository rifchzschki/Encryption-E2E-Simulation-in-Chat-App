import type { PublicKey, Token } from '../types/auth';
import { ApiClient } from './api';

export class UserApi extends ApiClient {
    constructor(token: Token) {
        super(import.meta.env.VITE_PROTECTED_BASE_URL, token);
    }
    async fetchMe(): Promise<{ username: string }> {
        return this.get('/me', { withCredentials: true });
    }
    async fetchPublicKey(
        username: string
    ): Promise<{ username: string; publicKeyHex: PublicKey }> {
        // console.log(username)
        return this.get(`/users/${username}/public-key`, {
          withCredentials: true,
        });
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
        return this.get(`/users/${username}/messages`, {
          withCredentials: true,
        });
    }
    async fetchFriends(
        username: string
    ): Promise<Array<{ id: number; username: string; avatar_url: string }>> {
        return this.get(`/friends/${username}`, { withCredentials: true });
    }
    async addFriend(
        username: string,
        friendUsername: string
    ): Promise<{ id: number; username: string; avatar_url: string }> {
        return this.post(
          '/friends',
          { username: username, friendUsername: friendUsername },
          { withCredentials: true }
        );
    }
}