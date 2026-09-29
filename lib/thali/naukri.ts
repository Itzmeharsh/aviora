import puppeteer from "puppeteer";
import type { ThaliJob } from "./types";
import { analyzeJobMatch } from "./ai-match";

type CandidateSkillEvidence = {
  skill: string;
  evidence: string[];
};

type CandidateSkillAlias = {
  skill: string;
  aliases: string[];
};

type CandidateSkillProfile = {
  primarySkills: string[];
  secondarySkills: string[];
  skillEvidence: CandidateSkillEvidence[];
  aliases: CandidateSkillAlias[];
};

type CandidateProfile = {
  personal?: {
    location?: string | null;
  };

  skills?: {
    category: string;
    skills: string[];
  }[];

  skillProfile?: CandidateSkillProfile | null;

  projects?: {
    technologies?: string[];
  }[];

  experience?: {
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
    technologies: string[];
  }[];
};

/* -------------------------------- */
/* Constants */
/* -------------------------------- */

const JOBS_PER_AVIORA_PAGE = 9;
const MAX_NAUKRI_PAGES = 3;
const FRESHNESS_DAYS = 7;

/*
 * Number of OpenAI requests that
 * run simultaneously.
 */
const AI_CONCURRENCY = 10;

/*
 * Minimum AI match score required
 * for a job to enter the final pool.
 */
const MIN_MATCH_SCORE = 40;

/* -------------------------------- */
/* Helpers */
/* -------------------------------- */

