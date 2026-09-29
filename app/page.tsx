import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import Image from "next/image";
import Link from "next/link";


const gold = "#D4AF37";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    const profile = await prisma.candidateProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (profile) {
      redirect("/tailor");
    }

    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbf8] text-[#0a0a0a]">

      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <nav className="fixed left-1/2 top-5 z-50 w-[calc(100%-32px)] max-w-7xl -translate-x-1/2 rounded-2xl border border-black/[0.06] bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between px-5 sm:px-7">

          <Link href="/" className="flex items-center">
            <Image
              src="/aviora-logo.png"
              alt="Aviora"
              width={150}
              height={100}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-neutral-600 transition hover:text-black"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-neutral-600 transition hover:text-black"
            >
              How it works
            </a>

          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="hidden rounded-full px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 sm:block"
            >
              Sign in
            </Link>

            <Link
  href="/signin"
  className="rounded-full bg-black px-5 py-2.5 text-sm text-white ..."
>
  Get started
</Link>
          </div>
        </div>
      </nav>


      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="relative px-5 pb-20 pt-36 sm:px-8 sm:pt-40 lg:pb-28 lg:pt-44">

        {/* Background glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-32 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: gold }}
        />

        <div className="relative mx-auto max-w-7xl">

          <div className="mx-auto max-w-5xl text-center">

            {/* Eyebrow */}
            <div
              className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em]"
              style={{
                borderColor: `${gold}55`,
                backgroundColor: `${gold}0d`,
                color: "#8a6a10",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: gold }}
              />
              AI-POWERED CAREER INTELLIGENCE
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.065em] sm:text-7xl lg:text-[100px]">
              Your career.
              <br />
              <span className="text-neutral-400">
                Intelligently served.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg">
              Aviora understands your professional profile, helps you build
              stronger applications, and discovers opportunities based on
              your actual skills and experience.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
  href="/signin"
  className="w-full rounded-full bg-black px-7 py-3.5 text-sm text-white ..."
>
  Start with Aviora →
