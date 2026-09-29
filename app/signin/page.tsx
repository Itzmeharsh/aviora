import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mb-8">
          <div className="mb-4 text-4xl">✨</div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to Aviora
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Sign in with Google to build your personalized resume and discover
            jobs matched to your profile.
          </p>
        </div>

        <form
          action={async () => {
            "use server";

            await signIn("google", {
              redirectTo: "/onboarding",
            });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-medium text-black transition hover:bg-white/90"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
              />
              <path
                fill="#34A853"
                d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 13.8A5.85 5.85 0 0 1 6.23 12c0-.63.11-1.24.31-1.8V7.67H3.3A9.72 9.72 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.33l3.24-2.53Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.14 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 7.89 9.46 6.17 12 6.17Z"
              />
            </svg>

            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-xs text-white/40">
          Your Google account will be used to securely create your Aviora
          account.
        </p>
      </div>
    </main>
  );
}