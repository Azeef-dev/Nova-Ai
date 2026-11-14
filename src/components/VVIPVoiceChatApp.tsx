"use client";

import { useState, useRef, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

export default function VVIPVoiceChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");

  const isCallActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.includes("hi-IN") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("ur") || v.lang.includes("hi")) ||
      voices[0]
    );
  };

  const speakText = (text: string) => {
    if (isMutedRef.current) {
      if (isCallActiveRef.current) startListening();
      else setStatus("idle");
      return;
    }

    window.speechSynthesis.cancel();
    setStatus("speaking");

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = getBestVoice();
    if (bestVoice) utterance.voice = bestVoice;

    utterance.lang = "hi-IN";
    utterance.rate = 1.05;

    utterance.onend = () => {
      if (isCallActiveRef.current) {
        startListening();
      } else {
        setStatus("idle");
      }
    };

    utterance.onerror = () => {
      if (isCallActiveRef.current) startListening();
      else setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const sendMessageToAI = async (text: string, shouldSpeak: boolean) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: getCurrentTime(),
    };

    const updated = [...messagesRef.current, userMsg];
    messagesRef.current = updated;
    setMessages(updated);
    setStatus("thinking");

    try {
      const apiMessages = updated.map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        time: getCurrentTime(),
      };

      const finalMessages = [...updated, aiMsg];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);

      if (shouldSpeak || isCallActiveRef.current) {
        speakText(data.reply);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
      if (isCallActiveRef.current) startListening();
    }
  };

  const startListening = () => {
    if (!isCallActiveRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapka browser Voice Recognition support nahi karta. Chrome istemal karein.");
      endCall();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ur-PK";
    recognition.interimResults = false;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessageToAI(transcript, true);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" && isCallActiveRef.current) {
        startListening();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startCall = () => {
    isCallActiveRef.current = true;
    setIsCallActive(true);
    const welcomeText = "Assalam o Alaikum! Main hazir hun, bataiye kya madad kar sakti hun?";
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: welcomeText,
      time: getCurrentTime(),
    };
    messagesRef.current = [...messagesRef.current, welcomeMsg];
    setMessages(messagesRef.current);
    speakText(welcomeText);
  };

  const endCall = () => {
    isCallActiveRef.current = false;
    setIsCallActive(false);
    setStatus("idle");
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    isMutedRef.current = newMute;
    if (newMute) window.speechSynthesis.cancel();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    sendMessageToAI(text, false);
  };

  const clearChat = () => {
    setMessages([]);
    messagesRef.current = [];
    window.speechSynthesis.cancel();
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-[92vh] max-w-2xl w-full mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden">
      {/* VVIP Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isCallActive ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"
              }`}
            />
          </div>
          <div>
            <h1 className="font-semibold text-base text-white tracking-wide">
              Nova AI Assistant
            </h1>
            <p className="text-xs font-medium text-indigo-300">
              {status === "idle" && "Online • Voice & Chat Ready"}
              {status === "listening" && "🟢 Sun raha hun... Aap bolein"}
              {status === "thinking" && "🟡 Jawab tayyar ho raha hai..."}
              {status === "speaking" && "🔵 AI bol raha hai..."}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {!isCallActive ? (
            <button
              onClick={startCall}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Voice Call</span>
            </button>
          ) : (
            <button
              onClick={endCall}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 animate-pulse transition cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Voice Visualizer Banner (Only visible during call) */}
      {isCallActive && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Live Hands-Free Voice Call Active</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
            {status.toUpperCase()}
          </span>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-80">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
Assalam o Alaikum! Main Nova hun


Neeche message likh kar chat karein ya upar Voice Call button daba kar direct baat shuru karein.


) : (
messages.map((msg) => (
<div
key={msg.id}
className={flex items-end gap-2.5 ${ msg.role === "user" ? "justify-end" : "justify-start" }}
>
{msg.role === "assistant" && (



)}
<div
className={group relative max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${ msg.role === "user" ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm" : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-sm" }}
>
{msg.content}
<div
className={flex items-center justify-end gap-2 mt-1.5 text-[10px] ${ msg.role === "user" ? "text-indigo-200" : "text-slate-400" }}
>
{msg.time}
<button
onClick={() => copyMessage(msg.id, msg.content)}
className="opacity-60 hover:opacity-100 transition"
title="Copy"
>
{copiedId === msg.id ? (

) : (

)}


{msg.role === "user" && (



)}

))
)}
{/* Thinking Typing Indicator */}
{status === "thinking" && (










)}
{/* Bottom Input Area */}

<input
type="text"
value={inputText}
onChange={(e) => setInputText(e.target.value)}
placeholder="Apna message yahan likhein..."
className="flex-1 bg-slate-800/90 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition"
/>
<button
type="submit"
disabled={!inputText.trim() || status === "thinking"}
className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
>




);
}