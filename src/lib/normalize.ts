export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeName(input: string): string {
  return stripAccents(input)
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCpf(input: string): string {
  return input.replace(/\D/g, "");
}

export function normalizeMatricula(input: string): string {
  return input.trim();
}

export function defaultPasswordFor(fullName: string): string {
  const firstName = stripAccents(fullName.trim().split(/\s+/)[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return `${firstName}123`;
}
