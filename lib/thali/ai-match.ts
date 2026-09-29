import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { openai } from "@/lib/openai";

/* -------------------------------- */
/* AI MATCH RESULT */
/* -------------------------------- */

const MatchResultSchema = z.object({
  /*
   * AI identifies the job requirements.
   *
   * IMPORTANT:
   * These arrays must contain ALL requirements
   * found in the job, not only matched ones.
   */

  coreRequiredSkills: z.array(z.string()),

  importantSkills: z.array(z.string()),

  preferredSkills: z.array(z.string()),

  matchingSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  experienceCompatible: z.boolean(),

  matchReasons: z.array(z.string()),

  experienceReason: z.string(),
});

export type MatchResult = z.infer<
  typeof MatchResultSchema
>;

/* -------------------------------- */
/* CANDIDATE TYPES */
/* -------------------------------- */

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
    name?: string | null;
    location?: string | null;
  };

  skills?: {
    category: string;
    skills: string[];
  }[];

  education?: {
  degree: string;
  field: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
}[];

  skillProfile?: CandidateSkillProfile | null;
  
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
/* JOB TYPES */
/* -------------------------------- */

type JobInput = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  experience: string;
  skills: string[];
};

/* -------------------------------- */
/* NORMALIZE SKILL */
/* -------------------------------- */

function normalizeSkill(
  skill: string
): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[._-]/g, "")
    .replace(/\s+/g, "");
}

/* -------------------------------- */
/* MATCH SKILL */
/* -------------------------------- */

function skillsMatch(
  candidateSkill: string,
  requiredSkill: string
): boolean {
  const candidate =
    normalizeSkill(candidateSkill);

  const required =
    normalizeSkill(requiredSkill);

  if (!candidate || !required) {
    return false;
  }

  if (candidate === required) {
    return true;
  }

  /*
   * Only genuine common aliases.
   */
  const aliases: Record<
    string,
    string[]
  > = {
    nextjs: [
      "nextjs",
      "next",
    ],

    react: [
      "react",
      "reactjs",
    ],

    nodejs: [
      "nodejs",
      "node",
    ],

    javascript: [
      "javascript",
      "js",
    ],

    typescript: [
      "typescript",
      "ts",
    ],

    postgresql: [
      "postgresql",
      "postgres",
    ],

    fastapi: [
      "fastapi",
      "fastapi",
    ],
  };

  for (const [key, values] of Object.entries(
    aliases
  )) {
    const candidateIsAlias =
      values.includes(candidate);

    const requiredIsAlias =
      values.includes(required);

    if (
      candidateIsAlias &&
      requiredIsAlias
    ) {
      return true;
    }
  }

  return false;
}

/* -------------------------------- */
/* CALCULATE MATCH SCORE */
/* -------------------------------- */

