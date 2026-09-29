export type ThaliJob = {
  id: string;

  title: string;
  company: string;

  location: string;
  employmentType: string;

  url: string;
  source: string;

  postedAt: string;

  description: string;

  skills: string[];
  technologies: string[];

  matchScore?: number;

  matchingSkills?: string[];
  missingSkills?: string[];

  matchReasons?: string[];
};