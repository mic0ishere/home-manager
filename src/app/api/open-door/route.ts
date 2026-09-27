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

  // Log door opening via better-auth database adapter (no foreign key link to user row)
  try {
    const ctx = await (auth as unknown as { $context: Promise<{ adapter: { create: (args: unknown) => Promise<unknown> } }> }).$context;
    await ctx.adapter.create({
      model: "doorOpeningLog",
      data: {
        doorId: id,
        userEmail: session.user.email,
        userName: session.user.name || null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log door opening via better-auth adapter:", error);
  }

  // Mock door action: wait 5 seconds and broadcast completion
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const message = `${doorId} door opened`;

  return NextResponse.json({
    success: true,
    door: doorId,
    message,
  });
}
