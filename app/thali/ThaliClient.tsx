"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AvioraNavbar from "@/components/AvioraNavbar";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  url: string;
  source: string;
  postedAt: string;
  description: string;
  skills: string[];
  technologies: string[];
  applied: boolean;
  appliedAt: string | null;
  matchScore?: number;
};

const JOBS_PER_PAGE = 9;

/* -------------------------------- */
/* Loading Thali */
/* -------------------------------- */

function LoadingThali() {
  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <img
        src="/thali.png"
        alt="Loading jobs"
        className="h-48 w-48 object-contain thali-loader"
      />
    </div>
  );
}

/* -------------------------------- */
/* Match Badge */
/* -------------------------------- */

function getMatchBadgeClass(score: number) {
  if (score >= 95) {
    return "bg-green-100 text-green-700";
  }

  if (score >= 90) {
    return "bg-green-100/80 text-green-700";
  }

  if (score >= 85) {
    return "bg-lime-100 text-lime-700";
  }

  if (score >= 80) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (score >= 70) {
    return "bg-yellow-200 text-yellow-800";
  }

  if (score >= 60) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

/* -------------------------------- */
/* Page */
/* -------------------------------- */

export default function ThaliPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [error, setError] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);

  /* -------------------------------- */
  /* Fake/Smooth Loading Progress */
  /* -------------------------------- */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 90) {
          return current;
        }

        if (current < 20) {
          return current + 2;
        }

        if (current < 50) {
          return current + 1;
        }

        if (current < 75) {
          return current + 0.5;
        }

        return current + 0.2;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  /* -------------------------------- */
  /* Fetch ONE Thali page */
  /* -------------------------------- */

  async function fetchJobs(
    requestedPage: number,
    signal?: AbortSignal
  ) {
    try {
      setLoading(true);
      setLoadingProgress(5);
      setError("");

      const response = await fetch(
        `/api/thali/jobs?page=${requestedPage}`,
        {
          cache: "no-store",
          signal,
        }
      );

      setLoadingProgress(90);

      const data = await response.json();

      setLoadingProgress(95);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch jobs"
        );
      }

      const fetchedJobs = data.jobs || [];

      console.log(
        "[Thali/UI] Scores received:",
        fetchedJobs.map((job: Job) => ({
          title: job.title,
          score: job.matchScore,
        }))
      );

      setLoadingProgress(100);
      setJobs(fetchedJobs);
      setPage(requestedPage);

      setHasNextPage(Boolean(data.hasNextPage));
    } catch (error) {
      /*
       * Aborted requests are expected when
       * the user leaves Thali.
       */

      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        console.log("[Thali/UI] Search cancelled");
        return;
      }

      console.error("Thali fetch error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

      setJobs([]);
      setHasNextPage(false);
    } finally {
      /*
       * Do NOT update loading state after
       * an aborted request.
       */

      if (!signal?.aborted) {
        setLoadingProgress(100);

        setTimeout(() => {
          setLoading(false);
        }, 250);
      }
    }
  }

  /* -------------------------------- */
  /* Initial page + cancellation */
  /* -------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(1, controller.signal);

    return () => {
      console.log(
        "[Thali/UI] Leaving Thali - cancelling search"
      );

      controller.abort();
    };
  }, []);

  /* -------------------------------- */
  /* Applied */
  /* -------------------------------- */

  async function markAsApplied(jobId: string) {
    try {
      const response = await fetch(
        `/api/thali/jobs/${jobId}/apply`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to mark job as applied"
        );
      }

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                applied: true,
                appliedAt: data.job.appliedAt,
              }
            : job
        )
      );
    } catch (error) {
      console.error(
        "Apply status error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update application status"
      );
    }
  }

  /* -------------------------------- */
  /* Posted time */
  /* -------------------------------- */

  function formatPostedTime(postedAt: string) {
    const difference =
      Date.now() -
      new Date(postedAt).getTime();

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    if (hours < 1) {
      return "Posted less than an hour ago";
    }

    if (hours === 1) {
      return "Posted 1 hour ago";
    }

    return `Posted ${hours} hours ago`;
  }

  /* -------------------------------- */
  /* Render */
  /* -------------------------------- */

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 pt-28">
      <div className="mx-auto max-w-5xl">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}
        
        {/* Navbar */}
        <AvioraNavbar />

        {/* -------------------------------- */}
        {/* Loading */}
        {/* -------------------------------- */}

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 shadow-sm">

            <LoadingThali />

            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              Serving your Thali...
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Finding fresh opportunities
              for you.
            </p>

            {/* Progress Section */}

            <div className="mt-6 w-full max-w-md">

              {/* Percentage */}

              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Preparing your jobs
                </span>

                <span className="text-xs font-semibold text-gray-700">
                  {Math.round(
                    loadingProgress
                  )}
                  %
                </span>
              </div>

              {/* Progress Bar */}

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-orange-400 transition-all duration-500 ease-out"
                  style={{
                    width: `${loadingProgress}%`,
                  }}
                >
                  {/* Water shine */}
                  <div className="absolute inset-0 animate-pulse bg-white/20" />

                  {/* Moving shine */}
                  <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[loadingShine_1.5s_linear_infinite] bg-white/20 blur-sm" />
                </div>
              </div>

              <p className="mt-2 text-center text-xs text-gray-400">
                Fetching fresh jobs and checking
                your match
              </p>
            </div>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}

            <button
              onClick={() => fetchJobs(1)}
              className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Empty */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          jobs.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No fresh jobs found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your Thali is empty right now.
              </p>

              <button
                onClick={() => fetchJobs(1)}
                className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                Try Again
              </button>
            </div>
          )}

        {/* -------------------------------- */}
        {/* Page information */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          jobs.length > 0 && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="font-semibold text-gray-900">
                  Today's Thali
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Fresh serving
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {jobs.length} jobs served
              </span>
            </div>
          )}

        {/* -------------------------------- */}
        {/* Jobs */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          jobs.length > 0 && (
            <div className="space-y-5">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h2>

                      <p className="mt-1 font-medium text-gray-700">
                        {job.company}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {job.location}
                        {" · "}
                        {job.employmentType}
                      </p>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getMatchBadgeClass(
                        job.matchScore ?? 0
                      )}`}
                    >
                      {Math.round(
                        job.matchScore ?? 0
                      )}
                      % Match
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    {job.description}
                  </p>

                  {job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">
                        {formatPostedTime(
                          job.postedAt
                        )}
                        {" · "}
                        {job.source}
                      </p>

                      {job.applied && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          ✓ Applied
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        View Job
                      </a>

                      {!job.applied && (
                        <button
                          onClick={() =>
                            markAsApplied(
                              job.id
                            )
                          }
                          className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                        >
                          Mark as Applied
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        {/* -------------------------------- */}
        {/* Pagination */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          jobs.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  fetchJobs(page - 1)
                }
                disabled={
                  page === 1 || loading
                }
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                onClick={() =>
                  fetchJobs(page + 1)
                }
                disabled={
                  !hasNextPage || loading
                }
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
      </div>
    </main>
  );
}