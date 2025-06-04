ALTER TABLE "orders" ADD COLUMN "shipping_address" jsonb NOT NULL;
ALTER TABLE "orders" ADD COLUMN "billing_address" jsonb;
