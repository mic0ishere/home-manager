import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getDoorsConfig, openDoor } from "@/lib/door-proxy";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const doorId = searchParams.get("id");

  if (!doorId) {
    return NextResponse.json({ error: "Missing door ID" }, { status: 400 });
  }

  const validDoorIds = await getDoorsConfig();
  const doorDetails = validDoorIds.find((door) => door.doorId === doorId);

  if (!doorDetails) {
    return NextResponse.json({ error: "Invalid door ID" }, { status: 400 });
  }

  // Log door opening via better-auth database adapter (no foreign key link to user row)
  try {
    const ctx = await (
      auth as unknown as {
        $context: Promise<{
          adapter: { create: (args: unknown) => Promise<unknown> };
        }>;
      }
    ).$context;
    await ctx.adapter.create({
      model: "doorOpeningLog",
      data: {
        doorId: doorId,
        userEmail: session.user.email,
        userName: session.user.name || null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log door opening via better-auth adapter:", error);
  }

  const doorUnlocked = await openDoor(doorId);

  if (!doorUnlocked.success) {
    return NextResponse.json(
      {
        error: `Failed to unlock door ${doorId}: ${doorUnlocked.error || "Unknown error"}`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: `${doorDetails.name} door opened`,
  });
}
