import { NextResponse } from "next/server";

const FALLBACK_FREE_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "gemma2-9b-it",
];

const PERSONA_PROMPTS: Record<string, string> = {
    assistant:
        "You are Nova, a warm, articulate, and intelligent AI Executive Assistant. Provide clear, natural, and directly helpful answers.",
    architect:
        "You are Nova, a Principal Software Architect and Full-Stack Engineer. Provide clean, production-grade architectural guidance and concise explanations.",
    strategist:
        "You are Nova, a Senior Creative & Product Growth Strategist. Offer high-impact marketing, branding, and storytelling ideas.",
    tutor:
        "You are Nova, an encouraging AI Learning Coach. Break down complex concepts into simple, intuitive step-by-step explanations.",
    support:
        "You are Nova, an empathetic Technical Support Specialist. Diagnose issues methodically and guide the user with calm, actionable steps.",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
    "en-US": "Respond in clear, natural English.",
    "en-GB": "Respond in clear, natural British English.",
    "ur-PK":
        "Respond in natural Urdu (or Roman Urdu if the user writes in Roman Urdu) so it is easy to read and listen to.",
    "hi-IN":
        "Respond in natural Hindi (or Hinglish if the user writes in Latin script).",
    "ar-SA": "Respond in clear, natural Arabic.",
};

const ALLOWED_FAMILY_PATTERNS = [
    "llama",
    "gemma",
    "mixtral",
    "qwen",
    "deepseek",
    "kimi",
    "gpt-oss",
];

const BLOCKED_KEYWORDS = [
    "whisper",
    "guard",
    "tts",
    "vision",
    "playai",
    "allam",
    "embedding",
    "compound",
    "safeguard",
    "orpheus",
    "canopylabs",
    "moderation",
    "stt",
    "audio",
];

function isSafeChatModel(id: string): boolean {
    const lower = id.toLowerCase();
    const isKnownChatFamily = ALLOWED_FAMILY_PATTERNS.some((kw) =>
        lower.includes(kw)
    );
    const isBlocked = BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
    return isKnownChatFamily && !isBlocked;
}

export async function GET() {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ models: [] });
        }

        const res = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json({ models: [] });
        }

        const data = await res.json();
        const rawModels: Array<{ id: string; owned_by?: string }> =
            data?.data || [];

        const chatModels = rawModels
            .filter((m) => isSafeChatModel(m.id))
            .map((m) => ({
                id: m.id,
                name: m.id,
                provider: `${m.owned_by || "Groq"} • Free Tier`,
                badge: "FREE • Active",
                description: "Verified active free model on your Groq API key",
            }));

        // Prioritize llama-3.1-8b-instant at the very top of the list
        chatModels.sort((a, b) => {
            if (a.id === "llama-3.1-8b-instant") return -1;
            if (b.id === "llama-3.1-8b-instant") return 1;
            if (a.id === "llama-3.3-70b-versatile") return -1;
            if (b.id === "llama-3.3-70b-versatile") return 1;
            return a.id.localeCompare(b.id);
        });

        return NextResponse.json({ models: chatModels });
    } catch {
        return NextResponse.json({ models: [] });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages,
            model = "llama-3.1-8b-instant",
            persona = "assistant",
            language = "en-US",
            isVoiceCall = false,
        } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "GROQ_API_KEY is missing in .env.local. Please add your Groq API key and restart the server.",
                },
                { status: 500 }
            );
        }

        const sanitizedMessages = messages
            .filter(
                (m: { role?: string; content?: string }) =>
                    m &&
                    typeof m.role === "string" &&
                    typeof m.content === "string" &&
                    m.content.trim() !== ""
            )
            .map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content.trim(),
            }));

        const personaInstruction =
            PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.assistant;
        const languageInstruction =
            LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS["en-US"];
        const voiceInstruction = isVoiceCall
            ? "IMPORTANT: The user is in a live hands-free voice call. Keep your response conversational, natural, and concise (1 to 3 sentences maximum) without markdown symbols or bullet points so it sounds natural when spoken aloud."
            : "Format your response clearly and concisely.";

        const systemPrompt = `${personaInstruction}\n${languageInstruction}\n${voiceInstruction}`;

        // Never send a non text-chat model (TTS/whisper/guard/etc.) to the
        // chat completions endpoint — fall back to a safe default instead.
        const safeRequestedModel = isSafeChatModel(String(model || ""))
            ? model
            : "llama-3.1-8b-instant";

        const candidateModels = [
            safeRequestedModel,
            ...FALLBACK_FREE_MODELS.filter((m) => m !== safeRequestedModel),
        ];

        let lastErrorMessage = "Failed to generate response from Groq.";

        for (const candidateModel of candidateModels) {
            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: candidateModel,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...sanitizedMessages,
                        ],
                        temperature: 0.65,
                        max_tokens: isVoiceCall ? 300 : 1024,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data?.choices?.[0]?.message?.content) {
                // Strip <think>...</think> tags if a reasoning model is selected
                const rawReply: string = data.choices[0].message.content;
                const cleanReply = rawReply
                    .replace(/<think>[\s\S]*?<\/think>/gi, "")
                    .trim();

                if (cleanReply) {
                    return NextResponse.json({
                        reply: cleanReply,
                        usedModel: candidateModel,
                    });
                }
            }

            lastErrorMessage =
                data?.error?.message || `Model ${candidateModel} unavailable.`;
        }

        return NextResponse.json({ error: lastErrorMessage }, { status: 400 });
    } catch (error: unknown) {
        console.error("Chat Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error while communicating with Groq." },
            { status: 500 }
        );
    }
}