import { getDb } from "@/lib/db";
import { calculateProfit } from "@/lib/profit";
import { deriveStatus } from "@/lib/status";
import { validateCreateItem, validateSellItem } from "@/lib/validation";
import type { ItemWithProfit } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT * FROM items WHERE id = ?").get(itemId) as {
      id: number;
      description: string;
      purchase_price: number;
      purchase_date: string;
      sale_price: number | null;
      sale_date: string | null;
      folder_id: number | null;
      created_at: string;
      updated_at: string;
    } | undefined;

    if (!existing) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields (description, purchasePrice, purchaseDate)
    const createValidation = validateCreateItem({
      description: body.description,
      purchasePrice: body.purchasePrice,
      purchaseDate: body.purchaseDate,
    });

    if (!createValidation.valid) {
      return Response.json(
        { errors: createValidation.errors },
        { status: 400 }
      );
    }

    // Handle sale fields
    const hasSalePrice = body.salePrice != null && body.salePrice !== undefined && body.salePrice !== "";
    const hasSaleDate = body.saleDate != null && body.saleDate !== undefined && body.saleDate !== "";

    let salePriceCents: number | null = null;
    let saleDate: string | null = null;

    if (hasSalePrice || hasSaleDate) {
      const sellValidation = validateSellItem({
        salePrice: hasSalePrice ? body.salePrice : undefined,
        saleDate: hasSaleDate ? body.saleDate : undefined,
      });

      if (!sellValidation.valid) {
        return Response.json(
          { errors: sellValidation.errors },
          { status: 400 }
        );
      }

      salePriceCents = Math.round(Number(body.salePrice) * 100);
      saleDate = body.saleDate;
    }

    const description = body.description.trim();
    const purchasePrice = Math.round(Number(body.purchasePrice) * 100);
    const purchaseDate = body.purchaseDate;
    const folderId = body.folderId !== undefined ? (body.folderId ?? null) : existing.folder_id;

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

    db.prepare(
      `UPDATE items SET
        description = ?,
        purchase_price = ?,
        purchase_date = ?,
        sale_price = ?,
        sale_date = ?,
        folder_id = ?,
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(description, purchasePrice, purchaseDate, salePriceCents, saleDate, folderId, itemId);

    const updated = db.prepare("SELECT * FROM items WHERE id = ?").get(itemId) as {
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

    const status = deriveStatus({
      salePrice: updated.sale_price,
      saleDate: updated.sale_date,
    });

    let profitAmount: number | null = null;
    let profitPercentage: number | null = null;

    if (status === "sold" && updated.sale_price != null) {
      const profit = calculateProfit(updated.purchase_price, updated.sale_price);
      profitAmount = profit.amount;
      profitPercentage = profit.percentage;
    }

    const item: ItemWithProfit = {
      id: updated.id,
      description: updated.description,
      purchasePrice: updated.purchase_price,
      purchaseDate: updated.purchase_date,
      salePrice: updated.sale_price,
      saleDate: updated.sale_date,
      folderId: updated.folder_id,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      status,
      profitAmount,
      profitPercentage,
    };

    return Response.json(item);
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const db = getDb();
    const result = db.prepare("DELETE FROM items WHERE id = ?").run(itemId);

    if (result.changes === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
