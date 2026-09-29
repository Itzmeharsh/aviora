import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { searchJobs } from "@/lib/thali/search";

export async function GET(request: Request) {
  try {
    // --------------------------------
    // AUTHENTICATE USER
    // --------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // --------------------------------
    // PAGE
    // --------------------------------

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page") || "1")
    );

    // --------------------------------
    // GET THIS USER'S PROFILE
    // --------------------------------

    const profile =
      await prisma.candidateProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "No candidate profile found. Upload a resume first.",
        },
        { status: 400 }
      );
    }

        // --------------------------------
    // VALIDATE PROFILE DATA
    // --------------------------------

    const hasSkills =
      Array.isArray(profile.skills) &&
      profile.skills.length > 0;

    const hasExperience =
      Array.isArray(profile.experience) &&
      profile.experience.length > 0;

    const hasProjects =
      Array.isArray(profile.projects) &&
      profile.projects.length > 0;

    if (!hasSkills && !hasExperience && !hasProjects) {
      return NextResponse.json(
        {
          error:
            "Candidate profile is incomplete. Please upload your resume again.",
        },
        { status: 409 }
      );
    }

    // --------------------------------
    // BUILD CANDIDATE PROFILE
    // --------------------------------

    const candidateProfile = {
      personal: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin,
        github: profile.github,
        portfolio: profile.portfolio,
      },

      summary: profile.summary,

      education: profile.education,

      skills: profile.skills,

      skillProfile: profile.skillProfile,

      experience: profile.experience,

      projects: profile.projects,

      certifications: profile.certifications,

      achievements: profile.achievements,
    };

    // --------------------------------
    // SEARCH JOBS
    // --------------------------------

    const result = await searchJobs(
      candidateProfile,
      page,
      request.signal
    );

    const jobs = result.jobs;

    // --------------------------------
    // SAVE JOBS + USER MATCH DATA
    // --------------------------------

    const savedJobs = [];

    for (const job of jobs) {
      // --------------------------------
      // CANONICAL JOB
      // --------------------------------

      const savedJob = await prisma.job.upsert({
        where: {
          url: job.url,
        },

        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          employmentType: job.employmentType,
          source: job.source,
          postedAt: new Date(job.postedAt),
          description: job.description,
          skills: job.skills,
          technologies: job.technologies,
        },

        create: {
          title: job.title,
          company: job.company,
          location: job.location,
          employmentType: job.employmentType,
          url: job.url,
          source: job.source,
          postedAt: new Date(job.postedAt),
          description: job.description,
          skills: job.skills,
          technologies: job.technologies,
        },
      });

      // --------------------------------
      // USER ↔ JOB
      // --------------------------------

      const application =
        await prisma.jobApplication.upsert({
          where: {
            userId_jobId: {
              userId,
              jobId: savedJob.id,
            },
          },

          update: {
            matchScore:
              job.matchScore ?? 0,

            matchingSkills:
              job.matchingSkills ?? [],

            missingSkills:
              job.missingSkills ?? [],

            matchReasons:
              job.matchReasons ?? [],
          },

          create: {
            userId,
            jobId: savedJob.id,

            matchScore:
              job.matchScore ?? 0,

            matchingSkills:
              job.matchingSkills ?? [],

            missingSkills:
              job.missingSkills ?? [],

            matchReasons:
              job.matchReasons ?? [],

            applied: false,
          },
        });

      savedJobs.push({
        ...savedJob,

        matchScore:
          application.matchScore ?? 0,

        matchingSkills:
          application.matchingSkills ?? [],

        missingSkills:
          application.missingSkills ?? [],

        matchReasons:
          application.matchReasons ?? [],

        applied:
          application.applied,

        appliedAt:
          application.appliedAt,
      });
    }

    // --------------------------------
    // RESPONSE
    // --------------------------------

    return NextResponse.json({
      success: true,
      page,
      jobs: savedJobs,
      hasNextPage: result.hasNextPage,
    });
  } catch (error) {
    // --------------------------------
    // CLIENT CANCELLED SEARCH
    // --------------------------------

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      console.log(
        "[Thali/API] Search cancelled by client"
      );

      return new Response(null, {
        status: 499,
      });
    }

    // --------------------------------
    // REAL SERVER ERROR
    // --------------------------------

    console.error(
      "Thali jobs error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Thali jobs",
      },
      {
        status: 500,
      }
    );
  }
}