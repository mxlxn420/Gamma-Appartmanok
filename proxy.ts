import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token         = req.cookies.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;

  if (!token || !expectedToken || token !== expectedToken) {
    return NextResponse.json(
      { success: false, error: "Nincs jogosultság" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/((?!login).*)"],
};
