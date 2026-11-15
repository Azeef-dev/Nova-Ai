import React from "react";

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking";

export type DropdownType = "model" | "persona" | "language" | "settings" | null;

export type UserProfile = {
    id: string;
    name: string;
    email: string;
};

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    time: string;
    model?: string;
    latency?: string;
};

export type ChatSessionItem = {
    _id: string;
    title: string;
    persona: string;
    model: string;
    language: string;
    messages: Message[];
    updatedAt: string;
};

export type ModelOption = {
    id: string;
    name: string;
    badge: string;
    description: string;
};

export type PersonaOption = {
    role: ReactNode;
    iconType(iconType: any): React.ReactNode;
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

export type LanguageOption = {
    code: Key | null | undefined;
    code(code: any): unknown;
    label: ReactNode;
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