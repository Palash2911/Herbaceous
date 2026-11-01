const items = [
  {
    tone: "var(--teal)",
    label: "Qualifications and promotions",
  },
  {
    tone: "var(--accent)",
    label: "Workforce representation",
  },
  {
    tone: "var(--amber)",
    label: "Appointments and resignations",
  },
  {
    tone: "var(--coral)",
    label: "Employer pay gap",
  },
];

export function GraphLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: item.tone }}
          />

          <span className="label-mono text-muted">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}