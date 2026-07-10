import "dotenv/config";
import { prisma } from "../src/lib/db";
import { defaultPasswordFor } from "../src/lib/normalize";
import { hashPassword } from "../src/lib/auth";

function getArg(name: string): string | null {
  const prefix = `--${name}=`;
  const direct = process.argv.find((a) => a.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);

  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

async function main() {
  const matricula = getArg("matricula");
  if (!matricula) {
    console.error(
      "Uso: npx tsx scripts/reset-password.ts --matricula <numero>"
    );
    process.exit(1);
  }

  const employee = await prisma.employee.findUnique({ where: { matricula } });
  if (!employee) {
    console.error(`Nenhum colaborador encontrado com matrícula ${matricula}`);
    process.exit(1);
  }

  const newPassword = defaultPasswordFor(employee.fullName);
  const passwordHash = await hashPassword(newPassword);

  await prisma.employee.update({
    where: { matricula },
    data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
  });

  console.log(
    `Senha de "${employee.fullName}" (matrícula ${matricula}) redefinida para a senha padrão: ${newPassword}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
