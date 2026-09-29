import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { JobSchema } from "@/lib/job-schema";
import { zodTextFormat } from "openai/helpers/zod";

type JobSource = "indeed" | "naukri" | "generic";

/* =========================================================
   DETECT JOB SOURCE
========================================================= */

function detectJobSource(url: URL): JobSource {
  const hostname = url.hostname.toLowerCase();

  if (hostname.includes("indeed.")) {
    return "indeed";
  }

  if (hostname.includes("naukri.com")) {
    return "naukri";
  }

  return "generic";
}

/* =========================================================
   NORMALIZE JOB URL
========================================================= */

function normalizeJobUrl(url: URL): URL {
  const normalized = new URL(url.toString());

  const hostname = normalized.hostname.toLowerCase();

  // -------------------------------------------------------
  // Indeed
  // -------------------------------------------------------

  if (hostname.includes("indeed.")) {
    const jobKey =
      normalized.searchParams.get("jk") ||
      normalized.searchParams.get("vjk");

    /*
     * Indeed URLs can contain a huge number of tracking,
     * search and advertisement parameters.
     *
     * We only need the actual job key.
     *
     * Example:
     *
     * https://in.indeed.com/viewjob?jk=123abc&from=serp&...
     *
     * becomes:
     *
     * https://in.indeed.com/viewjob?jk=123abc
     */

    if (jobKey) {
      return new URL(
        `${normalized.protocol}//${normalized.hostname}/viewjob?jk=${encodeURIComponent(
          jobKey
        )}`
      );
    }
  }

  // -------------------------------------------------------
  // Naukri
  // -------------------------------------------------------

  if (hostname.includes("naukri.com")) {
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    for (const param of trackingParams) {
      normalized.searchParams.delete(param);
    }

    return normalized;
  }

  // -------------------------------------------------------
  // Generic website
  // -------------------------------------------------------

  return normalized;
}

/* =========================================================
   CLEAN HTML
========================================================= */

function cleanHtml(html: string): string {
  return html
    // Remove scripts
    .replace(/<script[\s\S]*?<\/script>/gi, " ")

    // Remove styles
    .replace(/<style[\s\S]*?<\/style>/gi, " ")

    // Remove noscript
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")

    // Remove SVG
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")

    // Remove templates
    .replace(/<template[\s\S]*?<\/template>/gi, " ")

    // Preserve line breaks from useful HTML elements
    .replace(
      /<\/(p|div|section|article|li|h1|h2|h3|h4|br)>/gi,
      "\n"
    )

    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, " ")

    // Decode common HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")

    // Normalize whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* =========================================================
   DETECT BLOCKED / CAPTCHA PAGE
========================================================= */

function looksLikeBlockedPage(text: string): boolean {
  const lower = text.toLowerCase();

  const blockedIndicators = [
    "verify you are human",
    "verify you're human",
    "captcha",
    "access denied",
    "robot check",
    "unusual traffic",
    "security check",
    "are you a robot",
    "enable javascript and cookies",
    "checking your browser",
    "temporarily unavailable",
  ];

  return blockedIndicators.some((indicator) =>
    lower.includes(indicator)
  );
}

/* =========================================================
   CHECK WHETHER WE HAVE USABLE CONTENT
========================================================= */

function hasUsableJobContent(text: string): boolean {
  if (!text) {
    return false;
  }

  // We don't require exact phrases such as
  // "Responsibilities" or "Qualifications".
  //
  // Indeed's extracted text can be formatted differently.
  //
  // OpenAI will determine the actual job structure.

  if (text.length < 800) {
    return false;
  }

  if (looksLikeBlockedPage(text)) {
    return false;
  }

  return true;
}

/* =========================================================
   DIRECT WEBSITE FETCH
========================================================= */

