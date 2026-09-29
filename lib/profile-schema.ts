import { z } from "zod";

export const CandidateProfileSchema = z.object({
  personal: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    github: z.string(),
    portfolio: z.string(),
  }),

  summary: z.string(),

  education: z.array(
    z.object({
      degree: z.string(),
      field: z.string(),
      institution: z.string(),
      location: z.string(),
      startYear: z.string(),
      endYear: z.string(),
      grade: z.string(),
    })
  ),

  skills: z.array(
    z.object({
      category: z.string(),
      skills: z.array(z.string()),
    })
  ),

  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.array(z.string()),
      technologies: z.array(z.string()),
    })
  ),

  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string(),
      highlights: z.array(z.string()),
    })
  ),

  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      url: z.string(),
    })
  ),

  achievements: z.array(z.string()),
});

export type CandidateProfile = z.infer<
  typeof CandidateProfileSchema
>;