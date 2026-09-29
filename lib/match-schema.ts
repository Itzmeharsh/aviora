import { z } from "zod";

export const MatchSchema = z.object({
  matchingSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  matchingTechnologies: z.array(z.string()),

  relevantExperience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      reason: z.string(),
    })
  ),

  relevantProjects: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
    })
  ),

  educationMatch: z.array(z.string()),

  importantKeywords: z.array(z.string()),

  tailoringSuggestions: z.array(z.string()),

  warnings: z.array(z.string()),
});

export type MatchResult = z.infer<typeof MatchSchema>;