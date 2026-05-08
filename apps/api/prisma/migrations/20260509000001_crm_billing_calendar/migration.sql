-- ─────────────────────────────────────────────────────────────────
-- CRM + Billing + Calendar — Onda 1
-- Adiciona: Customer, Plan, Subscription, CalendarBlock, StripeEvent
-- Estende:  Company (Stripe + plan), Material (dailyRentPrice),
--           Event (customerId, totalAmount, discount, paid)
-- ─────────────────────────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('PJ', 'PF');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM (
  'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED',
  'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID', 'PAUSED'
);

-- ── Plan ────────────────────────────────────────────────────────
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxMaterials" INTEGER NOT NULL,
    "maxEventsPerMonth" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxBranches" INTEGER NOT NULL DEFAULT 1,
    "hasReports" BOOLEAN NOT NULL DEFAULT true,
    "hasPdfExport" BOOLEAN NOT NULL DEFAULT false,
    "hasMultiBranch" BOOLEAN NOT NULL DEFAULT false,
    "priceMonthlyBrl" DECIMAL(10,2) NOT NULL,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- ── Company: stripe + plan ──────────────────────────────────────
ALTER TABLE "Company"
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "planId" TEXT,
  ADD COLUMN "trialEndsAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Company_stripeCustomerId_key" ON "Company"("stripeCustomerId");
CREATE INDEX "Company_planId_idx" ON "Company"("planId");

ALTER TABLE "Company"
  ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId")
  REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Subscription ────────────────────────────────────────────────
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId")
  REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId")
  REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Customer ───────────────────────────────────────────────────
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'PJ',
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");
CREATE INDEX "Customer_companyId_name_idx" ON "Customer"("companyId", "name");
CREATE INDEX "Customer_companyId_document_idx" ON "Customer"("companyId", "document");

ALTER TABLE "Customer"
  ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId")
  REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Material: preço de locação ─────────────────────────────────
ALTER TABLE "Material"
  ADD COLUMN "dailyRentPrice" DECIMAL(10,2);

-- ── Event: customer + comercial ────────────────────────────────
ALTER TABLE "Event"
  ADD COLUMN "customerId" TEXT,
  ADD COLUMN "totalAmount" DECIMAL(12,2),
  ADD COLUMN "discount" DECIMAL(12,2),
  ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Event_customerId_idx" ON "Event"("customerId");
CREATE INDEX "Event_startDate_returnDate_idx" ON "Event"("startDate", "returnDate");

ALTER TABLE "Event"
  ADD CONSTRAINT "Event_customerId_fkey" FOREIGN KEY ("customerId")
  REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── CalendarBlock ──────────────────────────────────────────────
CREATE TABLE "CalendarBlock" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalendarBlock_materialId_idx" ON "CalendarBlock"("materialId");
CREATE INDEX "CalendarBlock_startDate_endDate_idx" ON "CalendarBlock"("startDate", "endDate");

ALTER TABLE "CalendarBlock"
  ADD CONSTRAINT "CalendarBlock_materialId_fkey" FOREIGN KEY ("materialId")
  REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── StripeEvent ────────────────────────────────────────────────
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- ── Seed dos 3 planos ──────────────────────────────────────────
INSERT INTO "Plan" ("id", "slug", "name", "description", "maxMaterials", "maxEventsPerMonth", "maxUsers", "maxBranches", "hasReports", "hasPdfExport", "hasMultiBranch", "priceMonthlyBrl", "active", "sortOrder")
VALUES
  ('plan_basico',   'basico',   'Básico',   'Para quem está começando a organizar eventos',          200, 20,  3,  1, true,  false, false, 79.00,  true, 1),
  ('plan_pro',      'pro',      'Pro',      'Para equipes que trabalham com eventos regularmente',  -1,  -1,  10, 1, true,  true,  false, 149.00, true, 2),
  ('plan_business', 'business', 'Business', 'Para empresas com múltiplas equipes e alto volume',    -1,  -1,  25, 5, true,  true,  true,  249.00, true, 3);
