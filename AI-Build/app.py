"""
Herbaceous - Mentor Matching Engine
FIT5120 TA06 - AI/ML Build

REVERTED 11 Sep back to the real onboarding-quiz model, after merging main
and finding the REAL backend code for it (IT-Product-Build/Backend/src/
controllers/mentee.controller.js + prisma/schema.prisma). Timeline of what
happened to this file, for anyone confused by the git history:
    - Originally built around the onboarding quiz (field/stage/goals/style/
      availability/about), matching the frontend quiz component someone
      showed me.
    - 8 Sep: team dropped free-text-driven matching entirely (about_overlap
      + Gemini dynamic reweighting removed).
    - 10 Sep: rebuilt from scratch around Vikas's mentor/mentee csv
      ("Advocacy Match" questionnaire, q1-q15) on ino's instruction.
    - 11 Sep: merged main, found the REAL live/validated backend code for
      the onboarding quiz - and found that "Advocacy" (q5_advocacy_ask
      categories: referral/introduction/nomination/endorsement/skill-sprint)
      is actually a SEPARATE downstream feature. Reverted /match back to
      the quiz model to match the real, live backend.
    - 15 Sep: confirmed with Palash - Node calls this /match endpoint
      directly over HTTP (not a code port). Rescored to actually use
      mentoringStyle/availabilityCadence/availabilityTimes (PR #17).
    - 16 Sep: Palash did a full review of the 15 Sep version and flagged
      9 real issues (interview went well, then this rewrite happened same
      day). Everything in this file from here down is a direct response to
      that review:
        1. debug=True in app.run() - Werkzeug's interactive debugger is a
           remote-code-execution hole if this ever reaches a deployed
           environment. Fixed: debug now comes from FLASK_DEBUG env var,
           defaults to False.
        2. No auth / no rate limit - anyone with the URL could hit
           /verify-from-document and burn Gemini credits per call. Fixed:
           a shared-secret header check (see AUTH section below) on every
           route except /health, plus a simple in-memory rate limiter on
           /verify-from-document specifically (the expensive one).
        3. Privacy: credential documents carry real names/degrees/
           employment history and are sent to Google (Gemini) for OCR -
           the only real personal data anywhere in this system, while the
           DMP currently says none is collected. NOT a code fix - flagged
           to whoever owns the DMP/Security Plan docs, needs writing up
           there (third-party processor, retention, consent).
        4. No goals factor - Node's scoreMentor.js weights goals at 20%
           against mentor specialisms (via a specialism->goals map) and
           this file scored nothing for it. Fixed: ported the same
           specialism->goals mapping (see SPECIALISM_GOALS below) and
           added a goals dimension.
        5. Missing mentor data scored 0 here vs Node's neutral 50 - with
           sparse mock/test mentor profiles this collapsed every score.
           Fixed: every dimension now returns NEUTRAL_SCORE (50) when the
           relevant mentor field is missing, matching Node exactly.
        6. Response shape didn't match what the frontend actually expects
           (score / reasoning string / breakdown object, from
           scoreMentor.js) - this file returned mentor_id/match_score/
           reasons[] instead. Fixed: /match now returns, per mentor,
           {mentor_id, score, breakdown, reasoning} - breakdown and
           reasoning shaped exactly like Node's scoreMentor() output (plus
           one extra "experience" factor Node doesn't have - see #7).
        7. Experience band was a hard cliff (20 yrs -> 1.0, 21 yrs -> 0.0
           for a "mid" mentee). Fixed: linear decay over a grace window
           instead of a binary cutoff - see score_experience below.
        8. No timeout/fallback if this service is slow or down - the
           Matching screen would just break. This is a NODE-side fix (the
           fetch call needs a timeout + fallback to a cached/neutral
           list), not something this file can solve by itself. Flagged to
           Palash, not yet implemented on his side as of this commit.
        9. This is rule-based, not ML - Gemini is only used in
           /verify-from-document. Wiring /match into Node swaps one
           rule-based scorer for another and adds a network hop, with no
           new ML capability. Open question for the team on what the "AI"
           in "AI matching" is actually meant to be - not something this
           file can resolve alone.
       10. Node's submitVerification stores the /verify-from-document
           response in Credential.extractedFields (the column exists in
           schema.prisma). The response carries counts and reasons only -
           no extracted dates, names or companies leave this service. See
           the docstring on /verify-from-document below for the shape.

Mentee fields (from prisma/schema.prisma MenteeProfile + the real
mentee.controller.js validation - these are the actual valid ids, not
guesses):
    field                - one of VALID_FIELDS below
    careerStage          - one of VALID_STAGES below
    mentoringStyle       - one of VALID_STYLES below (optional)
    availabilityCadence  - one of VALID_CADENCES below (optional)
    availabilityTimes    - list of VALID_TIMES ids
    goals                - list of goal tags (see SPECIALISM_GOALS below) -
                           used for the goals-vs-specialisms match
    about                - free text, <=500 chars - NOT used for matching
                           (team decision, 8 Sep), backend still stores it

Mentor fields (prisma/schema.prisma MentorProfile, post PR #17). All
camelCase to match what Prisma actually returns, since the Node backend
passes real MentorProfile rows straight through as JSON.

Integration (confirmed 15 Sep with Palash): the Node backend calls this
Flask /match endpoint directly over HTTP and passes the candidate mentor
list itself - this service has no DB connection of its own. If "mentors" is
omitted from the request body, /match falls back to MOCK_MENTORS below,
which is only there for local/manual testing (curl, no Node needed).

AUTH: set MATCHING_SERVICE_API_KEY in .env and Node must send it back as
the X-Internal-Api-Key header on every request. If the env var isn't set,
the service logs a warning and /match runs open - fine for local dev, NOT
fine for anything deployed. /verify and /verify-from-document fail closed
with 503 when it isn't set. This is a shared-secret check, not real user auth (this
service never sees end-user identity, only Node does).

Setup:
    pip install -r requirements.txt
    cp .env.example .env      # then paste your Gemini API key + a made-up
                               # MATCHING_SERVICE_API_KEY into .env
    python app.py
"""

