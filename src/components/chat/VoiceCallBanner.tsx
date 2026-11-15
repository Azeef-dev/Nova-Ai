"use client";

import React from "react";
import { Activity, Square, Mic, Send } from "lucide-react";
import { ChatStatus } from "@/types/chat";

interface VoiceCallBannerProps {
    isCallActive: boolean;
    selectedLanguage: string;
    status: ChatStatus;
    liveTranscript: string;
    onInterruptSpeech: () => void;
    onForceSendTranscript: () => void;
}

export default function VoiceCallBanner({
    isCallActive,
    selectedLanguage,
    status,
    liveTranscript,
    onInterruptSpeech,
    onForceSendTranscript,
}: VoiceCallBannerProps) {
    if (!isCallActive) return null;

    return (
        <div className="px-4 lg:px-8 py-3 bg-gradient-to-r from-indigo-950/95 via-purple-950/90 to-indigo-950/95 border-b border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 shrink-0">
                    {status === "listening" ? (
                        <Mic className="w-5 h-5 text-rose-400 animate-pulse" />
                    ) : (
                        <Activity className="w-5 h-5 text-indigo-300 animate-pulse" />
                    )}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                            Hands-Free Duplex Voice Call Active
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {selectedLanguage}
                        </span>
                    </div>

                    {liveTranscript ? (
                        <p className="text-xs text-emerald-300 font-medium mt-0.5 truncate">
                            Hearing you: &ldquo;{liveTranscript}&rdquo;
                        </p>
                    ) : (
                        <p className="text-[11px] text-indigo-200/80 mt-0.5 truncate">
                            {status === "listening"
                                ? "Microphone is live — speak naturally now..."
                                : status === "thinking"
                                    ? "Nova is generating your response..."
                                    : status === "speaking"
                                        ? "Nova is speaking to you..."
                                        : "Ready for voice input..."}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
                {liveTranscript && (
                    <button
                        type="button"
                        onClick={onForceSendTranscript}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                    </button>
                )}

                {status === "speaking" && (
                    <button
                        type="button"
                        onClick={onInterruptSpeech}
                        className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Interrupt</span>
                    </button>
                )}

                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-indigo-500/30 text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
                    {status}
                </div>
            </div>
        </div>
    );
}