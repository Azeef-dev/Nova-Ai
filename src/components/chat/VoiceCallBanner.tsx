"use client";

import React from "react";
import { Activity, Square } from "lucide-react";
import { ChatStatus, LanguageOption } from "@/types/chat";

type VoiceCallBannerProps = {
    isCallActive: boolean;
    selectedLanguage: LanguageOption;
    status: ChatStatus;
    onStopSpeaking: () => void;
};

export default function VoiceCallBanner({
    isCallActive,
    selectedLanguage,
    status,
    onStopSpeaking,
}: VoiceCallBannerProps) {
    if (!isCallActive) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-900/80 via-violet-900/80 to-indigo-900/80 border-b border-indigo-400/30 px-6 py-3 flex items-center justify-between text-xs text-indigo-100">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                        <span>Hands-Free Duplex Voice Call Active</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {selectedLanguage.badge}
                        </span>
                    </div>
                    <p className="text-[11px] text-indigo-200">
                        Speak naturally when the status is listening. Nova automatically
                        listens after each response.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {status === "speaking" && (
                    <button
                        onClick={onStopSpeaking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition cursor-pointer"
                    >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Interrupt</span>
                    </button>
                )}
                <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-white font-semibold uppercase tracking-wider text-[10px]">
                    {status}
                </span>
            </div>
        </div>
    );
}