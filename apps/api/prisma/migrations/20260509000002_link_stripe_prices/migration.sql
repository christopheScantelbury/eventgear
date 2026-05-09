-- ─────────────────────────────────────────────────────────────────
-- Vincula os planos seedados aos produtos/prices reais do Stripe
-- (criados via Stripe API em 2026-05-09)
-- ─────────────────────────────────────────────────────────────────

UPDATE "Plan"
   SET "stripeProductId" = 'prod_UU7zfmsc2x52yn',
       "stripePriceId"   = 'price_1TV9k1QkYQoRUOWmIHLYLAWp'
 WHERE "slug" = 'basico';

UPDATE "Plan"
   SET "stripeProductId" = 'prod_UU7zGo6k7fNXy5',
       "stripePriceId"   = 'price_1TV9k2QkYQoRUOWmmpRSCrmj'
 WHERE "slug" = 'pro';

UPDATE "Plan"
   SET "stripeProductId" = 'prod_UU7zjBDb9RKTtN',
       "stripePriceId"   = 'price_1TV9k2QkYQoRUOWmzEMGAC8f'
 WHERE "slug" = 'business';
