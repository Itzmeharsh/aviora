import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { JobSchema } from "@/lib/job-schema";
import { zodTextFormat } from "openai/helpers/zod";

export async function POST(request: Request) {
  try {
    // Require an authenticated user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          error: "Job URL is required",
        },
        { status: 400 }
      );
    }

    // Validate URL
    let jobUrl: URL;

    try {
      jobUrl = new URL(url);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid job URL",
        },
        { status: 400 }
      );
    }

    let jobText = "";

    // --------------------------------------------------
    // 1. Try direct website fetch first
    // --------------------------------------------------

    try {
      const response = await fetch(jobUrl.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });

      if (response.ok) {
        const html = await response.text();

        jobText = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
          .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&#39;/gi, "'")
          .replace(/&quot;/gi, '"')
          .replace(/\s+/g, " ")
          .trim();
      }
    } catch (error) {
      console.log("Direct job page fetch failed:", error);
    }

    // --------------------------------------------------
    // 2. If direct fetch failed, use Jina Reader
    // --------------------------------------------------

    if (jobText.length < 500) {
      console.log(
        "Direct extraction insufficient. Trying Jina Reader..."
      );

      try {
        const jinaUrl = `https://r.jina.ai/${jobUrl.toString()}`;

        const jinaResponse = await fetch(jinaUrl, {
          headers: {
            Accept: "text/plain",
          },
        });

        if (jinaResponse.ok) {
          const jinaText = await jinaResponse.text();

          if (jinaText.length > jobText.length) {
            jobText = jinaText;
          }
        }
      } catch (error) {
        console.log("Jina Reader failed:", error);
      }
    }

    // --------------------------------------------------
    // 3. Check extracted content
    // --------------------------------------------------

    if (jobText.length < 200) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the job page. The website may be blocking automated access.",
        },
        { status: 400 }
      );
    }

    // Limit text sent to OpenAI
    jobText = jobText.slice(0, 30000);

    // --------------------------------------------------
    // 4. Analyze job with OpenAI
    // --------------------------------------------------

    const aiResponse = await openai.responses.parse({
      model: "gpt-5.6-luna",

      instructions: `
You are Aviora, an AI job description analysis engine.

Analyze the provided job posting and convert it into
structured job requirements.

IMPORTANT RULES:

1. Only use information explicitly present in the job posting.
2. Never invent requirements.
3. If information is missing, return an empty string.
4. If a section does not exist, return an empty array.
5. Extract required and preferred skills separately when possible.
6. Extract technologies and frameworks mentioned in the posting.
7. Extract education requirements.
8. Extract experience requirements.
9. Extract important keywords.
10. Keep the information factual.
11. Do not assume that a technology is required unless the
    job posting indicates it.
12. Do not confuse company information with candidate requirements.
13. Preserve the original meaning of the job posting.

The resulting structured job data will be used by Aviora
to compare the job with a candidate's professional profile.
`,

      input: `
Analyze this job posting.

JOB URL:
${jobUrl.toString()}

JOB POSTING TEXT:

--- JOB START ---

${jobText}

--- JOB END ---
`,

      text: {
        format: zodTextFormat(JobSchema, "job"),
      },
    });

    const job = aiResponse.output_parsed;

    if (!job) {
      return NextResponse.json(
        {
          error: "AI did not return job information",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sourceUrl: jobUrl.toString(),
      job,
    });
  } catch (error) {
    console.error("Job analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze job posting",
      },
      { status: 500 }
    );
  }
}