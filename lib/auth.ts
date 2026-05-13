import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function isAuthed(): Promise<boolean> {
  const store         = await cookies();
  const token         = store.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  return !!token && !!expectedToken && token === expectedToken;
}

export async function requireAuth(): Promise<NextResponse | null> {
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
