export const experienceOptions = [
  { id: "early", label: "Early (0-2 yrs)" },
  { id: "mid", label: "Mid (3-7 yrs)" },
  { id: "senior", label: "Senior (8+ yrs)" },
];

export function bucketForSeniority(seniority) {
  if (seniority == null) return null;
  if (seniority <= 2) return "early";
  if (seniority <= 7) return "mid";
  return "senior";
}
