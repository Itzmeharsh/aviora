import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import OnboardingResumeUpload from "@/components/OnboardingResumeUpload";

export default async function OnboardingPage() {
  const session = await auth();

  // --------------------------------
  // USER MUST BE SIGNED IN
  // --------------------------------

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // --------------------------------
  // CHECK FOR EXISTING PROFILE
  // --------------------------------

  const existingProfile =
    await prisma.candidateProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  // --------------------------------
  // RETURNING USER
  // --------------------------------

  if (existingProfile) {
    redirect("/tailor");
  }

  // --------------------------------
  // NEW USER
  // --------------------------------

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full">

          {/* Brand */}
          <div className="mb-12 text-center">
            <div className="mb-4 text-4xl">
              ✨
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome to Aviora
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/60">
              Let&apos;s start by adding your resume.
              Aviora will turn it into your personalized
              career profile and use it to find relevant
              opportunities for you.
            </p>
          </div>

          {/* Upload card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">

            <div className="mb-8">
              <h2 className="text-xl font-semibold">
                Upload your resume
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Upload your latest resume in PDF format.
              </p>
            </div>

            <OnboardingResumeUpload />

            <div className="mt-6 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
              <p className="text-center text-xs leading-5 text-white/40">
                Your resume is used to create your
                Aviora profile, understand your skills,
                and personalize job matching.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}