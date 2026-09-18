"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import type { LoginState } from "@/actions/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {
    error: null,
};

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(login, initialState);

    return (
        <form action={formAction} className="space-y-5">
            <Input
                // label="Username"
                name="username"
                placeholder="Masukkan username"
            />

            <Input
                // label="Password"
                name="password"
                type="password"
                placeholder="Masukkan password"
            />

            {state.error && (
                <p className="text-red-500">{state.error}</p>
            )}

            <Button type="submit" disabled={pending}>
                Login
            </Button>
        </form>
    );
}