import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useId, useRef, useState } from "react";

export function handleRovingKeys(event) {
  const keys = [
    "ArrowRight",
    "ArrowLeft",
    "ArrowDown",
    "ArrowUp",
    "Home",
    "End",
  ];
  if (!keys.includes(event.key)) return;
  const container = event.currentTarget;
  const items = Array.from(
    container.querySelectorAll("button[data-roving]:not([disabled])"),
  );
  if (items.length === 0) return;
  const current = items.indexOf(document.activeElement);
  if (current === -1) return;
  event.preventDefault();
  let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowDown")
    next = (current + 1) % items.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    next = (current - 1 + items.length) % items.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = items.length - 1;
  items[next]?.focus();
}

export function QuestionHeader({ question, hint, badge }) {
  return (
    <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[8px]">
      <div>
        <h2 className="text-[22px] leading-tight font-semibold sm:text-[26px]">
          {question}
        </h2>
        {hint ? (
          <p className="mt-[4px] text-[14px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {badge}
    </div>
  );
}

export function MonoLabel({ children, className }) {
  return (
    <span className={cn("label-mono text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export function OptionCard({
  selected,
  dimmed,
  icon,
  label,
  className,
  ...rest
}) {
  return (
    <button
      type="button"
      data-roving
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-[88px] flex-col items-start justify-between gap-[8px] rounded-[16px] border p-[16px] text-left transition-colors",
        "bg-[var(--field-bg)]/70 hover:border-[var(--primary)]",
        "focus-visible:focus-visible-ring",
        selected && "option-tint",
        dimmed && !selected && "opacity-45",
        className,
      )}
      {...rest}
    >
      <span className="text-primary [&_svg]:size-[20px]">{icon}</span>
      <span className="pr-[20px] text-[15px] leading-snug font-medium">
        {label}
      </span>
      {selected ? <CheckBadge /> : null}
    </button>
  );
}

function CheckBadge() {
  return (
    <span className="absolute top-[12px] right-[12px] grid size-[20px] place-items-center rounded-full bg-primary text-primary-foreground">
      <Check className="size-[13px]" aria-hidden />
    </span>
  );
}

export function OptionRow({ selected, label, detail, className, ...rest }) {
  return (
    <button
      type="button"
      data-roving
      aria-pressed={selected}
      className={cn(
        "relative w-full rounded-[16px] border border-l-[3px] px-[16px] py-[16px] text-left transition-colors",
        "bg-[var(--field-bg)]/70 hover:border-[var(--primary)]",
        "focus-visible:focus-visible-ring",
        selected
          ? "option-tint border-l-[3px] border-l-[var(--primary)]"
          : "border-l-transparent",
        className,
      )}
      {...rest}
    >
      <span className="block pr-[28px] text-[15px] font-medium">{label}</span>
      {detail ? (
        <span className="mt-[4px] block text-[13px] text-muted-foreground">
          {detail}
        </span>
      ) : null}
      {selected ? <CheckBadge /> : null}
    </button>
  );
}

export function OptionChip({ selected, dimmed, label, className, ...rest }) {
  return (
    <button
      type="button"
      data-roving
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-[8px] rounded-full border px-[16px] py-[10px] text-[14px] transition-colors",
        "bg-[var(--field-bg)]/70 hover:border-[var(--primary)]",
        "focus-visible:focus-visible-ring",
        selected && "option-tint font-medium",
        dimmed && !selected && "opacity-45",
        className,
      )}
      {...rest}
    >
      {selected ? (
        <Check className="size-[14px] text-primary" aria-hidden />
      ) : null}
      {label}
    </button>
  );
}

export function TextField({
  label,
  value,
  onValueChange,
  placeholder,
  maxLength,
  inputMode,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="label-mono mb-2 block text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "field-base placeholder:text-muted-foreground/70",
          focused && "field-base-focus",
        )}
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onValueChange,
  placeholder,
  maxLength,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="label-mono mb-2 block text-muted-foreground"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "field-base min-h-[120px] resize-y py-[14px] placeholder:text-muted-foreground/70",
          focused && "field-base-focus",
        )}
        style={{ height: "auto" }}
      />
      <div className="mt-[4px] text-right">
        <MonoLabel>
          {value.length} / {maxLength}
        </MonoLabel>
      </div>
    </div>
  );
}

export function PrimaryButton({ className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[48px] items-center justify-center gap-[8px] rounded-full bg-primary px-[24px] text-[15px] font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-opacity",
        "hover:opacity-90 focus-visible:focus-visible-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[48px] items-center justify-center gap-[8px] rounded-full border px-[20px] text-[15px] text-muted-foreground transition-colors",
        "hover:text-foreground focus-visible:focus-visible-ring disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function OptionGroup({ label, multi, className, children }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      aria-multiselectable={multi}
      onKeyDown={handleRovingKeys}
      className={className}
    >
      {children}
    </div>
  );
}
