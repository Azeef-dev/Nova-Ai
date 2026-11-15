"use client";

import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { ChatStatus, ModelOption, PersonaOption } from "@/types/chat";

type ChatComposerProps = {
    inputText: string;
    setInputText: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isDictating: boolean;
    onToggleDictation: () => void;
    status: ChatStatus;
    selectedPersona: PersonaOption;
    selectedModel: ModelOption;
};

export default function ChatComposer({
    inputText,
    setInputText,
    onSubmit,
    isDictating,
    onToggleDictation,
    status,
    selectedPersona,
    selectedModel,
}: ChatComposerProps) {
    return (
        <div className="border-t border-indigo-500/20 bg-slate-900/85 backdrop-blur-xl px-3 sm:px-8 py-3 shrink-0">
            <form
                onSubmit={onSubmit}
                className="max-w-4xl mx-auto flex items-center gap-2"
            >
                <button
                    type="button"
                    onClick={onToggleDictation}
                    title={
                        isDictating ? "Stop Voice Dictation" : "Dictate with Microphone"
                    }
                    className={`p-3 sm:p-3.5 rounded-2xl border transition cursor-pointer shrink-0 ${isDictating
                            ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                            : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                        }`}
                >
                    {isDictating ? (
                        <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </button>

                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Ask Nova anything (${selectedPersona.name})...`}
                    className="flex-1 min-w-0 rounded-2xl border border-slate-700/90 bg-slate-800/90 px-3.5 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                    type="submit"
                    disabled={!inputText.trim() || status === "thinking"}
                    className="cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-6 py-3 sm:py-3.5 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                    aria-label="Send message"
                >
                    <Send className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}