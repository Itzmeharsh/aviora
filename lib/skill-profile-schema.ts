import { z } from "zod";

export const SkillProfileSchema = z.object({
  primarySkills: z.array(z.string()),

  secondarySkills: z.array(z.string()),

  skillEvidence: z.array(
    z.object({
      skill: z.string(),
      evidence: z.array(z.string()),
    })
  ),

  aliases: z.array(
    z.object({
      skill: z.string(),
      aliases: z.array(z.string()),
    })
  ),

  /*
   * AI determines whether the candidate's
   * PRIMARY skills contain meaningful technical/
   * technology-oriented skills.
   */
  hasPrimaryTechnicalSkills: z.boolean(),

  /*
   * Only PRIMARY skills that the AI determines
   * are genuinely technical / technology-oriented.
   *
   * These are used directly by Thali for Naukri
   * search when hasPrimaryTechnicalSkills = true.
   */
  primaryTechnicalSkills: z.array(z.string()),
});

export type SkillProfile = z.infer<
  typeof SkillProfileSchema
>;