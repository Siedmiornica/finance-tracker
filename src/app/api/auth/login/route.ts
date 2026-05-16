import { login } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const success = await login(username, password);

    if (!success) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
