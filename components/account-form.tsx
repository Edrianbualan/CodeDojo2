"use client";
import { useActionState, type ReactNode } from "react";

export function AccountForm({
  action,
  label,
  children,
}: {
  action: (previous: string, form: FormData) => Promise<string>;
  label: string;
  children: ReactNode;
}) {
  const [message, submit, pending] = useActionState(action, "");
  return (
    <form action={submit} className="dojo-form">
      <fieldset disabled={pending}>{children}</fieldset>
      <button className="button" disabled={pending}>
        {pending ? "Please wait…" : label}
      </button>
      <p role="status" className="feedback">
        {message}
      </p>
    </form>
  );
}
