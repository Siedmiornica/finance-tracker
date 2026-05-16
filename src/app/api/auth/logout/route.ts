import { logout } from "@/lib/auth";

export async function POST() {
  try {
    await logout();
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
