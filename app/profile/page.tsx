import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      candidateProfile: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const profile = user.candidateProfile;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/[0.04] blur-[150px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10">
            <span className="text-sm font-bold text-amber-300">
              A
            </span>
          </div>

          <span className="text-lg font-semibold tracking-tight">
            Aviora
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.07] hover:text-white"
        >
          Back to Aviora
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-32 pt-20">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300/60">
            Your account
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em]">
            Profile
          </h1>

          <p className="mt-5 text-white/40">
            Manage your Aviora account and career profile.
          </p>
        </div>

        {/* Account */}
        <section className="mt-12 rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">
            Account
          </p>

          <div className="mt-7 flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-semibold text-black">
                {(user.name ?? "A").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-semibold text-white">
                {user.name ?? "Aviora User"}
              </p>

              <p className="mt-1 text-sm text-white/40">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Career profile */}
        <section className="mt-5 rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-7 sm:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">
            Career profile
          </p>

          {profile ? (
            <div className="mt-7 space-y-6">
              <div>
                <p className="text-xs text-white/30">
                  Name
                </p>

                <p className="mt-1 text-sm text-white/75">
                  {profile.name}
                </p>
              </div>

              {profile.location && (
                <div>
                  <p className="text-xs text-white/30">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-white/75">
                    {profile.location}
                  </p>
                </div>
              )}

              {profile.summary && (
                <div>
                  <p className="text-xs text-white/30">
                    Summary
                  </p>

                  <p className="mt-2 text-sm leading-7 text-white/50">
                    {profile.summary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-6 text-sm text-white/40">
              No career profile has been created yet.
            </p>
          )}
        </section>

        {/* Danger zone */}
        <section className="mt-12 rounded-[28px] border border-red-400/10 bg-red-400/[0.02] p-7 sm:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300/60">
            Danger zone
          </p>

          <h2 className="mt-4 text-xl font-semibold">
            Delete account
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
            Permanently delete your Aviora account and associated personal
            information. This action cannot be undone.
          </p>

          <div className="mt-6">
            <DeleteAccountButton />
          </div>
        </section>
      </section>
    </main>
  );
}