"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmation === "DELETE";

  function closeModal() {
    if (deleting) return;

    setOpen(false);
    setConfirmation("");
    setError("");
  }

  async function handleDelete() {
    if (!canDelete) {
      setError('Please type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmation: "DELETE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete account."
        );
      }

      await signOut({
        callbackUrl: "/signin",
      });
    } catch (error) {
      console.error("Delete account error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
        className="rounded-full border border-red-400/20 bg-red-400/[0.05] px-5 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1]"
      >
        Delete account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111] p-7 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.06] text-xl text-red-300">
              ×
            </div>

            <h2
              id="delete-account-title"
              className="mt-6 text-2xl font-semibold tracking-tight text-white"
            >
              Delete your account?
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/45">
              This permanently deletes your Aviora account and the personal
              information associated with it.
            </p>

            <p className="mt-3 text-sm leading-7 text-white/45">
              Your candidate profile, resume-derived information, saved jobs,
              and application information will be deleted.
            </p>

            <div className="mt-6">
              <label
                htmlFor="delete-confirmation"
                className="text-xs font-medium uppercase tracking-[0.18em] text-white/35"
              >
                Type DELETE to confirm
              </label>

              <input
                id="delete-confirmation"
                type="text"
                value={confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value);
                  setError("");
                }}
                disabled={deleting}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="DELETE"
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-400/40 focus:ring-1 focus:ring-red-400/20 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm leading-6 text-red-300">
                {error}
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}