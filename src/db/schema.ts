import { pgTable, foreignKey, serial, integer, varchar, boolean, timestamp, date, unique, text, index, numeric, pgEnum, decimal, jsonb, uniqueIndex } from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"


const commonFields = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(), // Consider $onUpdate trigger or handle in application logic
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}


// --- Enums ---

export const orderStatusEnum = pgEnum("order_status", [
  "pending", // Order created, awaiting payment or processing
  "processing", // Payment received, order being prepared
  "shipped", // Order handed over to carrier
  "delivered", // Order successfully delivered
  "cancelled", // Order cancelled by user or admin
  "refunded", // Order refunded
  "failed", // Order failed (e.g., payment failure)
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", // Payment initiated but not confirmed
  "successful", // Payment completed successfully
  "failed", // Payment attempt failed
  "refunded", // Payment was refunded
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending", // Shipment not yet processed
  "preparing", // Shipment being prepared
  "shipped", // Handed over to carrier
  "in_transit", // With the carrier, on its way
  "delivered", // Successfully delivered
  "failed", // Delivery attempt failed
  "cancelled", // Shipment cancelled
]);

export const checkoutStatusEnum = pgEnum('checkout_status', [
  'pending',
  'success',
  'failed',
  'cancel',
  'pending_verify',
]);


export const productImages = pgTable("product_images", {
  imageId: serial("image_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  imageUrl: varchar("image_url", { length: 1024 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
  isThumbnail: boolean("is_thumbnail").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "product_images_product_id_products_product_id_fk"
  }).onDelete("cascade"),
]);

export const productRankings = pgTable("product_rankings", {
  rankingId: serial("ranking_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  categoryId: integer("category_id").notNull(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  rank: integer().notNull(),
  dateRecorded: date("date_recorded").defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "product_rankings_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.categoryId],
    foreignColumns: [categories.categoryId],
    name: "product_rankings_category_id_categories_category_id_fk"
  }).onDelete("cascade"),
]);

export const productReviewHighlights = pgTable("product_review_highlights", {
  productId: integer("product_id").notNull(),
  highlightId: integer("highlight_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "product_review_highlights_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.highlightId],
    foreignColumns: [reviewHighlights.highlightId],
    name: "product_review_highlights_highlight_id_review_highlights_highli"
  }).onDelete("cascade"),
]);

export const reviewHighlights = pgTable("review_highlights", {
  highlightId: serial("highlight_id").primaryKey().notNull(),
  highlightText: varchar("highlight_text", { length: 100 }).notNull(),
  iconClass: varchar("icon_class", { length: 50 }),
}, (table) => [
  unique("review_highlights_highlight_text_unique").on(table.highlightText),
]);

export const reviews = pgTable("reviews", {
  reviewId: serial("review_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  userId: text("user_id").notNull(),
  rating: integer().notNull(),
  reviewTitle: varchar("review_title", { length: 255 }),
  reviewText: text("review_text"),
  reviewDate: timestamp("review_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
  isRewardedReview: boolean("is_rewarded_review").default(false).notNull(),
  helpfulVotes: integer("helpful_votes").default(0).notNull(),
  notHelpfulVotes: integer("not_helpful_votes").default(0).notNull(),
  reviewerLocation: varchar("reviewer_location", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "reviews_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "reviews_user_id_user_id_fk"
  }).onDelete("cascade"),
]);

export const reviewImages = pgTable("review_images", {
  reviewImageId: serial("review_image_id").primaryKey().notNull(),
  reviewId: integer("review_id").notNull(),
  imageUrl: varchar("image_url", { length: 1024 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.reviewId],
    foreignColumns: [reviews.reviewId],
    name: "review_images_review_id_reviews_review_id_fk"
  }).onDelete("cascade"),
]);

export const session = pgTable("session", {
  id: text().primaryKey().notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  token: text().notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull(),
  impersonatedBy: text("impersonated_by"),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "session_user_id_user_id_fk"
  }).onDelete("cascade"),
  unique("session_token_unique").on(table.token),
]);

export const supplementFacts = pgTable("supplement_facts", {
  factId: serial("fact_id").primaryKey().notNull(),
  variantId: integer("variant_id").notNull(),
  ingredientName: varchar("ingredient_name", { length: 255 }).notNull(),
  amountPerServing: varchar("amount_per_serving", { length: 100 }).notNull(),
  percentDailyValue: varchar("percent_daily_value", { length: 10 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.variantId],
    foreignColumns: [productVariants.variantId],
    name: "supplement_facts_variant_id_product_variants_variant_id_fk"
  }).onDelete("cascade"),
]);

