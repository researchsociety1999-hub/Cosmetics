/**
 * Generates Content-Inventory.xlsx and Content-Inventory.docx at the repository root.
 * Run: node next-app/scripts/build-content-inventory.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  PageOrientation,
} from "docx";
import { INVENTORY_ROWS } from "./content-inventory-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..", "..");

const HEADERS = [
  "Route / URL",
  "Content block",
  "Visible text (representative or full)",
  "Edit this file (repo path)",
  "Notes",
];

const MAX_CELL = 32000;

function truncate(s) {
  if (s.length <= MAX_CELL) return s;
  return `${s.slice(0, MAX_CELL - 20)}… [truncated]`;
}

function buildTableRows() {
  const headerRow = new TableRow({
    children: HEADERS.map(
      (h) =>
        new TableCell({
          children: [new Paragraph({ text: h })],
        }),
    ),
  });

  const dataRows = INVENTORY_ROWS.map(
    (cells) =>
      new TableRow({
        children: cells.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: truncate(String(c ?? "")),
                }),
              ],
            }),
        ),
      }),
  );

  return [headerRow, ...dataRows];
}

const xlsxPath = path.join(repoRoot, "Content-Inventory.xlsx");
const docxPath = path.join(repoRoot, "Content-Inventory.docx");

const aoa = [HEADERS, ...INVENTORY_ROWS];
const worksheet = XLSX.utils.aoa_to_sheet(aoa);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Site content");
XLSX.writeFile(workbook, xlsxPath);

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE,
          },
        },
      },
      children: [
        new Paragraph({
          text: "Mystique / Mystic — site content inventory",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: `Generated: ${new Date().toISOString().slice(0, 10)}`,
        }),
        new Paragraph({
          text: "Next.js storefront lives under next-app/ (routes starting with /). Static Mystic demo: index.html + script.js + styles.css at repo root. Product and journal copy may also come from Supabase when configured.",
        }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [2000, 2200, 4500, 2800, 2800],
          rows: buildTableRows(),
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buffer);

console.log("Wrote:");
console.log(" ", xlsxPath);
console.log(" ", docxPath);
