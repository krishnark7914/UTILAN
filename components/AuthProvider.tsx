"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { createContext, useContext, useMemo } from "react";

interface User {
    name: string;
    email: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    const authValue = useMemo(() => ({
        user: session?.user ? {
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || undefined,
        } : null,
        login: () => signIn("google", { prompt: "select_account" }),
        logout: () => signOut(),
        isLoading: status === "loading",
    }), [session, status]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthWrapper>{children}</AuthWrapper>
        </SessionProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