function calculateMatchScore(
  matchingSkills: string[],
  coreRequiredSkills: string[],
  importantSkills: string[],
  preferredSkills: string[],
  experienceCompatible: boolean
): number {
  /*
   * --------------------------------
   * 1. REMOVE DUPLICATES
   * --------------------------------
   */

  const used = new Set<string>();

  const core = coreRequiredSkills.filter((skill) => {
    const normalized = normalizeSkill(skill);

    if (!normalized || used.has(normalized)) {
      return false;
    }

    used.add(normalized);
    return true;
  });

  const important = importantSkills.filter((skill) => {
    const normalized = normalizeSkill(skill);

    if (!normalized || used.has(normalized)) {
      return false;
    }

    used.add(normalized);
    return true;
  });

  const preferred = preferredSkills.filter((skill) => {
    const normalized = normalizeSkill(skill);

    if (!normalized || used.has(normalized)) {
      return false;
    }

    used.add(normalized);
    return true;
  });

  /*
   * --------------------------------
   * 2. NO REQUIREMENTS = NO MATCH
   * --------------------------------
   */

  const totalRequirements =
    core.length +
    important.length +
    preferred.length;

  if (totalRequirements === 0) {
    return 0;
  }

  /*
   /* -------------------------------- */
/* 3. REQUIREMENT MATCH */
/* -------------------------------- */

  const CORE_WEIGHT = 4;
  const IMPORTANT_WEIGHT = 2;
  const PREFERRED_WEIGHT = 1;

  const totalRequirementWeight =
    core.length * CORE_WEIGHT +
    important.length * IMPORTANT_WEIGHT +
    preferred.length * PREFERRED_WEIGHT;

  let matchedRequirementWeight = 0;

  /*
   * CORE
   */

  for (const requiredSkill of core) {
    const matched = matchingSkills.some(
      (matchingSkill) =>
        skillsMatch(
          matchingSkill,
          requiredSkill
        )
    );

    if (matched) {
      matchedRequirementWeight += CORE_WEIGHT;
    }
  }

  /*
   * IMPORTANT
   */

  for (const requiredSkill of important) {
    const matched = matchingSkills.some(
      (matchingSkill) =>
        skillsMatch(
          matchingSkill,
          requiredSkill
        )
    );

    if (matched) {
      matchedRequirementWeight +=
        IMPORTANT_WEIGHT;
    }
  }

  /*
   * PREFERRED
   */

  for (const requiredSkill of preferred) {
    const matched = matchingSkills.some(
      (matchingSkill) =>
        skillsMatch(
          matchingSkill,
          requiredSkill
        )
    );

    if (matched) {
      matchedRequirementWeight +=
        PREFERRED_WEIGHT;
    }
  }

  const requirementMatch =
    totalRequirementWeight > 0
      ? (matchedRequirementWeight /
          totalRequirementWeight) *
        100
      : 0;

  /*
   * --------------------------------
   * 4. EXPERIENCE MATCH
   * --------------------------------
   *
   * Compatible = 100
   * Incompatible = 0
   *
   * Experience contributes 20%.
   */

  const experienceMatch =
    experienceCompatible ? 100 : 0;

  /*
   * --------------------------------
   * 5. FINAL SCORE
   * --------------------------------
   *
   * Technical = 80%
   * Experience = 20%
   */

  let finalScore =
  requirementMatch * 0.8 +
  experienceMatch * 0.2;

  /*
   * --------------------------------
   * 6. PREVENT 100% TOO EASILY
   * --------------------------------
   *
   * A job with only one or two requirements
   * should not automatically become 100%.
   *
   * If every requirement is matched and
   * experience is compatible, give a small
   * realism cap based on requirement depth.
   */

  if (
    requirementMatch === 100 &&
    experienceCompatible
  ) {
    if (totalRequirements === 1) {
      finalScore = Math.min(finalScore, 85);
    } else if (totalRequirements === 2) {
      finalScore = Math.min(finalScore, 90);
    } else if (totalRequirements === 3) {
      finalScore = Math.min(finalScore, 95);
    }
  }

  /*
   * --------------------------------
   * 7. EXPERIENCE MISMATCH CAP
   * --------------------------------
   *
   * Even excellent technical matching
   * should not look like a perfect fit
   * when the experience requirement is
   * incompatible.
   */

  if (!experienceCompatible) {
    finalScore = Math.min(
      finalScore,
      60
    );
  }

  return Math.round(finalScore);
}
/* -------------------------------- */
/* AI JOB MATCHING */
/* -------------------------------- */

