"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type ActionState } from "../actions";
import { FormMessage, TextField } from "@/components/ui/field";
import { SubmitButton, useSubmitWithoutReset } from "@/components/admin/form-bits";

const initial: ActionState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {state.status === "error" && state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <TextField name="email" label="Email" type="email" autoComplete="username" required error={e.email} />
      <TextField name="password" label="Password" type="password" autoComplete="current-password" required error={e.password} />
      <SubmitButton pending={pending} className="w-full" pendingLabel="Signing in…">
        <LogIn className="size-4" /> Sign in
      </SubmitButton>
    </form>
  );
}
