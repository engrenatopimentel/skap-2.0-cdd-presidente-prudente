"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentEmployee, hashPassword, verifyPassword } from "@/lib/auth";

export type ChangePasswordState = {
  error: string | null;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "A nova senha deve ter pelo menos 8 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "A confirmação não corresponde à nova senha." };
  }

  const record = await prisma.employee.findUnique({
    where: { id: employee.id },
    select: { passwordHash: true },
  });
  if (!record) {
    redirect("/login");
  }

  const currentOk = await verifyPassword(currentPassword, record.passwordHash);
  if (!currentOk) {
    return { error: "Senha atual incorreta." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.employee.update({
    where: { id: employee.id },
    data: { passwordHash },
  });

  return { error: null, success: true };
}
