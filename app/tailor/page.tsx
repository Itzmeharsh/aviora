import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "../HomeClient";

export default async function TailorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile =
    await prisma.candidateProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  if (!profile) {
    redirect("/onboarding");
  }

  const initialProfile = {
    personal: {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || "",
    },

    summary: profile.summary || "",

    education: Array.isArray(profile.education)
      ? profile.education
      : [],

    skills: Array.isArray(profile.skills)
      ? profile.skills
      : [],

    experience: Array.isArray(profile.experience)
      ? profile.experience
      : [],

    projects: Array.isArray(profile.projects)
      ? profile.projects
      : [],

    certifications: Array.isArray(
      profile.certifications
    )
      ? profile.certifications
      : [],

    achievements: Array.isArray(profile.achievements)
      ? profile.achievements
      : [],
  };

  return (
    <HomeClient
      initialProfile={initialProfile}
    />
  );
}