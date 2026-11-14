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

const MODELS: ModelOption[] = [
    {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B Pro",
        badge: "Flagship",
        description: "Deep reasoning, coding & complex tasks",
    },
    {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        badge: "Ultra Fast",
        description: "Lowest latency for real-time voice calls",
    },
    {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B MoE",
        badge: "32k Context",
        description: "Balanced speed and detailed synthesis",
    },
    {
        id: "gemma2-9b-it",
        name: "Google Gemma 2 9B",
        badge: "Efficient",
        description: "Crisp, structured & concise responses",
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isCallActive, setIsCallActive] = useState(false);
    const [isDictating, setIsDictating] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [autoSpeakChat, setAutoSpeakChat] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");

    const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
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
        } catch (e) { }

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

            if (response.ok) {
                const data = await response.json();
                replyText = data.reply || replyText;
            }

            const aiMsgId = (Date.now() + 1).toString();
            const aiMsg: Message = {
                id: aiMsgId,
                role: "assistant",
                content: replyText,
                time: getCurrentTime(),
                model: selectedModelRef.current.name,
                latency,
            };

            messagesRef.current = [...messagesRef.current, aiMsg];
            setMessages([...messagesRef.current]);

            if (isVoice || isCallActiveRef.current || autoSpeakChat) {
                speakText(replyText, aiMsgId);
            } else {
                setStatus("idle");
            }
        } catch (error) {
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
        <div className="flex flex-col h-[94vh] max-w-5xl w-full mx-auto bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl shadow-indigo-950/60 overflow-hidden">
            {/* Top Header & Navigation */}
            <div
                ref={headerRef}
                className="relative z-30 flex flex-col gap-3 px-5 py-3.5 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950/90 border-b border-slate-800/90"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                            <Sparkles className="w-5 h-5 text-white" />
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${isCallActive
                                    ? "bg-emerald-400 animate-ping"
                                    : status === "thinking"
                                        ? "bg-amber-400 animate-pulse"
                                        : "bg-emerald-400"
                                    }`}
                            />
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${isCallActive
                                    ? "bg-emerald-400"
                                    : status === "thinking"
                                        ? "bg-amber-400"
                                        : "bg-emerald-400"
                                    }`}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-semibold text-base text-white tracking-tight">
                                    Nova AI Studio
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                    ENTERPRISE
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                {status === "idle" && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>System Ready • Real-Time Voice & Chat</span>
                                    </>
                                )}
                                {status === "listening" && (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="text-emerald-300">Listening... Speak naturally</span>
                                    </>
                                )}
                                {status === "thinking" && (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <span className="text-amber-300">Synthesizing response...</span>
                                    </>
                                )}
                                {status === "speaking" && (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                        <span className="text-indigo-300">Nova is speaking...</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right Header Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMute}
                            title={isMuted ? "Unmute Audio Output" : "Mute Audio Output"}
                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 transition cursor-pointer"
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4 text-rose-400" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-emerald-400" />
                            )}
                        </button>

                        {/* Options Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setOpenDropdown(openDropdown === "settings" ? null : "settings")
                                }
                                title="Voice & Workspace Settings"
                                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 text-xs font-medium transition cursor-pointer"
                            >
                                <Sliders className="w-4 h-4 text-indigo-400" />
                                <span className="hidden sm:inline">Options</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === "settings" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openDropdown === "settings" && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
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

                        {/* Voice Call Button */}
                        {!isCallActive ? (
                            <button
                                onClick={startCall}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Start Voice Call</span>
                            </button>
                        ) : (
                            <button
                                onClick={endCall}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 animate-pulse transition cursor-pointer"
                            >
                                <PhoneOff className="w-4 h-4" />
                                <span>End Call</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Second Row: Dropdown Selectors */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                    {/* Model Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setOpenDropdown(openDropdown === "model" ? null : "model")
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 transition cursor-pointer"
                        >
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-medium">{selectedModel.name}</span>
                            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
                                {selectedModel.badge}
                            </span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "model" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {openDropdown === "model" && (
                            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
                                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Select AI Inference Model
                                </div>
                                {MODELS.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${selectedModel.id === model.id
                                            ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
                                            : "hover:bg-slate-800/80 text-slate-300"
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold">{model.name}</span>
                                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-indigo-300 font-medium">
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

                    {/* Persona Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setOpenDropdown(openDropdown === "persona" ? null : "persona")
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 transition cursor-pointer"
                        >
                            <PersonaIcon className="w-3.5 h-3.5 text-violet-400" />
                            <span className="font-medium">{selectedPersona.name}</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "persona" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {openDropdown === "persona" && (
                            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
                                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                                                ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
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

                    {/* Language Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setOpenDropdown(openDropdown === "language" ? null : "language")
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 transition cursor-pointer"
                        >
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-medium">{selectedLanguage.name}</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === "language" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {openDropdown === "language" && (
                            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
                                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                                            ? "bg-indigo-600/20 border border-indigo-500/40 text-white font-semibold"
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

                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 transition cursor-pointer"
                        >
                            <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
                            <span>New Session</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Live Voice Call Banner */}
            {isCallActive && (
                <div className="bg-linear-to-r from-indigo-950/90 via-violet-950/90 to-indigo-950/90 border-b border-indigo-500/30 px-6 py-3 flex items-center justify-between text-xs text-indigo-100">
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
                            <p className="text-[11px] text-indigo-300">
                                Speak naturally when the indicator is green. Nova will automatically listen after replying.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {status === "speaking" && (
                            <button
                                onClick={stopSpeaking}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                            >
                                <Square className="w-3 h-3 fill-current" />
                                <span>Interrupt</span>
                            </button>
                        )}
                        <span className="px-3 py-1 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 font-semibold uppercase tracking-wider text-[10px]">
                            {status}
                        </span>
                    </div>
                </div>
            )}

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-6">
                        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-inner">
                            <Bot className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Welcome to Nova AI Enterprise Studio
                        </h2>
                        <p className="max-w-md text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                            Powered by <span className="text-indigo-300 font-medium">{selectedModel.name}</span> acting as your{" "}
                            <span className="text-violet-300 font-medium">{selectedPersona.name}</span>. Start typing below or launch a real-time voice call.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-left">
                            {QUICK_PROMPTS.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessageToAI(item.prompt, false)}
                                        className="group p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-left flex items-start gap-3.5 cursor-pointer shadow-sm"
                                    >
                                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
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
                                className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 mt-0.5">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}

                                <div
                                    className={`group relative max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-md ${msg.role === "user"
                                        ? "rounded-tr-sm bg-linear-to-br from-indigo-600 to-violet-600 text-white"
                                        : "rounded-tl-sm border border-slate-700/80 bg-slate-800/90 text-slate-100"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>

                                    <div
                                        className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${msg.role === "user"
                                            ? "border-indigo-400/30 text-indigo-100"
                                            : "border-slate-700/60 text-slate-400"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{msg.time}</span>
                                            {msg.model && (
                                                <span className="px-1.5 py-0.5 rounded bg-slate-900/70 text-slate-300 text-[10px]">
                                                    {msg.model}
                                                </span>
                                            )}
                                            {msg.latency && (
                                                <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]">
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
                                                        speakingMessageId === msg.id ? "Stop Speaking" : "Read Aloud"
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
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-300 mt-0.5">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {status === "thinking" && (
                    <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/60 w-fit px-4 py-2.5 rounded-2xl">
                        <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                        <span>Nova is thinking with {selectedModel.name}...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Bottom Input Area */}
            <form
                onSubmit={handleTextSubmit}
                className="flex items-center gap-2.5 border-t border-slate-800/90 bg-slate-950/90 px-4 py-3.5"
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
                    {isDictating ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message Nova (${selectedPersona.name})...`}
                    className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                    type="submit"
                    disabled={!inputText.trim() || status === "thinking"}
                    className="cursor-pointer rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    aria-label="Send message"
                >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}