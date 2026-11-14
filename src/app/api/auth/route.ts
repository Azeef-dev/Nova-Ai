import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
    AUTH_COOKIE_NAME,
    getCurrentUser,
    hashPassword,
    signToken,
    verifyPassword,
} from "@/lib/auth";

export async function GET() {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, name, email, password } = body;

        if (action === "logout") {
            const res = NextResponse.json({ success: true });
            res.cookies.delete(AUTH_COOKIE_NAME);
            return res;
        }

        await connectDB();

        if (action === "signup") {
            if (!name || !email || !password) {
                return NextResponse.json(
                    { error: "All fields are required." },
                    { status: 400 }
                );
            }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return NextResponse.json(
                    { error: "An account with this email already exists." },
                    { status: 400 }
                );
            }

            const passwordHash = hashPassword(password);
            const newUser = await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                passwordHash,
            });

            const userPayload = {
                id: String(newUser._id),
                name: newUser.name,
                email: newUser.email,
            };
            const token = signToken(userPayload);

            const res = NextResponse.json({ user: userPayload });
            res.cookies.set(AUTH_COOKIE_NAME, token, {
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            });
            return res;
        }

        if (action === "login") {
            if (!email || !password) {
                return NextResponse.json(
                    { error: "Email and password are required." },
                    { status: 400 }
                );
            }

            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (!existingUser || !verifyPassword(password, existingUser.passwordHash)) {
                return NextResponse.json(
                    { error: "Invalid email or password." },
                    { status: 401 }
                );
            }

            const userPayload = {
                id: String(existingUser._id),
                name: existingUser.name,
                email: existingUser.email,
            };
            const token = signToken(userPayload);

            const res = NextResponse.json({ user: userPayload });
            res.cookies.set(AUTH_COOKIE_NAME, token, {
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            });
            return res;
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message || "Database connection error. Check MONGODB_URI." },
            { status: 500 }
        );
    }
}