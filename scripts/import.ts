import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import * as XLSX from "xlsx";
import { prisma } from "../src/lib/db";
import {
  defaultPasswordFor,
  normalizeCpf,
  normalizeName,
} from "../src/lib/normalize";
import { hashPassword } from "../src/lib/auth";

const SOURCE_DIR = path.resolve(
  __dirname,
  "..",
  process.env.IMPORT_SOURCE_DIR ?? ".."
);

const FILES = {
  cadastro: "Cadastro de Colaboradores.xlsx",
  conformidade: "Conformidade por Colaborador.xlsx",
  comentarios: "Comentários Adicionais - Plano de ação por colaborador.xlsx",
  blockBenchmark: "Conformidade por Pilar  Bloco  Pergunta.xlsx",
};

type Row = Record<string, unknown>;

function readSheet(filename: string, sheetName?: string): Row[] {
  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  aviso: arquivo não encontrado, pulando: ${filePath}`);
    return [];
  }
  const workbook = XLSX.readFile(filePath, { cellText: false, cellDates: true });
  const sheet = workbook.Sheets[sheetName ?? workbook.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: null, raw: true });
}

/** Power BI export footers sometimes leave a "Filtros aplicados:" metadata
 * block in the last row of the sheet instead of real employee data. */
function looksLikeFilterFooter(colaborador: string): boolean {
  return colaborador.includes("\n") || colaborador.startsWith("Filtros aplicados");
}

function str(row: Row, key: string): string | null {
  const v = row[key];
  if (v === null || v === undefined) return null;
  return String(v).trim() || null;
}

function num(row: Row, key: string): number | null {
  const v = row[key];
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function backupDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const match = dbUrl.match(/^file:(.+)$/);
  if (!match) return;
  const dbPath = path.resolve(__dirname, "..", match[1]);
  if (!fs.existsSync(dbPath)) return;

  const backupDir = path.resolve(__dirname, "..", "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `skap-${stamp}.db`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Backup criado em ${backupPath}`);
}

async function importCadastro() {
  const rows = readSheet(FILES.cadastro);
  console.log(`Cadastro de Colaboradores: ${rows.length} linhas`);

  let created = 0;
  let updated = 0;
  let skippedInvalidCpf = 0;
  const nameToId = new Map<string, number>();

  for (const row of rows) {
    const matricula = str(row, "Matrícula");
    const fullName = str(row, "Colaborador");
    const rawCpf = str(row, "CPF");
    const cpf = rawCpf ? normalizeCpf(rawCpf) : null;

    if (!matricula || !fullName) continue;
    if (!cpf || cpf.length !== 11) {
      skippedInvalidCpf++;
      console.warn(
        `  aviso: CPF inválido/ausente para "${fullName}" (matrícula ${matricula}) — login por CPF não funcionará para essa pessoa`
      );
    }

    const fullNameNormalized = normalizeName(fullName);
    const profileData = {
      fullName,
      fullNameNormalized,
      cargo: str(row, "Cargo"),
      tipoCargo: str(row, "Tipo Cargo"),
      empresa: str(row, "Empresa"),
      operacao: str(row, "Operação"),
      lotacao: str(row, "Lotação"),
      liderancaNome: str(row, "Liderança"),
      status: str(row, "Status"),
    };

    const existing = await prisma.employee.findUnique({
      where: { matricula },
    });

    if (existing) {
      await prisma.employee.update({
        where: { matricula },
        data: {
          ...profileData,
          ...(cpf ? { cpf } : {}),
        },
      });
      updated++;
      nameToId.set(fullNameNormalized, existing.id);
    } else {
      const passwordHash = await hashPassword(defaultPasswordFor(fullName));
      const employee = await prisma.employee.create({
        data: {
          matricula,
          cpf: cpf ?? `SEM-CPF-${matricula}`,
          passwordHash,
          ...profileData,
        },
      });
      created++;
      nameToId.set(fullNameNormalized, employee.id);
    }
  }

  return { created, updated, skippedInvalidCpf, nameToId };
}

async function importConformidade(nameToId: Map<string, number>) {
  const rows = readSheet(FILES.conformidade, "Export");
  console.log(`Conformidade por Colaborador: ${rows.length} linhas`);

  let matched = 0;
  const unmatched: { source: string; colaborador: string }[] = [];

  for (const row of rows) {
    const colaborador = str(row, "Colaborador");
    if (!colaborador || looksLikeFilterFooter(colaborador)) continue;

    const employeeId = nameToId.get(normalizeName(colaborador));
    if (!employeeId) {
      unmatched.push({ source: "Conformidade por Colaborador", colaborador });
      continue;
    }

    await prisma.evaluationResult.upsert({
      where: { employeeId },
      create: {
        employeeId,
        empresa: str(row, "Empresa"),
        operacao: str(row, "Operação"),
        atividade: str(row, "Atividade"),
        cargo: str(row, "Cargo"),
        tempoDeCasa: str(row, "Tempo de Casa"),
        tecnicaRatio: num(row, "Habilidades Técnicas"),
        tecnicaNumerador: num(row, "Habilidades Técnicas Numerador"),
        tecnicaDenominador: num(row, "Habilidades Técnicas Denominador"),
        especificaRatio: num(row, "Habilidades Específicas"),
        especificaNumerador: num(row, "Habilidades Específicas Numerador"),
        especificaDenominador: num(row, "Habilidades Específicas Denominador"),
        empoderamentoRatio: num(row, "Habilidades Empoderamento"),
        empoderamentoNumerador: num(row, "Habilidades Empoderamento Numerador"),
        empoderamentoDenominador: num(
          row,
          "Habilidades Empoderamento Denominador"
        ),
        proficiencia: num(row, "Proficiência"),
        nivel: str(row, "Níveis"),
      },
      update: {
        empresa: str(row, "Empresa"),
        operacao: str(row, "Operação"),
        atividade: str(row, "Atividade"),
        cargo: str(row, "Cargo"),
        tempoDeCasa: str(row, "Tempo de Casa"),
        tecnicaRatio: num(row, "Habilidades Técnicas"),
        tecnicaNumerador: num(row, "Habilidades Técnicas Numerador"),
        tecnicaDenominador: num(row, "Habilidades Técnicas Denominador"),
        especificaRatio: num(row, "Habilidades Específicas"),
        especificaNumerador: num(row, "Habilidades Específicas Numerador"),
        especificaDenominador: num(row, "Habilidades Específicas Denominador"),
        empoderamentoRatio: num(row, "Habilidades Empoderamento"),
        empoderamentoNumerador: num(row, "Habilidades Empoderamento Numerador"),
        empoderamentoDenominador: num(
          row,
          "Habilidades Empoderamento Denominador"
        ),
        proficiencia: num(row, "Proficiência"),
        nivel: str(row, "Níveis"),
        importedAt: new Date(),
      },
    });
    matched++;
  }

  return { matched, unmatched };
}

