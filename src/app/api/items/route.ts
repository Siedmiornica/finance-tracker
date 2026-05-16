import { getDb } from "@/lib/db";
import { calculateProfit } from "@/lib/profit";
import { deriveStatus } from "@/lib/status";
import { validateCreateItem } from "@/lib/validation";
import type { Item, ItemWithProfit } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM items ORDER BY created_at DESC").all() as Array<{
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

    const items: ItemWithProfit[] = rows.map((row) => {
      const item: Item = {
        id: row.id,
        description: row.description,
        purchasePrice: row.purchase_price,
        purchaseDate: row.purchase_date,
        salePrice: row.sale_price,
        saleDate: row.sale_date,
        folderId: row.folder_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const status = deriveStatus(item);
      let profitAmount: number | null = null;
      let profitPercentage: number | null = null;

      if (status === "sold" && item.salePrice != null) {
        const profit = calculateProfit(item.purchasePrice, item.salePrice);
        profitAmount = profit.amount;
        profitPercentage = profit.percentage;
      }

      return { ...item, status, profitAmount, profitPercentage };
    });

    return Response.json(items);
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateCreateItem({
      description: body.description,
      purchasePrice: body.purchasePrice,
      purchaseDate: body.purchaseDate,
      folderId: body.folderId,
    });

    if (!validation.valid) {
      return Response.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    const db = getDb();
    const description = body.description.trim();
    const purchasePrice = Math.round(Number(body.purchasePrice) * 100);
    const purchaseDate = body.purchaseDate;
    const folderId = body.folderId ?? null;

    // Verify folder exists if provided
    if (folderId !== null) {
      const folder = db.prepare("SELECT id FROM folders WHERE id = ?").get(folderId);
      if (!folder) {
        return Response.json(
          { errors: { folderId: "Folder not found" } },
          { status: 400 }
        );
      }
    }

    const result = db.prepare(
      `INSERT INTO items (description, purchase_price, purchase_date, folder_id)
       VALUES (?, ?, ?, ?)`
    ).run(description, purchasePrice, purchaseDate, folderId);

    const created = db.prepare("SELECT * FROM items WHERE id = ?").get(result.lastInsertRowid) as {
      id: number;
      description: string;
      purchase_price: number;
      purchase_date: string;
      sale_price: number | null;
      sale_date: string | null;
      folder_id: number | null;
      created_at: string;
      updated_at: string;
    };

    const item: ItemWithProfit = {
      id: created.id,
      description: created.description,
      purchasePrice: created.purchase_price,
      purchaseDate: created.purchase_date,
      salePrice: created.sale_price,
      saleDate: created.sale_date,
      folderId: created.folder_id,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      status: "active",
      profitAmount: null,
      profitPercentage: null,
    };

    return Response.json(item, { status: 201 });
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
