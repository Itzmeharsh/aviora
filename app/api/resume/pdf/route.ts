import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { generateResumeHTML } from "@/lib/resume-template";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function transformCandidateProfile(profile: any) {
  const skillGroups = Array.isArray(profile.skills)
    ? profile.skills
    : [];

  const technicalCategories =
    /technical|technology|technologies|programming|development|software|engineering|framework|database|cloud|devops|mobile|web|tools/i;

  const technicalSkills: string[] = [];
  const analyticalSkills: string[] = [];

  for (const group of skillGroups) {
    const category = String(group?.category ?? "").trim();
    const skills = cleanArray(group?.skills);

    if (technicalCategories.test(category)) {
      technicalSkills.push(...skills);
    } else {
      analyticalSkills.push(...skills);
    }
  }

  const education = Array.isArray(profile.education)
    ? profile.education
    : [];

  const experience = Array.isArray(profile.experience)
    ? profile.experience
    : [];

  const projects = Array.isArray(profile.projects)
    ? profile.projects
    : [];

  const certifications = Array.isArray(profile.certifications)
    ? profile.certifications
    : [];

  const achievements = cleanArray(profile.achievements);

  return {
    personal: {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || "",
    },

    education: education.map((item: any) => ({
      degree: item?.degree || "",
      field: item?.field || "",
      institution: item?.institution || "",
      location: item?.location || "",
      startYear: item?.startYear || "",
      endYear: item?.endYear || "",
      grade: item?.grade || "",
    })),

    experience: experience.map((item: any) => ({
      company: item?.company || "",
      role: item?.role || "",
      location: item?.location || "",
      startDate: item?.startDate || "",
      endDate: item?.endDate || "",
      description: cleanArray(item?.description),
      technologies: cleanArray(item?.technologies),
      skills: cleanArray(item?.skills),
      tools: cleanArray(item?.tools),
    })),

    projects: projects.map((item: any) => ({
      name: item?.name || "",
      description: item?.description || "",
      technologies: cleanArray(item?.technologies),
      skills: cleanArray(item?.skills),
      tools: cleanArray(item?.tools),
      url: item?.url || "",
      highlights: cleanArray(item?.highlights),
    })),

    skills: {
      technical: Array.from(new Set(technicalSkills)),
      analytical: Array.from(new Set(analyticalSkills)),
    },

    achievements,

    // Kept here so the transformed object contains the
    // complete profile data if the template is extended later.
    summary: profile.summary || "",

    certifications: certifications.map((item: any) => ({
      name: item?.name || "",
      issuer: item?.issuer || "",
      date: item?.date || "",
      url: item?.url || "",
    })),

    extracurricular: [],
  };
}
function getLocalChromePath(): string | null {
  if (process.platform !== "win32") {
    return null;
  }

  const candidates = [
    process.env.PROGRAMFILES
      ? `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
      : null,

    process.env["PROGRAMFILES(X86)"]
      ? `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`
      : null,

    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : null,

    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google Chrome SxS\\Application\\chrome.exe`
      : null,
  ];

  for (const path of candidates) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }

  return null;
}
export async function POST(request: Request) {
  let browser;

  try {
    // --------------------------------------------------
    // 1. Require authenticated user
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request
    // --------------------------------------------------

    const body = await request.json();

    let resume = body?.resume;

    // --------------------------------------------------
    // 3. Candidate Profile Resume mode
    // --------------------------------------------------

    if (body?.mode === "candidate-profile") {
      const profile =
        await prisma.candidateProfile.findUnique({
          where: {
            userId: session.user.id,
          },
        });

      if (!profile) {
        return NextResponse.json(
          {
            error:
              "Candidate profile not found. Please complete onboarding first.",
          },
          { status: 404 }
        );
      }

      resume = transformCandidateProfile(profile);
    }

    // --------------------------------------------------
    // 4. Require resume data
    // --------------------------------------------------

    if (!resume) {
      return NextResponse.json(
        {
          error: "Resume data is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Generate resume HTML
    // --------------------------------------------------

    const html = generateResumeHTML(resume);

    // --------------------------------------------------
    // 6. Generate PDF with Puppeteer
    // --------------------------------------------------

    const localChromePath = getLocalChromePath();

browser = await puppeteer.launch({
  args: localChromePath ? [] : chromium.args,

  defaultViewport: {
    width: 1440,
    height: 1000,
  },

  executablePath:
    localChromePath ||
    (await chromium.executablePath()),

  headless: true,
});

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    // --------------------------------------------------
    // 7. Return PDF
    // --------------------------------------------------

    const filename =
      body?.mode === "candidate-profile"
        ? "Aviora-Candidate-Profile-Resume.pdf"
        : "Aviora-Tailored-Resume.pdf";

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(
      "PDF generation error:",
      error
    );

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}