</Link>

              <a
                href="#features"
                className="w-full rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 sm:w-auto"
              >
                Explore Aviora
              </a>
            </div>
          </div>


          {/* ===================================================== */}
          {/* CAREER INTELLIGENCE VISUAL */}
          {/* ===================================================== */}

          <div className="relative mx-auto mt-20 max-w-5xl sm:mt-24">

            {/* Outer ring */}
            <div
              className="absolute left-1/2 top-1/2 hidden h-[570px] w-[570px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-40 lg:block"
              style={{ borderColor: gold }}
            />

            <div
              className="absolute left-1/2 top-1/2 hidden h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-30 lg:block"
              style={{ borderColor: gold }}
            />

            {/* Connecting lines */}
            <div
              className="absolute left-1/2 top-[19%] hidden h-[120px] w-px lg:block"
              style={{ backgroundColor: `${gold}66` }}
            />

            <div
              className="absolute bottom-[19%] left-1/2 hidden h-[120px] w-px lg:block"
              style={{ backgroundColor: `${gold}66` }}
            />

            <div
              className="absolute left-[21%] top-1/2 hidden h-px w-[150px] lg:block"
              style={{ backgroundColor: `${gold}66` }}
            />

            <div
              className="absolute right-[21%] top-1/2 hidden h-px w-[150px] lg:block"
              style={{ backgroundColor: `${gold}66` }}
            />


            {/* Main visual */}
            <div className="relative mx-auto flex h-[440px] max-w-3xl items-center justify-center sm:h-[500px]">

              {/* Center */}
              <div
                className="relative z-20 flex h-36 w-36 flex-col items-center justify-center rounded-full border bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)] sm:h-44 sm:w-44"
                style={{ borderColor: `${gold}66` }}
              >
                <Image
                  src="/aviora-logo.png"
                  alt="Aviora"
                  width={120}
                  height={80}
                  className="h-16 w-auto object-contain sm:h-20"
                />

                <span
                  className="mt-1 text-[10px] font-semibold tracking-[0.2em]"
                  style={{ color: gold }}
                >
                  INTELLIGENCE
                </span>
              </div>


              {/* Top card */}
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                <div className="w-44 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] sm:w-52">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: `${gold}18`,
                        color: "#8a6a10",
                      }}
                    >
                      01
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Your Profile</p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Skills · Experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Left card */}
              <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
                <div className="w-44 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] sm:w-52">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: `${gold}18`,
                        color: "#8a6a10",
                      }}
                    >
                      02
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Tailor</p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Analyze · Match
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Right card */}
              <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
                <div className="w-44 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] sm:w-52">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: `${gold}18`,
                        color: "#8a6a10",
                      }}
                    >
                      03
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Thali</p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Discover · Match
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Bottom card */}
              <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2">
                <div className="w-44 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] sm:w-52">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: `${gold}18`,
                        color: "#8a6a10",
                      }}
                    >
                      04
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Next Move</p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Apply · Discover
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* STATEMENT */}
      {/* ========================================================= */}

      <section className="border-y border-black/[0.06] bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">

          <p
            className="text-xs font-semibold tracking-[0.2em]"
            style={{ color: gold }}
          >
            THE AVIORA APPROACH
          </p>

          <h2 className="mt-6 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Stop searching for jobs.
            <br />
            <span className="text-neutral-400">
              Start understanding your career.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg">
            Your resume contains more than a list of keywords. Aviora turns
            your professional experience into structured career intelligence
            that powers everything you do next.
          </p>
        </div>
      </section>


      {/* ========================================================= */}
      {/* FEATURES */}
      {/* ========================================================= */}

      <section
        id="features"
        className="px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">
            <p
              className="text-xs font-semibold tracking-[0.2em]"
              style={{ color: gold }}
            >
              ONE PLATFORM
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Everything your career needs.
            </h2>

            <p className="mt-5 text-base leading-7 text-neutral-500 sm:text-lg">
              Two powerful workflows, one professional profile, and AI
              connecting everything together.
            </p>
          </div>


          <div className="mt-16 grid gap-5 md:grid-cols-2">

            {/* TAILOR */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-black/[0.07] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10 lg:p-12">

              <div
                className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-[0.08] blur-3xl"
                style={{ backgroundColor: gold }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-neutral-400">
                    01
                  </span>

                  <span
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{
                      borderColor: `${gold}55`,
                      color: "#8a6a10",
                    }}
                  >
                    TAILOR
                  </span>
                </div>

                <h3 className="mt-20 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Build applications around your experience.
                </h3>

                <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-500 sm:text-base">
                  Upload your resume, analyze a job, understand the match,
                  and generate a tailored resume while preserving your real
                  professional experience.
                </p>

                <div className="mt-8 space-y-3 text-sm text-neutral-600">
                  {[
                    "Resume understanding",
                    "Job description analysis",
                    "AI skill and experience matching",
                    "Tailored resume generation",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: gold }}
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href="/signin"
                  className="mt-10 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Use Tailor →
                </Link>
              </div>
            </div>


            {/* THALI */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[#f4f3ee] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10 lg:p-12">

              <div
                className="absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-[0.10] blur-3xl"
                style={{ backgroundColor: gold }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-neutral-400">
                    02
                  </span>

                  <span
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{
                      borderColor: `${gold}55`,
                      color: "#8a6a10",
                    }}
                  >
                    THALI
                  </span>
                </div>

                <h3 className="mt-20 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Discover jobs that fit your profile.
                </h3>

                <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-500 sm:text-base">
                  Thali uses your professional profile to search for
                  opportunities and evaluate their relevance to your actual
                  skills and experience.
                </p>

                <div className="mt-8 space-y-3 text-sm text-neutral-600">
                  {[
                    "Personalized job discovery",
                    "AI-powered job matching",
                    "Skill-aware search",
                    "Profession-aware intelligence",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: gold }}
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href="/signin"
                  className="mt-10 inline-flex rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-neutral-100"
                >
                  Use Thali →
                </Link>
              </div>
            </div>


            {/* PROFILE */}
            <div className="rounded-[2rem] border border-black/[0.07] bg-white p-8 sm:p-10 lg:p-12">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-neutral-400">
                  03
                </span>

                <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-neutral-500">
                  PROFILE
                </span>
              </div>

              <h3 className="mt-16 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                One profile. Your complete career context.
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-500 sm:text-base">
                Aviora transforms your resume into structured professional
                information that can power every career workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Skills",
                  "Experience",
                  "Education",
                  "Projects",
                  "Certifications",
                  "Achievements",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/[0.07] bg-[#fafafa] px-4 py-2 text-xs text-neutral-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>


            {/* AI */}
            <div className="rounded-[2rem] border border-black/[0.07] bg-black p-8 text-white sm:p-10 lg:p-12">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500">
                  04
                </span>

                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: `${gold}66`,
                    color: gold,
                  }}
                >
                  AI
                </span>
              </div>

              <h3 className="mt-16 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Intelligence behind every decision.
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-400 sm:text-base">
                Aviora's AI works with the evidence in your professional
                profile instead of making assumptions about your career.
              </p>

              <div className="mt-10 space-y-0">
                {[
                  "Understand",
                  "Analyze",
                  "Match",
                  "Discover",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 border-b border-white/10 py-4 last:border-0"
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: gold }}
                    >
                      0{index + 1}
                    </span>

                    <span className="text-sm font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* HOW IT WORKS */}
      {/* ========================================================= */}

      <section
        id="how-it-works"
        className="border-y border-black/[0.06] bg-white px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">
            <p
              className="text-xs font-semibold tracking-[0.2em]"
              style={{ color: gold }}
            >
              HOW IT WORKS
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              From resume to opportunity.
            </h2>
          </div>


          <div className="mt-20 grid gap-10 md:grid-cols-4">

            {[
              {
                number: "01",
                title: "Create your account",
                text: "Sign in securely and start your Aviora career profile.",
              },
              {
                number: "02",
                title: "Upload your resume",
                text: "Aviora extracts your professional information.",
              },
              {
                number: "03",
                title: "Let AI understand",
                text: "Your skills, experience and career context become structured.",
              },
              {
                number: "04",
                title: "Make your next move",
                text: "Tailor applications or discover relevant opportunities.",
              },
            ].map((step) => (
              <div key={step.number} className="relative">

                <div
                  className="mb-7 flex h-11 w-11 items-center justify-center rounded-full border text-xs font-semibold"
                  style={{
                    borderColor: `${gold}77`,
                    color: "#8a6a10",
                    backgroundColor: `${gold}0d`,
                  }}
                >
                  {step.number}
                </div>

                <h3 className="text-xl font-semibold tracking-[-0.025em]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  {step.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* WHY AVIORA */}
      {/* ========================================================= */}

      <section
        className="px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

            <div>
              <p
                className="text-xs font-semibold tracking-[0.2em]"
                style={{ color: gold }}
              >
                WHY AVIORA
              </p>

              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-6xl">
                Your resume is only the beginning.
              </h2>
            </div>

            <div className="space-y-5">

              <div className="rounded-3xl border border-black/[0.07] bg-white p-7">
                <h3 className="font-semibold">
                  Built around evidence
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Aviora works from the information actually present in
                  your professional profile.
                </p>
              </div>

              <div className="rounded-3xl border border-black/[0.07] bg-white p-7">
                <h3 className="font-semibold">
                  Not just another job board
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Thali connects job discovery with your skills,
                  experience and professional context.
                </p>
              </div>

              <div className="rounded-3xl border border-black/[0.07] bg-white p-7">
                <h3 className="font-semibold">
                  One career workspace
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Tailor and Thali work from the same professional profile,
                  giving your career workflows a shared foundation.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* FINAL CTA */}
      {/* ========================================================= */}

      <section className="px-5 pb-20 sm:px-8 lg:pb-28">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-black px-7 py-20 text-center text-white sm:px-12 lg:py-28">

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: gold }}
          />

          <div className="relative">

            <Image
              src="/aviora-logo.png"
              alt="Aviora"
              width={170}
              height={110}
              className="mx-auto mb-8 h-20 w-auto object-contain"
            />

            <p
              className="text-xs font-semibold tracking-[0.2em]"
              style={{ color: gold }}
            >
              AVIORA
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-6xl">
              Your next opportunity starts here.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              Build your professional profile. Tailor your applications.
              Discover what comes next.
            </p>

            <Link
              href="/signin"
              className="mt-9 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-neutral-100"
            >
              Get started with Aviora →
            </Link>

          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-black/[0.06] bg-white px-5 py-8 sm:px-8">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <Link href="/" className="flex items-center">
            <Image
              src="/aviora-logo.png"
              alt="Aviora"
              width={120}
              height={80}
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
            <Link
              href="/about"
              className="transition hover:text-black"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-black"
            >
              Privacy
            </Link>

            <Link
              href="/signin"
              className="transition hover:text-black"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Aviora
          </p>

        </div>
      </footer>

    </main>
  );
}