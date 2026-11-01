import { useRef } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Check, Info, SlidersHorizontal, Zap } from "lucide-react";
import { experienceOptions } from "@/components/dashboard/mentee/matching/experienceBuckets";
import { fieldStep } from "@/content/onboarding";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "top", label: "Top matches" },
  { id: "all", label: "All mentors" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0";

function FilterChip({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors duration-150",
        focusRing,
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-[var(--hairline)] bg-[var(--surface-soft)] text-muted-foreground hover:border-accent/30 hover:text-foreground",
      )}
    >
      {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function ModeControl({ browseAll, onChange }) {
  const activeId = browseAll ? "all" : "top";
  const buttonsRef = useRef({});

  const select = (id) => {
    onChange(id === "all");
    buttonsRef.current[id]?.focus();
  };

  const onKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    select(activeId === "top" ? "all" : "top");
  };

  return (
    <div
      role="radiogroup"
      aria-label="Mode"
      onKeyDown={onKeyDown}
      className="inline-flex h-9 shrink-0 items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] p-0.5"
    >
      {MODES.map((mode) => {
        const active = mode.id === activeId;
        return (
          <button
            key={mode.id}
            ref={(node) => {
              buttonsRef.current[mode.id] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(mode.id)}
            className={cn(
              "relative h-8 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors duration-150",
              focusRing,
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="matching-mode-indicator"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FilterRow({ label, children, scrollOnMobile = false }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[var(--hairline)] pt-3 sm:flex-row sm:items-start sm:gap-4">
      <span className="label-caps shrink-0 sm:w-28 sm:pt-2.5">{label}</span>
      <div
        className={cn(
          "flex min-w-0 gap-2",
          scrollOnMobile
            ? "-mx-1 overflow-x-auto py-0.5 pr-10 pl-1 [mask-image:linear-gradient(to_right,black_82%,transparent)] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
            : "flex-wrap",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function activeFilterCount(filters, openOnly) {
  return [filters.field, filters.experience, filters.verified, openOnly].filter(
    Boolean,
  ).length;
}

export function MatchingFilterPanel({
  filters,
  onFiltersChange,
  browseAll,
  onBrowseAllChange,
  openOnly,
  onOpenOnlyChange,
  notice,
}) {
  const setFilter = (key, next) => onFiltersChange({ ...filters, [key]: next });
  const activeCount = activeFilterCount(filters, openOnly);

  const clearAll = () => {
    onFiltersChange({});
    onOpenOnlyChange(false);
  };

  return (
    <div className="glass space-y-3 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
          Filters
        </h2>
        {activeCount > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAll}
              className={cn(
                "rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                focusRing,
              )}
            >
              Clear all
            </button>
            <span
              className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white dark:bg-[#5b3be8]"
              aria-label={`${activeCount} active ${activeCount === 1 ? "filter" : "filters"}`}
            >
              {activeCount}
            </span>
          </div>
        ) : null}
      </div>

      <FilterRow label="View">
        <ModeControl browseAll={browseAll} onChange={onBrowseAllChange} />
      </FilterRow>

      <FilterRow label="Show only">
        <FilterChip
          active={openOnly}
          icon={Zap}
          onClick={() => onOpenOnlyChange(!openOnly)}
        >
          Open availability
        </FilterChip>
        <FilterChip
          active={!!filters.verified}
          icon={BadgeCheck}
          onClick={() => setFilter("verified", filters.verified ? null : true)}
        >
          Verified only
        </FilterChip>
      </FilterRow>

      <FilterRow label="Experience">
        {experienceOptions.map((option) => {
          const active = filters.experience === option.id;
          return (
            <FilterChip
              key={option.id}
              active={active}
              onClick={() => setFilter("experience", active ? null : option.id)}
            >
              {option.label}
            </FilterChip>
          );
        })}
      </FilterRow>

      <FilterRow label="Field" scrollOnMobile>
        {fieldStep.options.map((option) => {
          const active = filters.field === option.id;
          return (
            <FilterChip
              key={option.id}
              active={active}
              onClick={() => setFilter("field", active ? null : option.id)}
            >
              {option.label}
            </FilterChip>
          );
        })}
      </FilterRow>

      {notice ? (
        <div className="border-t border-[var(--hairline)] pt-3">
          <div
            className="flex flex-col gap-3 rounded-xl border border-accent/20 bg-accent/[0.09] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            aria-live="polite"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0">
                {notice.message ? (
                  <p className="text-sm text-foreground">{notice.message}</p>
                ) : null}
                {notice.detail ? (
                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      notice.message && "mt-0.5",
                    )}
                  >
                    {notice.detail}
                  </p>
                ) : null}
              </div>
            </div>
            {notice.action ? (
              <button
                type="button"
                onClick={notice.action.onClick}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center justify-center self-start rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:self-center",
                  focusRing,
                )}
              >
                {notice.action.label}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
