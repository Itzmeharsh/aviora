import Link from "next/link";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[850px] -translate-x-1/2 rounded-full bg-amber-500/[0.04] blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-orange-500/[0.02] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10">
            <span className="text-sm font-bold text-amber-300">
              A
            </span>
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

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 pt-24 sm:pt-32">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-red-300/60">
            <span className="h-px w-8 bg-red-300/40" />
            Account & Data
          </div>

          <h1 className="mt-7 text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
            Delete your
            <br />
            <span className="text-white/35">
              Aviora account.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/45 sm:text-lg">
            You can request deletion of your Aviora account and the personal
            information associated with it.
          </p>
        </div>

        {/* What gets deleted */}
        <div className="mt-14 rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-300/10 bg-red-400/[0.06] text-red-300">
              ×
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Data deletion
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                What will be deleted?
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {[
              "Your Aviora account",
              "Your candidate profile",
              "Resume-derived information",
              "Skills, experience, education, and project information",
              "Saved job information",
              "Application information associated with your account",
              "Other personal information stored as part of your Aviora account",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <span className="mt-0.5 text-sm text-red-300/60">
                  ×
                </span>

                <span className="text-sm leading-6 text-white/50">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Important information */}
        <div className="mt-5 rounded-[28px] border border-amber-300/10 bg-amber-300/[0.025] p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="text-lg text-amber-300">
              i
            </span>

            <h2 className="text-lg font-semibold">
              Before you request deletion
            </h2>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-7 text-white/40">
            <p>
              Account deletion is intended to permanently remove your Aviora
              account and personal information associated with it.
            </p>

            <p>
              Some information may need to be retained where required or
              permitted by applicable law, for security purposes, fraud
              prevention, dispute resolution, or other legitimate purposes.
            </p>

            <p>
              Information retained for these purposes will not be used to
              provide your normal Aviora account experience.
            </p>
          </div>
        </div>

        {/* Request deletion */}
        <div className="mt-5 rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300/60">
            Request deletion
          </p>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            Ready to leave Aviora?
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
            Send an account deletion request from the email address associated
            with your Aviora account. This allows us to verify account
            ownership before processing the request.
          </p>

          <a
            href="mailto:harshbroyt@gmail.com?subject=Aviora%20Account%20Deletion%20Request"
            className="mt-7 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-50"
          >
            Request account deletion
            <span className="ml-2">→</span>
          </a>

          <p className="mt-5 text-xs leading-6 text-white/25">
            Deletion requests can be sent to{" "}
            <a
              href="mailto:harshbroyt@gmail.com"
              className="text-white/45 hover:text-white/70"
            >
              harshbroyt@gmail.com
            </a>
            .
          </p>
        </div>

        {/* Privacy */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/30">
            Have questions about how Aviora handles your information?
          </p>

          <Link
            href="/privacy"
            className="mt-3 inline-block text-sm text-amber-300/70 transition hover:text-amber-200"
          >
            Read the Privacy Policy →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Aviora
          </span>

          <div className="flex gap-6">
            <Link
              href="/about"
              className="transition hover:text-white/70"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-white/70"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white/70"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white/70"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}