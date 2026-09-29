import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { generateResumeHTML } from "@/lib/resume-template";
import { auth } from "@/auth";

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
    // 2. Get tailored resume
    // --------------------------------------------------

    const body = await request.json();

    const { resume } = body;

    if (!resume) {
      return NextResponse.json(
        {
          error: "Resume data is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Generate resume HTML
    // --------------------------------------------------

    const html = generateResumeHTML(resume);

    // --------------------------------------------------
    // 4. Generate PDF with Puppeteer
    // --------------------------------------------------

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
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
    // 5. Return PDF
    // --------------------------------------------------

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="Aviora-Tailored-Resume.pdf"',
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