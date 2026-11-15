"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
    ChatStatus,
    DropdownType,
    Message,
    ModelOption,
    ChatSessionItem,
    UserProfile,
} from "@/types/chat";
import { DEFAULT_FREE_MODELS, LANGUAGES, PERSONAS } from "@/constants/chatData";
import Sidebar from "./chat/Sidebar";
import TopNavbar from "./chat/TopNavbar";
import VoiceCallBanner from "./chat/VoiceCallBanner";
import MessageList from "./chat/MessageList";
import ChatComposer from "./chat/ChatComposer";

export default function VoiceChatApp() {
    // UI & Layout State
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

    // Auth & MongoDB Session State
    const [user, setUser] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Assistant Configuration State (Always default to llama-3.1-8b-instant)
    const [availableModels, setAvailableModels] =
        useState<ModelOption[]>(DEFAULT_FREE_MODELS);
    const [selectedModel, setSelectedModel] = useState<string>(
        "llama-3.1-8b-instant"
    );
    const [selectedPersona, setSelectedPersona] = useState<string>(
        PERSONAS[0].id
    );
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        LANGUAGES[0].id
    );
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [autoSpeakReplies, setAutoSpeakReplies] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    // Conversation & Voice Call State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>("");
    const [liveTranscript, setLiveTranscript] = useState<string>("");
    const [isCallActive, setIsCallActive] = useState<boolean>(false);
    const [status, setStatus] = useState<ChatStatus>("idle");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
        null
    );

    // Refs for async callbacks & Web Speech API
    const isCallActiveRef = useRef<boolean>(false);
    const statusRef = useRef<ChatStatus>("idle");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestTranscriptRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
    const sendMessageRef = useRef<(text: string) => void>(() => { });

    const updateStatus = useCallback((next: ChatStatus) => {
        statusRef.current = next;
        setStatus(next);
    }, []);

    const currentModel =
        availableModels.find((m) => m.id === selectedModel) || availableModels[0];
    const currentPersona =
        PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];
    const currentLanguage =
        LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

    const formatTime = () =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Fetch User Sessions from MongoDB
    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch("/api/sessions");
            const data = await res.json();
            if (Array.isArray(data.sessions)) {
                setSessions(data.sessions);
            }
        } catch {
            // Ignore if offline
        }
    }, []);

    // Check Current Logged-in User on Mount
    useEffect(() => {
        async function checkUser() {
            try {
                const res = await fetch("/api/auth");
                const data = await res.json();
                if (data?.user) {
                    setUser(data.user);
                    fetchSessions();
                }
            } catch {
                // Guest mode
            }
        }
        checkUser();
    }, [fetchSessions]);

    // Fetch Active Free Models from Groq API without overriding llama-3.1-8b-instant with allam-2-7b
    useEffect(() => {
        async function loadActiveModels() {
            try {
                const res = await fetch("/api/chat");
                const data = await res.json();
                if (
                    data?.models &&
                    Array.isArray(data.models) &&
                    data.models.length > 0
                ) {
                    setAvailableModels(data.models);
                    const hasDefault = data.models.some(
                        (m: ModelOption) => m.id === "llama-3.1-8b-instant"
                    );
                    setSelectedModel(
                        hasDefault ? "llama-3.1-8b-instant" : data.models[0].id
                    );
                }
            } catch {
                // Keep default fallback list
            }
        }
        loadActiveModels();
    }, []);

    // Auto-scroll to newest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status, liveTranscript]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownContainerRef.current &&
                !dropdownContainerRef.current.contains(event.target as Node)
            ) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Stop Speech Synthesis
    const stopSpeaking = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        if (statusRef.current === "speaking") {
            updateStatus("idle");
        }
    }, [updateStatus]);

    // Speak Text with Safety Watchdog Timer (so Chrome TTS never hangs)
    const speakText = useCallback(
        (text: string, onComplete?: () => void, messageId?: string) => {
            if (
                isMuted ||
                typeof window === "undefined" ||
                !("speechSynthesis" in window)
            ) {
                if (onComplete) onComplete();
                return;
            }

            window.speechSynthesis.cancel();

            const cleanText = text
                .replace(/```[\s\S]*?```/g, "Code block provided in the chat window.")
                .replace(/[*#_`~>-]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (!cleanText) {
                if (onComplete) onComplete();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = selectedLanguage;
            utterance.rate = speechRate;

            // Try matching voice for selected language
            const voices = window.speechSynthesis.getVoices();
            const matchedVoice =
                voices.find((v) => v.lang === selectedLanguage) ||
                voices.find((v) =>
                    v.lang.startsWith(selectedLanguage.split("-")[0])
                );
            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            let finished = false;
            const finishSpeaking = () => {
                if (finished) return;
                finished = true;
                setSpeakingMessageId(null);
                updateStatus("idle");
                if (onComplete) onComplete();
            };

            // Safety watchdog in case Chrome speechSynthesis onend doesn't trigger
            const estimatedMs = Math.max(
                4000,
                Math.min(35000, cleanText.length * 90)
            );
            const watchdog = setTimeout(finishSpeaking, estimatedMs);

            utterance.onstart = () => {
                updateStatus("speaking");
                if (messageId) setSpeakingMessageId(messageId);
            };

            utterance.onend = () => {
                clearTimeout(watchdog);
                finishSpeaking();
            };

            utterance.onerror = () => {
                clearTimeout(watchdog);
                finishSpeaking();
            };

            window.speechSynthesis.speak(utterance);
        },
        [isMuted, selectedLanguage, speechRate, updateStatus]
    );

    // Stop Microphone Listening
    const stopListening = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.abort();
            } catch {
                // Ignore abort errors
            }
            recognitionRef.current = null;
        }
        setLiveTranscript("");
        latestTranscriptRef.current = "";
        if (statusRef.current === "listening") {
            updateStatus("idle");
        }
    }, [updateStatus]);

    // Start Microphone Listening (Fresh Instance + Real-Time Interim Captions + Auto-Send)
    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).SpeechRecognition ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error(
                "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
            );
            return;
        }

        stopSpeaking();

        // Cleanly close any previous recognition instance
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.abort();
            } catch {
                // Ignore
            }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        latestTranscriptRef.current = "";
        setLiveTranscript("");

        const commitVoiceMessage = (spokenText: string) => {
            const cleaned = spokenText.trim();
            if (!cleaned) return;

            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }

            latestTranscriptRef.current = "";
            setLiveTranscript("");

            try {
                recognition.onend = null;
                recognition.stop();
            } catch {
                // Ignore
            }

            sendMessageRef.current(cleaned);
        };

        recognition.onstart = () => {
            updateStatus("listening");
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            try {
                const results = event?.results;
                if (!results || results.length === 0) return;

                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = 0; i < results.length; i++) {
                    const item = results[i];
                    const textPiece = item?.[0]?.transcript || "";
                    if (item.isFinal) {
                        finalTranscript += textPiece + " ";
                    } else {
                        interimTranscript += textPiece;
                    }
                }

                const combined = (finalTranscript + interimTranscript).trim();
                if (!combined) return;

                latestTranscriptRef.current = combined;
                setLiveTranscript(combined);
                setInputText(combined);

                // Wait 1.1 seconds of silence after speaking, then automatically send!
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                }
                silenceTimerRef.current = setTimeout(() => {
                    if (latestTranscriptRef.current.trim()) {
                        commitVoiceMessage(latestTranscriptRef.current);
                    }
                }, 1100);
            } catch (err) {
                console.warn("Speech recognition parse warning:", err);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            const errCode = event?.error;
            if (errCode === "not-allowed" || errCode === "service-not-allowed") {
                toast.error(
                    "Microphone access denied! Please allow microphone permission in your browser address bar."
                );
                setIsCallActive(false);
                isCallActiveRef.current = false;
                updateStatus("idle");
                return;
            }
            // Ignore 'no-speech' or 'aborted' during active voice call
        };

        recognition.onend = () => {
            // If user spoke something before recognition ended, send it immediately
            if (latestTranscriptRef.current.trim()) {
                const pending = latestTranscriptRef.current.trim();
                latestTranscriptRef.current = "";
                setLiveTranscript("");
                sendMessageRef.current(pending);
                return;
            }

            // If hands-free voice call is still active and AI is not thinking/speaking, keep listening!
            if (
                isCallActiveRef.current &&
                statusRef.current !== "thinking" &&
                statusRef.current !== "speaking"
            ) {
                setTimeout(() => {
                    if (
                        isCallActiveRef.current &&
                        statusRef.current !== "thinking" &&
                        statusRef.current !== "speaking"
                    ) {
                        try {
                            recognition.start();
                        } catch {
                            // Ignore
                        }
                    }
                }, 250);
            } else if (statusRef.current === "listening") {
                updateStatus("idle");
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch {
            // Ignore start error
        }
    }, [selectedLanguage, stopSpeaking, updateStatus]);

    // Force Send Live Transcript Immediately
    const handleForceSendTranscript = useCallback(() => {
        const textToSend = latestTranscriptRef.current.trim() || inputText.trim();
        if (!textToSend) return;
        stopListening();
        sendMessageRef.current(textToSend);
    }, [inputText, stopListening]);

    // Persist Conversation in MongoDB (if logged in)
    const persistSessionToDB = useCallback(
        async (
            updatedMessages: Message[],
            sessionIdToUpdate: string | null,
            usedModel: string
        ) => {
            if (!user || updatedMessages.length === 0) return;
            try {
                const res = await fetch("/api/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: sessionIdToUpdate,
                        persona: selectedPersona,
                        model: usedModel,
                        language: selectedLanguage,
                        messages: updatedMessages,
                    }),
                });
                const data = await res.json();
                if (res.ok && data?.session?._id) {
                    setActiveSessionId(data.session._id);
                    fetchSessions();
                }
            } catch {
                // Silent fail if DB not connected
            }
        },
        [user, selectedPersona, selectedLanguage, fetchSessions]
    );

    // Send User Message to Groq API
    const sendMessage = useCallback(
        async (rawText: string) => {
            const trimmed = rawText.trim();
            if (!trimmed) return;

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: trimmed,
                time: formatTime(),
            };

            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            setInputText("");
            setLiveTranscript("");
            latestTranscriptRef.current = "";
            updateStatus("thinking");

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
                        model: selectedModel,
                        persona: selectedPersona,
                        language: selectedLanguage,
                        isVoiceCall: isCallActiveRef.current,
                    }),
                });

                const data = await response.json();
                const latencyMs = Math.round(performance.now() - startTime);

                if (!response.ok) {
                    throw new Error(data?.error || "Failed to get response from Groq.");
                }

                const aiReply: string =
                    data.reply || "I could not process that request.";
                const usedModel: string = data.usedModel || selectedModel;

                if (usedModel !== selectedModel) {
                    setSelectedModel(usedModel);
                }

                const assistantMessageId = (Date.now() + 1).toString();
                const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: aiReply,
                    time: formatTime(),
                    model: usedModel,
                    latency: String(latencyMs),
                };

                const finalMessages = [...updatedMessages, assistantMessage];
                setMessages(finalMessages);

                // Auto-save to MongoDB if logged in
                persistSessionToDB(finalMessages, activeSessionId, usedModel);

                if (isCallActiveRef.current) {
                    speakText(
                        aiReply,
                        () => {
                            if (isCallActiveRef.current) {
                                startListening();
                            }
                        },
                        assistantMessageId
                    );
                } else if (autoSpeakReplies && !isMuted) {
                    speakText(aiReply, undefined, assistantMessageId);
                } else {
                    updateStatus("idle");
                }
            } catch (err: unknown) {
                const errorText =
                    err instanceof Error
                        ? err.message
                        : "Connection error. Please verify your GROQ_API_KEY in .env.local.";

                toast.error(errorText);

                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 2).toString(),
                        role: "assistant",
                        content: `Error: ${errorText}`,
                        time: formatTime(),
                        model: selectedModel,
                    },
                ]);
                updateStatus("idle");

                if (isCallActiveRef.current) {
                    setTimeout(() => {
                        if (isCallActiveRef.current) startListening();
                    }, 1500);
                }
            }
        },
        [
            messages,
            selectedModel,
            selectedPersona,
            selectedLanguage,
            autoSpeakReplies,
            isMuted,
            activeSessionId,
            persistSessionToDB,
            speakText,
            startListening,
            updateStatus,
        ]
    );

    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    // Start Hands-Free Duplex Voice Call
    const startVoiceCall = () => {
        setIsCallActive(true);
        isCallActiveRef.current = true;
        toast.success("Hands-Free Voice Call started! Speak after the greeting.");

        const greeting =
            "Hello! Nova live voice session is active. How can I help you today?";
        const greetingId = Date.now().toString();

        if (messages.length === 0) {
            setMessages([
                {
                    id: greetingId,
                    role: "assistant",
                    content: greeting,
                    time: formatTime(),
                    model: selectedModel,
                },
            ]);
        }

        speakText(
            greeting,
            () => {
                if (isCallActiveRef.current) {
                    startListening();
                }
            },
            greetingId
        );
    };

    // End Voice Call
    const endVoiceCall = () => {
        setIsCallActive(false);
        isCallActiveRef.current = false;
        stopListening();
        stopSpeaking();
        updateStatus("idle");
        toast("Voice Call ended.", { icon: "📞" });
    };

    // Start New Conversation
    const startNewConversation = () => {
        stopListening();
        stopSpeaking();
        setMessages([]);
        setActiveSessionId(null);
        setInputText("");
        setLiveTranscript("");
        updateStatus("idle");
        toast.success("Started a new conversation.");
    };

    // Load Saved Session from MongoDB
    const handleSelectSession = (sessionId: string) => {
        const found = sessions.find((s) => s._id === sessionId);
        if (!found) return;
        stopListening();
        stopSpeaking();
        setActiveSessionId(found._id);
        setMessages(found.messages || []);

        if (found.persona && PERSONAS.some((p) => p.id === found.persona)) {
            setSelectedPersona(found.persona);
        }

        // Only restore the saved model if it is still a valid, currently
        // active chat model — an older session may reference a model
        // (a voice/TTS model that slipped through before filtering, or
        // one Groq has since decommissioned) that should no longer be used.
        if (found.model && availableModels.some((m) => m.id === found.model)) {
            setSelectedModel(found.model);
        }

        if (found.language && LANGUAGES.some((l) => l.id === found.language)) {
            setSelectedLanguage(found.language);
        }

        toast.success(`Loaded "${found.title}"`);
    };

    // Delete Saved Session from MongoDB
    const handleDeleteSession = async (
        sessionId: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        try {
            await fetch(`/api/sessions?id=${sessionId}`, { method: "DELETE" });
            setSessions((prev) => prev.filter((s) => s._id !== sessionId));
            if (activeSessionId === sessionId) {
                setMessages([]);
                setActiveSessionId(null);
            }
            toast.success("Conversation deleted.");
        } catch {
            toast.error("Failed to delete conversation.");
        }
    };

    // Logout Handler
    const handleLogout = async () => {
        await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
        });
        setUser(null);
        setSessions([]);
        setActiveSessionId(null);
        setMessages([]);
        toast.success("Signed out successfully.");
    };

    // Copy Message Content
    const copyMessage = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Export Transcript
    const exportTranscript = () => {
        if (messages.length === 0) {
            toast.error("No messages to export yet.");
            return;
        }
        const text = messages
            .map(
                (m) => `[${m.time}] ${m.role.toUpperCase()}:\n${m.content}\n`
            )
            .join("\n----------------------------------------\n");
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nova-ai-transcript-${new Date()
            .toISOString()
            .slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setOpenDropdown(null);
        toast.success("Transcript downloaded!");
    };

    // Regenerate Assistant Response
    const regenerateResponse = (index: number) => {
        const previousUserMessage = [...messages]
            .slice(0, index)
            .reverse()
            .find((m) => m.role === "user");
        if (!previousUserMessage) return;
        setMessages((prev) => prev.slice(0, index));
        sendMessage(previousUserMessage.content);
    };

    // Form Submit
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || status === "thinking") return;
        stopListening();
        sendMessage(inputText);
    };

    return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px]" />
                <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px]" />
            </div>

            {/* Collapsible Left Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                selectedPersona={selectedPersona}
                setSelectedPersona={(id) => {
                    setSelectedPersona(id);
                    const p = PERSONAS.find((item) => item.id === id);
                    if (p) toast.success(`Switched to ${p.name}`);
                }}
                selectedModel={selectedModel}
                selectedLanguage={selectedLanguage}
                onNewConversation={startNewConversation}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                user={user}
                onLogout={handleLogout}
            />

            {/* Main Full-Screen Workspace */}
            <div className="relative z-10 flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Top Navigation Bar */}
                <TopNavbar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    dropdownContainerRef={dropdownContainerRef}
                    availableModels={availableModels}
                    currentModel={currentModel}
                    selectedModel={selectedModel}
                    setSelectedModel={(id) => {
                        setSelectedModel(id);
                        toast.success(`Model set to ${id}`);
                    }}
                    currentPersona={currentPersona}
                    selectedPersona={selectedPersona}
                    setSelectedPersona={(id) => {
                        setSelectedPersona(id);
                        const p = PERSONAS.find((item) => item.id === id);
                        if (p) toast.success(`Persona set to ${p.name}`);
                    }}
                    currentLanguage={currentLanguage}
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={(code) => {
                        setSelectedLanguage(code);
                        const l = LANGUAGES.find((item) => item.id === code);
                        if (l) toast.success(`Language set to ${l.name}`);
                    }}
                    speechRate={speechRate}
                    setSpeechRate={setSpeechRate}
                    autoSpeakReplies={autoSpeakReplies}
                    setAutoSpeakReplies={setAutoSpeakReplies}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    isCallActive={isCallActive}
                    onStartVoiceCall={startVoiceCall}
                    onEndVoiceCall={endVoiceCall}
                    onExportTranscript={exportTranscript}
                    onClearConversation={() => {
                        startNewConversation();
                        setOpenDropdown(null);
                    }}
                    onStopSpeaking={stopSpeaking}
                    user={user}
                />

                {/* Active Voice Call Status Banner */}
                <VoiceCallBanner
                    isCallActive={isCallActive}
                    selectedLanguage={selectedLanguage}
                    status={status}
                    liveTranscript={liveTranscript}
                    onInterruptSpeech={() => {
                        stopSpeaking();
                        startListening();
                    }}
                    onForceSendTranscript={handleForceSendTranscript}
                />

                {/* Chat Stream & Welcome Quick Prompts */}
                <MessageList
                    messages={messages}
                    status={status}
                    selectedModel={currentModel}
                    selectedPersona={currentPersona}
                    speakingMessageId={speakingMessageId}
                    copiedId={copiedId}
                    chatEndRef={messagesEndRef}
                    onSendQuickPrompt={(prompt) => sendMessage(prompt)}
                    onSpeakText={(content, id) => speakText(content, undefined, id)}
                    onStopSpeaking={stopSpeaking}
                    onRegenerate={() => {
                        for (let i = messages.length - 1; i >= 0; i--) {
                            if (messages[i].role === "assistant") {
                                regenerateResponse(i);
                                break;
                            }
                        }
                    }}
                    onCopyMessage={copyMessage}
                />
                <div ref={messagesEndRef} />

                {/* Bottom Composer Dock */}
                <ChatComposer
                    inputText={inputText}
                    setInputText={setInputText}
                    status={status}
                    onSubmit={handleFormSubmit}
                    isDictating={false}
                    onToggleDictation={() => { }}
                    selectedPersona={currentPersona}
                    selectedModel={currentModel}
                />
            </div>
        </div>
    );
}