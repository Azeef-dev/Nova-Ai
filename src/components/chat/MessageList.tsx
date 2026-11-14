"use client";

import React from "react";
import {
    Bot,
    ShieldCheck,
    Zap,
    Square,
    Play,
    RefreshCw,
    Check,
    Copy,
    User,
} from "lucide-react";
import { QUICK_PROMPTS } from "@/constants/chatData";
import {
    ChatStatus,
    Message,
    ModelOption,
    PersonaOption,
} from "@/types/chat";

type MessageListProps = {
    messages: Message[];
    status: ChatStatus;
    selectedModel: ModelOption;
    selectedPersona: PersonaOption;
    speakingMessageId: string | null;
    copiedId: string | null;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
    onSendQuickPrompt: (prompt: string) => void;
    onSpeakText: (text: string, id: string) => void;
    onStopSpeaking: () => void;
    onRegenerate: () => void;
    onCopyMessage: (id: string, text: string) => void;
};

export default function MessageList({
    messages,
    status,
    selectedModel,
    selectedPersona,
    speakingMessageId,
    copiedId,
    chatEndRef,
    onSendQuickPrompt,
    onSpeakText,
    onStopSpeaking,
    onRegenerate,
    onCopyMessage,
}: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 ? (
                    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-indigo-500/25 to-violet-500/25 border border-indigo-400/30 flex items-center justify-center mb-5 shadow-xl shadow-indigo-950/50">
                            <Bot className="w-8 h-8 text-indigo-300" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Groq Free Inference • Real-Time Voice & Chat</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            How can Nova help you today?
                        </h2>
                        <p className="max-w-lg text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                            Running on{" "}
                            <span className="text-emerald-300 font-semibold">
                                {selectedModel.name}
                            </span>{" "}
                            in{" "}
                            <span className="text-violet-300 font-semibold">
                                {selectedPersona.name}
                            </span>{" "}
                            mode. Select a starter prompt below or start talking.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8 text-left">
                            {QUICK_PROMPTS.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onSendQuickPrompt(item.prompt)}
                                        className="group p-4 rounded-2xl bg-slate-800/55 hover:bg-slate-800/90 border border-slate-700/70 hover:border-indigo-500/60 transition-all text-left flex items-start gap-3.5 cursor-pointer shadow-md"
                                    >
                                        <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-white">
                                                {item.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                                                {item.prompt}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isLastAssistant =
                            msg.role === "assistant" && index === messages.length - 1;

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mt-0.5">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}

                                <div
                                    className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${msg.role === "user"
                                            ? "rounded-tr-sm bg-linear-to-br from-indigo-600 to-violet-600 text-white"
                                            : "rounded-tl-sm border border-slate-700/80 bg-slate-800/90 text-slate-100"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>

                                    <div
                                        className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${msg.role === "user"
                                                ? "border-indigo-400/30 text-indigo-100"
                                                : "border-slate-700/70 text-slate-400"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{msg.time}</span>
                                            {msg.model && (
                                                <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-indigo-300 text-[10px] font-medium">
                                                    {msg.model}
                                                </span>
                                            )}
                                            {msg.latency && (
                                                <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-medium">
                                                    <Zap className="w-3 h-3" />
                                                    {msg.latency}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {msg.role === "assistant" && (
                                                <button
                                                    onClick={() =>
                                                        speakingMessageId === msg.id
                                                            ? onStopSpeaking()
                                                            : onSpeakText(msg.content, msg.id)
                                                    }
                                                    className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-300 hover:text-white transition cursor-pointer"
                                                    title={
                                                        speakingMessageId === msg.id
                                                            ? "Stop Speaking"
                                                            : "Read Aloud"
                                                    }
                                                >
                                                    {speakingMessageId === msg.id ? (
                                                        <Square className="h-3.5 w-3.5 text-rose-400 fill-current" />
                                                    ) : (
                                                        <Play className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            )}

                                            {isLastAssistant && (
                                                <button
                                                    onClick={onRegenerate}
                                                    className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-300 hover:text-white transition cursor-pointer"
                                                    title="Regenerate Response"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => onCopyMessage(msg.id, msg.content)}
                                                className="p-1 rounded-lg hover:bg-slate-700/70 transition cursor-pointer"
                                                title="Copy Message"
                                            >
                                                {copiedId === msg.id ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {msg.role === "user" && (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-400/30 text-violet-300 mt-0.5">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {status === "thinking" && (
                    <div className="flex items-center gap-3 text-sm text-slate-200 bg-slate-800/80 border border-indigo-500/30 w-fit px-4 py-2.5 rounded-2xl shadow-md">
                        <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                        <span>
                            Nova is generating response with {selectedModel.name}...
                        </span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
}