function cleanText(
  value: string | null | undefined
): string {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------- */
/* Get all skills from resume */
/* -------------------------------- */

function getCandidateSkills(
  profile: CandidateProfile
): string[] {
  const skills = [
    ...(profile.skills?.flatMap(
      (group) => group.skills || []
    ) || []),
    ...(profile.skillProfile?.primarySkills || []),
    ...(profile.skillProfile?.secondarySkills || []),
    ...(profile.experience?.flatMap(
      (experience) => experience.technologies || []
    ) || []),
    ...(profile.projects?.flatMap(
      (project) => project.technologies || []
    ) || []),
  ];

  return Array.from(
    new Set(
      skills
        .map((skill) => cleanText(skill))
        .filter(Boolean)
    )
  );
}

/* -------------------------------- */
/* Calculate experience */
/* -------------------------------- */

function parseResumeDate(
  value: string
): Date | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  if (
    normalized === "present" ||
    normalized === "current"
  ) {
    return new Date();
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const monthYear =
    normalized.match(
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/
    );

  if (monthYear) {
    const months: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    return new Date(
      Number(monthYear[2]),
      months[monthYear[1]]
    );
  }

  const year =
    normalized.match(/^(\d{4})$/);

  if (year) {
    return new Date(
      Number(year[1]),
      0
    );
  }

  return null;
}

function calculateExperienceYears(
  profile: CandidateProfile
): number {
  if (
    !profile.experience ||
    profile.experience.length === 0
  ) {
    return 0;
  }

  let totalMonths = 0;

  for (const experience of profile.experience) {
    const start = parseResumeDate(
      experience.startDate
    );

    const end = parseResumeDate(
      experience.endDate
    );

    if (!start || !end) {
      continue;
    }

    const months = Math.max(
      0,
      (end.getFullYear() -
        start.getFullYear()) *
        12 +
        (end.getMonth() -
          start.getMonth())
    );

    totalMonths += months;
  }

  return totalMonths / 12;
}

/* -------------------------------- */
/* Build search query FROM SKILLS */
/* -------------------------------- */

function buildSkillQuery(
  profile: CandidateProfile
): string {
  const skills =
    getCandidateSkills(profile);

  /*
   * These are only used to build the
   * Naukri search query.
   *
   * AI still performs the actual
   * candidate/job matching later.
   */
  const prioritySkills = [
    "flutter",
    "dart",
    "react",
    "next.js",
    "nextjs",
    "javascript",
    "typescript",
    "node.js",
    "nodejs",
    "python",
    "java",
    "postgresql",
    "mongodb",
    "firebase",
    "supabase",
  ];

  const selected =
    prioritySkills.filter((skill) =>
      skills.some((candidateSkill) =>
        candidateSkill
          .toLowerCase()
          .includes(skill.toLowerCase())
      )
    );

  if (selected.length > 0) {
    return selected
      .slice(0, 4)
      .join(", ");
  }

  return skills
    .slice(0, 4)
    .join(", ");
}

/* -------------------------------- */
/* Naukri URL */
/* -------------------------------- */

function buildSearchUrl(
  query: string,
  naukriPage: number,
  experienceYears: number
): string {
  const keywords = query
    .split(",")
    .map((skill) => cleanText(skill))
    .filter(Boolean)
    .join(", ");

  const slug = keywords
    .toLowerCase()
    .replace(/\.js\b/g, "-dot-js")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const experienceBucket =
    Math.floor(experienceYears);

  const params = new URLSearchParams();

  params.set("k", keywords);

  /*
   * Last 7 days.
   */
  params.set(
    "jobAge",
    String(FRESHNESS_DAYS)
  );

  params.set(
    "experience",
    String(experienceBucket)
  );

  const pageSlug =
    naukriPage > 1
      ? `${slug}-jobs-${naukriPage}`
      : `${slug}-jobs`;

  return `https://www.naukri.com/${pageSlug}?${params.toString()}`;
}

/* -------------------------------- */
/* Posted time */
/* -------------------------------- */

function extractPostedAt(
  text: string
): Date | null {
  const normalized =
    text.toLowerCase();

  const now = Date.now();

  if (
    normalized.includes("just now") ||
    normalized.includes("few minutes") ||
    normalized.includes("few hours") ||
    normalized.includes("today")
  ) {
    return new Date(now);
  }

  const minutes =
    normalized.match(
      /(\d+)\s*minutes?/i
    );

  if (minutes) {
    return new Date(
      now -
        Number(minutes[1]) *
          60 *
          1000
    );
  }

  const hours =
    normalized.match(
      /(\d+)\s*hours?/i
    );

  if (hours) {
    return new Date(
      now -
        Number(hours[1]) *
          60 *
          60 *
          1000
    );
  }

  const days =
    normalized.match(
      /(\d+)\s*days?/i
    );

  if (days) {
    return new Date(
      now -
        Number(days[1]) *
          24 *
          60 *
          60 *
          1000
    );
  }

  const weeks =
    normalized.match(
      /(\d+)\s*weeks?/i
    );

  if (weeks) {
    return new Date(
      now -
        Number(weeks[1]) *
          7 *
          24 *
          60 *
          60 *
          1000
    );
  }

  return null;
}

/* -------------------------------- */
/* Extract skills from job */
/* -------------------------------- */

function extractSkills(
  text: string
): string[] {
  const knownSkills = [
    "javascript",
    "typescript",
    "react",
    "react.js",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "express",
    "flutter",
    "dart",
    "python",
    "java",
    "sql",
    "postgresql",
    "mongodb",
    "firebase",
    "supabase",
    "tailwind",
    "html",
    "css",
    "git",
    "docker",
    "aws",
    "rest api",
  ];

  const lower =
    text.toLowerCase();

  return knownSkills.filter(
    (skill) =>
      lower.includes(
        skill.toLowerCase()
      )
  );
}

/* -------------------------------- */
/* Main search */
/* -------------------------------- */

export async function searchNaukriJobs(
  profile: CandidateProfile,
  appPage = 1,
  signal?: AbortSignal
): Promise<{
  jobs: ThaliJob[];
  hasNextPage: boolean;
}> {
    const throwIfAborted = () => {
    if (signal?.aborted) {
      throw new DOMException(
        "Thali search was cancelled",
        "AbortError"
      );
    }
  };

  throwIfAborted();
  const query =
    buildSkillQuery(profile);

  const candidateYears =
    calculateExperienceYears(profile);

  const candidateSkills =
    getCandidateSkills(profile);

  console.log(
    "[Thali] Resume skill query:",
    query
  );

  console.log(
    "[Thali] Candidate experience:",
    candidateYears.toFixed(1),
    "years | Naukri bucket:",
    Math.floor(candidateYears),
    "years"
  );

  console.log(
    "[Thali] Candidate skills:",
    candidateSkills
  );

  /*
   * Build a sufficiently large raw pool.
   *
   * AI matching happens AFTER scraping.
   */
  const targetPoolSize =
    Math.max(
      12,
      appPage * JOBS_PER_AVIORA_PAGE
    );

  const browser =
  await puppeteer.launch({
    headless: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

const abortHandler = () => {
  console.log(
    "[Thali/Naukri] Search cancelled by user"
  );

  void browser.close();
};

signal?.addEventListener(
  "abort",
  abortHandler,
  { once: true }
);

throwIfAborted();

  /*
   * Internal fields are kept here.
   *
   * relevanceScore will become the
   * AI match score.
   */
  const jobs =
    new Map<
      string,
      ThaliJob & {
        relevanceScore: number;
        matchingSkills: string[];
        missingSkills: string[];
        matchReasons: string[];
        jobExperience: string;
      }
    >();

  let hasNaukriNextPage = true;

  try {
    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 1000,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language":
        "en-IN,en;q=0.9",
    });

    /*
     * Always start from Naukri page 1.
     *
     * We build one large pool and then
     * paginate that pool inside Aviora.
     */
    for (
  let naukriPage = 1;
  naukriPage <= MAX_NAUKRI_PAGES;
  naukriPage++
) {
  throwIfAborted();
      if (
        jobs.size >=
        targetPoolSize
      ) {
        break;
      }

      const searchUrl =
        buildSearchUrl(
          query,
          naukriPage,
          candidateYears
        );

      console.log(
        `[Thali/Naukri] Searching result page ${naukriPage}`
      );

      try {
  throwIfAborted();

  const response =
    await page.goto(
            searchUrl,
            {
              waitUntil:
                "domcontentloaded",
              timeout: 15000,
            }
          );

        console.log(
          "[Thali/Naukri] Response status:",
          response?.status()
        );
        throwIfAborted();
        console.log(
          "[Thali/Naukri] Response URL:",
          response?.url()
        );

        try {
          await page.waitForSelector(
            ".srp-jobtuple-wrapper",
            {
              timeout: 5000,
            }
          );
        } catch {
          console.log(
            "[Thali/Naukri] Job cards did not appear within 8 seconds"
          );
        }

        console.log(
          "[Thali/Naukri] Page title:",
          await page.title()
        );

        console.log(
          "[Thali/Naukri] Current URL:",
          page.url()
        );

        /*
         * Check whether Naukri has
         * another result page.
         */
        const bodyText =
          await page.evaluate(
            () =>
              document.body?.innerText ||
              ""
          );

        const resultRangeMatch =
          bodyText.match(
            /(\d+)\s*-\s*(\d+)\s+of\s+(\d+)/i
          );

        if (resultRangeMatch) {
          const currentEnd =
            Number(
              resultRangeMatch[2]
            );

          const totalResults =
            Number(
              resultRangeMatch[3]
            );

          hasNaukriNextPage =
            currentEnd <
            totalResults;
        } else {
          hasNaukriNextPage = true;
        }

        /*
         * Primary selector.
         */
        let cards =
          await page.$$(
            ".srp-jobtuple-wrapper"
          );

        /*
         * Fallback selector.
         */
        if (cards.length === 0) {
          cards =
            await page.$$(
              ".cust-job-tuple"
            );
        }

        /*
         * Second fallback.
         */
        if (cards.length === 0) {
          cards =
            await page.$$(
              '[class*="jobtuple"]'
            );
        }

        console.log(
          `[Thali/Naukri] Cards found: ${cards.length}`
        );

        if (cards.length === 0) {
          console.log(
            `[Thali/Naukri] No cards on Naukri page ${naukriPage}`
          );

          continue;
        }

        /*
         * --------------------------------
         * SCRAPE ONLY
         * --------------------------------
         *
         * IMPORTANT:
         * There is NO OpenAI call here.
         *
         * This makes scraping much faster.
         */
        for (const card of cards) {
          try {
            const data =
              await card.evaluate(
                (element) => {
                  const root =
                    element as HTMLElement;

                  function findText(
                    selectors: string[]
                  ): string {
                    for (
                      const selector of selectors
                    ) {
                      const node =
                        root.querySelector(
                          selector
                        );

                      if (
                        node?.textContent?.trim()
                      ) {
                        return node.textContent.trim();
                      }
                    }

                    return "";
                  }

                  const title =
                    findText([
                      "a.title",
                      ".row1 a.title",
                    ]);

                  const company =
                    findText([
                      "a.comp-name",
                      ".comp-name",
                    ]);

                  const location =
                    findText([
                      ".locWdth",
                    ]);

                  const experience =
                    findText([
                      ".expwdth",
                    ]);

                  const description =
                    findText([
                      ".job-desc",
                    ]);

                  const posted =
                    findText([
                      ".job-post-day",
                    ]);

                  const titleAnchor =
                    root.querySelector(
                      "a.title, .row1 a"
                    ) as
                      | HTMLAnchorElement
                      | null;

                  return {
                    title,
                    company,
                    location,
                    experience,
                    description,
                    posted,

                    url:
                      titleAnchor?.href ||
                      "",

                    fullText:
                      root.innerText ||
                      "",
                  };
                }
              );

            const title =
              cleanText(data.title);

            const url =
              cleanText(data.url);

            if (!title || !url) {
              continue;
            }

            /*
             * Only actual Naukri job URLs.
             */
            if (
              !url.includes(
                "naukri.com/job-listings-"
              )
            ) {
              continue;
            }

            /*
             * Freshness.
             */
            const postedAt =
              extractPostedAt(
                cleanText(
                  `${data.posted} ${data.fullText}`
                )
              );

            if (!postedAt) {
              continue;
            }

            const age =
              Date.now() -
              postedAt.getTime();

            const sevenDays =
              FRESHNESS_DAYS *
              24 *
              60 *
              60 *
              1000;

            if (
              age < 0 ||
              age > sevenDays
            ) {
              continue;
            }

            /*
             * Job description.
             */
            const description =
              cleanText(
                data.description ||
                  data.fullText
              );

            /*
             * Searchable text is used only
             * for extracting recognizable
             * technologies to give the AI
             * additional structured context.
             */
            const searchableText =
              cleanText(
                [
                  title,
                  data.company,
                  data.location,
                  data.experience,
                  description,
                ].join(" ")
              );

            const jobSkills =
              extractSkills(
                searchableText
              );

            /*
             * Store the raw job.
             *
             * AI matching comes later.
             */
            const existing =
              jobs.get(url);

            if (!existing) {
              jobs.set(
                url,
                {
                  id:
                    `naukri-${Buffer.from(
                      url
                    ).toString(
                      "base64url"
                    )}`,

                  title,

                  company:
                    cleanText(
                      data.company
                    ) ||
                    "Company not specified",

                  location:
                    cleanText(
                      data.location
                    ) ||
                    profile.personal
                      ?.location ||
                    "India",

                  employmentType:
                    "Not specified",

                  url,

                  source:
                    "Naukri",

                  postedAt:
                    postedAt.toISOString(),

                  description:
                    description.slice(
                      0,
                      3000
                    ),

                  skills:
                    jobSkills,

                  technologies:
                    jobSkills,

                  relevanceScore: 0,

                  matchingSkills: [],

                  missingSkills: [],

                  matchReasons: [],

                  matchScore: 0,

                  jobExperience:
                    cleanText(
                      data.experience
                    ),
                }
              );
            }
          } catch (error) {
            console.error(
              "[Thali/Naukri] Card parsing error:",
              error
            );
          }
        }

        console.log(
          `[Thali/Naukri] Raw candidate pool after page ${naukriPage}: ${jobs.size}`
        );

        if (
          !hasNaukriNextPage
        ) {
          console.log(
            "[Thali/Naukri] No more Naukri pages available"
          );

          break;
        }
      } catch (error) {
        console.error(
          `[Thali/Naukri] Page ${naukriPage} failed:`,
          error
        );
      }
    }
  } finally {
  signal?.removeEventListener(
    "abort",
    abortHandler
  );

  if (browser.connected) {
    await browser.close();
  }
}

  /*
   * --------------------------------
   * AI MATCHING
   * --------------------------------
   *
   * Scraping is finished.
   *
   * Now analyze jobs in batches of 5.
   *
   * Example:
   *
   * Job 1 ─┐
   * Job 2  │
   * Job 3  ├── OpenAI concurrently
   * Job 4  │
   * Job 5 ─┘
   *
   * Then the next five.
   */
  throwIfAborted();
  const candidateJobs =
    Array.from(
      jobs.values()
    );

  console.log(
    `[Thali/AI] Starting AI matching for ${candidateJobs.length} jobs`
  );

  for (
    let i = 0;
    i < candidateJobs.length;
    i += AI_CONCURRENCY
  ) {
    throwIfAborted();
    const batch =
      candidateJobs.slice(
        i,
        i + AI_CONCURRENCY
      );

    console.log(
      `[Thali/AI] Processing batch ${
        Math.floor(
          i / AI_CONCURRENCY
        ) + 1
      }`
    );

    const results =
      await Promise.all(
        batch.map(
          async (job) => {
            try {
              const aiMatch =
                await analyzeJobMatch(
                  profile,
                  {
                    title:
                      job.title,

                    company:
                      job.company,

                    location:
                      job.location,

                    employmentType:
                      job.employmentType,

                    experience:
                      job.jobExperience,

                    skills:
                      job.skills,

                    description:
                      job.description,
                  }
                );

              return {
                job,
                aiMatch,
              };
            } catch (error) {
              console.error(
                `[Thali/AI] Failed to analyze "${job.title}":`,
                error
              );

              return {
                job,
                aiMatch: null,
              };
            }
          }
        )
      );

    /*
     * Save AI results into the jobs.
     */
    for (const result of results) {
      if (!result.aiMatch) {
        continue;
      }

      result.job.relevanceScore =
        result.aiMatch.matchScore;

      result.job.matchScore =
        result.aiMatch.matchScore;
      console.log(
  "[Thali/Score]",
  result.job.title,
  "=>",
  result.aiMatch.matchScore
);
      result.job.matchingSkills =
        result.aiMatch.matchingSkills;

      result.job.missingSkills =
        result.aiMatch.missingSkills;

      result.job.matchReasons =
        result.aiMatch.matchReasons;
    }

    console.log(
      `[Thali/AI] Completed ${
        Math.min(
          i + AI_CONCURRENCY,
          candidateJobs.length
        )
      }/${candidateJobs.length}`
    );
  }

  /*
   * --------------------------------
   * FILTER MATCHED JOBS
   * --------------------------------
   */

  const matchedJobs =
  candidateJobs.filter(
    (job) =>
      (job.matchScore ?? 0) >=
      MIN_MATCH_SCORE
  );

  console.log(
    `[Thali/AI] Jobs passing ${MIN_MATCH_SCORE}% threshold: ${matchedJobs.length}/${candidateJobs.length}`
  );

  /*
   * --------------------------------
   * SORT
   * --------------------------------
   *
   * Newer jobs first.
   * AI match score breaks ties.
   */

  const sortedJobs =
    matchedJobs.sort(
      (a, b) => {
        const postedAtDifference =
          new Date(b.postedAt).getTime() -
          new Date(a.postedAt).getTime();

        if (postedAtDifference !== 0) {
          return postedAtDifference;
        }

        return b.relevanceScore - a.relevanceScore;
      }
    );

  /*
   * --------------------------------
   * AVIORA PAGINATION
   * --------------------------------
   */

  const startIndex =
    (appPage - 1) *
    JOBS_PER_AVIORA_PAGE;

  const endIndex =
    startIndex +
    JOBS_PER_AVIORA_PAGE;

  const result =
    sortedJobs.slice(
      startIndex,
      endIndex
    );

  /*
   * --------------------------------
   * CLEAN RESULT
   * --------------------------------
   *
   * Keep:
   * - matchScore
   * - matchingSkills
   * - missingSkills
   * - matchReasons
   *
   * Remove only internal fields.
   */

  const cleanResult: ThaliJob[] =
    result.map(
      ({
        relevanceScore:
          _relevanceScore,

        jobExperience:
          _jobExperience,

        ...job
      }) => job
    );

  const hasNextPage =
    endIndex <
    sortedJobs.length;

  console.log(
    `[Thali] Total matched pool: ${sortedJobs.length}`
  );

  console.log(
    `[Thali] Returning ${cleanResult.length} jobs for Aviora page ${appPage}`
  );

  console.log(
    `[Thali] Has next page: ${hasNextPage}`
  );

  return {
    jobs: cleanResult,
    hasNextPage,
  };
}
