import { db } from "../db";
import { brands, products, productImages, productVariants, productCategories, reviews } from "../db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getTopRankedProducts } from "./products";

export async function getPersonalizedRecommendations(userId: string) {
  try {
    // Find up to 3 categories the user has interacted with most via reviews
    const categoryQuery = sql`
      SELECT pc.category_id AS "categoryId"
      FROM ${reviews} r
      JOIN ${productCategories} pc ON r.product_id = pc.product_id
      WHERE r.user_id = ${userId}
      GROUP BY pc.category_id
      ORDER BY COUNT(*) DESC
      LIMIT 3
    `;
    const { rows: categoryRows } = await db.execute(categoryQuery);
    const categoryIds = categoryRows.map((row: { categoryId: number }) => row.categoryId);

    if (categoryIds.length === 0) {
      // Fallback: return top ranked products overall
      return await getTopRankedProducts();
    }

    const productList = await db
      .select({
        productId: products.productId,
        name: products.name,
        brandId: products.brandId,
        brandName: brands.name,
        overallRating: products.overallRating,
        totalReviews: products.totalReviews,
        isuraVerified: products.isuraVerified,
        price: sql<number>`MIN(${productVariants.price})`.as("price"),
        currency: productVariants.currency,
        imageUrl: productImages.imageUrl,
      })
      .from(productCategories)
      .innerJoin(products, eq(productCategories.productId, products.productId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .leftJoin(productVariants, eq(products.productId, productVariants.productId))
      .leftJoin(
        productImages,
        and(eq(products.productId, productImages.productId), eq(productImages.isThumbnail, true))
      )
      .where(inArray(productCategories.categoryId, categoryIds))
      .groupBy(
        products.productId,
        brands.name,
        productVariants.currency,
        productImages.imageUrl
      )
      .orderBy(desc(products.overallRating), desc(products.totalReviews))
      .limit(10);

    return productList;
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    return [];
  }
}
