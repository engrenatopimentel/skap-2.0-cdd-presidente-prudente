-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricula" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fullNameNormalized" TEXT NOT NULL,
    "cargo" TEXT,
    "tipoCargo" TEXT,
    "empresa" TEXT,
    "operacao" TEXT,
    "lotacao" TEXT,
    "liderancaNome" TEXT,
    "status" TEXT,
    "passwordHash" TEXT NOT NULL,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "empresa" TEXT,
    "operacao" TEXT,
    "atividade" TEXT,
    "cargo" TEXT,
    "tempoDeCasa" TEXT,
    "tecnicaRatio" REAL,
    "tecnicaNumerador" INTEGER,
    "tecnicaDenominador" INTEGER,
    "especificaRatio" REAL,
    "especificaNumerador" INTEGER,
    "especificaDenominador" INTEGER,
    "empoderamentoRatio" REAL,
    "empoderamentoNumerador" INTEGER,
    "empoderamentoDenominador" INTEGER,
    "proficiencia" REAL,
    "nivel" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvaluationResult_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionPlanComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "tecnicaComment" TEXT,
    "especificaComment" TEXT,
    "empoderamentoComment" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActionPlanComment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockBenchmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bloco" TEXT NOT NULL,
    "tecnica" REAL,
    "especifica" REAL,
    "empoderamento" REAL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ImportRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "employeesUpserted" INTEGER NOT NULL DEFAULT 0,
    "newPasswordsAssigned" INTEGER NOT NULL DEFAULT 0,
    "unmatchedRowsJson" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_matricula_key" ON "Employee"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_cpf_key" ON "Employee"("cpf");

-- CreateIndex
CREATE INDEX "Employee_fullNameNormalized_idx" ON "Employee"("fullNameNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationResult_employeeId_key" ON "EvaluationResult"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionPlanComment_employeeId_key" ON "ActionPlanComment"("employeeId");
