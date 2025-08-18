-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('AA', 'AS', 'AAS', 'BA', 'BS', 'CERT');

-- CreateEnum
CREATE TYPE "OutcomeLevel" AS ENUM ('I', 'D', 'M');

-- CreateEnum
CREATE TYPE "RulePackStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'DRAFT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('ERROR', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeType" "DegreeType" NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "catalogYear" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "ProgramVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "stateId" TEXT,
    "tccnsId" TEXT,
    "cipCode" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermPlan" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "termNumber" INTEGER NOT NULL,

    CONSTRAINT "TermPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermCourse" (
    "id" TEXT NOT NULL,
    "termPlanId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TermCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramOutcome" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProgramOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOutcome" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" "OutcomeLevel" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CourseOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alignment" (
    "id" TEXT NOT NULL,
    "ploId" TEXT,
    "cloId" TEXT,
    "weight" DOUBLE PRECISION,

    CONSTRAINT "Alignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RulePack" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "RulePackStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RulePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleResult" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactItem" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSnapshot" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportArtifact" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_state_key" ON "Institution"("name", "state");

-- CreateIndex
CREATE INDEX "Program_institutionId_code_idx" ON "Program"("institutionId", "code");

-- CreateIndex
CREATE INDEX "Course_subject_number_idx" ON "Course"("subject", "number");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermPlan" ADD CONSTRAINT "TermPlan_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermCourse" ADD CONSTRAINT "TermCourse_termPlanId_fkey" FOREIGN KEY ("termPlanId") REFERENCES "TermPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermCourse" ADD CONSTRAINT "TermCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramOutcome" ADD CONSTRAINT "ProgramOutcome_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOutcome" ADD CONSTRAINT "CourseOutcome_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alignment" ADD CONSTRAINT "Alignment_ploId_fkey" FOREIGN KEY ("ploId") REFERENCES "ProgramOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alignment" ADD CONSTRAINT "Alignment_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CourseOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleResult" ADD CONSTRAINT "RuleResult_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleResult" ADD CONSTRAINT "RuleResult_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "RulePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactItem" ADD CONSTRAINT "ImpactItem_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactItem" ADD CONSTRAINT "ImpactItem_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "RulePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSnapshot" ADD CONSTRAINT "ProgramSnapshot_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportArtifact" ADD CONSTRAINT "ExportArtifact_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
