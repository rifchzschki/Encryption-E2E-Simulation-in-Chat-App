import type { AuthInput, CredentialInfo } from "../types/auth";
import { generateKeyPair } from "../utils/crypto";
import { getEnv } from "../utils/env";
import { ApiClient } from "./api";

export class authService extends ApiClient{
    constructor(token?: string) {
        super(getEnv("VITE_API_BASE_URL", "http:/localhost:8080/api/"), token);
    }

    //register
    async register({username, password}: AuthInput){
        const {privateKeyHex, publicKeyHex} = await generateKeyPair(username, password);
        
        this.post<CredentialInfo>("/register", {username, publicKeyHex}).then((res) => {
            localStorage.setItem("privateKey", privateKeyHex)
            return res;
        })
    }

}