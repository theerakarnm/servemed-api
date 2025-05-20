CREATE TYPE "public"."checkout_status" AS ENUM('pending', 'success', 'failed', 'cancel', 'pending_verify');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'successful', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"street_line_1" varchar(255) NOT NULL,
	"street_line_2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state_or_province" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkouts" (
	"checkout_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "checkout_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_facts" (
	"fact_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"ingredient" varchar(255) NOT NULL,
	"amount_per_serving" varchar(100) NOT NULL,
	"percent_daily_value" varchar(10),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_purchase" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"shipping_address_id" integer NOT NULL,
	"billing_address_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"method" varchar(50),
	"transaction_id" varchar(255),
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"provider_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" "shipment_status" DEFAULT 'pending' NOT NULL,
	"carrier" varchar(100),
	"tracking_number" varchar(255),
	"shipping_cost" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"estimated_delivery_date" timestamp with time zone,
	"actual_delivery_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_product_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"interaction_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_variants" RENAME COLUMN "iherb_stock_number" TO "stock_number";--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_iherb_stock_number_unique";--> statement-breakpoint
ALTER TABLE "customers_also_viewed" DROP CONSTRAINT "customers_also_viewed_source_variant_id_product_variants_variant_id_fk";
--> statement-breakpoint
ALTER TABLE "customers_also_viewed" DROP CONSTRAINT "customers_also_viewed_viewed_variant_id_product_variants_variant_id_fk";
--> statement-breakpoint
ALTER TABLE "frequently_bought_together_items" DROP CONSTRAINT "frequently_bought_together_items_group_id_frequently_bought_together_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "frequently_bought_together_items" DROP CONSTRAINT "frequently_bought_together_items_variant_id_product_variants_variant_id_fk";
--> statement-breakpoint
ALTER TABLE "product_review_highlights" DROP CONSTRAINT "product_review_highlights_highlight_id_review_highlights_highlight_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "allergen_information" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_product_interactions" ADD CONSTRAINT "user_product_interactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_product_interactions" ADD CONSTRAINT "user_product_interactions_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addr_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "nutrition_product_idx" ON "nutrition_facts" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "item_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "item_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_product_unique_idx" ON "order_items" USING btree ("order_id","product_id");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_shipping_addr_idx" ON "orders" USING btree ("shipping_address_id");--> statement-breakpoint
CREATE INDEX "order_billing_addr_idx" ON "orders" USING btree ("billing_address_id");--> statement-breakpoint
CREATE INDEX "payment_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "shipment_order_idx" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "shipment_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipment_tracking_idx" ON "shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "upi_user_idx" ON "user_product_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upi_product_idx" ON "user_product_interactions" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "customers_also_viewed" ADD CONSTRAINT "customers_also_viewed_source_variant_id_product_variants_varian" FOREIGN KEY ("source_variant_id") REFERENCES "public"."product_variants"("variant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers_also_viewed" ADD CONSTRAINT "customers_also_viewed_viewed_variant_id_product_variants_varian" FOREIGN KEY ("viewed_variant_id") REFERENCES "public"."product_variants"("variant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frequently_bought_together_items" ADD CONSTRAINT "frequently_bought_together_items_group_id_frequently_bought_tog" FOREIGN KEY ("group_id") REFERENCES "public"."frequently_bought_together_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frequently_bought_together_items" ADD CONSTRAINT "frequently_bought_together_items_variant_id_product_variants_va" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("variant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review_highlights" ADD CONSTRAINT "product_review_highlights_highlight_id_review_highlights_highli" FOREIGN KEY ("highlight_id") REFERENCES "public"."review_highlights"("highlight_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_stock_number_unique" UNIQUE("stock_number");