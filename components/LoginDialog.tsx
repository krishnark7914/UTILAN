"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

export function LoginDialog() {
    const [open, setOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { login } = useAuth();

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login();
        setOpen(false);
    };

    const handleGoogleLogin = () => {
        login();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 px-6 font-semibold">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                {/* Visual Header */}
                <div className="relative h-48 flex flex-col items-center justify-center p-8 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-700 dark:from-primary/20 dark:via-primary/10 dark:to-blue-900/10" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                        <div className="h-16 w-16 rounded-2xl bg-white dark:bg-primary shadow-xl flex items-center justify-center transform transition-transform hover:scale-110 duration-500">
                            <span className="text-3xl font-black text-primary dark:text-primary-foreground">U</span>
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black tracking-tight text-white dark:text-foreground">
                                {isSignUp ? "Join UTILAN" : "Welcome Back"}
                            </DialogTitle>
                            <DialogDescription className="text-white/80 dark:text-muted-foreground font-medium">
                                {isSignUp
                                    ? "Start building your dream routines."
                                    : "Continue your streak to greatness."}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 space-y-6">
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full py-7 rounded-2xl border-2 dark:border-border/50 hover:bg-muted font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-sm"
                        onClick={handleGoogleLogin}
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="relative z-10">Continue with Google</span>
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-muted-foreground">
                            <span className="bg-background px-4">Or use email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full font-black py-7 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg mt-2">
                            {isSignUp ? "Create My Account" : "Sign In to UTILAN"}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {isSignUp ? "Joined us before? " : "New to UTILAN? "}
                            <button
                                type="button"
                                className="font-bold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? "Sign In" : "Create Account"}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Security Message */}
                <div className="p-4 bg-muted/30 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                        Secure 256-bit encrypted authentication
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
