"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    DEFAULT_FREE_MODELS,
    PERSONAS,
    LANGUAGES,
} from "@/constants/chatData";
import {
    ChatSessionItem,
    ChatStatus,
    DropdownType,
    LanguageOption,
    Message,
    ModelOption,
    PersonaOption,
    UserProfile,
} from "@/types/chat";
import Sidebar from "@/components/chat/Sidebar";
import TopNavbar from "@/components/chat/TopNavbar";
import VoiceCallBanner from "@/components/chat/VoiceCallBanner";
import MessageList from "@/components/chat/MessageList";
import ChatComposer from "@/components/chat/ChatComposer";
import AuthModal from "@/components/chat/AuthModal";

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
    const [status, setStatus] = useState<ChatStatus>("idle");

    // Auth & MongoDB Session States
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
    const activeSessionIdRef = useRef<string | null>(null);
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

    useEffect(() => {
        activeSessionIdRef.current = activeSessionId;
    }, [activeSessionId]);

    const fetchUserSessions = async () => {
        try {
            const res = await fetch("/api/sessions");
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.sessions)) {
                setSessions(data.sessions);
            }
        } catch { }
    };

    // Check current logged-in user & load MongoDB sessions
    useEffect(() => {
        async function initAuthAndModels() {
            try {
                const authRes = await fetch("/api/auth");
                if (authRes.ok) {
                    const authData = await authRes.json();
                    if (authData.user) {
                        setUser(authData.user);
                        fetchUserSessions();
                    }
                }
            } catch { }

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
            } catch { }
        }
        initAuthAndModels();
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

    const persistMessagesToDB = async (updatedMessages: Message[]) => {
        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSessionIdRef.current,
                    messages: updatedMessages,
                    persona: selectedPersonaRef.current.id,
                    model: selectedModelRef.current.id,
                    language: selectedLanguageRef.current.id,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.session && data.session._id) {
                    setActiveSessionId(data.session._id);
                    activeSessionIdRef.current = data.session._id;
                    fetchUserSessions();
                }
            }
        } catch { }
    };

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
            if (isCallActiveRef.current) {
                startListening();
            } else {
                setStatus("idle");
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        if (isCallActiveRef.current) {
            startListening();
        } else {
            setStatus("idle");
        }
    };

    // Bulletproof Speech Recognition (Fixes undefined reading '0' error)
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
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setStatus("listening");

        recognition.onresult = (event: any) => {
            try {
                const results = event?.results;
                if (!results || typeof results.length !== "number" || results.length === 0) {
                    if (isCallActiveRef.current) startListening();
                    return;
                }
                const idx =
                    typeof event.resultIndex === "number" && results[event.resultIndex]
                        ? event.resultIndex
                        : 0;
                const firstResult = results[idx] || results[0];
                const alternative = firstResult ? firstResult[0] : null;
                const transcript = alternative?.transcript
                    ? String(alternative.transcript).trim()
                    : "";

                if (transcript) {
                    sendMessageToAI(transcript, true);
                } else if (isCallActiveRef.current) {
                    startListening();
                }
            } catch {
                if (isCallActiveRef.current) startListening();
            }
        };

        recognition.onerror = (event: any) => {
            if (event?.error === "no-speech" && isCallActiveRef.current) {
                try {
                    recognition.stop();
                } catch { }
                setTimeout(() => {
                    if (isCallActiveRef.current) startListening();
                }, 250);
            } else if (!isCallActiveRef.current) {
                setStatus("idle");
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch { }
    };

    const toggleDictation = () => {
        if (typeof window === "undefined") return;

        if (isDictating) {
            try {
                recognitionRef.current?.stop();
            } catch { }
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
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsDictating(true);
            setStatus("listening");
        };

        recognition.onresult = (event: any) => {
            try {
                const results = event?.results;
                if (results && results.length > 0) {
                    const idx =
                        typeof event.resultIndex === "number" && results[event.resultIndex]
                            ? event.resultIndex
                            : 0;
                    const firstResult = results[idx] || results[0];
                    const transcript = firstResult?.[0]?.transcript
                        ? String(firstResult[0].transcript).trim()
                        : "";
                    if (transcript) {
                        setInputText((prev) => (prev ? [prev, transcript].join(" ") : transcript));
                    }
                }
            } catch { }
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
        try {
            recognition.start();
        } catch { }
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
            const latency = ((endTime - startTime) / 1000).toFixed(2) + "s";

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

            const finalMessages = [...messagesRef.current, aiMsg];
            messagesRef.current = finalMessages;
            setMessages(finalMessages);

            // Save conversation to MongoDB if logged in
            persistMessagesToDB(finalMessages);

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
        const updated = [...messagesRef.current, welcomeMsg];
        messagesRef.current = updated;
        setMessages(updated);
        persistMessagesToDB(updated);
        speakText(welcomeText, msgId);
    };

    const endCall = () => {
        isCallActiveRef.current = false;
        setIsCallActive(false);
        setStatus("idle");
        setSpeakingMessageId(null);
        try {
            recognitionRef.current?.stop();
        } catch { }
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

    const startNewChat = () => {
        setActiveSessionId(null);
        activeSessionIdRef.current = null;
        setMessages([]);
        messagesRef.current = [];
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        setStatus("idle");
        setOpenDropdown(null);
    };

    const handleSelectSession = (session: ChatSessionItem) => {
        setActiveSessionId(session._id);
        activeSessionIdRef.current = session._id;
        setMessages(session.messages || []);
        messagesRef.current = session.messages || [];
    };

    const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch("/api/sessions?id=" + encodeURIComponent(id), {
                method: "DELETE",
            });
            setSessions((prev) => prev.filter((s) => s._id !== id));
            if (activeSessionIdRef.current === id) {
                startNewChat();
            }
        } catch { }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            setUser(null);
            setSessions([]);
            startNewChat();
        } catch { }
    };

    const exportChatTranscript = () => {
        if (messages.length === 0) return;
        const transcript = messages
            .map((m) => "[" + m.time + "] " + m.role.toUpperCase() + ": " + m.content)
            .join("\n\n");
        const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
            "nova-ai-transcript-" + new Date().toISOString().slice(0, 10) + ".txt";
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
        <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 text-slate-100">
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(loggedInUser) => {
                    setUser(loggedInUser);
                    fetchUserSessions();
                }}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={startNewChat}
                selectedPersona={selectedPersona}
                onSelectPersona={setSelectedPersona}
                selectedModel={selectedModel}
                selectedLanguage={selectedLanguage}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
            />

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
                    onClearChat={startNewChat}
                    hasMessages={messages.length > 0}
                    isCallActive={isCallActive}
                    onStartCall={startCall}
                    onEndCall={endCall}
                    user={user}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
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
