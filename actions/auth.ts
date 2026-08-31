"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export type LoginState = {
    error: string | null;
};

export async function login(
    _: LoginState,
    formData: FormData
): Promise<LoginState> {
    const username = formData.get("username")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!user) {
        return { error: "Username tidak ditemukan." };
    }

    if (!user.is_active) {
        return { error: "User tidak aktif." };
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return { error: "Password salah." };
    }

    const token = await signToken({
        id: user.id,
        username: user.username,
        role: user.role,
    });

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/dashboard");
}