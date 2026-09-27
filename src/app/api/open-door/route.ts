import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const doorId = searchParams.get("id")?.toLowerCase();

  // Mock door action: wait 5 seconds and broadcast completion
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const message = `${doorId} door opened`;

  return NextResponse.json({
    success: true,
    door: doorId,
    message,
  });
}
