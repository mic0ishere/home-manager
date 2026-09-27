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

  // Only owners/admins can view access logs
  const isOwner = session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "100", 10) || 100)
  );
  const offset = (page - 1) * limit;

  try {
    const ctx = await (auth as unknown as {
      $context: Promise<{
        adapter: {
          findMany: (args: unknown) => Promise<unknown[]>;
          count: (args: unknown) => Promise<number>;
        };
      }>;
    }).$context;

    const [logs, total] = await Promise.all([
      ctx.adapter.findMany({
        model: "doorOpeningLog",
        sortBy: {
          field: "createdAt",
          direction: "desc",
        },
        limit,
        offset,
      }),
      ctx.adapter.count({
        model: "doorOpeningLog",
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching door logs via better-auth adapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch door logs" },
      { status: 500 }
    );
  }
}
