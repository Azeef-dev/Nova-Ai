"use client";

import React from "react";
import Link from "next/link";
import {
    PanelLeftOpen,
    Cpu,
    ChevronDown,
    Check,
    Globe,
    SlidersHorizontal,
    Gauge,
    Volume2,
    VolumeX,
    Download,
    Trash2,
    PhoneCall,
    PhoneOff,
    LogIn,
    UserCheck,
} from "lucide-react";
import {
    DropdownType,
    ModelOption,
    PersonaOption,
    LanguageOption,
    UserProfile,
} from "@/types/chat";
import { LANGUAGES, PERSONAS, SPEECH_RATES } from "@/constants/chatData";

interface TopNavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    openDropdown: DropdownType;
    setOpenDropdown: (dropdown: DropdownType) => void;
    dropdownContainerRef: React.RefObject<HTMLDivElement | null>;
    availableModels: ModelOption[];
    currentModel: ModelOption;
    selectedModel: string;
    setSelectedModel: (id: string) => void;
    currentPersona: PersonaOption;
    selectedPersona: string;
    setSelectedPersona: (id: string) => void;
    currentLanguage: LanguageOption;
    selectedLanguage: string;
    setSelectedLanguage: (code: string) => void;
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    autoSpeakReplies: boolean;
    setAutoSpeakReplies: (auto: boolean) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    isCallActive: boolean;
    onStartVoiceCall: () => void;
    onEndVoiceCall: () => void;
    onExportTranscript: () => void;
    onClearConversation: () => void;
    onStopSpeaking: () => void;
    user: UserProfile | null;
}

