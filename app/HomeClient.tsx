"use client";
import { useEffect, useState } from "react";
import AvioraNavbar from "@/components/AvioraNavbar";
import Image from "next/image";
import Link from "next/link";
export default function Home({
  initialProfile,
}: {
  initialProfile: any;
}) {
  // -----------------------------
  // State
  // -----------------------------

  const [resume, setResume] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeLinks, setResumeLinks] = useState<
  {
    text: string;
    url: string;
  }[]
>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] =
  useState<any>(initialProfile);

  const [job, setJob] = useState<any>(null);
  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [jobError, setJobError] = useState("");

  const [match, setMatch] = useState<any>(null);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [tailoredResume, setTailoredResume] =
  useState<any>(null);

const [generatingResume, setGeneratingResume] =
  useState(false);
const [generatingCandidateProfileResume, setGeneratingCandidateProfileResume] =
  useState(false);
const [resumeGenerationError, setResumeGenerationError] =
  useState("");
const [applications, setApplications] = useState<any[]>([]);
const [applicationsLoading, setApplicationsLoading] = useState(true);
const [applicationsError, setApplicationsError] = useState("");
const [showAllApplications, setShowAllApplications] =
  useState(false);
const [applicationToDelete, setApplicationToDelete] =
  useState<any | null>(null);

const [deletingApplication, setDeletingApplication] =
  useState(false);
  // -----------------------------
  // Resume Upload
  // -----------------------------

  async function handleResumeChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  setResume(file);
  setError("");
  setResumeText("");
  setResumeLinks([]);
  setProfile(null);

  setJob(null);
  setMatch(null);
  setJobError("");
  setMatchError("");
  setTailoredResume(null);
  setResumeGenerationError("");

  setUploading(true);

  try {
    const formData = new FormData();

    formData.append("file", file);

    // --------------------------------
    // STEP 1: Extract PDF text + links
    // --------------------------------

    const response = await fetch(
      "/api/resume/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Upload failed"
      );
    }

    console.log(
      "Aviora Resume Upload:",
      data
    );

    setResumeText(data.text);

    // Preserve embedded PDF hyperlinks
    setResumeLinks(data.links || []);

    console.log(
      "Aviora Resume Links:",
      data.links || []
    );

    // --------------------------------
    // STEP 2: Convert resume into profile
    // --------------------------------

    const profileResponse = await fetch(
      "/api/profile/extract",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  text: data.text,
  links: data.links || [],
}),
      }
    );

    const profileData =
      await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(
        profileData.error ||
          "Profile extraction failed"
      );
    }

    console.log(
      "Aviora Candidate Profile:",
      profileData.profile
    );

    setProfile(profileData.profile);
  } catch (error) {
    console.error(
      "Resume processing error:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  } finally {
    setUploading(false);
  }
}

  // -----------------------------
  // Job Analyzer + Matcher
  // -----------------------------

  const handleAnalyzeJob = async () => {
  if (!jobUrl.trim()) {
    setJobError("Please enter a job URL.");
    return;
  }

  if (!profile) {
    setJobError(
      "Please upload your resume before analyzing a job."
    );
    return;
  }

  setAnalyzingJob(true);
  setJobError("");
  setJob(null);
  setMatch(null);
  setMatchError("");
  setTailoredResume(null);
  setResumeGenerationError("");

  try {
    // --------------------------------
    // STEP 1: ANALYZE JOB
    // --------------------------------

    const response = await fetch("/api/job/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: jobUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to analyze job"
      );
    }

    console.log("Aviora Job:", data.job);

    setJob(data.job);

    // --------------------------------
    // STEP 2: MATCH PROFILE
    // --------------------------------

    setAnalyzingJob(false);
    setMatching(true);

    const matchResponse = await fetch("/api/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile,
        job: data.job,
      }),
    });

    const matchData = await matchResponse.json();

    if (!matchResponse.ok) {
      throw new Error(
        matchData.error || "Failed to match profile"
      );
    }

    console.log(
      "Aviora Match:",
      matchData.match
    );

    setMatch(matchData.match);

    // --------------------------------
    // STEP 3: GENERATE TAILORED RESUME
    // --------------------------------

    setMatching(false);
    setGeneratingResume(true);

    const resumeResponse = await fetch(
      "/api/resume/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          job: data.job,
          match: matchData.match,
        }),
      }
    );

    const resumeData = await resumeResponse.json();

    if (!resumeResponse.ok) {
      throw new Error(
        resumeData.error ||
          "Failed to generate tailored resume"
      );
    }

    console.log(
      "Aviora Tailored Resume:",
      resumeData.resume
    );

    setTailoredResume(resumeData.resume);
  } catch (error) {
    console.error(
      "Aviora analysis error:",
      error
    );

    setJobError(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  } finally {
    setAnalyzingJob(false);
    setMatching(false);
    setGeneratingResume(false);
  }
};
  // -----------------------------
  // UI
  // -----------------------------
  const handleDownloadResume = async () => {
    
  if (!tailoredResume) {
    return;
  }

  try {
    setResumeGenerationError("");
    console.log(
  "Resume personal links:",
  tailoredResume.personal
);
    const response = await fetch("/api/resume/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: tailoredResume,
      }),
    });

    if (!response.ok) {
      const data = await response.json();

      throw new Error(
        data.error || "Failed to generate PDF"
      );
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Aviora-Tailored-Resume.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Resume download error:",
      error
    );

    setResumeGenerationError(
      error instanceof Error
        ? error.message
        : "Failed to download resume"
    );
  }
};

