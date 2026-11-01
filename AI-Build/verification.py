"""
Herbaceous - Mentor Credential Verification (Calculator + Verify)
FIT5120 TA06 - AI/ML Build

Pipeline per Palash (7 Sep): OCR -> Resume -> Extract -> Calculator -> Verify
This module implements the CALCULATOR + VERIFY steps only:
    - Calculator: sum a mentor candidate's total years of work experience
      from the start/end dates of each employment period on their resume,
      counted in whole months. Each period is a half-open month interval
      [start, end): the start month counts, and an end given as YYYY-MM or
      YYYY-MM-DD runs through that month. A year-only date means January of
      that year, so "2018" to "2020" is 24 months. Overlapping or touching
      periods are merged (counted once, from earliest start to latest end of
      the group) - per team decision, 7 Sep.
    - Verify: compare total months against the mentor eligibility threshold
      (2 years = 24 months) and return an explainable eligible/not-eligible
      result. Years are shown floored to one decimal, so a displayed 2.0 or
      more always means eligible.

OCR + Extract (turning an uploaded resume into the `employment_history`
list of {start_date, end_date} this module expects) are a separate, earlier
step in the pipeline. Dates that are missing, unreadable, start in the
future or end before they start are skipped and only counted, never echoed.

IMPORTANT LIMITATION - flag this to the team:
This is an automated check of the dates on the submitted resume. It only
checks whether those dates add up to the 2-year threshold and cannot
confirm the dates or roles are genuine.
"""

import re
from datetime import date

MENTOR_ELIGIBILITY_THRESHOLD_YEARS = 2
_THRESHOLD_MONTHS = MENTOR_ELIGIBILITY_THRESHOLD_YEARS * 12

_DATE_PATTERN = re.compile(r"(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?")

_SKIP_REASON_TEXT = {
    "unreadable": "a missing or unreadable date",
    "future_start": "a start date in the future",
    "end_before_start": "an end date before the start date",
}


def _month_index(year, month):
    return year * 12 + month - 1


def _parse_month(value, is_end, current_month):
    """Accepts 'YYYY', 'YYYY-MM', 'YYYY-MM-DD' or 'present' (case and
    surrounding whitespace ignored) and returns a month index.
    Start: 'YYYY' is January of that year, otherwise the month given.
    End (exclusive): 'YYYY' is January of that year, 'YYYY-MM' and
    'YYYY-MM-DD' are the month after the one given, 'present' is the month
    after the current month. Anything else, including None, returns None."""
    if not isinstance(value, str):
        return None
    text = value.strip().lower()
    if text == "present":
        return current_month + 1 if is_end else current_month
    match = _DATE_PATTERN.fullmatch(text)
    if not match:
        return None
    year_text, month_text, day_text = match.groups()
    year = int(year_text)
    month = int(month_text) if month_text else 1
    try:
        date(year, month, int(day_text) if day_text else 1)
    except ValueError:
        return None
    index = _month_index(year, month)
    return index + 1 if is_end and month_text else index


def _collect_periods(employment_history, current_month):
    periods = []
    skipped = {}
    for entry in employment_history:
        if isinstance(entry, dict):
            start = _parse_month(entry.get("start_date"), False, current_month)
            end = _parse_month(entry.get("end_date"), True, current_month)
        else:
            start = end = None
        if start is None or end is None:
            reason = "unreadable"
        elif start > current_month:
            reason = "future_start"
        else:
            end = min(end, current_month + 1)
            reason = "end_before_start" if end < start else None
        if reason:
            skipped[reason] = skipped.get(reason, 0) + 1
        else:
            periods.append((start, end))
    return periods, skipped


def merge_periods(periods):
    """Merges overlapping or touching [start, end) month intervals into
    continuous spans, so overlapping jobs aren't double-counted.

    Rule (confirmed with team, 7 Sep): if two periods overlap, count that
    group only once - from its earliest start to its latest end."""
    periods = sorted(periods, key=lambda p: p[0])

    merged = []
    for start, end in periods:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def calculate_total_experience_months(employment_history, today=None):
    """Returns (total_months, merged_periods, skipped_by_reason).
    total_months: int, whole months across the merged periods.
    merged_periods: the list of [start, end) month-index spans actually counted - kept
    for the explainable breakdown, so this never returns a bare number.
    skipped_by_reason: {reason: count} for entries that could not be used."""
    today = today or date.today()
    current_month = _month_index(today.year, today.month)
    periods, skipped = _collect_periods(employment_history, current_month)
    merged = merge_periods(periods)
    total_months = sum(end - start for start, end in merged)
    return total_months, merged, skipped


def verify_mentor_eligibility(candidate):
    """candidate expects:
    {
        "employment_history": [
            {"start_date": "2018-01", "end_date": "2020-01"},
            {"start_date": "2020-01", "end_date": "present"}
        ]
    }
    Returns an explainable result - never a bare true/false, matching the
    same "always explain the reasons" pattern used in the matching engine.
    Counts and reasons only - no dates leave this function."""
    history = candidate.get("employment_history") if isinstance(candidate, dict) else None
    if not isinstance(history, list):
        history = []
    total_months, merged, skipped = calculate_total_experience_months(history)
    total_years = (total_months * 10 // 12) / 10
    skipped_count = sum(skipped.values())
    eligible = total_months >= _THRESHOLD_MONTHS

    reasons = [
        f"Total experience calculated: {total_years} years, from "
        f"{len(history) - skipped_count} role(s) on the submitted resume "
        f"merged into {len(merged)} continuous period(s) (overlaps counted once)."
    ]
    if skipped:
        details = ", ".join(
            f"{skipped[key]} with {text}"
            for key, text in _SKIP_REASON_TEXT.items()
            if key in skipped
        )
        reasons.append(f"{skipped_count} role(s) skipped: {details}.")
    if eligible:
        reasons.append(f"Meets the {MENTOR_ELIGIBILITY_THRESHOLD_YEARS}-year mentor threshold.")
    else:
        shortfall = -(-(_THRESHOLD_MONTHS - total_months) * 10 // 12) / 10
        reasons.append(
            f"Below the {MENTOR_ELIGIBILITY_THRESHOLD_YEARS}-year threshold "
            f"(needs {shortfall} more year(s))."
        )
    reasons.append(
        "This is an automated check of the dates on the submitted resume. "
        "It cannot confirm the dates or roles are genuine."
    )

    return {
        "eligible": eligible,
        "total_experience_years": total_years,
        "threshold_years": MENTOR_ELIGIBILITY_THRESHOLD_YEARS,
        "periods_counted": len(merged),
        "skipped_entries": skipped_count,
        "reasons": reasons,
    }
