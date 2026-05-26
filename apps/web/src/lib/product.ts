import type { Product, ProductColorOption } from "../types";

export function buildRating(index: number) {
  return (4.6 + (index % 4) * 0.1).toFixed(1);
}

export function buildReviewCount(index: number) {
  return 18 + index * 7;
}

export function getValidCompareAtPrice(product: Product) {
  return typeof product.compareAtPriceInCents === "number" &&
    Number.isFinite(product.compareAtPriceInCents) &&
    product.compareAtPriceInCents > product.priceInCents
    ? product.compareAtPriceInCents
    : null;
}

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    compareAtPriceInCents:
      typeof product.compareAtPriceInCents === "number" &&
      Number.isFinite(product.compareAtPriceInCents)
        ? product.compareAtPriceInCents
        : undefined,
    imageUrl: product.imageUrl ?? "",
    galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
    colorOptions: Array.isArray(product.colorOptions) ? product.colorOptions : []
  };
}

export function buildProductGallery(product: Product) {
  return [product.imageUrl, ...(product.galleryImages ?? [])].filter(
    (image, index, images): image is string =>
      Boolean(image) && images.indexOf(image) === index
  );
}

export function parseDimensions(dimensions: string) {
  const [width = "", heightWithUnit = ""] = dimensions.split("x");
  const height = heightWithUnit.replace(/cm/i, "").trim();

  return {
    width: width.trim(),
    height
  };
}

export function cloneProduct(product: Product): Product {
  return {
    ...normalizeProduct(product),
    tags: [...product.tags],
    galleryImages: [...(product.galleryImages ?? [])],
    colorOptions: (product.colorOptions ?? []).map((option) => ({
      ...option,
      swatches: [...option.swatches]
    }))
  };
}

export function parseColorOptions(value: string): ProductColorOption[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [namePart, swatchesPart = ""] = line.split("=");

      return {
        id: `color-${index + 1}`,
        name: namePart.trim(),
        swatches: swatchesPart
          .split(",")
          .map((swatch) => swatch.trim())
          .filter(Boolean)
      };
    })
    .filter((option) => option.name && option.swatches.length > 0);
}

export function formatColorOptions(colorOptions: ProductColorOption[]) {
  return colorOptions
    .map((option) => `${option.name}=${option.swatches.join(", ")}`)
    .join("\n");
}
