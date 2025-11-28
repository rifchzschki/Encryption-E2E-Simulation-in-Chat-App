import React, { createContext, useContext, useState } from "react";
import type { Token } from "../types/auth";

type AuthContextType ={
    token: Token;
    username: string | null;
    setUsername: (username: string | null) => void;
    setToken: (t: Token)=>void;
    isAuthenticated: boolean;
    logout: ()=>void;
}

const AuthContext = createContext<AuthContextType|undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState<Token>(null)
    const [username, setUsername] = useState<string | null>(null);
    function logout(){
        setToken(null)
        setUsername(null);
    }

    const value: AuthContextType ={
        token,
        username,
        setUsername,
        setToken,
        isAuthenticated: !!token,
        logout
    }
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}

export function useAuth(){
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be inside AuthProvider")
    return ctx;
}