const handleDownloadCandidateProfileResume =
  async () => {
    try {
      setResumeGenerationError("");
      setGeneratingCandidateProfileResume(true);

      const response = await fetch(
        "/api/resume/pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "candidate-profile",
          }),
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.error ||
            "Failed to generate candidate profile resume"
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "Aviora-Candidate-Profile-Resume.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Candidate profile resume download error:",
        error
      );

      setResumeGenerationError(
        error instanceof Error
          ? error.message
          : "Failed to generate candidate profile resume"
      );
    } finally {
      setGeneratingCandidateProfileResume(false);
    }
  };

useEffect(() => {
  async function loadApplications() {
    try {
      setApplicationsLoading(true);
      setApplicationsError("");

      const response = await fetch("/api/applications", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load applications"
        );
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error(
        "Applications loading error:",
        error
      );

      setApplicationsError(
        error instanceof Error
          ? error.message
          : "Failed to load applications"
      );
    } finally {
      setApplicationsLoading(false);
    }
  }

  loadApplications();
}, []);

async function deleteApplication(applicationId: string) {

  try {
    const response = await fetch(
      `/api/applications/${applicationId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to delete application"
      );
    }

    setApplications((currentApplications) =>
      currentApplications.filter(
        (application) => application.id !== applicationId
      )
    );
  } catch (error) {
    console.error(
      "Application deletion error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete application"
    );
  }
}

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <AvioraNavbar />

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        {/* Hero */}
       <div className="mb-12 text-center">

  {/* Aviora Logo */}
  <div className="mb-6 flex justify-center">
    <Image
      src="/aviora-logo.png"
      alt="Aviora"
      width={220}
      height={165}
      className="h-28 w-auto object-contain"
      priority
    />
  </div>

  <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-violet-400">
    AI Career Assistant
  </p>

          <h1 className="text-5xl font-semibold tracking-tight">
            Your resume.
            <br />

            <span className="text-gray-500">
              Tailored for every job.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Upload your resume, paste a job posting, and let
            Aviora create a tailored resume based on your real
            experience.
          </p>
        </div>


        {/* -------------------------------- */}
        {/* Job URL */}
        {/* -------------------------------- */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6">
           <h2 className="text-lg font-medium">
  Scan a Job
</h2>

<p className="mt-1 text-sm text-gray-500">
  Paste a job posting URL and Aviora will analyze the role and match it against your profile.
</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => {
                setJobUrl(e.target.value);
                setJobError("");
              }}
              placeholder="https://company.com/careers/frontend-developer"
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-violet-400/50"
            />

            <button
              onClick={handleAnalyzeJob}
             disabled={
  analyzingJob ||
  matching ||
  generatingResume
}
              className="rounded-xl bg-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzingJob
  ? "Analyzing Job..."
  : matching
  ? "Matching Profile..."
  : generatingResume
  ? "Generating Resume..."
  : "Analyze & Match"}
            </button>
          </div>
        </div>

        {/* Job error */}
        {jobError && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-red-400">
              {jobError}
            </p>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Job Result */}
        {/* -------------------------------- */}

        {job && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                Job analyzed
              </p>

              <h2 className="text-2xl font-semibold">
                {job.title || "Untitled position"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {job.company || "Company not specified"}

                {job.location && (
                  <>
                    <span className="mx-2 text-gray-600">
                      •
                    </span>

                    {job.location}
                  </>
                )}
              </p>

              {job.employmentType && (
                <span className="mt-4 inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  {job.employmentType}
                </span>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Description
                </h3>

                <p className="text-sm leading-7 text-gray-400">
                  {job.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Responsibilities
                </h3>

                <ul className="space-y-2">
                  {job.responsibilities.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-gray-400"
                      >
                        <span className="mr-2 text-violet-400">
                          •
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Required Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map(
                    (
                      skill: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {job.preferredSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Preferred Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map(
                    (
                      skill: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Technologies */}
            {job.technologies?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Technologies
                </h3>

                <div className="flex flex-wrap gap-2">
                  {job.technologies.map(
                    (
                      technology: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300"
                      >
                        {technology}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {job.experienceRequirements?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Experience Requirements
                </h3>

                <ul className="space-y-2">
                  {job.experienceRequirements.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm text-gray-400"
                      >
                        <span className="mr-2 text-violet-400">
                          •
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Education */}
            {job.educationRequirements?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Education Requirements
                </h3>

                <ul className="space-y-2">
                  {job.educationRequirements.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm text-gray-400"
                      >
                        <span className="mr-2 text-violet-400">
                          •
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {job.keywords?.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium">
                  Keywords
                </h3>

                <div className="flex flex-wrap gap-2">
                  {job.keywords.map(
                    (
                      keyword: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------- */}
        {/* AI Match Analysis */}
        {/* -------------------------------- */}

        {match && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                AI Match Analysis
              </p>

              <h2 className="text-2xl font-semibold">
                Your profile vs. this job
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Aviora identified the parts of your existing
                profile that are relevant to this position.
              </p>
            </div>

            {/* Matching Skills */}
            {match.matchingSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Matching Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {match.matchingSkills.map(
                    (
                      skill: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-500/10 px-3 py-1.5 text-xs text-green-400"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {match.missingSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Skills Not Found In Your Profile
                </h3>

                <div className="flex flex-wrap gap-2">
                  {match.missingSkills.map(
                    (
                      skill: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs text-red-400"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Matching Technologies */}
            {match.matchingTechnologies?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Matching Technologies
                </h3>

                <div className="flex flex-wrap gap-2">
                  {match.matchingTechnologies.map(
                    (
                      technology: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                      >
                        {technology}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Relevant Experience */}
            {match.relevantExperience?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 font-medium">
                  Relevant Experience
                </h3>

                <div className="space-y-4">
                  {match.relevantExperience.map(
                    (
                      experience: {
                        company: string;
                        role: string;
                        reason: string;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="font-medium">
                          {experience.role}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {experience.company}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-gray-400">
                          {experience.reason}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Relevant Projects */}
            {match.relevantProjects?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 font-medium">
                  Relevant Projects
                </h3>

                <div className="space-y-4">
                  {match.relevantProjects.map(
                    (
                      project: {
                        name: string;
                        reason: string;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="font-medium">
                          {project.name}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-gray-400">
                          {project.reason}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {match.educationMatch?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Education Match
                </h3>

                <ul className="space-y-2">
                  {match.educationMatch.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm text-gray-400"
                      >
                        <span className="mr-2 text-violet-400">
                          •
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Tailoring Suggestions */}
            {match.tailoringSuggestions?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Resume Tailoring Suggestions
                </h3>

                <ul className="space-y-2">
                  {match.tailoringSuggestions.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-gray-400"
                      >
                        <span className="mr-2 text-violet-400">
                          •
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {match.importantKeywords?.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 font-medium">
                  Important Job Keywords
                </h3>

                <div className="flex flex-wrap gap-2">
                  {match.importantKeywords.map(
                    (
                      keyword: string,
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {match.warnings?.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium">
                  Notes
                </h3>

                <ul className="space-y-2">
                  {match.warnings.map(
                    (
                      warning: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-gray-500"
                      >
                        {warning}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
{generatingResume && (
  <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />

      <div>
        <h2 className="text-lg font-semibold text-white">
          Generating Tailored Resume
        </h2>

        <p className="mt-1 text-sm text-white/50">
          Aviora is tailoring your resume for this job.
        </p>
      </div>
    </div>
  </section>
)}

{resumeGenerationError && (
  <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
    <h2 className="text-lg font-semibold text-red-300">
      Resume Generation Error
    </h2>

    <p className="mt-2 text-sm text-red-200/70">
      {resumeGenerationError}
    </p>
  </section>
)}

{tailoredResume && (
  <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  <div>
    <h2 className="text-2xl font-semibold text-white">
      Tailored Resume
    </h2>

    <p className="mt-1 text-sm text-white/50">
      Generated specifically for this job while
      preserving your original experience.
    </p>
  </div>

  <button
    onClick={handleDownloadResume}
    className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
  >
    Download PDF
  </button>

</div>

    <div className="space-y-8 rounded-2xl bg-white p-8 text-black">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          {tailoredResume.personal.name}
        </h1>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {tailoredResume.personal.email && (
            <span>
              {tailoredResume.personal.email}
            </span>
          )}

          {tailoredResume.personal.phone && (
            <span>
              {tailoredResume.personal.phone}
            </span>
          )}

          {tailoredResume.personal.location && (
            <span>
              {tailoredResume.personal.location}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}

      {tailoredResume.summary && (
        <div>
          <h2 className="mb-2 border-b pb-1 text-lg font-bold">
            SUMMARY
          </h2>

          <p className="text-sm leading-6 text-gray-700">
            {tailoredResume.summary}
          </p>
        </div>
      )}

      {/* Skills */}

      {tailoredResume.skills?.length > 0 && (
        <div>
          <h2 className="mb-3 border-b pb-1 text-lg font-bold">
            SKILLS
          </h2>

          <div className="space-y-2">
            {tailoredResume.skills.map(
              (
                skillGroup: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="text-sm"
                >
                  <span className="font-semibold">
                    {skillGroup.category}:
                  </span>{" "}
                  {skillGroup.skills.join(", ")}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Experience */}

      {tailoredResume.experience?.length > 0 && (
        <div>
          <h2 className="mb-4 border-b pb-1 text-lg font-bold">
            EXPERIENCE
          </h2>

          <div className="space-y-6">
            {tailoredResume.experience.map(
              (
                experience: any,
                index: number
              ) => (
                <div key={index}>
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold">
                        {experience.role}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {experience.company}
                        {experience.location
                          ? ` · ${experience.location}`
                          : ""}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-sm text-gray-500">
                      {experience.startDate} -{" "}
                      {experience.endDate}
                    </span>
                  </div>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
                    {experience.description.map(
                      (
                        bullet: string,
                        bulletIndex: number
                      ) => (
                        <li key={bulletIndex}>
                          {bullet}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Projects */}

      {tailoredResume.projects?.length > 0 && (
        <div>
          <h2 className="mb-4 border-b pb-1 text-lg font-bold">
            PROJECTS
          </h2>

          <div className="space-y-6">
            {tailoredResume.projects.map(
              (
                project: any,
                index: number
              ) => (
                <div key={index}>
                  <h3 className="font-bold">
                    {project.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-700">
                    {project.description}
                  </p>

                  {project.technologies?.length >
                    0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold">
                        Technologies:
                      </span>{" "}
                      {project.technologies.join(
                        ", "
                      )}
                    </p>
                  )}

                  {project.highlights?.length >
                    0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {project.highlights.map(
                        (
                          highlight: string,
                          highlightIndex: number
                        ) => (
                          <li
                            key={
                              highlightIndex
                            }
                          >
                            {highlight}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Education */}

      {tailoredResume.education?.length > 0 && (
        <div>
          <h2 className="mb-4 border-b pb-1 text-lg font-bold">
            EDUCATION
          </h2>

          <div className="space-y-4">
            {tailoredResume.education.map(
              (
                education: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold">
                      {education.degree}
                      {education.field
                        ? ` — ${education.field}`
                        : ""}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {education.institution}
                      {education.location
                        ? ` · ${education.location}`
                        : ""}
                    </p>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <div>
                      {education.startYear} -{" "}
                      {education.endYear}
                    </div>

                    {education.grade && (
                      <div>
                        {education.grade}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Certifications */}

      {tailoredResume.certifications?.length >
        0 && (
        <div>
          <h2 className="mb-4 border-b pb-1 text-lg font-bold">
            CERTIFICATIONS
          </h2>

          <div className="space-y-3">
            {tailoredResume.certifications.map(
              (
                certification: any,
                index: number
              ) => (
                <div key={index}>
                  <p className="font-semibold">
                    {certification.name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {certification.issuer}
                    {certification.date
                      ? ` · ${certification.date}`
                      : ""}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Achievements */}

      {tailoredResume.achievements?.length >
        0 && (
        <div>
          <h2 className="mb-4 border-b pb-1 text-lg font-bold">
            ACHIEVEMENTS
          </h2>

          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {tailoredResume.achievements.map(
              (
                achievement: string,
                index: number
              ) => (
                <li key={index}>
                  {achievement}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  </section>
)}
        {/* Match error */}
        {matchError && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-red-400">
              {matchError}
            </p>
          </div>
        )}

{/* -------------------------------- */}
{/* Career Actions */}
{/* -------------------------------- */}

<div className="mt-16">

  {/* Generate Candidate Profile Resume */}
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
      <span className="text-lg">✦</span>
    </div>

    <h2 className="mt-5 text-lg font-medium">
      Candidate Profile Resume
    </h2>

    <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
      Generate a professional resume using the information
      already stored in your Aviora candidate profile.
    </p>

    <button
      type="button"
      
      onClick={handleDownloadCandidateProfileResume}
  disabled={generatingCandidateProfileResume}
  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
>
  {generatingCandidateProfileResume
    ? "Generating..."
    : "Generate Resume"}
    </button>
  </div>

  
</div>
{/* -------------------------------- */}
{/* Update Profile */}
{/* -------------------------------- */}

<div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

  <div className="mb-6">
    <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
      Candidate Profile
    </p>

    <h2 className="text-xl font-semibold">
      Update Your Profile
    </h2>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
      Upload a new resume to replace your current candidate profile.
      Aviora will extract your skills, experience, education, projects
      and other information from the new resume.
    </p>
  </div>

  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 px-6 py-12 transition hover:border-violet-400/50 hover:bg-white/[0.02]">

    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-2xl">
      📄
    </div>

    {resume ? (
      <>
        <p className="font-medium text-violet-300">
          {resume.name}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {(resume.size / 1024 / 1024).toFixed(2)} MB
        </p>

        <p className="mt-3 text-xs text-gray-600">
          Click to choose a different resume
        </p>
      </>
    ) : (
      <>
        <p className="font-medium">
          Upload a new resume
        </p>

        <p className="mt-2 text-sm text-gray-500">
          PDF only · Click to browse
        </p>
      </>
    )}

    <input
      type="file"
      accept=".pdf,application/pdf"
      className="hidden"
      onChange={handleResumeChange}
    />

  </label>

  {uploading && (
    <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
      <p className="text-sm text-violet-300">
        Updating your profile...
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Aviora is extracting your resume and rebuilding your candidate profile.
      </p>
    </div>
  )}

  {error && (
    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
      <p className="text-sm text-red-400">
        {error}
      </p>
    </div>
  )}

</div>
{/* -------------------------------- */}
{/* Recent Applications List */}
{/* -------------------------------- */}

<div
  id="recent-applications"
  className="mt-10"
>
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-medium">
        Recent Applications
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Your jobs marked as Applied in Thali.
      </p>
    </div>

    {applications.length > 3 && (
      <button
        type="button"
        onClick={() =>
          setShowAllApplications(
            (current) => !current
          )
        }
        className="text-sm text-gray-400 transition hover:text-white"
      >
        {showAllApplications
          ? "Show less"
          : "View all"}
      </button>
    )}
  </div>

  {applicationsLoading && (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <p className="text-sm text-gray-500">
        Loading your applications...
      </p>
    </div>
  )}

  {!applicationsLoading && applicationsError && (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
      <p className="text-sm text-red-400">
        {applicationsError}
      </p>
    </div>
  )}

  {!applicationsLoading &&
    !applicationsError &&
    applications.length === 0 && (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-sm text-gray-400">
          No applications yet.
        </p>

        <p className="mt-2 text-xs text-gray-600">
          Jobs you mark as Applied in Thali will appear here.
        </p>
      </div>
    )}

  {!applicationsLoading &&
    !applicationsError &&
    applications.length > 0 && (
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {(showAllApplications
          ? applications
          : applications.slice(0, 3)
        ).map((application) => {
          const job = application.job;

          return (
            <div
              key={application.id}
              className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="truncate font-medium text-white">
                    {job?.title ||
                      "Untitled position"}
                  </h3>

                  <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400">
                    Applied
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  {job?.company ||
                    "Company not specified"}

                  {job?.location && (
                    <>
                      <span className="mx-2 text-gray-700">
                        •
                      </span>

                      {job.location}
                    </>
                  )}
                </p>

                {application.appliedAt && (
                  <p className="mt-2 text-xs text-gray-600">
                    Applied{" "}
                    {new Date(
                      application.appliedAt
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
  {job?.url && (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
    >
      View Job ↗
    </a>
  )}

  <button
    type="button"
    onClick={() =>
  setApplicationToDelete(application)
}
    aria-label="Remove application"
    title="Remove application"
    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-500 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
  >
    🗑
  </button>
</div>
            </div>
          );
        })}
      </div>
    )}
</div>
      </section>
      {applicationToDelete && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Application
          </p>

          <h3 className="mt-2 text-xl font-medium text-white">
            Remove application?
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setApplicationToDelete(null)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white"
        >
          ×
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-400">
        Are you sure you want to remove{" "}
        <span className="font-medium text-white">
          {applicationToDelete.job?.title ||
            "this application"}
        </span>{" "}
        from your recent applications?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setApplicationToDelete(null)}
          disabled={deletingApplication}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            deleteApplication(applicationToDelete.id)
          }
          disabled={deletingApplication}
          className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deletingApplication
            ? "Removing..."
            : "Remove"}
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}