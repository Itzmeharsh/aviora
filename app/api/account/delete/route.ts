import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const confirmation =
      typeof body === "object" &&
      body !== null &&
      "confirmation" in body &&
      typeof body.confirmation === "string"
        ? body.confirmation
        : "";

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        {
          error: 'Type "DELETE" to confirm account deletion.',
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account.",
      },
      {
        status: 500,
      }
    );
  }
}