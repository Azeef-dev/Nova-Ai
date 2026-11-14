"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    DEFAULT_FREE_MODELS,
    PERSONAS,
    LANGUAGES,
} from "@/constants/chatData";
import {
    ChatStatus,
    DropdownType,
    LanguageOption,
    Message,
    ModelOption,
    PersonaOption,
} from "@/types/chat";
import Sidebar from "@/components/chat/Sidebar";
import TopNavbar from "@/components/chat/TopNavbar";
import VoiceCallBanner from "@/components/chat/VoiceCallBanner";
import MessageList from "@/components/chat/MessageList";
import ChatComposer from "@/components/chat/ChatComposer";

export default function VVIPVoiceChatApp() {
    const [models, setModels] = useState<ModelOption[]>(DEFAULT_FREE_MODELS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isDictating, setIsDictating] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [autoSpeakChat, setAutoSpeakChat] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
        null
    );
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [status, setStatus] = useState<ChatStatus>("idle");

    const [selectedModel, setSelectedModel] = useState<ModelOption>(
        DEFAULT_FREE_MODELS[0]
    );
    const [selectedPersona, setSelectedPersona] = useState<PersonaOption>(
        PERSONAS[0]
    );
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
        LANGUAGES[0]
    );
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

    const isCallActiveRef = useRef(false);
    const isMutedRef = useRef(false);
    const messagesRef = useRef<Message[]>([]);
    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);

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

    // Fetch active free models from Groq API
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
                        .filter(
                            (id: string) => !DEFAULT_FREE_MODELS.some((d) => d.id === id)
                        )
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
                // Keep default free models
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
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getBestVoice = (targetLang: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window))
            return null;
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = targetLang.split("-")[0];

        return (
            voices.find(
                (v) =>
                    v.lang.toLowerCase().includes(targetLang.toLowerCase()) &&
                    (v.name.includes("Natural") ||
                        v.name.includes("Google") ||
                        v.name.includes("Premium"))
            ) ||
            voices.find((v) =>
                v.lang.toLowerCase().includes(targetLang.toLowerCase())
            ) ||
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
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Your browser does not support Web Speech Recognition. Please use Google Chrome or Edge."
            );
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
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Your browser does not support Speech Recognition. Please use Google Chrome or Edge."
            );
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

            let replyText =
                "I apologize, I could not process that request. Please try again.";
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

        if (
            messagesRef.current[messagesRef.current.length - 1].role === "assistant"
        ) {
            messagesRef.current = messagesRef.current.slice(0, -1);
            setMessages([...messagesRef.current]);
        }
        if (
            messagesRef.current[messagesRef.current.length - 1]?.id ===
            lastUserMessage.id
        ) {
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
        if (
            newMute &&
            typeof window !== "undefined" &&
            "speechSynthesis" in window
        ) {
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

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-linear-to-br from-slate-900 via-indigo-950/90 to-slate-900 text-slate-100">
            {/* Smoothly Animated Left Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onClearChat={clearChat}
                selectedPersona={selectedPersona}
                onSelectPersona={setSelectedPersona}
                selectedModel={selectedModel}
                selectedLanguage={selectedLanguage}
                messageCount={messages.length}
            />

            {/* Main Full-Screen Workspace */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <TopNavbar
                    headerRef={headerRef}
                    isSidebarOpen={isSidebarOpen}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    models={models}
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                    selectedPersona={selectedPersona}
                    onSelectPersona={setSelectedPersona}
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={setSelectedLanguage}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    status={status}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    speechRate={speechRate}
                    onSelectSpeechRate={setSpeechRate}
                    autoSpeakChat={autoSpeakChat}
                    onToggleAutoSpeak={() => setAutoSpeakChat(!autoSpeakChat)}
                    onExportTranscript={exportChatTranscript}
                    onClearChat={clearChat}
                    hasMessages={messages.length > 0}
                    isCallActive={isCallActive}
                    onStartCall={startCall}
                    onEndCall={endCall}
                />

                <VoiceCallBanner
                    isCallActive={isCallActive}
                    selectedLanguage={selectedLanguage}
                    status={status}
                    onStopSpeaking={stopSpeaking}
                />

                <MessageList
                    messages={messages}
                    status={status}
                    selectedModel={selectedModel}
                    selectedPersona={selectedPersona}
                    speakingMessageId={speakingMessageId}
                    copiedId={copiedId}
                    chatEndRef={chatEndRef}
                    onSendQuickPrompt={(prompt) => sendMessageToAI(prompt, false)}
                    onSpeakText={speakText}
                    onStopSpeaking={stopSpeaking}
                    onRegenerate={regenerateLastResponse}
                    onCopyMessage={copyMessage}
                />

                <ChatComposer
                    inputText={inputText}
                    setInputText={setInputText}
                    onSubmit={handleTextSubmit}
                    isDictating={isDictating}
                    onToggleDictation={toggleDictation}
                    status={status}
                    selectedPersona={selectedPersona}
                    selectedModel={selectedModel}
                />
            </div>
        </div>
    );
}