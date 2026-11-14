import {
    Briefcase,
    Code2,
    Lightbulb,
    GraduationCap,
    Headphones,
} from "lucide-react";
import {
    ModelOption,
    PersonaOption,
    LanguageOption,
    SpeechRateOption,
    QuickPromptOption,
} from "@/types/chat";

export const DEFAULT_FREE_MODELS: ModelOption[] = [
    {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        badge: "FREE • Ultra Fast",
        description: "Official Groq Free Tier • Best for real-time voice & chat",
    },
    {
        id: "llama3-8b-8192",
        name: "Meta Llama 3 8B",
        badge: "FREE • Fast",
        description: "Reliable 8K context window for daily tasks",
    },
    {
        id: "llama3-70b-8192",
        name: "Meta Llama 3 70B",
        badge: "FREE • Pro",
        description: "High intelligence model for coding & reasoning",
    },
    {
        id: "gemma2-9b-it",
        name: "Google Gemma 2 9B",
        badge: "FREE • Balanced",
        description: "Clean, structured & articulate responses",
    },
];

export const PERSONAS: PersonaOption[] = [
    {
        id: "assistant",
        name: "Executive Assistant",
        description: "Professional, concise & action-oriented",
        icon: Briefcase,
    },
    {
        id: "architect",
        name: "Software Architect",
        description: "Production code, debugging & system design",
        icon: Code2,
    },
    {
        id: "strategist",
        name: "Creative Strategist",
        description: "Marketing, copywriting & product growth",
        icon: Lightbulb,
    },
    {
        id: "tutor",
        name: "AI Learning Coach",
        description: "Clear step-by-step explanations & examples",
        icon: GraduationCap,
    },
    {
        id: "support",
        name: "Support Specialist",
        description: "Empathetic troubleshooting & resolution",
        icon: Headphones,
    },
];

export const LANGUAGES: LanguageOption[] = [
    { id: "en-US", name: "English (US)", voiceLang: "en-US", badge: "EN-US" },
    { id: "en-GB", name: "English (UK)", voiceLang: "en-GB", badge: "EN-GB" },
    { id: "ur-PK", name: "Urdu / Roman Urdu", voiceLang: "hi-IN", badge: "UR-PK" },
    { id: "hi-IN", name: "Hindi / Hinglish", voiceLang: "hi-IN", badge: "HI-IN" },
    { id: "ar-SA", name: "Arabic (MSA)", voiceLang: "ar-SA", badge: "AR-SA" },
];

export const SPEECH_RATES: SpeechRateOption[] = [
    { value: 0.9, label: "0.9x Calm" },
    { value: 1.0, label: "1.0x Natural" },
    { value: 1.1, label: "1.1x Dynamic" },
    { value: 1.25, label: "1.25x Fast" },
];

export const QUICK_PROMPTS: QuickPromptOption[] = [
    {
        title: "System Architecture",
        prompt:
            "Design a scalable microservices architecture for a real-time SaaS application.",
        icon: Code2,
    },
    {
        title: "Executive Summary",
        prompt:
            "Help me draft a high-impact Q3 product roadmap presentation for stakeholders.",
        icon: Briefcase,
    },
    {
        title: "Growth Strategy",
        prompt:
            "Give me 5 high-converting onboarding strategies for an AI SaaS product.",
        icon: Lightbulb,
    },
    {
        title: "Live Voice Practice",
        prompt:
            "Let's do a mock technical interview. Ask me your first question!",
        icon: Headphones,
    },
];