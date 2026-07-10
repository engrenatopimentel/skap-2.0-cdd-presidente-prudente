import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

/**
 * `prisma migrate deploy` does not work against a remote libsql:// datasource
 * (Turso) the same way it does against a local SQLite file. This applies the
 * same migration.sql files directly over the libsql client instead.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql://")) {
    console.error(
      "DATABASE_URL precisa apontar para o Turso (libsql://...) para rodar este script."
    );
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const migrationsDir = path.resolve(__dirname, "..", "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const folder of folders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    console.log(`Aplicando migração: ${folder}`);
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await client.executeMultiple(sql);
  }

  console.log("Migrações aplicadas com sucesso no Turso.");
  client.close();
}

main().catch((err) => {
  console.error("Erro ao aplicar migrações no Turso:", err);
  process.exitCode = 1;
});
