"use client";

import { useId, useState } from "react";

function PasswordField({ label, name }: { label: string; name: string }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          aria-describedby="password-requirements"
        />
        <button
          type="button"
          className="button outline"
          aria-controls={id}
          onClick={() => setVisible(!visible)}
          aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function NewPasswordFields() {
  return (
    <>
      <p id="password-requirements" className="muted">
        Use at least 8 characters. The maximum is 72 bytes.
      </p>
      <PasswordField label="New Password" name="password" />
      <PasswordField label="Confirm New Password" name="confirmPassword" />
    </>
  );
}
