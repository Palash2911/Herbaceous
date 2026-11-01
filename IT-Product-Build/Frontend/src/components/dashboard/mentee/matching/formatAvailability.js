import { availabilityStep } from "@/content/onboarding";

export function formatAvailability(availability) {
  if (!availability) return "Availability not set";

  const cadenceLabel = availabilityStep.cadenceOptions.find(
    (option) => option.id === availability.cadence,
  )?.label;

  const timesLabel = (availability.times ?? [])
    .map(
      (time) =>
        availabilityStep.timeOptions.find(
          (option) => option.id === time,
        )?.label,
    )
    .filter(Boolean)
    .join(", ");

  if (!cadenceLabel && !timesLabel) {
    return "Availability not set";
  }

  return [cadenceLabel, timesLabel].filter(Boolean).join(" · ");
}
