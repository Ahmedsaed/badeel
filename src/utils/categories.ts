import { Category, Product } from "~types";

export const categoryMap: Record<string, Category> = {};

/**
 * Generates the map required to map subcategories to major categories
 */
export const generateCategoryMap = (categories: Category[]) => {
	categories.forEach((category) => {
		categoryMap[category.english] = category;
	});
};

export const getProductCategory = (product: Product) => {
	const category = categoryMap[product.Category];

	return category;
};

export const getParentCategory = (product: Product) => {
	const category = categoryMap[product.Category];
	const major = categoryMap[category.major!];

	return major;
};