import os
import hmac
import time
from collections import defaultdict
from functools import wraps

from flask import Flask, request, jsonify

from verification import verify_mentor_eligibility
from extraction import extract_credentials_from_document

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed yet - env vars can still come from the real env

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Gemini client - only used by the /verify-from-document OCR pipeline
# (matching doesn't use free text / embeddings at all - team decision,
# 8 Sep). Everything else in this file works fine with _gemini_client left
# as None.
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
_gemini_client = None

if GEMINI_API_KEY:
    try:
        from google import genai
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except ImportError:
        print("[gemini] google-genai not installed - run: pip install google-genai")

# ---------------------------------------------------------------------------
# Auth (added 16 Sep, Palash review item #2) - shared-secret header check.
# No new dependency: plain Flask before_request-style decorator.
# ---------------------------------------------------------------------------

MATCHING_SERVICE_API_KEY = os.environ.get("MATCHING_SERVICE_API_KEY")
if not MATCHING_SERVICE_API_KEY:
    print("[auth] MATCHING_SERVICE_API_KEY not set - /match running OPEN, "
          "/verify and /verify-from-document disabled. "
          "Fine for local dev, do NOT deploy like this.")


def _has_valid_api_key():
    if not MATCHING_SERVICE_API_KEY:
        return False
    provided = request.headers.get("X-Internal-Api-Key", "")
    return hmac.compare_digest(provided.encode(), MATCHING_SERVICE_API_KEY.encode())


