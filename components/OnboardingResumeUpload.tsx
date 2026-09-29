"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingResumeUpload() {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleResumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    setUploading(true);

    try {
      // --------------------------------
      // STEP 1: Extract PDF text + links
      // --------------------------------

      const formData = new FormData();

      formData.append("file", file);

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
          data.error || "Failed to upload resume."
        );
      }

      // --------------------------------
      // STEP 2: Create candidate profile
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
            "Failed to create your profile."
        );
      }

      // --------------------------------
      // PROFILE CREATED
      // --------------------------------

      router.push("/tailor");
      router.refresh();
    } catch (error) {
      console.error(
        "Onboarding resume upload error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <label
        htmlFor="resume"
        className={`group flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition ${
          uploading
            ? "cursor-wait border-violet-400/40 bg-violet-400/[0.06]"
            : "cursor-pointer border-violet-400/30 bg-violet-400/[0.04] hover:border-violet-400/60 hover:bg-violet-400/[0.08]"
        }`}
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl transition group-hover:scale-105">
          {uploading ? "⏳" : "📄"}
        </div>

        <p className="text-base font-medium">
          {uploading
            ? "Building your profile..."
            : "Choose your resume"}
        </p>

        <p className="mt-2 text-sm text-white/40">
          {uploading
            ? "This may take a moment"
            : "PDF files only"}
        </p>

        <input
          id="resume"
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={uploading}
          onChange={handleResumeChange}
        />
      </label>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3">
          <p className="text-center text-sm text-red-300">
            {error}
          </p>
        </div>
      )}
    </>
  );
}