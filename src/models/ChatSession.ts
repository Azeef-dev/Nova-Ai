import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    time: string;
    model?: string;
    latency?: string;
}

export interface IChatSession extends Omit<Document, "model"> {
    userId: string;
    title: string;
    persona: string;
    model: string;
    language: string;
    messages: IChatMessage[];
    updatedAt: Date;
}

const MessageSchema = new Schema<IChatMessage>(
    {
        id: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        time: { type: String, required: true },
        model: { type: String },
        latency: { type: String },
    },
    { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, required: true, default: "New Conversation" },
        persona: { type: String, default: "assistant" },
        model: { type: String, default: "llama-3.1-8b-instant" },
        language: { type: String, default: "en-US" },
        messages: { type: [MessageSchema], default: [] },
    },
    { timestamps: true }
);

export const ChatSession =
    mongoose.models.ChatSession ||
    mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);