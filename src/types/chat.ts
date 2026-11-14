import React from "react";

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking";

export type DropdownType = "model" | "persona" | "language" | "settings" | null;

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    time: string;
    model?: string;
    latency?: string;
};

export type ModelOption = {
    id: string;
    name: string;
    badge: string;
    description: string;
};

export type PersonaOption = {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

export type LanguageOption = {
    id: string;
    name: string;
    voiceLang: string;
    badge: string;
};

export type SpeechRateOption = {
    value: number;
    label: string;
};

export type QuickPromptOption = {
    title: string;
    prompt: string;
    icon: React.ComponentType<{ className?: string }>;
};