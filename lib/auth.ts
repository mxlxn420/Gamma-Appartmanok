import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return !!store.get("admin_token")?.value;
}

export async function requireAuth(): Promise<NextResponse | null> {
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
