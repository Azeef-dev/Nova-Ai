"use client";

import React from "react";
import Link from "next/link";
import {
    Sparkles,
    PanelLeftClose,
    MessageSquarePlus,
    Layers,
    Check,
    History,
    MessageSquare,
    Trash2,
    LogIn,
    UserPlus,
    LogOut,
    UserCheck,
} from "lucide-react";
import { ChatSessionItem, UserProfile } from "@/types/chat";
import { PERSONAS } from "@/constants/chatData";

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    selectedPersona: string;
    setSelectedPersona: (id: string) => void;
    selectedModel: string;
    selectedLanguage: string;
    onNewConversation: () => void;
    sessions: ChatSessionItem[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string, e: React.MouseEvent) => void;
    user: UserProfile | null;
    onLogout: () => void;
}

export default function Sidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    selectedPersona,
    setSelectedPersona,
    selectedModel,
    selectedLanguage,
    onNewConversation,
    sessions,
    activeSessionId,
    onSelectSession,
    onDeleteSession,
    user,
    onLogout,
}: SidebarProps) {
    const sidebarContainerClass = [
        "fixed md:relative z-40 h-full bg-slate-950/90 backdrop-blur-2xl border-indigo-500/20 shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isSidebarOpen
            ? "w-72 lg:w-80 translate-x-0 opacity-100 border-r shadow-2xl md:shadow-none"
            : "w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0 pointer-events-none",
    ].join(" ");

    return (
        <>
            <div
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isSidebarOpen
                    ? "opacity-100 pointer-events-auto cursor-pointer"
                    : "opacity-0 pointer-events-none"
                    }`}
            />

            <aside className={sidebarContainerClass}>
                <div className="w-72 lg:w-80 h-full flex flex-col justify-between">
                    {/* Top Brand */}
                    <div className="p-5 border-b border-indigo-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-bold text-base tracking-tight text-white">
                                        Nova AI
                                    </h1>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        PRO
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Enterprise Voice Studio
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            title="Collapse Sidebar"
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    </div>

                    {/* New Session CTA */}
                    <div className="p-4 pb-2">
                        <button
                            type="button"
                            onClick={onNewConversation}
                            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>Start New Conversation</span>
                        </button>
                    </div>

                    {/* Scrollable Middle Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 custom-scrollbar">
                        {/* Saved MongoDB Chat Sessions */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <History className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Saved Chat History
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                    {sessions.length}
                                </span>
                            </div>

                            {!user ? (
                                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-indigo-500/20 text-xs text-slate-400 space-y-2.5">
                                    <p>Sign in to save & sync your chat history.</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/login"
                                            className="py-2 px-3 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>Sign In</span>
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>Sign Up</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 text-center">
                                    No saved conversations yet. Send a message to auto-save!
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {sessions.map((item) => {
                                        const isActive = activeSessionId === item._id;
                                        return (
                                            <div
                                                key={item._id}
                                                onClick={() => onSelectSession(item._id)}
                                                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${isActive
                                                    ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                                                    : "bg-slate-900/40 border-transparent hover:bg-slate-900/80 hover:border-slate-800 text-slate-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                    <span className="text-xs font-medium truncate">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => onDeleteSession(item._id, e)}
                                                    title="Delete Conversation"
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* AI Persona Switcher */}
                        <div>
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    AI Specialist Persona
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {PERSONAS.map((persona) => {
                                    const active = selectedPersona === persona.id;
                                    const personaBtnClass = [
                                        "w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                                        active
                                            ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-md shadow-indigo-950/50"
                                            : "bg-slate-900/40 border-slate-800/70 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700",
                                    ].join(" ");

                                    return (
                                        <button
                                            key={persona.id}
                                            type="button"
                                            onClick={() => setSelectedPersona(persona.id)}
                                            className={personaBtnClass}
                                        >
                                            <div
                                                className={`p-2 rounded-lg mt-0.5 shrink-0 ${active
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-slate-800 text-slate-400"
                                                    }`}
                                            >
                                                <persona.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold truncate">
                                                        {persona.name}
                                                    </p>
                                                    {active && (
                                                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                                    {persona.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom User Account & Runtime Info */}
                    <div className="p-4 border-t border-indigo-500/20 bg-slate-950/70 space-y-3">
                        {user ? (
                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/25">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    title="Sign Out"
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    className="py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Sign In</span>
                                </Link>
                                <Link
                                    href="/signup"
                                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Sign Up</span>
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
                            <span className="truncate min-w-0">{selectedModel}</span>
                            <span className="text-indigo-300 font-medium shrink-0">
                                {selectedLanguage}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}