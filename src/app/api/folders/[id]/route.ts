import { getDb } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = Number(id);

    if (isNaN(folderId)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const db = getDb();
    const result = db.prepare("DELETE FROM folders WHERE id = ?").run(folderId);

    if (result.changes === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // ON DELETE SET NULL in the schema handles item reassignment automatically
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
