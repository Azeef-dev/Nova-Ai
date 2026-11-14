import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ChatSession } from "@/models/ChatSession";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ sessions: [] });
        }

        await connectDB();
        const sessions = await ChatSession.find({ userId: user.id })
            .sort({ updatedAt: -1 })
            .limit(30)
            .lean();

        return NextResponse.json({ sessions });
    } catch {
        return NextResponse.json({ sessions: [] });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ session: null });
        }

        const body = await req.json();
        const { sessionId, messages, persona, model, language } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ session: null });
        }

        await connectDB();

        const firstUserMsg = messages.find((m: any) => m.role === "user");
        const title = firstUserMsg
            ? String(firstUserMsg.content).slice(0, 42)
            : "Voice Call Session";

        if (sessionId) {
            const updated = await ChatSession.findOneAndUpdate(
                { _id: sessionId, userId: user.id },
                { messages, persona, model, language, title },
                { new: true }
            ).lean();

            if (updated) {
                return NextResponse.json({ session: updated });
            }
        }

        const created = await ChatSession.create({
            userId: user.id,
            title,
            persona: persona || "assistant",
            model: model || "llama-3.1-8b-instant",
            language: language || "en-US",
            messages,
        });

        return NextResponse.json({ session: created });
    } catch {
        return NextResponse.json({ session: null });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await connectDB();
        if (id) {
            await ChatSession.deleteOne({ _id: id, userId: user.id });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}