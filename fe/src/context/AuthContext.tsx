import { Token } from "@mui/icons-material";
import React, { createContext, useContext, useState } from "react";

type AuthContextType ={
    token: string|null
    setToken: (t: string|null)=>void;
    isAuthenticated: boolean;
    logout: ()=>void;
}

const AuthContext = createContext<AuthContextType|undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState<string|null>(null)

    function logout(){
        setToken(null)
    }

    const value: AuthContextType ={
        token,
        setToken,
        isAuthenticated: !!Token,
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