async function importComentarios(nameToId: Map<string, number>) {
  const rows = readSheet(FILES.comentarios, "Export");
  console.log(`Comentários Adicionais: ${rows.length} linhas`);

  let matched = 0;
  const unmatched: { source: string; colaborador: string }[] = [];

  for (const row of rows) {
    const colaborador = str(row, "Colaborador");
    if (!colaborador || looksLikeFilterFooter(colaborador)) continue;

    const employeeId = nameToId.get(normalizeName(colaborador));
    if (!employeeId) {
      unmatched.push({ source: "Comentários Adicionais", colaborador });
      continue;
    }

    const data = {
      tecnicaComment: str(row, "Habilidade Técnica"),
      especificaComment: str(row, "Habilidade Específica"),
      empoderamentoComment: str(row, "Habilidade Empoderamento"),
    };

    await prisma.actionPlanComment.upsert({
      where: { employeeId },
      create: { employeeId, ...data },
      update: { ...data, importedAt: new Date() },
    });
    matched++;
  }

  return { matched, unmatched };
}

async function importBlockBenchmark() {
  const rows = readSheet(FILES.blockBenchmark, "Export");
  const validRows = rows.filter((r) => str(r, "Pilar / Bloco / Pergunta"));
  console.log(`Conformidade por Pilar/Bloco/Pergunta: ${validRows.length} linhas úteis`);

  await prisma.blockBenchmark.deleteMany({});
  for (const row of validRows) {
    await prisma.blockBenchmark.create({
      data: {
        bloco: str(row, "Pilar / Bloco / Pergunta") ?? "",
        tecnica: num(row, "Habilidade Técnica"),
        especifica: num(row, "Habilidade Específica"),
        empoderamento: num(row, "Habilidade Empoderamento"),
      },
    });
  }

  return validRows.length;
}

async function main() {
  console.log(`Lendo arquivos de origem em: ${SOURCE_DIR}\n`);
  await backupDatabase();

  const importRun = await prisma.importRun.create({ data: {} });

  const { created, updated, skippedInvalidCpf, nameToId } =
    await importCadastro();
  const conformidade = await importConformidade(nameToId);
  const comentarios = await importComentarios(nameToId);
  const blockRows = await importBlockBenchmark();

  console.log(
    "\nRadar de Competências: não importado — os 3 arquivos são agregados por Bloco (não por colaborador) e 2 de 3 exports estão quebrados/quase vazios. Radar por colaborador não é possível com os dados atuais."
  );

  const unmatched = [...conformidade.unmatched, ...comentarios.unmatched];

  await prisma.importRun.update({
    where: { id: importRun.id },
    data: {
      finishedAt: new Date(),
      employeesUpserted: created + updated,
      newPasswordsAssigned: created,
      unmatchedRowsJson: JSON.stringify(unmatched),
    },
  });

  const report = [
    `Importação finalizada em ${new Date().toLocaleString("pt-BR")}`,
    `Colaboradores upsertados: ${created + updated} (${created} novos, ${updated} atualizados)`,
    `Senhas padrão novas atribuídas: ${created}`,
    `CPFs inválidos/ausentes no Cadastro: ${skippedInvalidCpf}`,
    `Linhas de Conformidade casadas: ${conformidade.matched}/${
      conformidade.matched + conformidade.unmatched.length
    }`,
    `Linhas de Comentários casadas: ${comentarios.matched}/${
      comentarios.matched + comentarios.unmatched.length
    }`,
    `Benchmarks por bloco importados: ${blockRows}`,
    "",
    unmatched.length
      ? `NÃO CASADOS (revisar manualmente - possível erro de digitação no nome):\n${unmatched
          .map((u) => `  - [${u.source}] "${u.colaborador}"`)
          .join("\n")}`
      : "Todas as linhas casaram com um colaborador do Cadastro.",
  ].join("\n");

  console.log("\n" + report);

  const reportPath = path.resolve(__dirname, "..", "last-import-report.txt");
  fs.writeFileSync(reportPath, report, "utf-8");
  console.log(`\nRelatório salvo em: ${reportPath}`);
}

main()
  .catch((err) => {
    console.error("Erro na importação:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