export const brands = pgTable("brands", {
  brandId: serial("brand_id").primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 512 }),
  description: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  unique("brands_name_unique").on(table.name),
]);

export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  parentCategoryId: integer("parent_category_id"),
  description: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const nutritionFacts = pgTable("nutrition_facts", {
  factId: serial("fact_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  ingredient: varchar({ length: 255 }).notNull(),
  amountPerServing: varchar("amount_per_serving", { length: 100 }).notNull(),
  percentDailyValue: varchar("percent_daily_value", { length: 10 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  index("nutrition_product_idx").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
  // foreignKey({
  //   columns: [table.productId],
  //   foreignColumns: [products.productId],
  //   name: "nutrition_facts_product_id_products_product_id_fk"
  // }).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }),
  updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
  username: text(),
  displayUsername: text("display_username"),
  role: text(),
  banned: boolean(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
  unique("user_email_unique").on(table.email),
  unique("user_username_unique").on(table.username),
]);

export const account = pgTable("account", {
  id: text().primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
  scope: text(),
  password: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "account_user_id_user_id_fk"
  }).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
  questionId: serial("question_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  userId: text("user_id").notNull(),
  questionText: text("question_text").notNull(),
  questionDate: timestamp("question_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  upvotes: integer().default(0).notNull(),
  downvotes: integer().default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "questions_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "questions_user_id_user_id_fk"
  }).onDelete("cascade"),
]);

export const answers = pgTable("answers", {
  answerId: serial("answer_id").primaryKey().notNull(),
  questionId: integer("question_id").notNull(),
  userId: text("user_id").notNull(),
  answerText: text("answer_text").notNull(),
  answerDate: timestamp("answer_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  isBestAnswer: boolean("is_best_answer").default(false).notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
  isRewardedAnswer: boolean("is_rewarded_answer").default(false).notNull(),
  upvotes: integer().default(0).notNull(),
  downvotes: integer().default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.questionId],
    foreignColumns: [questions.questionId],
    name: "answers_question_id_questions_question_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "answers_user_id_user_id_fk"
  }).onDelete("cascade"),
]);

export const productVariants = pgTable("product_variants", {
  variantId: serial("variant_id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  packageDescription: varchar("package_description", { length: 255 }).notNull(),
  stockNumber: varchar("stock_number", { length: 50 }),
  upc: varchar({ length: 50 }),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  listPrice: numeric("list_price", { precision: 10, scale: 2 }),
  servingSize: varchar("serving_size", { length: 100 }),
  servingsPerContainer: integer("servings_per_container"),
  bestByDate: date("best_by_date"),
  isInStock: boolean("is_in_stock").default(true).notNull(),
  shippingWeightKg: numeric("shipping_weight_kg", { precision: 5, scale: 2 }),
  dimensionsCm: varchar("dimensions_cm", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "product_variants_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  unique("product_variants_stock_number_unique").on(table.stockNumber),
  unique("product_variants_upc_unique").on(table.upc),
]);

export const customersAlsoViewed = pgTable("customers_also_viewed", {
  relationshipId: serial("relationship_id").primaryKey().notNull(),
  sourceVariantId: integer("source_variant_id").notNull(),
  viewedVariantId: integer("viewed_variant_id").notNull(),
  viewCount: integer("view_count").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.sourceVariantId],
    foreignColumns: [productVariants.variantId],
    name: "customers_also_viewed_source_variant_id_product_variants_varian"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.viewedVariantId],
    foreignColumns: [productVariants.variantId],
    name: "customers_also_viewed_viewed_variant_id_product_variants_varian"
  }).onDelete("cascade"),
]);

export const frequentlyBoughtTogetherGroups = pgTable("frequently_bought_together_groups", {
  groupId: serial("group_id").primaryKey().notNull(),
  description: varchar({ length: 255 }),
});

export const frequentlyBoughtTogetherItems = pgTable("frequently_bought_together_items", {
  groupId: integer("group_id").notNull(),
  variantId: integer("variant_id").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.groupId],
    foreignColumns: [frequentlyBoughtTogetherGroups.groupId],
    name: "frequently_bought_together_items_group_id_frequently_bought_tog"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.variantId],
    foreignColumns: [productVariants.variantId],
    name: "frequently_bought_together_items_variant_id_product_variants_va"
  }).onDelete("cascade"),
]);

export const productCategories = pgTable("product_categories", {
  productId: integer("product_id").notNull(),
  categoryId: integer("category_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "product_categories_product_id_products_product_id_fk"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.categoryId],
    foreignColumns: [categories.categoryId],
    name: "product_categories_category_id_categories_category_id_fk"
  }).onDelete("cascade"),
]);

