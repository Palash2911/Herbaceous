/**
 * Each value is women's share of a separate WGEA population or movement
 * category. These rows are a comparison, not a sequential cohort funnel.
 */
export const workforceMovementRows = [
  {
    id: "workforce",
    label: "STEM-industry workforce",
    value: 36.5,
    detail: "Women's share of total workforce headcount.",
    tone: "teal",
  },
  {
    id: "promotions",
    label: "Promotions",
    value: 39.3,
    detail: "Women's share of recorded promotions.",
    tone: "accent",
  },
  {
    id: "external-appointments",
    label: "External appointments",
    value: 40.9,
    detail: "Women's share of recorded external appointments.",
    tone: "amber",
  },
  {
    id: "resignations",
    label: "Resignations",
    value: 39.9,
    detail: "Women's share of recorded resignations.",
    tone: "coral",
  },
];

export const workforceMovementSource =
  "Source: WGEA statutory census FY2024-25, four STEM ANZSIC divisions";

export const workforceMovementNote =
  "These percentages describe separate categories in the same reporting year; they are not sequential stages or a cohort flow.";