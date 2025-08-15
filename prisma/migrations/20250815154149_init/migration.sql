-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeType" TEXT NOT NULL,
    CONSTRAINT "Program_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "catalogYear" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "effectiveTo" DATETIME,
    CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "stateId" TEXT,
    "tccnsId" TEXT,
    "cipCode" TEXT
);

-- CreateTable
CREATE TABLE "TermPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "termNumber" INTEGER NOT NULL,
    CONSTRAINT "TermPlan_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TermCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "termPlanId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TermCourse_termPlanId_fkey" FOREIGN KEY ("termPlanId") REFERENCES "TermPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TermCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "ProgramOutcome_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "CourseOutcome_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ploId" TEXT,
    "cloId" TEXT,
    "weight" REAL,
    CONSTRAINT "Alignment_ploId_fkey" FOREIGN KEY ("ploId") REFERENCES "ProgramOutcome" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alignment_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CourseOutcome" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RulePack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RuleResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RuleResult_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RuleResult_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "RulePack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpactItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImpactItem_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImpactItem_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "RulePack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramSnapshot_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExportArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programVersionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExportArtifact_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Program_institutionId_code_idx" ON "Program"("institutionId", "code");

-- CreateIndex
CREATE INDEX "Course_subject_number_idx" ON "Course"("subject", "number");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