export const products = pgTable("products", {
  productId: serial("product_id").primaryKey().notNull(),
  brandId: integer("brand_id").notNull(),
  name: varchar({ length: 512 }).notNull(),
  baseDescription: text("base_description"),
  overallRating: numeric("overall_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0).notNull(),
  totalQuestions: integer("total_questions").default(0).notNull(),
  dateFirstAvailable: date("date_first_available"),
  manufacturerWebsiteUrl: varchar("manufacturer_website_url", { length: 512 }),
  isuraVerified: boolean("isura_verified").default(false).notNull(),
  nonGmoDocumentation: boolean("non_gmo_documentation").default(false).notNull(),
  massSpecLabTested: boolean("mass_spec_lab_tested").default(false).notNull(),
  detailedDescription: text("detailed_description"),
  suggestedUse: text("suggested_use"),
  otherIngredients: text("other_ingredients"),
  warnings: text(),
  disclaimer: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
  isFeatured: boolean("is_featured").default(false),
  allergenInformation: text("allergen_information"),
}, (table) => [
  foreignKey({
    columns: [table.brandId],
    foreignColumns: [brands.brandId],
    name: "products_brand_id_brands_brand_id_fk"
  }),
]);

// Addresses Table
export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "cascade", // Or 'set null' depending on your requirements
    }), // Optional: Link address to a user account
    streetLine1: varchar("street_line_1", { length: 255 }).notNull(),
    streetLine2: varchar("street_line_2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    stateOrProvince: varchar("state_or_province", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 50 }).notNull(), // Consider using ISO country codes
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userIdx: index("addr_user_idx").on(table.userId),
    };
  },
);

// Orders Table
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }), // Don't delete user if they have orders
    status: orderStatusEnum("status").default("pending").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(), // Total including shipping, taxes etc.
    currency: varchar("currency", { length: 3 }).notNull().default("USD"), // ISO 4217 currency code
    shippingAddressId: integer("shipping_address_id")
      .notNull()
      .references(() => addresses.id, { onDelete: "restrict" }), // Don't delete address if used in order
    billingAddressId: integer("billing_address_id").references(
      () => addresses.id,
      { onDelete: "restrict" },
    ), // Optional: Can be same as shipping
    // paymentId: integer('payment_id'), // We'll link from the payment table instead for flexibility
    // shipmentId: integer('shipment_id'), // We'll link from the shipment table
    notes: text("notes"), // Customer notes
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userIdx: index("order_user_idx").on(table.userId),
      statusIdx: index("order_status_idx").on(table.status),
      shippingAddrIdx: index("order_shipping_addr_idx").on(
        table.shippingAddressId,
      ),
      billingAddrIdx: index("order_billing_addr_idx").on(
        table.billingAddressId,
      ),
    };
  },
);

// Order Items Table (Line items for an order)
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }), // Delete items if order is deleted
    productId: integer("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "restrict" }), // Don't delete product if it's in an order
    quantity: integer("quantity").notNull(),
    // IMPORTANT: Store price at the time of purchase, as product price might change later
    priceAtPurchase: decimal("price_at_purchase", {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"), // Should match order currency
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orderIdx: index("item_order_idx").on(table.orderId),
      productIdx: index("item_product_idx").on(table.productId),
      orderProductUnique: uniqueIndex("order_product_unique_idx").on(
        table.orderId,
        table.productId,
      ), // Usually only one line item per product per order
    };
  },
);

// Payments Table
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }), // Link payment to order
    status: paymentStatusEnum("status").default("pending").notNull(),
    method: varchar("method", { length: 50 }), // e.g., 'stripe', 'paypal', 'credit_card'
    transactionId: varchar("transaction_id", { length: 255 }).unique(), // ID from payment provider
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    providerDetails: jsonb("provider_details"), // Store raw response or specific details from provider
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orderIdx: index("payment_order_idx").on(table.orderId),
      statusIdx: index("payment_status_idx").on(table.status),
      transactionIdx: index("payment_transaction_idx").on(table.transactionId),
    };
  },
);

// Shipments Table (Optional, but recommended for tracking)
export const shipments = pgTable(
  "shipments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: shipmentStatusEnum("status").default("pending").notNull(),
    carrier: varchar("carrier", { length: 100 }), // e.g., 'UPS', 'FedEx', 'DHL'
    trackingNumber: varchar("tracking_number", { length: 255 }),
    shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    estimatedDeliveryDate: timestamp("estimated_delivery_date", {
      withTimezone: true,
    }),
    actualDeliveryDate: timestamp("actual_delivery_date", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orderIdx: index("shipment_order_idx").on(table.orderId),
      statusIdx: index("shipment_status_idx").on(table.status),
      trackingIdx: index("shipment_tracking_idx").on(table.trackingNumber),
    };
  },
);

