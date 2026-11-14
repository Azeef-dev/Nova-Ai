"use client";

import React from "react";
import {
    PanelLeftOpen,
    Cpu,
    ChevronDown,
    Check,
    Globe,
    Volume2,
    VolumeX,
    Sliders,
    Gauge,
    Download,
    Trash2,
    Phone,
    PhoneOff,
    LogIn,
    UserCheck,
} from "lucide-react";
import { PERSONAS, LANGUAGES, SPEECH_RATES } from "@/constants/chatData";
import {
    ChatStatus,
    DropdownType,
    LanguageOption,
    ModelOption,
    PersonaOption,
    UserProfile,
} from "@/types/chat";

type TopNavbarProps = {
    headerRef: React.RefObject<HTMLElement | null>;
    isSidebarOpen: boolean;
    onOpenSidebar: () => void;
    models: ModelOption[];
    selectedModel: ModelOption;
    onSelectModel: (model: ModelOption) => void;
    selectedPersona: PersonaOption;
    onSelectPersona: (persona: PersonaOption) => void;
    selectedLanguage: LanguageOption;
    onSelectLanguage: (lang: LanguageOption) => void;
    openDropdown: DropdownType;
    setOpenDropdown: (dropdown: DropdownType) => void;
    status: ChatStatus;
    isMuted: boolean;
    onToggleMute: () => void;
    speechRate: number;
    onSelectSpeechRate: (rate: number) => void;
    autoSpeakChat: boolean;
    onToggleAutoSpeak: () => void;
    onExportTranscript: () => void;
    onClearChat: () => void;
    hasMessages: boolean;
    isCallActive: boolean;
    onStartCall: () => void;
    onEndCall: () => void;
    user: UserProfile | null;
    onOpenAuth: () => void;
};

