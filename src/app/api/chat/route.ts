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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages = [],
            model = "llama-3.3-70b-versatile",
            persona = "assistant",
            language = "en-US",
            isVoiceCall = false,
        } = body;

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    reply:
                        "Configuration Alert: GROQ_API_KEY is missing in your .env.local file. Please add your Groq API key and restart the Next.js server.",
                },
                { status: 200 }
            );
        }

        const sanitizedMessages = messages
            .filter((m: any) => m && m.content && (m.role === "user" || m.role === "assistant"))
            .map((m: any) => ({
                role: m.role,
                content: String(m.content),
            }));

        const baseSystemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.assistant;

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

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: `${baseSystemPrompt}\n${languageInstruction}\n${voiceInstruction}`,
                    },
                    ...sanitizedMessages,
                ],
                temperature: 0.7,
                max_tokens: isVoiceCall ? 250 : 1024,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    reply:
                        data?.error?.message ||
                        "Unable to process the request with the selected model. Please try another model from the dropdown.",
                },
                { status: 200 }
            );
        }

        const reply =
            data.choices?.[0]?.message?.content ||
            "I apologize, I could not generate a response at this moment. Please try again.";

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}