export const userProductInteractions = pgTable(
  "user_product_interactions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    interactionType: varchar("interaction_type", { length: 50 }).notNull(), // e.g. "view", "purchase"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("upi_user_idx").on(table.userId),
    index("upi_product_idx").on(table.productId),
  ]
);

export const checkouts = pgTable('checkouts', {
  checkoutId: serial('checkout_id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: checkoutStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const configTable = pgTable("configs", {
  key: text("key").primaryKey().notNull(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
}, (table) => [
  unique("configs_key_unique").on(table.key),
]);

// --- Drizzle Relations ---
// Define relationships for ORM querying (e.g., joins, eager loading)

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.categoryId],
    relationName: "parentCategory",
  }),
  childCategories: many(categories, {
    relationName: "parentCategory",
  }),
  productCategories: many(productCategories),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.brandId],
  }),
  productCategories: many(productCategories),
  productVariants: many(productVariants),
  productImages: many(productImages),
  productRankings: many(productRankings),
  questions: many(questions),
  reviews: many(reviews),
  userProductInteractions: many(userProductInteractions),
  productReviewHighlights: many(productReviewHighlights),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.productId],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.categoryId],
    }),
  }),
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.productId],
    }),
    supplementFacts: many(supplementFacts),
    frequentlyBoughtTogetherItems: many(frequentlyBoughtTogetherItems),
    customersAlsoViewedSource: many(customersAlsoViewed, {
      relationName: "sourceVariant",
    }),
    customersAlsoViewedTarget: many(customersAlsoViewed, {
      relationName: "viewedVariant",
    }),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.productId],
  }),
}));

export const supplementFactsRelations = relations(
  supplementFacts,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [supplementFacts.variantId],
      references: [productVariants.variantId],
    }),
  }),
);

export const productRankingsRelations = relations(
  productRankings,
  ({ one }) => ({
    product: one(products, {
      fields: [productRankings.productId],
      references: [products.productId],
    }),
    category: one(categories, {
      fields: [productRankings.categoryId],
      references: [categories.categoryId],
    }),
  }),
);

export const usersRelations = relations(user, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  reviews: many(reviews),
  userProductInteractions: many(userProductInteractions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  product: one(products, {
    fields: [questions.productId],
    references: [products.productId],
  }),
  user: one(user, {
    fields: [questions.userId],
    references: [user.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.questionId],
  }),
  user: one(user, {
    fields: [answers.userId],
    references: [user.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.productId],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  reviewImages: many(reviewImages),
}));

export const userProductInteractionsRelations = relations(
  userProductInteractions,
  ({ one }) => ({
    user: one(user, {
      fields: [userProductInteractions.userId],
      references: [user.id],
    }),
    product: one(products, {
      fields: [userProductInteractions.productId],
      references: [products.productId],
    }),
  }),
);

export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewImages.reviewId],
    references: [reviews.reviewId],
  }),
}));

export const reviewHighlightsRelations = relations(
  reviewHighlights,
  ({ many }) => ({
    productReviewHighlights: many(productReviewHighlights),
  }),
);

export const productReviewHighlightsRelations = relations(
  productReviewHighlights,
  ({ one }) => ({
    product: one(products, {
      fields: [productReviewHighlights.productId],
      references: [products.productId],
    }),
    reviewHighlight: one(reviewHighlights, {
      fields: [productReviewHighlights.highlightId],
      references: [reviewHighlights.highlightId],
    }),
  }),
);

export const frequentlyBoughtTogetherGroupsRelations = relations(
  frequentlyBoughtTogetherGroups,
  ({ many }) => ({
    items: many(frequentlyBoughtTogetherItems),
  }),
);

export const frequentlyBoughtTogetherItemsRelations = relations(
  frequentlyBoughtTogetherItems,
  ({ one }) => ({
    group: one(frequentlyBoughtTogetherGroups, {
      fields: [frequentlyBoughtTogetherItems.groupId],
      references: [frequentlyBoughtTogetherGroups.groupId],
    }),
    productVariant: one(productVariants, {
      fields: [frequentlyBoughtTogetherItems.variantId],
      references: [productVariants.variantId],
    }),
  }),
);

export const customersAlsoViewedRelations = relations(
  customersAlsoViewed,
  ({ one }) => ({
    sourceVariant: one(productVariants, {
      fields: [customersAlsoViewed.sourceVariantId],
      references: [productVariants.variantId],
      relationName: "sourceVariant",
    }),
    viewedVariant: one(productVariants, {
      fields: [customersAlsoViewed.viewedVariantId],
      references: [productVariants.variantId],
      relationName: "viewedVariant",
    }),
  }),
);
