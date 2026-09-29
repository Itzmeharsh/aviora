import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ThaliClient from "./ThaliClient";

export default async function ThaliPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile =
    await prisma.candidateProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

  if (!profile) {
    redirect("/onboarding");
  }

  return <ThaliClient />;
}