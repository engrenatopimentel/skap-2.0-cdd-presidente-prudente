import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "skap_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET must be set to a long random string in .env"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(employeeId: number): Promise<void> {
  const token = await new SignJWT({ employeeId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function readSessionEmployeeId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.employeeId === "number" ? payload.employeeId : null;
  } catch {
    return null;
  }
}

/** DAL: returns only the fields safe to use in the UI, never the password hash or full CPF. */
export const getCurrentEmployee = cache(async () => {
  const employeeId = await readSessionEmployeeId();
  if (!employeeId) return null;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      fullName: true,
      cargo: true,
      empresa: true,
      operacao: true,
      status: true,
    },
  });

  if (!employee || employee.status !== "ATIVO") return null;
  return employee;
});

export async function findEmployeeByLoginIdentifier(identifier: string) {
  const digitsOnly = identifier.replace(/\D/g, "");
  if (digitsOnly.length === 11) {
    return prisma.employee.findUnique({ where: { cpf: digitsOnly } });
  }
  return prisma.employee.findUnique({
    where: { matricula: identifier.trim() },
  });
}

export function isLockedOut(employee: { lockedUntil: Date | null }): boolean {
  return !!employee.lockedUntil && employee.lockedUntil.getTime() > Date.now();
}

export async function registerFailedLogin(employeeId: number): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { failedLoginCount: true },
  });
  if (!employee) return;

  const failedLoginCount = employee.failedLoginCount + 1;
  const shouldLock = failedLoginCount >= MAX_FAILED_ATTEMPTS;

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      failedLoginCount: shouldLock ? 0 : failedLoginCount,
      lockedUntil: shouldLock
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : undefined,
    },
  });
}

export async function registerSuccessfulLogin(
  employeeId: number
): Promise<void> {
  await prisma.employee.update({
    where: { id: employeeId },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
