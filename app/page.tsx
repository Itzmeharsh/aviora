import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function Home() {
  // --------------------------------
  // AUTHENTICATE USER
  // --------------------------------

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // --------------------------------
  // CHECK USER PROFILE
  // --------------------------------

  const profile =
    await prisma.candidateProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  // --------------------------------
  // FIRST-TIME USER
  // --------------------------------

  if (!profile) {
    redirect("/onboarding");
  }

  // --------------------------------
  // AUTHENTICATED USER WITH PROFILE
  // --------------------------------

  return <HomeClient />;
}