export default function TopNavbar({
    headerRef,
    isSidebarOpen,
    onOpenSidebar,
    models,
    selectedModel,
    onSelectModel,
    selectedPersona,
    onSelectPersona,
    selectedLanguage,
    onSelectLanguage,
    openDropdown,
    setOpenDropdown,
    status,
    isMuted,
    onToggleMute,
    speechRate,
    onSelectSpeechRate,
    autoSpeakChat,
    onToggleAutoSpeak,
    onExportTranscript,
    onClearChat,
    hasMessages,
    isCallActive,
    onStartCall,
    onEndCall,
    user,
    onOpenAuth,
}: TopNavbarProps) {
    const PersonaIcon = selectedPersona.icon;

    const sidebarBtnClass = [
        "p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all duration-200 cursor-pointer",
        isSidebarOpen
            ? "md:opacity-0 md:w-0 md:p-0 md:border-0 md:overflow-hidden"
            : "opacity-100",
    ].join(" ");

    return (
        <header
            ref={headerRef}
            className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20"
        >
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={onOpenSidebar}
                    title="Expand Sidebar"
                    className={sidebarBtnClass}
                >
                    <PanelLeftOpen className="w-4 h-4" />
                </button>

                {/* 1. Groq Free Model Dropdown */}
                <div className="relative">
                    <button
                        onClick={() =>
                            setOpenDropdown(openDropdown === "model" ? null : "model")
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-100 transition cursor-pointer"
                    >
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold">{selectedModel.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            {selectedModel.badge}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "model" && (
                        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Groq Free Tier Models
                            </div>
                            {models.map((model) => {
                                const active = selectedModel.id === model.id;
                                const itemClass = [
                                    "w-full flex items-start justify-between p-2.5 rounded-xl text-left transition cursor-pointer",
                                    active
                                        ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                        : "hover:bg-slate-800/80 text-slate-300",
                                ].join(" ");

                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onSelectModel(model);
                                            setOpenDropdown(null);
                                        }}
                                        className={itemClass}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold">
                                                    {model.name}
                                                </span>
                                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/15 text-emerald-300 font-medium">
                                                    {model.badge}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {model.description}
                                            </p>
                                        </div>
                                        {active && (
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 2. Persona Dropdown */}
                <div className="relative">
                    <button
                        onClick={() =>
                            setOpenDropdown(openDropdown === "persona" ? null : "persona")
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-100 transition cursor-pointer"
                    >
                        <PersonaIcon className="w-3.5 h-3.5 text-violet-400" />
                        <span className="font-medium">{selectedPersona.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "persona" && (
                        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Select Agent Role & Persona
                            </div>
                            {PERSONAS.map((persona) => {
                                const Icon = persona.icon;
                                const active = selectedPersona.id === persona.id;
                                const itemClass = [
                                    "w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer",
                                    active
                                        ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                        : "hover:bg-slate-800/80 text-slate-300",
                                ].join(" ");

                                return (
                                    <button
                                        key={persona.id}
                                        onClick={() => {
                                            onSelectPersona(persona);
                                            setOpenDropdown(null);
                                        }}
                                        className={itemClass}
                                    >
                                        <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold">
                                                {persona.name}
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {persona.description}
                                            </p>
                                        </div>
                                        {active && (
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Language Dropdown */}
                <div className="relative">
                    <button
                        onClick={() =>
                            setOpenDropdown(openDropdown === "language" ? null : "language")
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-100 transition cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-medium">{selectedLanguage.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "language" && (
                        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Voice & Chat Language
                            </div>
                            {LANGUAGES.map((lang) => {
                                const active = selectedLanguage.id === lang.id;
                                const itemClass = [
                                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer",
                                    active
                                        ? "bg-indigo-600/25 border border-indigo-500/40 text-white font-semibold"
                                        : "hover:bg-slate-800/80 text-slate-300",
                                ].join(" ");

                                return (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            onSelectLanguage(lang);
                                            setOpenDropdown(null);
                                        }}
                                        className={itemClass}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                                                {lang.badge}
                                            </span>
                                            <span>{lang.name}</span>
                                        </div>
                                        {active && <Check className="w-4 h-4 text-indigo-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
                {!user ? (
                    <button
                        onClick={onOpenAuth}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-indigo-300 transition cursor-pointer"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sign In</span>
                    </button>
                ) : (
                    <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{user.name}</span>
                    </div>
                )}

                <button
                    onClick={onToggleMute}
                    title={isMuted ? "Unmute Audio Output" : "Mute Audio Output"}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                >
                    {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                </button>

                {/* 4. Options Dropdown */}
                <div className="relative">
                    <button
                        onClick={() =>
                            setOpenDropdown(openDropdown === "settings" ? null : "settings")
                        }
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                    >
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        <span className="hidden sm:inline">Options</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {openDropdown === "settings" && (
                        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Voice Playback Speed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                                {SPEECH_RATES.map((rate) => {
                                    const active = speechRate === rate.value;
                                    const rateClass = [
                                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between",
                                        active
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-800/80 text-slate-300 hover:bg-slate-700",
                                    ].join(" ");

                                    return (
                                        <button
                                            key={rate.value}
                                            onClick={() => onSelectSpeechRate(rate.value)}
                                            className={rateClass}
                                        >
                                            <span>{rate.label}</span>
                                            {active && <Check className="w-3 h-3" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-slate-800 my-1" />

                            <button
                                onClick={onToggleAutoSpeak}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-indigo-400" />
                                    <span>Auto-Read Text Replies</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-indigo-300">
                                    {autoSpeakChat ? "ON" : "OFF"}
                                </span>
                            </button>

                            <button
                                onClick={onExportTranscript}
                                disabled={!hasMessages}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 disabled:opacity-40 transition cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-indigo-400" />
                                <span>Export Chat Transcript (.txt)</span>
                            </button>

                            <button
                                onClick={onClearChat}
                                disabled={!hasMessages}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-40 transition cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 text-rose-400" />
                                <span>Clear Current Screen</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Voice Call Button */}
                {!isCallActive ? (
                    <button
                        onClick={onStartCall}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                    >
                        <Phone className="w-4 h-4" />
                        <span>Start Voice Call</span>
                    </button>
                ) : (
                    <button
                        onClick={onEndCall}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 animate-pulse transition cursor-pointer"
                    >
                        <PhoneOff className="w-4 h-4" />
                        <span>End Call</span>
                    </button>
                )}
            </div>
        </header>
    );
}