import { z } from "zod";

export const JobSchema = z.object({
  title: z.string(),
  company: z.string(),

  location: z.string(),

  employmentType: z.string(),

  description: z.string(),

  responsibilities: z.array(z.string()),

  requiredSkills: z.array(z.string()),

  preferredSkills: z.array(z.string()),

  technologies: z.array(z.string()),

  educationRequirements: z.array(z.string()),

  experienceRequirements: z.array(z.string()),

  keywords: z.array(z.string()),
});

export type Job = z.infer<typeof JobSchema>;