import { pgTable, foreignKey, serial, integer, varchar, boolean, timestamp, date, unique, text, index, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
  foreignKey({
    columns: [table.productId],
    foreignColumns: [products.productId],
    name: "nutrition_facts_product_id_products_product_id_fk"
  }).onDelete("cascade"),
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
