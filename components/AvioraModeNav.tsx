"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AvioraModeNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);

  const isThali = pathname.startsWith("/thali");

  const userName = session?.user?.name || "Account";
  const userImage = session?.user?.image;
  const initial = userName.charAt(0).toUpperCase();

  function switchMode(toThali: boolean) {
    if (toThali === isThali) return;

    router.push(toThali ? "/thali" : "/tailor");
  }

  return (
    <div className="flex items-center gap-3">
      {/* Tailor / Thali switch */}
      <div className="relative flex items-center rounded-full border border-amber-300/30 bg-white/[0.06] p-1 shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
        {/* Sliding amber pill */}
        <div
          className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_4px_22px_rgba(245,158,11,0.45)] transition-transform duration-200 ease-out ${
            isThali
              ? "translate-x-[calc(100%+4px)]"
              : "translate-x-0"
          }`}
        />

        {/* Tailor */}
        <button
          type="button"
          onClick={() => switchMode(false)}
          className={`relative z-10 flex min-w-[112px] items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            !isThali
              ? "scale-[1.02] text-white"
              : "text-amber-200/65 hover:text-amber-200"
          }`}
        >
          <span>✨</span>
          <span>Tailor</span>
        </button>

        {/* Thali */}
        <button
          type="button"
          onClick={() => switchMode(true)}
          className={`relative z-10 flex min-w-[112px] items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            isThali
              ? "scale-[1.02] text-white"
              : "text-amber-200/65 hover:text-amber-200"
          }`}
        >
          <span>🍛</span>
          <span>Thali</span>
        </button>
      </div>

      {/* Account */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] p-1 pr-3 backdrop-blur-xl transition hover:bg-white/[0.1]"
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 font-semibold text-white">
              {initial}
            </div>
          )}

          <span className="max-w-28 truncate text-sm font-medium text-white">
            {userName}
          </span>

          <span className="text-xs text-white/60">▾</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-[100] w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-2 shadow-2xl">
            <div className="border-b border-white/10 px-3 py-3">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>

              {session?.user?.email && (
                <p className="mt-1 truncate text-xs text-white/50">
                  {session.user.email}
                </p>
              )}
            </div>

            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              Profile
            </Link>

            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              About Aviora
            </Link>

            <Link
              href="/privacy"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              Terms of Service
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white"
            >
              Contact
            </Link>

            <div className="my-1 border-t border-white/10" />

            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}