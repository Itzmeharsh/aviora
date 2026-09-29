"use client";

import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const [loading, setLoading] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const connected =
      params.get("connected");

    const error =
      params.get("error");

    if (connected === "indeed") {
      setMessage(
        "Indeed account connected successfully."
      );
    }

    if (error) {
      setMessage(
        `Connection failed: ${error}`
      );
    }
  }, []);

  function connectIndeed() {
    setLoading("indeed");

    window.location.href =
      "/api/auth/indeed";
  }

  function connectNaukri() {
    setMessage(
      "Naukri connection will be added when an official third-party authorization mechanism is available."
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Job Connections
          </h1>

          <p className="mt-2 text-gray-600">
            Connect your job platforms to
            personalize Thali.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border bg-white p-4 text-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">

          {/* Indeed */}

          <div className="rounded-xl border bg-white p-6">

            <div className="flex items-center justify-between gap-6">

              <div>
                <h2 className="text-lg font-semibold">
                  Indeed
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Connect your Indeed account
                  securely using OAuth.
                </p>
              </div>

              <button
                onClick={connectIndeed}
                disabled={
                  loading === "indeed"
                }
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading === "indeed"
                  ? "Connecting..."
                  : "Connect Indeed"}
              </button>

            </div>

          </div>


          {/* Naukri */}

          <div className="rounded-xl border bg-white p-6">

            <div className="flex items-center justify-between gap-6">

              <div>
                <h2 className="text-lg font-semibold">
                  Naukri
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Naukri integration will be
                  enabled when an approved
                  third-party authorization
                  mechanism is available.
                </p>
              </div>

              <button
                onClick={connectNaukri}
                className="rounded-lg border px-5 py-2.5 text-sm font-medium"
              >
                Connect Naukri
              </button>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}