export async function analyzeJobMatch(
  candidate: CandidateProfile,
  job: JobInput
): Promise<MatchResult & {
  matchScore: number;
}> {
  const skillProfile =
    candidate.skillProfile || {
      primarySkills: [],
      secondarySkills: [],
      skillEvidence: [],
      aliases: [],
    };

  const candidateExperience =
    candidate.experience || [];

  const response =
    await openai.responses.parse({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "system",

          content: `
You are Aviora's AI job requirement analyzer.

Your job is NOT to decide an arbitrary percentage.

Your job is to carefully identify the requirements
of the job and determine which requirements are
actually supported by the candidate.

Aviora will calculate the final match percentage
programmatically.

Therefore:

DO NOT invent a match score.

DO NOT return a percentage.

Focus on accurate requirement extraction and
candidate evidence.

--------------------------------
CANDIDATE SKILL PROFILE

PRIMARY SKILLS:

These are the candidate's strongest documented
professional skills.

They may be technical or non-technical depending
on the candidate's profession.

SECONDARY SKILLS:

These are documented professional skills with
weaker or less extensive evidence.

SKILL EVIDENCE:

This shows where the resume supports a skill.

ALIASES:

These are genuine alternative names for the same
technology.

Only use genuine aliases.

--------------------------------
CANDIDATE EXPERIENCE
--------------------------------

Use only documented experience.

Consider:

- roles
- companies
- projects
- technologies
- responsibilities
- duration
- documented evidence

Do NOT invent experience.

A technology listed in the candidate profile does
not automatically mean professional experience.

--------------------------------
JOB ANALYSIS
--------------------------------

Analyze the COMPLETE job title and description.

Identify all meaningful job requirements relevant to performing the role.

This is NOT limited to software or technology jobs.

Depending on the profession, requirements may include:

- technical skills
- software and tools
- engineering methods
- machinery or equipment
- design tools
- domain knowledge
- certifications
- industry standards
- business skills
- analytical skills
- communication skills
- operational skills
- functional responsibilities
- professional qualifications
- role-specific knowledge

Examples of requirements include:

- programming languages
- frameworks
- databases
- engineering software
- CAD/CAE tools
- machinery and equipment
- manufacturing processes
- accounting systems
- business tools
- analytics tools
- certifications
- industry standards
- domain knowledge
- methodologies
- functional responsibilities
- role-specific skills

The categories depend on the job.
Do not assume the job is a software engineering role.

Do not treat every technology mentioned casually
in the description as a requirement.

--------------------------------
CORE REQUIRED
--------------------------------

Put requirements here when they are:

- explicitly required
- mandatory
- must-have
- essential
- core
- key requirement
- central to performing the role
- strongly required by the responsibility

These requirements have the highest importance.

--------------------------------
IMPORTANT
--------------------------------

Put requirements here when they are clearly
relevant to the role but are less central than
the core requirements.

--------------------------------
PREFERRED
--------------------------------

Put requirements here when the job explicitly
describes them as:

- preferred
- good to have
- nice to have
- bonus
- optional
- plus
- advantage

--------------------------------
VERY IMPORTANT
--------------------------------

The three requirement arrays must contain ALL meaningful
job requirements identified from the job, regardless of
whether they are technical, professional, educational,
credential-related, or domain-specific.

Do NOT put only matching requirements there.

For example, if a job requires:

Core:
React
Next.js
AWS

and the candidate has:

React
Next.js

Then:

coreRequiredSkills:

[
  "React",
  "Next.js",
  "AWS"
]

matchingSkills:

[
  "React",
  "Next.js"
]

missingSkills:

[
  "AWS"
]

This is extremely important.

--------------------------------
SKILL MATCHING
--------------------------------

Only mark a skill as matching when the candidate
has genuine evidence.

Exact matches are valid.

Genuine aliases are valid.

Examples:

Next.js = NextJS
React = React.js
Node.js = NodeJS
JavaScript = JS
PostgreSQL = Postgres
FastAPI = Fast API

Different technologies are NOT equivalent.

React != Angular

React != WordPress

Next.js != WordPress

Python != PHP

Java != JavaScript

PostgreSQL != MySQL

Flutter != React Native

React != Vue

Node.js != Django

Firebase != Supabase

Do not infer missing technologies from related
technologies.

--------------------------------
MATCHING SKILLS
--------------------------------

matchingSkills must contain ONLY job requirements
for which the candidate has genuine evidence.

The names should correspond to the requirement
names used in the three requirement arrays.

--------------------------------
MISSING SKILLS
--------------------------------

missingSkills must contain meaningful requirements
from the job for which the candidate has no
documented evidence.

Do not include irrelevant technologies.

--------------------------------
EXPERIENCE
--------------------------------

Determine whether the candidate's documented
experience is compatible with the job.

If the job does not specify a clear minimum
experience requirement:

experienceCompatible = true

If the job requires:

0 years
0-1 years
freshers
fresh graduate
entry level
or equivalent:

A fresher candidate can be compatible.

If the job requires significantly more experience
than the candidate has:

experienceCompatible = false.

Do not invent an experience requirement.

--------------------------------
MATCH REASONS
--------------------------------

Give concise factual reasons.

Examples:

"Candidate has documented Next.js experience."

"Candidate has PostgreSQL experience."

"AWS is a core requirement but is not documented
in the candidate profile."

"PHP is required and no PHP experience is documented."

Do not exaggerate.

--------------------------------
FINAL RULE
--------------------------------

Do NOT return a score.

Aviora will calculate the score from:

CORE_REQUIRED = 4 points

IMPORTANT = 2 points

PREFERRED = 1 point

Only the job's requirements determine the score.

The number of technologies in the candidate's resume
must NOT increase the score.

Return only the structured result.
          `.trim(),
        },

        {
          role: "user",

          content: JSON.stringify({
            candidate: {
              skillProfile,

              originalSkills:
                candidate.skills || [],

              education:
  candidate.education || [],

              experience:
                candidateExperience,

              location:
                candidate.personal?.location ||
                null,
            },

            job: {
              title:
                job.title,

              company:
                job.company,

              location:
                job.location,

              employmentType:
                job.employmentType,

              experience:
                job.experience,

              skills:
                job.skills,

              description:
                job.description,
            },
          }),
        },
      ],

      text: {
        format: zodTextFormat(
          MatchResultSchema,
          "job_match"
        ),
      },
    });

  if (!response.output_parsed) {
    throw new Error(
      "AI match analysis returned no parsed result"
    );
  }

  const result =
    response.output_parsed;

console.log(
  "[Thali/AI] Requirement analysis:",
  JSON.stringify(
    result,
    null,
    2
  )
);

  /*
   * --------------------------------
   * DETERMINISTIC SCORE
   * --------------------------------
   *
   * The AI does NOT control the score.
   */

  const matchScore =
    calculateMatchScore(
      result.matchingSkills,

      result.coreRequiredSkills,

      result.importantSkills,

      result.preferredSkills,

      result.experienceCompatible
    );

  return {
    ...result,
    matchScore,
  };
}