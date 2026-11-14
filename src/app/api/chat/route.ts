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
                            "Tum ek smart, polite aur modern AI assistant ho. Hamesha Roman Urdu mein natural aur helpful jawab do. Agar voice call chal rahi ho to jawab mukhtasir rakho.",
                    },
                    ...messages,
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Maaf kijiyega, dubara koshish karein.";

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
