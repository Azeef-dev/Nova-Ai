import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "nova_default_secret_key_2025";
export const AUTH_COOKIE_NAME = "nova_auth_token";

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return [salt, hash].join(":");
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === originalHash;
}

export function signToken(payload: { id: string; name: string; email: string }): string {
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
        .createHmac("sha256", SECRET)
        .update(data)
        .digest("base64url");
    return [data, signature].join(".");
}

export function verifyToken(token: string): { id: string; name: string; email: string } | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 2) return null;
        const [data, signature] = parts;
        const expectedSig = crypto
            .createHmac("sha256", SECRET)
            .update(data)
            .digest("base64url");
        if (signature !== expectedSig) return null;
        return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    } catch {
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch {
        return null;
    }
}