export default function TopNavbar({
    isSidebarOpen,
    setIsSidebarOpen,
    openDropdown,
    setOpenDropdown,
    dropdownContainerRef,
    availableModels,
    currentModel,
    selectedModel,
    setSelectedModel,
    currentPersona,
    selectedPersona,
    setSelectedPersona,
    currentLanguage,
    selectedLanguage,
    setSelectedLanguage,
    speechRate,
    setSpeechRate,
    autoSpeakReplies,
    setAutoSpeakReplies,
    isMuted,
    setIsMuted,
    isCallActive,
    onStartVoiceCall,
    onEndVoiceCall,
    onExportTranscript,
    onClearConversation,
    onStopSpeaking,
    user,
}: TopNavbarProps) {
    return (
        <header
            ref={dropdownContainerRef}
            className="min-h-16 px-4 lg:px-6 py-2.5 bg-slate-950/75 backdrop-blur-xl border-b border-indigo-500/20 flex items-center gap-3 shrink-0 z-30 flex-wrap gap-y-2"
        >
            {/* Left Controls & Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap gap-y-2">
                {!isSidebarOpen && (
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        title="Open Sidebar"
                        className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all cursor-pointer"
                    >
                        <PanelLeftOpen className="w-4 h-4" />
                    </button>
                )}

                {/* 1. AI Model Selector Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenDropdown(openDropdown === "model" ? null : "model")
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-indigo-500/25 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-28 sm:max-w-40">
                            {currentModel.name}
                        </span>
                        <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            {currentModel.badge}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>

                    {openDropdown === "model" && (
                        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl p-2 z-50 max-h-96 overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Groq Free Tier Models
                                </p>
                                <span className="text-[10px] text-emerald-400 font-medium">
                                    Auto-Fallback Ready
                                </span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {availableModels.length === 0 && (
                                    <div className="px-3 py-3 text-[11px] text-slate-500">
                                        No active chat models found on this Groq key.
                                    </div>
                                )}
                                {availableModels.map((model) => {
                                    const active = selectedModel === model.id;
                                    return (
                                        <button
                                            key={model.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedModel(model.id);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${active
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                : "hover:bg-slate-800/80 text-slate-300"
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold truncate">
                                                        {model.name}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
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
                        </div>
                    )}
                </div>

                {/* 2. Persona Selector Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenDropdown(openDropdown === "persona" ? null : "persona")
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-indigo-500/25 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <span className="text-indigo-400">
                            <currentPersona.icon className="w-4 h-4" />
                        </span>
                        <span className="hidden md:inline">{currentPersona.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "persona" && (
                        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl p-2 z-50">
                            <div className="px-3 py-2 border-b border-slate-800">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Switch AI Persona
                                </p>
                            </div>
                            <div className="mt-1 space-y-1">
                                {PERSONAS.map((persona) => {
                                    const active = selectedPersona === persona.id;
                                    return (
                                        <button
                                            key={persona.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPersona(persona.id);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${active
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                : "hover:bg-slate-800/80 text-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-indigo-400">
                                                    <persona.icon className="w-4 h-4" />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-semibold">
                                                        {persona.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {persona.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {active && <Check className="w-4 h-4 text-indigo-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Language Selector Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenDropdown(openDropdown === "language" ? null : "language")
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-indigo-500/25 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span className="hidden sm:inline">{currentLanguage.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "language" && (
                        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl p-2 z-50">
                            <div className="px-3 py-2 border-b border-slate-800">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Voice & Chat Language
                                </p>
                            </div>
                            <div className="mt-1 space-y-1">
                                {LANGUAGES.map((lang) => {
                                    const active = selectedLanguage === lang.id;
                                    return (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage(lang.id);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${active
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                : "hover:bg-slate-800/80 text-slate-300"
                                                }`}
                                        >
                                            <div>
                                                <p className="text-xs font-semibold">{lang.name}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {lang.badge}
                                                </p>
                                            </div>
                                            {active && <Check className="w-4 h-4 text-indigo-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Live Status Pill — fills the empty middle space elegantly on wide screens */}
            <div className="hidden xl:flex flex-1 items-center justify-center min-w-0 px-4">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-indigo-500/20 text-[11px] font-medium text-slate-300 shadow-inner shadow-black/20">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-300 font-semibold">Nova is live</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-indigo-300">
                        <currentPersona.icon className="w-3 h-3" />
                        {currentPersona.name}
                    </span>
                </div>
            </div>

            {/* Right Action Bar — ml-auto keeps it flush right even when the header wraps */}
            <div className="flex items-center gap-2.5 flex-wrap justify-end ml-auto">
                {!user ? (
                    <Link
                        href="/login"
                        className="hidden sm:flex px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/25 text-xs font-medium text-indigo-300 items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                    </Link>
                ) : (
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="truncate max-w-27.5">{user.name}</span>
                    </div>
                )}

                {/* Mute Button */}
                <button
                    type="button"
                    onClick={() => {
                        const nextMute = !isMuted;
                        setIsMuted(nextMute);
                        if (nextMute) onStopSpeaking();
                    }}
                    title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isMuted
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25"
                        : "bg-slate-900/90 border-indigo-500/25 text-emerald-400 hover:bg-slate-800"
                        }`}
                >
                    {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                </button>

                {/* 4. Workspace Settings Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenDropdown(openDropdown === "settings" ? null : "settings")
                        }
                        className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/25 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                        <span className="hidden sm:inline">Options</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {openDropdown === "settings" && (
                        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl p-3 z-50 space-y-3">
                            <div className="px-2 py-1 border-b border-slate-800">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Voice & Workspace Settings
                                </p>
                            </div>

                            <div className="px-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2">
                                    <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Voice Playback Speed</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {SPEECH_RATES.map((rate) => (
                                        <button
                                            key={rate.value}
                                            type="button"
                                            onClick={() => setSpeechRate(rate.value)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${speechRate === rate.value
                                                ? "bg-indigo-600/30 border-indigo-500 text-white"
                                                : "bg-slate-800/70 border-slate-700/70 text-slate-400 hover:text-white"
                                                }`}
                                        >
                                            {rate.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-2 pt-1 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setAutoSpeakReplies(!autoSpeakReplies)}
                                    className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-800/70 flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                                >
                                    <span>Auto-Read Chat Replies</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${autoSpeakReplies
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "bg-slate-800 text-slate-400"
                                            }`}
                                    >
                                        {autoSpeakReplies ? "ON" : "OFF"}
                                    </span>
                                </button>
                            </div>

                            <div className="px-2 pt-1 border-t border-slate-800/80 space-y-1">
                                <button
                                    type="button"
                                    onClick={onExportTranscript}
                                    className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-800/70 flex items-center gap-2.5 text-xs text-slate-200 transition-colors cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Download Transcript (.txt)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClearConversation}
                                    className="w-full py-2 px-2.5 rounded-xl hover:bg-rose-500/15 flex items-center gap-2.5 text-xs text-rose-300 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Clear Conversation</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Voice Call Start/End CTA */}
                {!isCallActive ? (
                    <button
                        type="button"
                        onClick={onStartVoiceCall}
                        className="px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                        <PhoneCall className="w-4 h-4" />
                        <span>Start Voice Call</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onEndVoiceCall}
                        className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
                    >
                        <PhoneOff className="w-4 h-4" />
                        <span>End Call</span>
                    </button>
                )}
            </div>
        </header>
    );
}