"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  findEmployeeByLoginIdentifier,
  isLockedOut,
  registerFailedLogin,
  registerSuccessfulLogin,
  verifyPassword,
} from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export type LoginState = {
  error: string | null;
};

const GENERIC_ERROR = "CPF/Matrícula ou senha inválidos.";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: GENERIC_ERROR };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(`login:${ip}`)) {
    return { error: "Muitas tentativas. Aguarde um minuto e tente novamente." };
  }

  const employee = await findEmployeeByLoginIdentifier(identifier);

  if (!employee || employee.status !== "ATIVO") {
    return { error: GENERIC_ERROR };
  }

  if (isLockedOut(employee)) {
    return {
      error:
        "Conta temporariamente bloqueada por tentativas incorretas. Tente novamente mais tarde.",
    };
  }

  const passwordOk = await verifyPassword(password, employee.passwordHash);
  if (!passwordOk) {
    await registerFailedLogin(employee.id);
    return { error: GENERIC_ERROR };
  }

  await registerSuccessfulLogin(employee.id);
  await createSession(employee.id);

  redirect("/dashboard");
}
