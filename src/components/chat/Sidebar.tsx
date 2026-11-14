"use client";

import React from "react";
import {
    Sparkles,
    PanelLeftClose,
    MessageSquarePlus,
    Layers,
    CheckCircle2,
    MessageSquare,
    Trash2,
    LogIn,
    LogOut,
    UserCheck,
    Database,
} from "lucide-react";
import { PERSONAS } from "@/constants/chatData";
import {
    ChatSessionItem,
    LanguageOption,
    ModelOption,
    PersonaOption,
    UserProfile,
} from "@/types/chat";

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    selectedPersona: PersonaOption;
    onSelectPersona: (persona: PersonaOption) => void;
    selectedModel: ModelOption;
    selectedLanguage: LanguageOption;
    user: UserProfile | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    sessions: ChatSessionItem[];
    activeSessionId: string | null;
    onSelectSession: (session: ChatSessionItem) => void;
    onDeleteSession: (id: string, e: React.MouseEvent) => void;
};

export default function Sidebar({
    isOpen,
    onClose,
    onNewChat,
    selectedPersona,
    onSelectPersona,
    selectedModel,
    selectedLanguage,
    user,
    onOpenAuth,
    onLogout,
    sessions,
    activeSessionId,
    onSelectSession,
    onDeleteSession,
}: SidebarProps) {
    const overlayClass = [
        "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
    ].join(" ");

    const asideClass = [
        "fixed md:relative z-50 md:z-20 h-full shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isOpen
            ? "w-72 lg:w-80 translate-x-0 opacity-100 border-r border-indigo-500/20"
            : "w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0",
    ].join(" ");

    return (
        <>
            <div onClick={onClose} className={overlayClass} />

            <aside className={asideClass}>
                <div className="w-72 lg:w-80 h-full flex flex-col justify-between bg-slate-900/90 backdrop-blur-2xl p-4 select-none">
                    <div className="space-y-5 overflow-y-auto pr-1 flex-1">
                        {/* Brand Header */}
                        <div className="flex items-center justify-between px-2 pt-1">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-base text-white tracking-tight">
                                            Nova AI
                                        </span>
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            PRO
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Enterprise Voice Studio
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                title="Collapse Sidebar"
                                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <PanelLeftClose className="w-4 h-4" />
                            </button>
                        </div>

                        {/* New Conversation Button */}
                        <button
                            onClick={onNewChat}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>Start New Conversation</span>
                        </button>

                        {/* Saved MongoDB Chat History */}
                        <div className="space-y-1.5">
                            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Saved Chat History</span>
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {sessions.length}
                                </span>
                            </div>

                            {!user ? (
                                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 space-y-2">
                                    <p>Sign in to save & sync your conversations in MongoDB.</p>
                                    <button
                                        onClick={onOpenAuth}
                                        className="w-full py-1.5 px-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>Login / Sign Up</span>
                                    </button>
                                </div>
                            ) : sessions.length === 0 ? (
                                <p className="px-2 py-2 text-xs text-slate-500">
                                    No saved conversations yet. Start chatting!
                                </p>
                            ) : (
                                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                    {sessions.map((item) => {
                                        const isActive = activeSessionId === item._id;
                                        const itemClass = [
                                            "group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer",
                                            isActive
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                : "hover:bg-slate-800/70 text-slate-300 border border-transparent",
                                        ].join(" ");

                                        return (
                                            <div
                                                key={item._id}
                                                onClick={() => onSelectSession(item)}
                                                className={itemClass}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => onDeleteSession(item._id, e)}
                                                    title="Delete Chat"
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
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
                        <div className="space-y-1.5">
                            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                <span>AI Specialist Persona</span>
                            </div>
                            <div className="space-y-1">
                                {PERSONAS.map((persona) => {
                                    const Icon = persona.icon;
                                    const active = selectedPersona.id === persona.id;
                                    const btnClass = [
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition cursor-pointer",
                                        active
                                            ? "bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm"
                                            : "hover:bg-slate-800/60 text-slate-300 border border-transparent",
                                    ].join(" ");

                                    const iconClass = [
                                        "p-2 rounded-lg transition",
                                        active
                                            ? "bg-indigo-500 text-white"
                                            : "bg-slate-800 text-indigo-400",
                                    ].join(" ");

                                    return (
                                        <button
                                            key={persona.id}
                                            onClick={() => onSelectPersona(persona)}
                                            className={btnClass}
                                        >
                                            <div className={iconClass}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold truncate">
                                                    {persona.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {persona.description}
                                                </div>
                                            </div>
                                            {active && (
                                                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom User Account & Telemetry Footer */}
                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        {user ? (
                            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-white truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    title="Sign Out"
                                    className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                            >
                                <LogIn className="w-4 h-4 text-indigo-400" />
                                <span>Sign In / Create Account</span>
                            </button>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                            <span className="truncate">{selectedModel.name}</span>
                            <span>{selectedLanguage.badge}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}