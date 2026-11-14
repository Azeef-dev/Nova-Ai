"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function FreeVoiceAgent() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [messages, setMessages] = useState<Message[]>([]);

    const isCallActiveRef = useRef(false);
    const messagesRef = useRef<Message[]>([]);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Browser voices load karne ke liye
        window.speechSynthesis.getVoices();
    }, []);

    const getBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        return (
            voices.find((v) => v.lang.includes("hi-IN") && v.name.includes("Google")) ||
            voices.find((v) => v.lang.includes("ur") || v.lang.includes("hi")) ||
            voices[0]
        );
    };

    const speakText = (text: string) => {
        window.speechSynthesis.cancel();
        setStatus("speaking");

        const utterance = new SpeechSynthesisUtterance(text);
        const bestVoice = getBestVoice();
        if (bestVoice) utterance.voice = bestVoice;

        utterance.lang = "hi-IN";
        utterance.rate = 1.05; // Thodi natural speed

        utterance.onend = () => {
            // Jaise hi AI bolna khatam kare, agar call active hai to dobara sunna shuru kare
            if (isCallActiveRef.current) {
                startListening();
            } else {
                setStatus("idle");
            }
        };

        utterance.onerror = () => {
            if (isCallActiveRef.current) startListening();
        };

        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!isCallActiveRef.current) return;

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Browser support nahi karta. Google Chrome istemal karein.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "ur-PK";
        recognition.interimResults = false;

        recognition.onstart = () => setStatus("listening");

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            const updatedMessages: Message[] = [
                ...messagesRef.current,
                { role: "user", content: transcript },
            ];

            messagesRef.current = updatedMessages;
            setMessages(updatedMessages);
            setStatus("thinking");

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: updatedMessages }),
                });

                const data = await res.json();
                const aiMessage: Message = { role: "assistant", content: data.reply };

                messagesRef.current = [...updatedMessages, aiMessage];
                setMessages(messagesRef.current);

                if (isCallActiveRef.current) {
                    speakText(data.reply);
                }
            } catch (err) {
                if (isCallActiveRef.current) startListening();
            }
        };

        recognition.onerror = (event: any) => {
            // Agar user kuch na bole (no-speech) aur call chal rahi ho to dobara sunne lage
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
        setMessages([]);
        messagesRef.current = [];
        speakText("Assalam o Alaikum! Main aapki kya madad kar sakti hun?");
    };

    const endCall = () => {
        isCallActiveRef.current = false;
        setIsCallActive(false);
        setStatus("idle");
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
    };

    return (
        <div className="max-w-md w-full mx-auto p-6 bg-white border rounded-2xl shadow-lg space-y-5">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-gray-800">Smart AI Voice Agent</h2>
                <p className="text-xs text-gray-500">
                    {status === "idle" && "Call shuru karne ke liye button dabayein"}
                    {status === "listening" && "🟢 Sun raha hun... Aap bolein"}
                    {status === "thinking" && "🟡 Soch raha hun..."}
                    {status === "speaking" && "🔵 AI bol raha hai..."}
                </p>
            </div>

            {/* Call Buttons */}
            <div className="flex justify-center">
                {!isCallActive ? (
                    <button
                        onClick={startCall}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-full shadow transition"
                    >
                        📞 Call Shuru Karein
                    </button>
                ) : (
                    <button
                        onClick={endCall}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow transition"
                    >
                        ❌ Call Kat Karein
                    </button>
                )}
            </div>

            {/* Live Chat Transcript */}
            <div className="h-64 overflow-y-auto p-3 bg-gray-50 rounded-xl space-y-3 border">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-20">
                        Guftagu yahan nazar aayegi...
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2.5 rounded-lg text-sm max-w-[85%] ${msg.role === "user"
                                    ? "bg-blue-600 text-white ml-auto"
                                    : "bg-gray-200 text-gray-800 mr-auto"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
