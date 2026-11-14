"use client";

import React from "react";
import {
    Sparkles,
    PanelLeftClose,
    MessageSquarePlus,
    Layers,
    CheckCircle2,
    Radio,
} from "lucide-react";
import { PERSONAS } from "@/constants/chatData";
import { LanguageOption, ModelOption, PersonaOption } from "@/types/chat";

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    onClearChat: () => void;
    selectedPersona: PersonaOption;
    onSelectPersona: (persona: PersonaOption) => void;
    selectedModel: ModelOption;
    selectedLanguage: LanguageOption;
    messageCount: number;
};

export default function Sidebar({
    isOpen,
    onClose,
    onClearChat,
    selectedPersona,
    onSelectPersona,
    selectedModel,
    selectedLanguage,
    messageCount,
}: SidebarProps) {
    return (
        <>
            {/* Mobile Smooth Backdrop Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Smoothly Animated Sidebar Container */}
            <aside
                className={`fixed md:relative z-50 md:z-20 h-full shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen
                        ? "w-72 lg:w-80 translate-x-0 opacity-100 border-r border-indigo-500/20"
                        : "w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0"
                    }`}
            >
                {/* Fixed Inner Width Container prevents text squishing during slide */}
                <div className="w-72 lg:w-80 h-full flex flex-col justify-between bg-slate-900/85 backdrop-blur-2xl p-4 select-none">
                    <div className="space-y-5 overflow-y-auto pr-1">
                        {/* Brand Identity */}
                        <div className="flex items-center justify-between px-2 pt-1">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
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
                                        Enterprise Voice Workspace
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

                        {/* New Session Button */}
                        <button
                            onClick={onClearChat}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>Start New Conversation</span>
                        </button>

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
                                    return (
                                        <button
                                            key={persona.id}
                                            onClick={() => onSelectPersona(persona)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${active
                                                    ? "bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm"
                                                    : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                                                }`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg transition ${active
                                                        ? "bg-indigo-500 text-white"
                                                        : "bg-slate-800 text-indigo-400"
                                                    }`}
                                            >
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

                    {/* Bottom Engine Telemetry Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Groq Free Engine</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Connected
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate font-medium">
                            Model:{" "}
                            <span className="text-indigo-300">{selectedModel.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                            <span>Messages: {messageCount}</span>
                            <span>Lang: {selectedLanguage.badge}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}