import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await fetch("https://groq.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content:
                            "Tum ek friendly aur smart voice assistant ho. Hamesha chote, natural aur Roman Urdu mein jawab do (1 se 2 jumlay) taake bolne mein bilkul insaan jaisa lage.",
                    },
                    ...messages,
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Maaf kijiyega, dubara bolein.";

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
