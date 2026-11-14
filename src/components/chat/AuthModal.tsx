"use client";

import React, { useState } from "react";
import {
    X,
    Mail,
    Lock,
    User as UserIcon,
    Sparkles,
    ArrowRight,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { UserProfile } from "@/types/chat";

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: UserProfile) => void;
};

export default function AuthModal({
    isOpen,
    onClose,
    onSuccess,
}: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: mode,
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Authentication failed.");
            } else if (data.user) {
                onSuccess(data.user);
                onClose();
            }
        } catch {
            setError("Network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6 text-slate-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {mode === "login" ? "Welcome Back to Nova" : "Create Nova Account"}
                        </h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Sync your voice & chat history with MongoDB</span>
                        </p>
                    </div>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-800/90 mb-5">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("login");
                            setError("");
                        }}
                        className={[
                            "py-2 rounded-xl text-xs font-semibold transition cursor-pointer",
                            mode === "login"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-slate-400 hover:text-white",
                        ].join(" ")}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("signup");
                            setError("");
                        }}
                        className={[
                            "py-2 rounded-xl text-xs font-semibold transition cursor-pointer",
                            mode === "signup"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-slate-400 hover:text-white",
                        ].join(" ")}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {mode === "signup" && (
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>
                                    {mode === "login" ? "Sign In to Workspace" : "Create Account"}
                                </span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}