def require_api_key(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not MATCHING_SERVICE_API_KEY:
            return view(*args, **kwargs)  # open mode, dev only (see warning above)
        if not _has_valid_api_key():
            return jsonify({"error": "missing or invalid X-Internal-Api-Key"}), 401
        return view(*args, **kwargs)
    return wrapped


# ---------------------------------------------------------------------------
# Rate limiting (added 16 Sep, Palash review item #2) - /verify-from-document
# is the expensive one (burns Gemini credits per call), so it gets its own
# limiter. In-memory, per-process sliding window - fine for a single dev
# instance, would need a shared store (Redis etc.) behind a real load
# balancer with multiple workers.
# ---------------------------------------------------------------------------

_rate_limit_hits = defaultdict(list)


def rate_limit(max_calls, period_seconds, exempt_when=None):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if exempt_when is not None and exempt_when():
                return view(*args, **kwargs)
            client_id = request.remote_addr
            now = time.monotonic()
            hits = _rate_limit_hits[client_id]
            while hits and now - hits[0] > period_seconds:
                hits.pop(0)
            if len(hits) >= max_calls:
                return jsonify({"error": "rate limit exceeded, try again shortly"}), 429
            hits.append(now)
            return view(*args, **kwargs)
        return wrapped
    return decorator


# ---------------------------------------------------------------------------
# Real valid ids, copied from IT-Product-Build/Backend/src/controllers/
# mentee.controller.js (11 Sep) - not guessed.
# ---------------------------------------------------------------------------

VALID_FIELDS = ["cs", "swe", "data", "ee", "me", "civil", "chemeng", "bio", "chem", "physics", "maths", "other"]
VALID_STAGES = ["undergrad", "postgrad", "recent", "early", "mid"]
VALID_STYLES = ["structured", "flexible", "handson", "bigpicture"]
VALID_CADENCES = ["weekly", "fortnightly", "monthly", "adhoc"]
VALID_TIMES = ["wdmorning", "wdafternoon", "wdevening", "weekend"]

# ---------------------------------------------------------------------------
# specialism -> goal-tag mapping, ported directly from Node's
# IT-Product-Build/Backend/src/services/matching/specialisms.js (16 Sep) so
# the goals dimension matches Node's scoring exactly rather than
# reinventing a different heuristic. Keep this in sync if that file changes.
# ---------------------------------------------------------------------------

SPECIALISMS = [
    {"label": "Genomics", "goals": ["skills"]},
    {"label": "Research careers", "goals": ["direction", "research"]},
    {"label": "Publishing", "goals": ["research"]},
    {"label": "ML systems", "goals": ["skills"]},
    {"label": "Interview prep", "goals": ["applications"]},
    {"label": "Bioinformatics", "goals": ["skills"]},
    {"label": "Grant writing", "goals": ["research", "applications"]},
    {"label": "PhD applications", "goals": ["applications", "research"]},
    {"label": "Data strategy", "goals": ["skills", "leadership"]},
    {"label": "Leadership", "goals": ["leadership", "workplace"]},
    {"label": "Structural biology", "goals": ["skills"]},
    {"label": "Aerospace systems", "goals": ["skills"]},
    {"label": "Engineering careers", "goals": ["direction"]},
    {"label": "Confidence", "goals": ["confidence", "workplace"]},
    {"label": "Industry networking", "goals": ["network"]},
    {"label": "Workplace navigation", "goals": ["workplace"]},
]
SPECIALISM_GOALS = {s["label"].lower(): s["goals"] for s in SPECIALISMS}

# ---------------------------------------------------------------------------
# Mock mentor data - shaped to match the REAL Prisma MentorProfile model
# exactly, post PR #17 (field, jobTitle, company, yearsExperience,
# specialisms[], bio, isVerified, acceptingMentees, mentoringStyle,
# availabilityCadence, availabilityTimes[]). camelCase keys on purpose - see
# module docstring. Only used as a fallback when a request doesn't include a
# real "mentors" list (local/manual testing). specialisms below are drawn
# from the real SPECIALISMS list above so the goals dimension has something
# to actually match against in local testing.
# ---------------------------------------------------------------------------

MOCK_MENTORS = [
    {
        "id": 1,
        "field": "data",
        "jobTitle": "Principal Data Scientist",
        "company": "CSIRO",
        "yearsExperience": 12,
        "specialisms": ["ML systems", "Data strategy"],
        "bio": "Leads CSIRO's applied ML team, enjoys mentoring people early in their data career.",
        "isVerified": True,
        "acceptingMentees": True,
        "mentoringStyle": "handson",
        "availabilityCadence": "weekly",
        "availabilityTimes": ["wdmorning", "weekend"],
    },
    {
        "id": 2,
        "field": "swe",
        "jobTitle": "Head of Engineering",
        "company": "Atlassian",
        "yearsExperience": 9,
        "specialisms": ["Leadership", "Interview prep"],
        "bio": "Engineering leader focused on helping people move into tech leadership roles.",
        "isVerified": True,
        "acceptingMentees": True,
        "mentoringStyle": "bigpicture",
        "availabilityCadence": "fortnightly",
        "availabilityTimes": ["wdevening"],
    },
    {
        "id": 3,
        "field": "bio",
        "jobTitle": "Director of Analytics",
        "company": "NAB",
        "yearsExperience": 15,
        "specialisms": ["Bioinformatics", "Data strategy"],
        "bio": "Bioinformatics background, now in analytics leadership - currently full.",
        "isVerified": True,
        "acceptingMentees": False,  # currently full - should be filtered out
        "mentoringStyle": "structured",
        "availabilityCadence": "monthly",
        "availabilityTimes": ["wdmorning"],
    },
    {
        # deliberately sparse - most real mentor profiles won't have every
        # optional field filled in, this is what item #5 in the 16 Sep
        # review was about.
        "id": 4,
        "field": "cs",
        "jobTitle": "Software Engineer",
        "company": "Canva",
        "yearsExperience": None,
        "specialisms": [],
        "bio": "",
        "isVerified": False,
        "acceptingMentees": True,
        "mentoringStyle": None,
        "availabilityCadence": None,
        "availabilityTimes": [],
    },
]


def load_mentors(mentors_payload=None):
    """mentors_payload is the "mentors" list from the /match request body -
    real MentorProfile rows the Node backend already has (Node owns the DB
    connection, this service doesn't). Falls back to MOCK_MENTORS when the
    request doesn't include one, for local/manual testing without Node."""
    source = mentors_payload if mentors_payload is not None else MOCK_MENTORS
    return [m for m in source if m.get("acceptingMentees")]


# ---------------------------------------------------------------------------
# Scoring - rewritten 16 Sep in direct response to Palash's review. Every
# sub-score is now 0-100 (not 0-1) to match Node's scoreMentor.js exactly,
# missing mentor data returns NEUTRAL_SCORE instead of 0, and there's a
# goals dimension now. weights sum to 100, not 1.0, for the same reason.
# field/goals/availability/style intentionally mirror Node's semantics so
# the two scorers are directly comparable; experience is an addition Node
# doesn't have (see score_experience below for the gradient fix to the old
# hard-cliff version).
# ---------------------------------------------------------------------------

NEUTRAL_SCORE = 50

WEIGHTS = {
    "field": 30,
    "goals": 20,
    "availability": 15,
    "style": 15,
    "experience": 20,
}

FACTOR_LABELS = {
    "field": "same field",
    "goals": "overlapping goals",
    "availability": "matching availability",
    "style": "similar mentoring style",
    "experience": "experience level suited to your career stage",
}
FACTOR_ORDER = ["field", "goals", "availability", "style", "experience"]

# Band = the years-of-experience range that scores a full 100 for a mentee
# at that career stage. Outside the band, score decays linearly to 0 over
# GRACE_YEARS rather than dropping straight to 0 (16 Sep fix for the old
# hard-cliff behaviour - 20 yrs used to score 1.0 and 21 yrs scored 0.0 for
# a "mid" mentee).
STAGE_EXPERIENCE_BAND = {
    "undergrad": (1, 8),
    "postgrad": (2, 10),
    "recent": (2, 10),
    "early": (3, 15),
    "mid": (5, 20),
}
GRACE_YEARS = 5


def score_field(mentee_field, mentor_field):
    if mentor_field is None:
        return NEUTRAL_SCORE
    return 100.0 if mentee_field and mentee_field == mentor_field else 0.0


def score_experience(mentee_stage, mentor_years_experience):
    """Full score inside the band, linear decay to 0 over GRACE_YEARS
    outside it - replaces the old hard cutoff (Palash review #7)."""
    if mentor_years_experience is None:
        return NEUTRAL_SCORE
    if mentee_stage not in STAGE_EXPERIENCE_BAND:
        return NEUTRAL_SCORE
    lo, hi = STAGE_EXPERIENCE_BAND[mentee_stage]
    if lo <= mentor_years_experience <= hi:
        return 100.0
    if mentor_years_experience < lo:
        distance = lo - mentor_years_experience
    else:
        distance = mentor_years_experience - hi
    return max(0.0, 100.0 * (1 - distance / GRACE_YEARS))


def score_style(mentee_style, mentor_style):
    if mentor_style is None:
        return NEUTRAL_SCORE
    return 100.0 if mentee_style and mentee_style == mentor_style else 30.0


def score_availability(mentee_cadence, mentor_cadence, mentee_times, mentor_times):
    cadence_score = (
        NEUTRAL_SCORE if mentor_cadence is None
        else 100.0 if mentee_cadence == mentor_cadence
        else 0.0
    )

    if not mentor_times or not mentee_times:
        overlap_score = NEUTRAL_SCORE
    else:
        mentor_set = set(mentor_times)
        overlap = sum(1 for t in mentee_times if t in mentor_set)
        overlap_score = round((overlap / len(mentee_times)) * 100)

    return round(cadence_score * 0.5 + overlap_score * 0.5)


def score_goals(mentee_goals, mentor_specialisms):
    """Mirrors Node's scoreGoals() exactly - maps mentor specialisms to
    goal tags via SPECIALISM_GOALS, then checks how many of the mentee's
    goal tags are covered."""
    if not mentee_goals or not mentor_specialisms:
        return NEUTRAL_SCORE

    mentor_goal_set = set()
    for specialism in mentor_specialisms:
        goals = SPECIALISM_GOALS.get(str(specialism).lower())
        if goals:
            mentor_goal_set.update(goals)
        # unknown specialism strings contribute no goals rather than erroring

    matched = sum(1 for g in mentee_goals if g in mentor_goal_set)
    return round((matched / len(mentee_goals)) * 100)


def build_reasoning(subscores):
    """Explainable output, matching Node's buildReasoning() shape - a
    single sentence naming the top two factors, not a bare score and not a
    list (Palash review #6: frontend expects a reasoning string)."""
    ranked = sorted(
        FACTOR_ORDER,
        key=lambda k: (-subscores[k], FACTOR_ORDER.index(k)),
    )
    first, second = ranked[0], ranked[1]
    first_label = FACTOR_LABELS[first]
    capitalized = first_label[0].upper() + first_label[1:]
    return f"{capitalized} and {FACTOR_LABELS[second]}."


def score_mentor(mentee, mentor):
    breakdown = {
        "field": score_field(mentee.get("field"), mentor.get("field")),
        "goals": score_goals(mentee.get("goals"), mentor.get("specialisms")),
        "availability": score_availability(
            mentee.get("availabilityCadence"), mentor.get("availabilityCadence"),
            mentee.get("availabilityTimes"), mentor.get("availabilityTimes"),
        ),
        "style": score_style(mentee.get("mentoringStyle"), mentor.get("mentoringStyle")),
        "experience": score_experience(mentee.get("careerStage"), mentor.get("yearsExperience")),
    }
    score = round(sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS) / 100)
    return score, breakdown, build_reasoning(breakdown)


