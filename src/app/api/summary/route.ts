import { getDb } from "@/lib/db";
import { calculateSummary } from "@/lib/summary";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM items").all() as Array<{
      id: number;
      description: string;
      purchase_price: number;
      purchase_date: string;
      sale_price: number | null;
      sale_date: string | null;
      folder_id: number | null;
      created_at: string;
      updated_at: string;
    }>;

    const items: Item[] = rows.map((row) => ({
      id: row.id,
      description: row.description,
      purchasePrice: row.purchase_price,
      purchaseDate: row.purchase_date,
      salePrice: row.sale_price,
      saleDate: row.sale_date,
      folderId: row.folder_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const summary = calculateSummary(items);

    return Response.json(summary);
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