async function fetchDirect(
  url: URL,
  source: JobSource
): Promise<string> {
  try {
    console.log(
      `[JOB] Direct fetch: ${source}`
    );

    console.log(
      `[JOB] URL: ${url.toString()}`
    );

    const response = await fetch(
      url.toString(),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",

          "Accept-Language":
            "en-US,en;q=0.9",

          "Cache-Control":
            "no-cache",
        },

        redirect: "follow",

        cache: "no-store",
      }
    );

    console.log(
      `[JOB] Direct response: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      return "";
    }

    const html =
      await response.text();

    console.log(
      `[JOB] Direct HTML length: ${html.length}`
    );

    const text =
      cleanHtml(html);

    console.log(
      `[JOB] Cleaned text length: ${text.length}`
    );

    if (looksLikeBlockedPage(text)) {
      console.log(
        "[JOB] Direct page appears to be blocked/verification page."
      );

      return "";
    }

    return text;
  } catch (error) {
    console.error(
      "[JOB] Direct fetch failed:",
      error
    );

    return "";
  }
}

/* =========================================================
   JINA READER
========================================================= */

async function fetchWithJina(
  url: URL
): Promise<string> {
  try {
    const jinaUrl =
      `https://r.jina.ai/${url.toString()}`;

    console.log(
      "[JOB] Trying Jina Reader..."
    );

    console.log(
      `[JOB] Jina URL: ${jinaUrl}`
    );

    const response =
      await fetch(jinaUrl, {
        headers: {
          Accept: "text/plain",
        },

        redirect: "follow",

        cache: "no-store",
      });

    console.log(
      `[JOB] Jina response: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      return "";
    }

    const text =
      await response.text();

    console.log(
      `[JOB] Jina text length: ${text.length}`
    );

    // TEMPORARY DEBUGGING
    // This lets us see what Jina actually returned.
    console.log(
      "[JOB] Jina preview:",
      text.slice(0, 1500)
    );

    if (looksLikeBlockedPage(text)) {
      console.log(
        "[JOB] Jina result appears to be a blocked/verification page."
      );

      return "";
    }

    return text.trim();
  } catch (error) {
    console.error(
      "[JOB] Jina Reader failed:",
      error
    );

    return "";
  }
}

/* =========================================================
   EXTRACT USEFUL JOB TEXT
========================================================= */

function extractUsefulText(
  text: string
): string {
  let cleaned = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  /*
   * Many websites contain navigation and footer content
   * before the actual job description.
   *
   * Try to locate the first meaningful job section.
   */

  const usefulSections = [
    "job description",
    "about the job",
    "about the role",
    "responsibilities",
    "qualifications",
    "requirements",
    "what you'll do",
    "what you will do",
    "skills",
    "experience",
    "education",
  ];

  const lower =
    cleaned.toLowerCase();

  let earliestIndex = -1;

  for (const section of usefulSections) {
    const index =
      lower.indexOf(section);

    if (
      index !== -1 &&
      (
        earliestIndex === -1 ||
        index < earliestIndex
      )
    ) {
      earliestIndex = index;
    }
  }

  /*
   * Only trim the beginning if we found a meaningful
   * job-related section.
   */

  if (earliestIndex > 0) {
    cleaned =
      cleaned.slice(earliestIndex);
  }

  /*
   * Allow long job descriptions but prevent huge pages
   * from being sent to OpenAI.
   */

  return cleaned.slice(
    0,
    40000
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  try {
    // -----------------------------------------------------
    // 1. Authentication
    // -----------------------------------------------------

    const session =
      await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------------------
    // 2. Read request
    // -----------------------------------------------------

    const body =
      await request.json();

    const { url } = body;

    if (
      !url ||
      typeof url !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Job URL is required",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // 3. Parse URL
    // -----------------------------------------------------

    let originalUrl: URL;

    try {
      originalUrl =
        new URL(url.trim());
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid job URL",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // 4. Detect source
    // -----------------------------------------------------

    const source =
      detectJobSource(
        originalUrl
      );

    // -----------------------------------------------------
    // 5. Normalize URL
    // -----------------------------------------------------

    const jobUrl =
      normalizeJobUrl(
        originalUrl
      );

    console.log(
      "========================================"
    );

    console.log(
      "[JOB ANALYZER]"
    );

    console.log(
      "Source:",
      source
    );

    console.log(
      "Original URL:",
      originalUrl.toString()
    );

    console.log(
      "Normalized URL:",
      jobUrl.toString()
    );

    // -----------------------------------------------------
    // 6. Indeed job key
    // -----------------------------------------------------

    if (source === "indeed") {
      const indeedJobKey =
        originalUrl.searchParams.get(
          "jk"
        ) ||
        originalUrl.searchParams.get(
          "vjk"
        );

      console.log(
        "Indeed Job Key:",
        indeedJobKey ||
          "not found"
      );
    }

    // -----------------------------------------------------
    // 7. Direct fetch
    // -----------------------------------------------------

    let jobText =
      await fetchDirect(
        jobUrl,
        source
      );

    // -----------------------------------------------------
    // 8. If direct result is bad,
    //    try Jina
    // -----------------------------------------------------

    if (
      !hasUsableJobContent(
        jobText
      )
    ) {
      console.log(
        "[JOB] Direct result insufficient. Trying Jina..."
      );

      const jinaText =
        await fetchWithJina(
          jobUrl
        );

      /*
       * Important:
       *
       * Do NOT require Jina text to be longer than
       * the direct result.
       *
       * Jina may return less text but it may be the
       * actual job description.
       */

      if (
        hasUsableJobContent(
          jinaText
        )
      ) {
        jobText =
          jinaText;
      }
    }

    // -----------------------------------------------------
    // 9. Extract useful content
    // -----------------------------------------------------

    const usefulJobText =
      extractUsefulText(
        jobText
      );

    console.log(
      "[JOB] Final job text length:",
      usefulJobText.length
    );

    console.log(
      "[JOB] Has usable job content:",
      hasUsableJobContent(
        usefulJobText
      )
    );

    // -----------------------------------------------------
    // 10. Final validation
    // -----------------------------------------------------

    if (
      !hasUsableJobContent(
        usefulJobText
      )
    ) {
      return NextResponse.json(
        {
          error:
            source === "indeed"
              ? "Indeed's job page did not return enough readable job information. Try copying the direct job URL from the browser."
              : "Could not extract enough readable information from the job page. The website may be blocking automated access.",
          source,
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // 11. Send job content to OpenAI
    // -----------------------------------------------------

    console.log(
      "[JOB] Sending extracted job content to OpenAI..."
    );

    const aiResponse =
      await openai.responses.parse(
        {
          model:
            "gpt-5.6-luna",

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
    job posting indicates that it is required.
12. Do not confuse company information with candidate requirements.
13. Preserve the original meaning of the job posting.
14. Ignore URL tracking parameters.
15. Focus only on the actual job posting.
16. Do not treat navigation, advertisements, recommended jobs,
    cookie notices, or website UI text as job requirements.

The resulting structured job data will be used by Aviora
to compare the job with a candidate's professional profile.
`,

          input: `
Analyze this job posting.

SOURCE:
${source}

JOB URL:
${originalUrl.toString()}

JOB POSTING TEXT:

--- JOB START ---

${usefulJobText}

--- JOB END ---
`,

          text: {
            format:
              zodTextFormat(
                JobSchema,
                "job"
              ),
          },
        }
      );

    // -----------------------------------------------------
    // 12. Get structured job
    // -----------------------------------------------------

    const job =
      aiResponse.output_parsed;

    if (!job) {
      return NextResponse.json(
        {
          error:
            "AI did not return job information",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "[JOB] OpenAI successfully analyzed job."
    );

    console.log(
      "========================================"
    );

    // -----------------------------------------------------
    // 13. Return job
    // -----------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        source,

        sourceUrl:
          originalUrl.toString(),

        job,
      }
    );
  } catch (error) {
    console.error(
      "Job analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to analyze job posting",
      },
      {
        status: 500,
      }
    );
  }
}