def rank_mentors(mentee, mentors_payload=None):
    ranked = []
    for mentor in load_mentors(mentors_payload):
        score, breakdown, reasoning = score_mentor(mentee, mentor)
        ranked.append({
            "mentor_id": mentor.get("id"),
            "score": score,
            "breakdown": breakdown,
            "reasoning": reasoning,
        })
    ranked.sort(key=lambda r: r["score"], reverse=True)
    return ranked, WEIGHTS


# ---------------------------------------------------------------------------
# API - the Node/Express backend calls this endpoint directly (confirmed
# with Palash, 15 Sep) and merges the result with mentor identity fields
# itself (see mentorDiscovery.js / toMentorCard.js on the Node side) - this
# service only returns the scoring half, matching scoreMentor.js's
# {score, breakdown, reasoning} shape per mentor.
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/match", methods=["POST"])
@rate_limit(max_calls=30, period_seconds=60, exempt_when=_has_valid_api_key)
@require_api_key
def match():
    """Expects:
    {
        "mentee": {
            "field": "data",
            "careerStage": "postgrad",
            "mentoringStyle": "handson",
            "availabilityCadence": "weekly",
            "availabilityTimes": ["wdmorning", "weekend"],
            "goals": ["skills", "direction"],
            "about": "optional free text, not used for matching"
        },
        "mentors": [ /* optional - real MentorProfile rows, Prisma-shaped
                        (camelCase). Falls back to MOCK_MENTORS if omitted,
                        for local/manual testing without Node. */ ]
    }
    For backwards compatibility, a body with no "mentee" key is treated as
    the mentee object itself (the old flat shape) so existing curl/test
    calls don't break.
    mentee.field is required. about is accepted but NOT used for matching
    (team decision, 8 Sep).

    Response: {"matches": [{"mentor_id", "score", "breakdown", "reasoning"}],
    "weights_used": {...}} - score/breakdown/reasoning are shaped exactly
    like Node's scoreMentor.js output (see module docstring, review item #6).
    """
    body = request.get_json(force=True, silent=True)
    if not body:
        return jsonify({"error": "field is required"}), 400

    mentee = body.get("mentee", body)
    mentors_payload = body.get("mentors")

    if not mentee or "field" not in mentee:
        return jsonify({"error": "field is required"}), 400

    ranked, weights = rank_mentors(mentee, mentors_payload)
    # weights_used is included for transparency/debugging - WEIGHTS,
    # not team-confirmed (see module docstring).
    return jsonify({"matches": ranked, "weights_used": weights}), 200


