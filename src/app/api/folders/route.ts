import { getDb } from "@/lib/db";
import { validateFolderName } from "@/lib/validation";
import type { Folder } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM folders ORDER BY name COLLATE NOCASE").all() as Array<{
      id: number;
      name: string;
      created_at: string;
    }>;

    const folders: Folder[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    }));

    return Response.json(folders);
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

    const validation = validateFolderName(body.name ?? "");

    if (!validation.valid) {
      return Response.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    const db = getDb();
    const name = (body.name as string).trim();

    try {
      const result = db.prepare("INSERT INTO folders (name) VALUES (?)").run(name);

      const created = db.prepare("SELECT * FROM folders WHERE id = ?").get(result.lastInsertRowid) as {
        id: number;
        name: string;
        created_at: string;
      };

      const folder: Folder = {
        id: created.id,
        name: created.name,
        createdAt: created.created_at,
      };

      return Response.json(folder, { status: 201 });
    } catch (err: unknown) {
      // SQLite UNIQUE constraint violation
      if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
        return Response.json(
          { errors: { name: "Already exists" } },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err: unknown) {
    // Check if it's already a handled error (re-thrown from inner catch)
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      return Response.json(
        { errors: { name: "Already exists" } },
        { status: 409 }
      );
    }
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
