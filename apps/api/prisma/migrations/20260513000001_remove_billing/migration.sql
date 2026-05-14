-- Remove Stripe/Billing from Company
ALTER TABLE "Company" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "planId";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "trialEndsAt";

-- Drop billing tables
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "StripeEvent" CASCADE;
DROP TABLE IF EXISTS "Plan" CASCADE;

-- Drop billing enum
DROP TYPE IF EXISTS "SubscriptionStatus";
