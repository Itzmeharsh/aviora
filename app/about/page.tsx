import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Understand",
    description:
      "Aviora turns your resume into a structured understanding of your skills, experience, projects, and career direction.",
  },
  {
    number: "02",
    title: "Discover",
    description:
      "Find opportunities that are relevant to your background instead of endlessly searching through generic job listings.",
  },
  {
    number: "03",
    title: "Tailor",
    description:
      "Adapt your application around the role and highlight the experience that matters most.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/[0.055] blur-[140px]" />
        <div className="absolute bottom-[-300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/[0.025] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10">
            <span className="text-sm font-bold text-amber-300">A</span>
          </div>

          <div>
            <div className="text-[17px] font-semibold tracking-tight">
              Aviora
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-white/35">
              Career Intelligence
            </div>
          </div>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
        >
          Back to Aviora
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32 pt-28 text-center sm:pt-36">
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.045] px-4 py-2 text-xs text-amber-200/70">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          AI-powered career intelligence
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-[88px] lg:leading-[0.95]">
          Your career,
          <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            understood.
          </span>
        </h1>

        <p className="mx-auto mt-9 max-w-2xl text-base leading-7 text-white/45 sm:text-lg sm:leading-8">
          Aviora is an AI-powered career companion that understands your
          professional experience, helps you discover relevant opportunities,
          and makes every application more intentional.
        </p>

        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-50"
          >
            Start with Aviora
          </Link>

          <Link
            href="/thali"
            className="rounded-full border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
          >
            Explore Thali
          </Link>
        </div>

        {/* Minimal visual */}
        <div className="relative mx-auto mt-28 h-[280px] max-w-3xl">
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/[0.06] blur-[70px]" />

          <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.08] to-transparent shadow-[0_0_80px_rgba(245,158,11,0.08)]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.08]">
              <span className="text-4xl font-semibold tracking-[-0.08em] text-white">
                A
              </span>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

          <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-[155px] rounded-full bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
        </div>
      </section>

      {/* Intro */}
      <section className="border-y border-white/[0.06]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-24 lg:py-32">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300/60">
              Why Aviora
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Job hunting shouldn't feel like a second job.
            </h2>
          </div>

          <div className="space-y-6 text-[15px] leading-7 text-white/45">
            <p>
              Searching for a career opportunity often means jumping between
              job boards, rewriting resumes, comparing requirements, and trying
              to figure out where your experience actually fits.
            </p>

            <p>
              Aviora brings that process into one intelligent workspace.
              Instead of repeatedly explaining your professional background,
              your profile becomes the foundation for everything you do.
            </p>

            <p className="text-white/65">
              One profile. Better context. More intentional applications.
            </p>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-6 py-28 lg:py-36">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300/60">
            The Aviora approach
          </p>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Everything starts with understanding you.
          </h2>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-[#0c0c0c] p-8 transition hover:bg-[#101010] sm:p-10"
            >
              <span className="text-xs text-amber-300/50">
                {feature.number}
              </span>

              <h3 className="mt-16 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/40">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-28 lg:py-36">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300/60">
              Inside Aviora
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Two experiences. One career workspace.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {/* Tailor */}
            <div className="group rounded-3xl border border-white/[0.07] bg-[#0b0b0b] p-8 transition hover:border-white/[0.12] sm:p-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[0.07]">
                <span>✦</span>
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.25em] text-white/30">
                Tailor
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                Make your application relevant.
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/40">
                Analyze a role, understand the match, identify what matters,
                and create a resume tailored to the opportunity.
              </p>

              <div className="mt-10 border-t border-white/[0.06] pt-5 text-sm text-white/35">
                Resume intelligence
                <span className="float-right text-amber-300/60">
                  →
                </span>
              </div>
            </div>

            {/* Thali */}
            <div className="group rounded-3xl border border-white/[0.07] bg-[#0b0b0b] p-8 transition hover:border-white/[0.12] sm:p-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-400/[0.07]">
                <span>◈</span>
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.25em] text-white/30">
                Thali
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                Discover what fits you.
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/40">
                Explore relevant opportunities based on the experience,
                skills, and direction already present in your profile.
              </p>

              <div className="mt-10 border-t border-white/[0.06] pt-5 text-sm text-white/35">
                Opportunity discovery
                <span className="float-right text-amber-300/60">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-4xl px-6 py-32 text-center lg:py-40">
        <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <h2 className="mt-10 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Technology should make your career simpler,
          <span className="text-white/35"> not noisier.</span>
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/40">
          Aviora is built around a simple idea: your professional experience
          already contains valuable context. AI should help you use that
          context — not make you start from zero every time.
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-transparent px-6 py-20 text-center sm:px-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-400/[0.07] text-amber-300">
            A
          </div>

          <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Your next opportunity starts with understanding.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/40">
            Build your profile once and let Aviora help you make more of every
            opportunity.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-50"
          >
            Enter Aviora →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Aviora</span>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/70">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-white/70">
              Terms
            </Link>

            <Link href="/contact" className="hover:text-white/70">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}