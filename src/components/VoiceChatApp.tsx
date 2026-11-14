"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Phone,
    PhoneOff,
    Send,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Trash2,
    Copy,
    Check,
    Sparkles,
    Bot,
    User,
    ChevronDown,
    Cpu,
    Globe,
    Sliders,
    Download,
    RefreshCw,
    Zap,
    ShieldCheck,
    Code2,
    Briefcase,
    GraduationCap,
    Headphones,
    Lightbulb,
    Square,
    Play,
    Gauge,
    MessageSquarePlus,
    Activity,
    PanelLeftClose,
    PanelLeftOpen,
    Layers,
    Radio,
    CheckCircle2,
} from "lucide-react";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    time: string;
    model?: string;
    latency?: string;
};

type ModelOption = {
    id: string;
    name: string;
    badge: string;
    description: string;
};

type PersonaOption = {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

type LanguageOption = {
    id: string;
    name: string;
    voiceLang: string;
    badge: string;
};

const DEFAULT_FREE_MODELS: ModelOption[] = [
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

const PERSONAS: PersonaOption[] = [
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

const LANGUAGES: LanguageOption[] = [
    { id: "en-US", name: "English (US)", voiceLang: "en-US", badge: "EN-US" },
    { id: "en-GB", name: "English (UK)", voiceLang: "en-GB", badge: "EN-GB" },
    { id: "ur-PK", name: "Urdu / Roman Urdu", voiceLang: "hi-IN", badge: "UR-PK" },
    { id: "hi-IN", name: "Hindi / Hinglish", voiceLang: "hi-IN", badge: "HI-IN" },
    { id: "ar-SA", name: "Arabic (MSA)", voiceLang: "ar-SA", badge: "AR-SA" },
];

const SPEECH_RATES = [
    { value: 0.9, label: "0.9x Calm" },
    { value: 1.0, label: "1.0x Natural" },
    { value: 1.1, label: "1.1x Dynamic" },
    { value: 1.25, label: "1.25x Fast" },
];

const QUICK_PROMPTS = [
    {
        title: "System Architecture",
        prompt: "Design a scalable microservices architecture for a real-time SaaS application.",
        icon: Code2,
    },
    {
        title: "Executive Summary",
        prompt: "Help me draft a high-impact Q3 product roadmap presentation for stakeholders.",
        icon: Briefcase,
    },
    {
        title: "Growth Strategy",
        prompt: "Give me 5 high-converting onboarding strategies for an AI SaaS product.",
        icon: Lightbulb,
    },
    {
        title: "Live Voice Practice",
        prompt: "Let's do a mock technical interview. Ask me your first question!",
        icon: Headphones,
    },
];

export default function VoiceChatApp() {
    const [models, setModels] = useState<ModelOption[]>(DEFAULT_FREE_MODELS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isDictating, setIsDictating] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [autoSpeakChat, setAutoSpeakChat] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");

    const [selectedModel, setSelectedModel] = useState<ModelOption>(DEFAULT_FREE_MODELS[0]);
    const [selectedPersona, setSelectedPersona] = useState<PersonaOption>(PERSONAS[0]);
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [openDropdown, setOpenDropdown] = useState<
        "model" | "persona" | "language" | "settings" | null
    >(null);

    const isCallActiveRef = useRef(false);
    const isMutedRef = useRef(false);
    const messagesRef = useRef<Message[]>([]);
    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    const selectedModelRef = useRef(selectedModel);
    const selectedPersonaRef = useRef(selectedPersona);
    const selectedLanguageRef = useRef(selectedLanguage);
    const speechRateRef = useRef(speechRate);

    useEffect(() => {
        selectedModelRef.current = selectedModel;
    }, [selectedModel]);

    useEffect(() => {
        selectedPersonaRef.current = selectedPersona;
    }, [selectedPersona]);

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    useEffect(() => {
        speechRateRef.current = speechRate;
    }, [speechRate]);

    // Dynamically load active free models from user's Groq API key
    useEffect(() => {
        async function fetchAvailableModels() {
            try {
                const res = await fetch("/api/chat");
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.models) && data.models.length > 0) {
                    const availableIds = new Set<string>(data.models);
                    const filteredDefaults = DEFAULT_FREE_MODELS.filter((m) =>
                        availableIds.has(m.id)
                    );
                    const extraModels: ModelOption[] = data.models
                        .filter((id: string) => !DEFAULT_FREE_MODELS.some((d) => d.id === id))
                        .slice(0, 6)
                        .map((id: string) => ({
                            id,
                            name: id,
                            badge: "FREE • Active",
                            description: "Verified active model on your Groq API key",
                        }));

                    const merged = [...filteredDefaults, ...extraModels];
                    if (merged.length > 0) {
                        setModels(merged);
                        setSelectedModel(merged[0]);
                    }
                }
            } catch {
                // Keep default models if offline
            }
        }
        fetchAvailableModels();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getBestVoice = (targetLang: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = targetLang.split("-")[0];

        return (
            voices.find(
                (v) =>
                    v.lang.toLowerCase().includes(targetLang.toLowerCase()) &&
                    (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium"))
            ) ||
            voices.find((v) => v.lang.toLowerCase().includes(targetLang.toLowerCase())) ||
            voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
            voices[0]
        );
    };

    const speakText = (text: string, msgId?: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        if (isMutedRef.current) {
            if (isCallActiveRef.current) startListening();
            else setStatus("idle");
            return;
        }

        window.speechSynthesis.cancel();
        setStatus("speaking");
        if (msgId) setSpeakingMessageId(msgId);

        const cleanText = text.replace(/[*#`_~]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voiceLang = selectedLanguageRef.current.voiceLang;
        const bestVoice = getBestVoice(voiceLang);

        if (bestVoice) utterance.voice = bestVoice;
        utterance.lang = voiceLang;
        utterance.rate = speechRateRef.current;

        utterance.onend = () => {
            setSpeakingMessageId(null);
            if (isCallActiveRef.current) {
                startListening();
            } else {
                setStatus("idle");
            }
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
            setStatus("idle");
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        if (!isCallActiveRef.current) {
            setStatus("idle");
        }
    };

    const startListening = () => {
        if (!isCallActiveRef.current || typeof window === "undefined") return;

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support Web Speech Recognition. Please use Google Chrome or Edge.");
            setStatus("idle");
            return;
        }

        try {
            recognitionRef.current?.stop();
        } catch { }

        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguageRef.current.id;
        recognition.interimResults = false;

        recognition.onstart = () => setStatus("listening");

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            sendMessageToAI(transcript, true);
        };

        recognition.onerror = (event: any) => {
            if (event.error === "no-speech" && isCallActiveRef.current) {
                startListening();
            } else {
                setStatus("idle");
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const toggleDictation = () => {
        if (typeof window === "undefined") return;

        if (isDictating) {
            recognitionRef.current?.stop();
            setIsDictating(false);
            setStatus("idle");
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Google Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguageRef.current.id;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsDictating(true);
            setStatus("listening");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsDictating(false);
            setStatus("idle");
        };

        recognition.onerror = () => {
            setIsDictating(false);
            setStatus("idle");
        };

        recognition.onend = () => {
            setIsDictating(false);
            if (!isCallActiveRef.current) setStatus("idle");
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const sendMessageToAI = async (text: string, isVoice: boolean) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            time: getCurrentTime(),
        };

        const updatedMessages = [...messagesRef.current, userMsg];
        messagesRef.current = updatedMessages;
        setMessages(updatedMessages);
        setStatus("thinking");

        const startTime = performance.now();

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    model: selectedModelRef.current.id,
                    persona: selectedPersonaRef.current.id,
                    language: selectedLanguageRef.current.id,
                    isVoiceCall: isVoice || isCallActiveRef.current,
                }),
            });

            const endTime = performance.now();
            const latency = `${((endTime - startTime) / 1000).toFixed(2)}s`;

            let replyText = "I apologize, I could not process that request. Please try again.";
            let actualModelUsed = selectedModelRef.current.name;

            if (response.ok) {
                const data = await response.json();
                replyText = data.reply || replyText;
                if (data.usedModel) {
                    actualModelUsed = data.usedModel;
                }
            }

            const aiMsgId = (Date.now() + 1).toString();
            const aiMsg: Message = {
                id: aiMsgId,
                role: "assistant",
                content: replyText,
                time: getCurrentTime(),
                model: actualModelUsed,
                latency,
            };

            messagesRef.current = [...messagesRef.current, aiMsg];
            setMessages([...messagesRef.current]);

            if (isVoice || isCallActiveRef.current || autoSpeakChat) {
                speakText(replyText, aiMsgId);
            } else {
                setStatus("idle");
            }
        } catch {
            const fallbackMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                    "Network error: Unable to reach the AI inference server. Please verify your internet connection.",
                time: getCurrentTime(),
            };

            messagesRef.current = [...messagesRef.current, fallbackMsg];
            setMessages([...messagesRef.current]);
            setStatus("idle");
        }
    };

    const regenerateLastResponse = () => {
        if (status === "thinking" || messagesRef.current.length === 0) return;
        const lastUserMessage = [...messagesRef.current]
            .reverse()
            .find((m) => m.role === "user");
        if (!lastUserMessage) return;

        if (messagesRef.current[messagesRef.current.length - 1].role === "assistant") {
            messagesRef.current = messagesRef.current.slice(0, -1);
            setMessages([...messagesRef.current]);
        }
        if (messagesRef.current[messagesRef.current.length - 1]?.id === lastUserMessage.id) {
            messagesRef.current = messagesRef.current.slice(0, -1);
        }

        sendMessageToAI(lastUserMessage.content, false);
    };

    const startCall = () => {
        setOpenDropdown(null);
        isCallActiveRef.current = true;
        setIsCallActive(true);
        const welcomeText =
            selectedLanguageRef.current.id === "ur-PK"
                ? "Assalam o Alaikum! Nova AI voice line active hai. Aap baat shuru kar sakte hain."
                : "Hello! Nova live voice session is active. How can I help you today?";

        const msgId = Date.now().toString();
        const welcomeMsg: Message = {
            id: msgId,
            role: "assistant",
            content: welcomeText,
            time: getCurrentTime(),
            model: selectedModelRef.current.name,
        };
        messagesRef.current = [...messagesRef.current, welcomeMsg];
        setMessages([...messagesRef.current]);
        speakText(welcomeText, msgId);
    };

    const endCall = () => {
        isCallActiveRef.current = false;
        setIsCallActive(false);
        setStatus("idle");
        setSpeakingMessageId(null);
        recognitionRef.current?.stop();
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    };

    const toggleMute = () => {
        const newMute = !isMuted;
        setIsMuted(newMute);
        isMutedRef.current = newMute;
        if (newMute && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            setStatus("idle");
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || status === "thinking") return;
        const text = inputText;
        setInputText("");
        sendMessageToAI(text, false);
    };

    const clearChat = () => {
        setMessages([]);
        messagesRef.current = [];
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        setStatus("idle");
        setOpenDropdown(null);
    };

    const exportChatTranscript = () => {
        if (messages.length === 0) return;
        const transcript = messages
            .map((m) => `[${m.time}] ${m.role.toUpperCase()}: ${m.content}`)
            .join("\n\n");
        const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nova-ai-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setOpenDropdown(null);
    };

    const copyMessage = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const PersonaIcon = selectedPersona.icon;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 text-slate-100">
            {/* Left Collapsible Enterprise Sidebar */}
            {isSidebarOpen && (
                <aside className="hidden md:flex md:w-72 lg:w-80 flex-col justify-between border-r border-indigo-500/20 bg-slate-900/75 backdrop-blur-2xl p-4 select-none shrink-0">
                    <div className="space-y-5 overflow-y-auto pr-1">
                        {/* Brand Header */}
                        <div className="flex items-center justify-between px-2 pt-1">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
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
                                    <p className="text-[11px] text-slate-400">Enterprise Voice Workspace</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                title="Collapse Sidebar"
                                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <PanelLeftClose className="w-4 h-4" />
                            </button>
                        </div>

                        {/* New Session CTA */}
                        <button
                            onClick={clearChat}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>Start New Conversation</span>
                        </button>

                        {/* Agent Persona Quick Switcher */}
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
                                            onClick={() => setSelectedPersona(persona)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${active
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm"
                                                : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                                                }`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg ${active
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

                    {/* Sidebar Bottom Telemetry Card */}
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
                            Model: <span className="text-indigo-300">{selectedModel.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                            <span>Messages: {messages.length}</span>
                            <span>Lang: {selectedLanguage.badge}</span>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Full-Viewport Workspace */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Top Enterprise Navigation & Dropdown Bar */}
                <header
                    ref={headerRef}
                    className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20"
                >
                    {/* Left Controls: Sidebar Toggle & Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                title="Open Sidebar"
                                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                            >
                                <PanelLeftOpen className="w-4 h-4" />
                            </button>
                        )}

                        {/* 1. Free Groq Model Dropdown */}
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
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "model" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openDropdown === "model" && (
                                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Groq Free Tier Models
                                    </div>
                                    {models.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${selectedModel.id === model.id
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                : "hover:bg-slate-800/80 text-slate-300"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold">{model.name}</span>
                                                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/15 text-emerald-300 font-medium">
                                                        {model.badge}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {model.description}
                                                </p>
                                            </div>
                                            {selectedModel.id === model.id && (
                                                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                                            )}
                                        </button>
                                    ))}
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
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "persona" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openDropdown === "persona" && (
                                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Select Agent Role & Persona
                                    </div>
                                    {PERSONAS.map((persona) => {
                                        const Icon = persona.icon;
                                        return (
                                            <button
                                                key={persona.id}
                                                onClick={() => {
                                                    setSelectedPersona(persona);
                                                    setOpenDropdown(null);
                                                }}
                                                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${selectedPersona.id === persona.id
                                                    ? "bg-indigo-600/25 border border-indigo-500/40 text-white"
                                                    : "hover:bg-slate-800/80 text-slate-300"
                                                    }`}
                                            >
                                                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-semibold">{persona.name}</div>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {persona.description}
                                                    </p>
                                                </div>
                                                {selectedPersona.id === persona.id && (
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
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "language" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openDropdown === "language" && (
                                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Voice & Chat Language
                                    </div>
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.id}
                                            onClick={() => {
                                                setSelectedLanguage(lang);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${selectedLanguage.id === lang.id
                                                ? "bg-indigo-600/25 border border-indigo-500/40 text-white font-semibold"
                                                : "hover:bg-slate-800/80 text-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                                                    {lang.badge}
                                                </span>
                                                <span>{lang.name}</span>
                                            </div>
                                            {selectedLanguage.id === lang.id && (
                                                <Check className="w-4 h-4 text-indigo-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Header Controls */}
                    <div className="flex items-center gap-2">
                        {/* Live Status Pill */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                            <span
                                className={`w-2 h-2 rounded-full ${status === "idle"
                                    ? "bg-emerald-400"
                                    : status === "listening"
                                        ? "bg-emerald-400 animate-ping"
                                        : status === "thinking"
                                            ? "bg-amber-400 animate-pulse"
                                            : "bg-indigo-400 animate-ping"
                                    }`}
                            />
                            <span className="capitalize font-medium">{status}</span>
                        </div>

                        <button
                            onClick={toggleMute}
                            title={isMuted ? "Unmute Audio Output" : "Mute Audio Output"}
                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4 text-rose-400" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-emerald-400" />
                            )}
                        </button>

                        {/* 4. Options & Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setOpenDropdown(openDropdown === "settings" ? null : "settings")
                                }
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                            >
                                <Sliders className="w-4 h-4 text-indigo-400" />
                                <span className="hidden sm:inline">Options</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === "settings" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openDropdown === "settings" && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Voice Playback Speed</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                                        {SPEECH_RATES.map((rate) => (
                                            <button
                                                key={rate.value}
                                                onClick={() => setSpeechRate(rate.value)}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${speechRate === rate.value
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                                                    }`}
                                            >
                                                <span>{rate.label}</span>
                                                {speechRate === rate.value && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-800 my-1" />

                                    <button
                                        onClick={() => setAutoSpeakChat(!autoSpeakChat)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Volume2 className="w-4 h-4 text-indigo-400" />
                                            <span>Auto-Read Text Replies</span>
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${autoSpeakChat
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                : "bg-slate-800 text-slate-400"
                                                }`}
                                        >
                                            {autoSpeakChat ? "ON" : "OFF"}
                                        </span>
                                    </button>

                                    <button
                                        onClick={exportChatTranscript}
                                        disabled={messages.length === 0}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 disabled:opacity-40 transition cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 text-indigo-400" />
                                        <span>Export Chat Transcript (.txt)</span>
                                    </button>

                                    <button
                                        onClick={clearChat}
                                        disabled={messages.length === 0}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-40 transition cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-400" />
                                        <span>Clear Conversation History</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Primary Voice Call Button */}
                        {!isCallActive ? (
                            <button
                                onClick={startCall}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Start Voice Call</span>
                            </button>
                        ) : (
                            <button
                                onClick={endCall}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 animate-pulse transition cursor-pointer"
                            >
                                <PhoneOff className="w-4 h-4" />
                                <span>End Call</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Live Voice Call Banner */}
                {isCallActive && (
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
                                    Speak naturally when the status is listening. Nova automatically listens after each response.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {status === "speaking" && (
                                <button
                                    onClick={stopSpeaking}
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
                )}

                {/* Main Scrollable Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 ? (
                            <div className="min-h-[65vh] flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/25 to-violet-500/25 border border-indigo-400/30 flex items-center justify-center mb-5 shadow-xl shadow-indigo-950/50">
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
                                    Running on <span className="text-emerald-300 font-semibold">{selectedModel.name}</span> in{" "}
                                    <span className="text-violet-300 font-semibold">{selectedPersona.name}</span> mode. Select a starter prompt below or start talking.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8 text-left">
                                    {QUICK_PROMPTS.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => sendMessageToAI(item.prompt, false)}
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
                                                ? "rounded-tr-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
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
                                                                    ? stopSpeaking()
                                                                    : speakText(msg.content, msg.id)
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
                                                            onClick={regenerateLastResponse}
                                                            className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-300 hover:text-white transition cursor-pointer"
                                                            title="Regenerate Response"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => copyMessage(msg.id, msg.content)}
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
                                <span>Nova is generating response with {selectedModel.name}...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Full-Width Bottom Input Composer */}
                <div className="border-t border-indigo-500/20 bg-slate-900/85 backdrop-blur-xl px-4 sm:px-8 py-3.5">
                    <form
                        onSubmit={handleTextSubmit}
                        className="max-w-4xl mx-auto flex items-center gap-2.5"
                    >
                        <button
                            type="button"
                            onClick={toggleDictation}
                            title={isDictating ? "Stop Voice Dictation" : "Dictate with Microphone"}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer ${isDictating
                                ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                                : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                                }`}
                        >
                            {isDictating ? (
                                <MicOff className="w-5 h-5" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Ask Nova anything (${selectedPersona.name} • ${selectedModel.name})...`}
                            className="flex-1 rounded-2xl border border-slate-700/90 bg-slate-800/90 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />

                        <button
                            type="submit"
                            disabled={!inputText.trim() || status === "thinking"}
                            className="cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            aria-label="Send message"
                        >
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
