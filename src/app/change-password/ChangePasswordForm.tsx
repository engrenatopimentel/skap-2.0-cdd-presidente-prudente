"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = { error: null };

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState
  );

  if (state?.success) {
    return (
      <div className="error-banner" style={{ background: "var(--track)", color: "var(--success)" }}>
        Senha alterada com sucesso.
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state?.error && <div className="error-banner">{state.error}</div>}

      <div className="field">
        <label htmlFor="currentPassword">Senha atual</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="newPassword">Nova senha</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">Confirmar nova senha</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
