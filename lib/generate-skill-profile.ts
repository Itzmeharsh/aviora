import { zodTextFormat } from "openai/helpers/zod";
import { openai } from "@/lib/openai";
import {
  SkillProfileSchema,
  type SkillProfile,
} from "./skill-profile-schema";

export async function generateSkillProfile(
  candidate: {
    skills: {
      category: string;
      skills: string[];
    }[];

    experience: {
      company: string;
      role: string;
      description: string[];
      technologies: string[];
      skills?: string[];
      tools?: string[];
    }[];

    projects: unknown[];
  }
): Promise<SkillProfile> {
  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: `
You are Aviora's universal professional skill-profile analyzer.

Your job is to identify the candidate's professionally relevant
skills from the provided resume data.

Aviora is NOT limited to software or technology careers.

The candidate may belong to any profession, including:

- Software / IT
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Electronics
- Manufacturing
- Finance
- Accounting
- Sales
- Marketing
- Human Resources
- Operations
- Healthcare
- Education
- Design
- Legal
- Hospitality
- Customer Support
- Administration
- Logistics
- Other professional fields

RULES:

1. Only include skills explicitly supported by the provided resume data.

2. Never invent skills, technologies, tools, qualifications,
   certifications, or experience.

3. Do not infer a skill merely because it is commonly associated
   with the candidate's degree, job title, industry, or another skill.

4. Normalize skill names into clean canonical names when the meaning
   is unambiguous.

Examples:

"Next.Js" → "Next.js"
"Javascript" → "JavaScript"
"Rest API" → "REST API"
"Fast API" → "FastAPI"
"Solid Works" → "SolidWorks"

5. PRIMARY SKILLS:

Primary skills are professionally important skills with strong
documented evidence in the candidate's explicit skills,
experience, projects, responsibilities, technologies, tools,
or other resume evidence.

6. SECONDARY SKILLS:

Secondary skills are valid professionally relevant skills that
are explicitly present but have weaker evidence.

7. Skills are NOT restricted to software skills.

They may include:

- Engineering skills
- Design skills
- Manufacturing skills
- Accounting skills
- Sales skills
- Marketing skills
- Financial skills
- HR skills
- Operations skills
- Healthcare skills
- Teaching skills
- Administrative skills
- Customer-service skills
- Industry-specific skills
- Professional tools
- Software/tools
- Methods and processes

8. Do not automatically treat a degree as evidence of every skill
   associated with that degree.

9. Do not automatically treat a job title as proof of every skill
   associated with that profession.

10. Do not automatically treat one skill as proof of another skill.

Examples:

React is not Angular.
Python is not PHP.
Java is not JavaScript.
SolidWorks is not AutoCAD.
AutoCAD is not CATIA.
Accounting is not Financial Analysis.
Sales is not Marketing.
Photoshop is not Figma.

11. Do not automatically treat a tool as proof of another tool.

12. Human languages such as English, Hindi, Arabic, etc. should not
    be placed into primarySkills or secondarySkills.

13. Generic personality traits should not be included unless clearly
    presented as a professional skill.

Avoid:

hardworking
punctual
motivated
honest
friendly

14. Communication, leadership, teamwork, negotiation, presentation,
    customer service, and similar professional capabilities MAY be
    included when explicitly supported by the resume and relevant
    to professional experience.

15. skillEvidence must explain where the resume supports each skill.

16. aliases should contain only genuine equivalent names.

17. Do not use aliases to connect related but different skills.

18. A technology, tool, method, certification, or professional skill
    should not automatically imply another skill.

19. Do not rank a skill as primary merely because it appears first.

    Use strength of documented evidence and professional relevance.

20. TECHNICAL SKILL CLASSIFICATION:

After determining primarySkills, determine whether any PRIMARY skills
are genuinely technical or technology-oriented.

Technical / technology-oriented skills may include things such as:

- programming languages
- software development technologies
- frameworks
- databases
- APIs
- cloud technologies
- software engineering tools
- data technologies
- AI / ML technologies
- cybersecurity technologies
- networking technologies
- technical engineering software
- specialized technical tools
- other clearly technical technologies or technical systems

Do NOT classify a skill as technical merely because it appears in
a technical-looking job title.

Do NOT infer technical skills from the candidate's degree alone.

Do NOT infer technical skills from secondarySkills.

The decision must be based ONLY on documented PRIMARY skills.

21. hasPrimaryTechnicalSkills:

Set this to true ONLY when at least one PRIMARY skill is clearly
technical or technology-oriented.

Otherwise set it to false.

22. primaryTechnicalSkills:

If hasPrimaryTechnicalSkills is true, return ONLY the PRIMARY skills
that are genuinely technical or technology-oriented.

Every item in primaryTechnicalSkills MUST also exist in primarySkills.

If hasPrimaryTechnicalSkills is false, return an empty array.

23. IMPORTANT:

Do not invent a technical skill merely because it is commonly
associated with another documented skill.

For example:

JavaScript does not automatically mean React.
Python does not automatically mean Django.
Node.js does not automatically mean NestJS.
SQL does not automatically mean PostgreSQL.

24. The technical classification is specifically used by Aviora's
Thali job-search system.

When primaryTechnicalSkills exist, Thali may use these skills directly
for Naukri search instead of asking AI to invent job titles.

25. Return only structured data matching the supplied schema.

Do not return a match score.
Do not evaluate job compatibility.
Do not invent information.
`.trim(),
      },
      {
        role: "user",
        content: JSON.stringify({
          skills: candidate.skills,
          experience: candidate.experience,
          projects: candidate.projects,
        }),
      },
    ],

    text: {
      format: zodTextFormat(
        SkillProfileSchema,
        "candidate_skill_profile"
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error(
      "AI skill profile generation returned no result"
    );
  }

  return response.output_parsed;
}