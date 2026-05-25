/**
 * Notion "Hero Product Lineup" database schema contract.
 *
 * If you rename or retype any property in Notion, update the matching entry
 * here. `sync-products.ts` reads `NOTION_PRODUCT_PROPS` to build every page
 * payload, so the schema map is the single source of truth for property
 * names + property types.
 */

export type NotionPropName =
  | "Name"
  | "Slug"
  | "RitualOrder"
  | "Category"
  | "Price"
  | "Description"
  | "Published"
  | "ImageURL";

export type NotionPropType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "checkbox"
  | "url";

export const NOTION_PRODUCT_PROPS: Readonly<Record<NotionPropName, NotionPropType>> = Object.freeze({
  Name:        "title",
  Slug:        "rich_text",
  RitualOrder: "number",
  Category:    "select",
  Price:       "number",
  Description: "rich_text",
  Published:   "checkbox",
  ImageURL:    "url",
});

/** Category options must exist in the Notion `Category` select. */
export const NOTION_CATEGORY_OPTIONS = [
  "cleanser",
  "essence",
  "serum",
  "cream",
  "sunscreen",
] as const;