@app.route("/verify", methods=["POST"])
@require_api_key
def verify():
    """Expects a JSON body shaped like the extracted resume data:
    {
        "employment_history": [
            {"start_date": "2018-01", "end_date": "2020-01"},
            {"start_date": "2020-01", "end_date": "present"}
        ]
    }
    This is the Calculator + Verify half of Palash's pipeline
    (OCR -> Resume -> Extract -> Calculator -> Verify). OCR/Extract
    happen upstream to turn an uploaded file into this structured JSON -
    this endpoint assumes that part is already done.

    Returns 503 when MATCHING_SERVICE_API_KEY isn't set (fails closed).
    """
    if not MATCHING_SERVICE_API_KEY:
        return jsonify({"error": "verification is disabled until MATCHING_SERVICE_API_KEY is set"}), 503

    candidate = request.get_json(force=True, silent=True)
    if not isinstance(candidate, dict) or "employment_history" not in candidate:
        return jsonify({"error": "employment_history is required"}), 400

    result = verify_mentor_eligibility(candidate)
    return jsonify(result), 200


@app.route("/verify-from-document", methods=["POST"])
@rate_limit(max_calls=10, period_seconds=60, exempt_when=_has_valid_api_key)
@require_api_key
def verify_from_document():
    """Full pipeline (per Palash, 7 Sep): OCR + Extract (Gemini) -> Calculator -> Verify.

    Expects a multipart/form-data upload with one file field named 'file'
    (a resume - image or PDF). No separate trained model - Gemini reads the
    document directly, and only the employment start/end dates are asked
    for.

    Rate-limited (16 Sep, review item #2) to 10 calls/minute per caller
    (X-Internal-Api-Key if set, else IP) - this is the endpoint that burns
    Gemini credits per call.

    Response shape - Node's submitVerification stores this as
    Credential.extractedFields (review item #10). Counts and reasons only,
    no dates, names or companies:
    {
        "eligible": true,
        "total_experience_years": 3.5,
        "threshold_years": 2,
        "periods_counted": 2,
        "skipped_entries": 0,
        "reasons": ["...", "...", "..."]
    }

    Errors: 503 when MATCHING_SERVICE_API_KEY or GEMINI_API_KEY isn't set,
    502 when Gemini fails or returns the wrong shape, 422 when no usable
    employment dates were read from the document.

    Test with:
        curl -X POST http://127.0.0.1:5001/verify-from-document \\
            -H "X-Internal-Api-Key: $MATCHING_SERVICE_API_KEY" \\
            -F "file=@/path/to/resume.pdf"
    """
    if not MATCHING_SERVICE_API_KEY:
        return jsonify({"error": "verification is disabled until MATCHING_SERVICE_API_KEY is set"}), 503
    if "file" not in request.files:
        return jsonify({"error": "upload a file under the 'file' field"}), 400
    if not _gemini_client:
        return jsonify({"error": "GEMINI_API_KEY is not configured - see .env.example"}), 503

    uploaded = request.files["file"]
    file_bytes = uploaded.read()
    mime_type = uploaded.mimetype or "application/octet-stream"

    try:
        extracted = extract_credentials_from_document(file_bytes, mime_type, _gemini_client)
    except Exception as e:
        print(f"[verify-from-document] extraction failed: {type(e).__name__}")
        return jsonify({"error": "extraction failed"}), 502

    result = verify_mentor_eligibility(extracted)
    if result["periods_counted"] == 0:
        return jsonify({"error": "Could not read any employment dates from this document"}), 422
    return jsonify(result), 200


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    if debug_mode:
        print("[WARNING] FLASK_DEBUG=true - Werkzeug's interactive debugger is "
              "enabled. Never run like this anywhere but your own machine.")
    app.run(debug=debug_mode, port=5001)
