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
});

export type SkillProfile = z.infer<
  typeof SkillProfileSchema
>;