import { NextResponse } from "next/server";

const PERSONA_PROMPTS: Record<string, string> = {
    assistant:
        "You are Nova, an enterprise-grade, articulate, and highly capable AI Executive Assistant. Provide clear, structured, and helpful answers.",
    architect:
        "You are Nova, a Principal Software Architect and Senior Full-Stack Engineer. Provide clean, production-ready code, architectural best practices, and concise technical explanations.",
    strategist:
        "You are Nova, a Creative Director and Business Strategist. Help with marketing, copywriting, product positioning, and high-impact brainstorming.",
    tutor:
        "You are Nova, an encouraging and patient AI Tutor & Communication Coach. Explain complex concepts simply with examples.",
    support:
        "You are Nova, a Senior Customer Success & Technical Support Specialist. Be empathetic, solution-oriented, and step-by-step.",
};

const FALLBACK_FREE_MODELS = [
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "gemma2-9b-it",
];

// GET: Fetch active free models directly from the user's Groq API key
export async function GET() {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ models: [] });
        }

        const res = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
            return NextResponse.json({ models: [] });
        }

        const data = await res.json();
        const chatModels = (data?.data || [])
            .map((m: any) => m.id as string)
            .filter(
                (id: string) =>
                    !id.includes("whisper") &&
                    !id.includes("guard") &&
                    !id.includes("tts") &&
                    !id.includes("vision") &&
                    !id.includes("playai")
            );

        return NextResponse.json({ models: chatModels });
    } catch {
        return NextResponse.json({ models: [] });
    }
}

async function callGroqChat(
    apiKey: string,
    model: string,
    systemContent: string,
    sanitizedMessages: { role: string; content: string }[],
    isVoiceCall: boolean
) {
    return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemContent },
                ...sanitizedMessages,
            ],
            temperature: 0.7,
            max_tokens: isVoiceCall ? 250 : 1024,
        }),
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages = [],
            model = "llama-3.1-8b-instant",
            persona = "assistant",
            language = "en-US",
            isVoiceCall = false,
        } = body;

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    reply:
                        "Configuration Alert: GROQ_API_KEY is missing in your .env.local file. Please add your Groq API key and restart the server.",
                },
                { status: 200 }
            );
        }

        const sanitizedMessages = messages
            .filter(
                (m: any) =>
                    m && m.content && (m.role === "user" || m.role === "assistant")
            )
            .map((m: any) => ({
                role: m.role,
                content: String(m.content),
            }));

        const baseSystemPrompt =
            PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.assistant;

        const languageInstruction =
            language === "ur-PK"
                ? "Respond naturally in Roman Urdu or English as preferred by the user."
                : language === "hi-IN"
                    ? "Respond naturally in Hindi / Hinglish or English as preferred by the user."
                    : language === "ar-SA"
                        ? "Respond naturally in Arabic or English as preferred by the user."
                        : "Always respond in professional, natural English.";

        const voiceInstruction = isVoiceCall
            ? "IMPORTANT: The user is currently on a live voice call with you. Keep your response conversational, natural for speech synthesis, and concise (2 to 3 sentences maximum) without markdown symbols."
            : "Format your response cleanly for readability.";

        const systemContent = `${baseSystemPrompt}\n${languageInstruction}\n${voiceInstruction}`;

        // 1. Try with user's selected model
        let usedModel = model;
        let response = await callGroqChat(
            apiKey,
            usedModel,
            systemContent,
            sanitizedMessages,
            isVoiceCall
        );
        let data = await response.json();

        // 2. Auto-Fallback if selected model is restricted or deprecated on user's free tier
        if (!response.ok) {
            for (const fallbackModel of FALLBACK_FREE_MODELS) {
                if (fallbackModel === usedModel) continue;
                const retryRes = await callGroqChat(
                    apiKey,
                    fallbackModel,
                    systemContent,
                    sanitizedMessages,
                    isVoiceCall
                );
                if (retryRes.ok) {
                    response = retryRes;
                    data = await retryRes.json();
                    usedModel = fallbackModel;
                    break;
                }
            }
        }

        // 3. Dynamic discovery fallback if all static models failed
        if (!response.ok) {
            const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (modelsRes.ok) {
                const modelsData = await modelsRes.json();
                const availableModel = (modelsData?.data || [])
                    .map((m: any) => m.id as string)
                    .find(
                        (id: string) =>
                            !id.includes("whisper") &&
                            !id.includes("guard") &&
                            !id.includes("tts")
                    );

                if (availableModel) {
                    const retryRes = await callGroqChat(
                        apiKey,
                        availableModel,
                        systemContent,
                        sanitizedMessages,
                        isVoiceCall
                    );
                    if (retryRes.ok) {
                        response = retryRes;
                        data = await retryRes.json();
                        usedModel = availableModel;
                    }
                }
            }
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    reply:
                        data?.error?.message ||
                        "Unable to process the request. Please verify your GROQ_API_KEY.",
                },
                { status: 200 }
            );
        }

        const reply =
            data.choices?.[0]?.message?.content ||
            "I apologize, I could not generate a response at this moment.";

        return NextResponse.json({ reply, usedModel });
    } catch {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}