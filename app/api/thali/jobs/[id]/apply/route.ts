import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // Get logged-in user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    const { id: jobId } = await context.params;

    // Make sure the job exists
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    // Store applied status for THIS user only
    const application =
      await prisma.jobApplication.upsert({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },

        update: {
          applied: true,
          appliedAt: new Date(),
        },

        create: {
          userId,
          jobId,
          applied: true,
          appliedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,

      job: {
        id: jobId,
        applied: application.applied,
        appliedAt: application.appliedAt,
      },
    });
  } catch (error) {
    console.error(
      "Mark job as applied error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to mark job as applied",
      },
      {
        status: 500,
      }
    );
  }
}