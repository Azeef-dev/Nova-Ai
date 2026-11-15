"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Sparkles,
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    Radio,
    Cpu,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Please enter both email and password.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Signing in to your workspace...");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login",
                    email: email.trim(),
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Invalid login credentials.", {
                    id: loadingToast,
                });
                setLoading(false);
                return;
            }

            toast.success(`Welcome back, ${data.user.name}!`, {
                id: loadingToast,
            });
            router.push("/");
            router.refresh();
        } catch {
            toast.error("Network error occurred. Please try again.", {
                id: loadingToast,
            });
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen overflow-y-auto bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 relative">
            {/* Ambient Glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[130px]" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/25 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden">
                {/* Left Feature Panel */}
                <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-linear-to-br from-indigo-600/20 via-purple-600/15 to-slate-900/60 border-r border-indigo-500/20">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 hover:text-white transition-colors cursor-pointer mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Workspace
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white tracking-tight">
                                    Nova AI Studio
                                </h1>
                                <p className="text-xs text-indigo-300/80">
                                    Enterprise Voice & Chat Platform
                                </p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white leading-snug mb-3">
                            Sign in to sync your AI voice sessions.
                        </h2>
                        <p className="text-xs text-slate-300/80 leading-relaxed">
                            Access your saved conversations, custom AI personas, and real-time
                            hands-free duplex voice assistant from anywhere.
                        </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-indigo-500/20">
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <Radio className="w-4 h-4" />
                            </div>
                            <span>Real-Time Hands-Free Duplex Voice Call</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <span>Powered by Groq Ultra-Fast Free Models</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span>MongoDB Encrypted Session History</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Enter your account credentials to continue
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-indigo-500/20 text-xs text-slate-300 hover:text-white cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Home
                        </Link>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/90 border border-indigo-500/25 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/90 border border-indigo-500/25 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogIn className="w-4 h-4" />
                            )}
                            <span>{loading ? "Signing In..." : "Sign In to Workspace"}</span>
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-indigo-500/15 text-center">
                        <p className="text-xs text-slate-400">
                            Don&apos;t have an account yet?{" "}
                            <Link
                                href="/signup"
                                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer ml-1"
                            >
                                Create Free Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}