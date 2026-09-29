import { searchNaukriJobs } from "./naukri";

export async function searchJobs(
  candidateProfile: any,
  page = 1,
  signal?: AbortSignal
) {
  return searchNaukriJobs(
    candidateProfile,
    page,
    signal
  );
}