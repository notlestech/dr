-- Free-tier subscriptions don't have Stripe IDs; make these nullable
ALTER TABLE subscriptions
  ALTER COLUMN stripe_customer_id DROP NOT NULL,
  ALTER COLUMN stripe_sub_id DROP NOT NULL;

-- Prevent future null-status errors if a code path omits the field
ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'active';
