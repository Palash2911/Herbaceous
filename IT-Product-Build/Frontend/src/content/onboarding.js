export const welcome = {
  kicker: "BEFORE WE MATCH YOU",
  headline: "Seven questions. Two minutes.",
  body: "We use your answers to rank verified mentors by real overlap with your field, your stage and what you actually want from mentorship.",
  cta: "Get started",
};

export const fieldStep = {
  question: "Which field are you in?",
  hint: "Choose the field closest to your work or study.",
  otherLabel: "Tell us your field",
  otherPlaceholder: "e.g. Biomedical engineering",
  options: [
    { id: "cs", label: "Computer Science", icon: "Cpu" },
    { id: "swe", label: "Software Engineering", icon: "Code2" },
    { id: "data", label: "Data Science", icon: "BarChart3" },
    { id: "ee", label: "Electrical Engineering", icon: "CircuitBoard" },
    { id: "me", label: "Mechanical Engineering", icon: "Cog" },
    { id: "civil", label: "Civil Engineering", icon: "HardHat" },
    { id: "chemeng", label: "Chemical Engineering", icon: "FlaskConical" },
    { id: "bio", label: "Biology", icon: "Dna" },
    { id: "chem", label: "Chemistry", icon: "TestTube" },
    { id: "physics", label: "Physics", icon: "Atom" },
    { id: "maths", label: "Mathematics", icon: "Sigma" },
    { id: "other", label: "Other", icon: "Sparkles" },
  ],
};

export const stageStep = {
  question: "Where are you right now?",
  options: [
    {
      id: "undergrad",
      label: "Undergraduate student",
      detail: "Still studying, exploring what comes next",
    },
    { id: "postgrad", label: "Postgraduate student", detail: "Masters or PhD" },
    {
      id: "recent",
      label: "Recent graduate",
      detail: "Less than a year into work or still looking",
    },
    { id: "early", label: "Early career", detail: "One to three years in" },
    { id: "mid", label: "Mid career", detail: "Four or more years in" },
  ],
};

export const goalsStep = {
  question: "What do you want from a mentor?",
  max: 3,
  emptyHint: "Pick at least one",
  options: [
    { id: "direction", label: "Career direction and next steps" },
    { id: "skills", label: "Technical skill development" },
    { id: "network", label: "Building a professional network" },
    { id: "workplace", label: "Navigating a male dominated workplace" },
    {
      id: "applications",
      label: "Preparing for job applications and interviews",
    },
    { id: "research", label: "Getting into research or postgraduate study" },
    { id: "leadership", label: "Moving into leadership" },
    { id: "confidence", label: "Confidence and imposter syndrome" },
  ],
};

export const styleStep = {
  question: "How do you like to be mentored?",
  options: [
    {
      id: "structured",
      label: "Structured",
      detail: "Regular check ins with clear goals and milestones",
    },
    {
      id: "flexible",
      label: "Flexible",
      detail: "We talk when I need to, no fixed cadence",
    },
    {
      id: "handson",
      label: "Hands on",
      detail: "Walk through real work with me, review what I build",
    },
    {
      id: "bigpicture",
      label: "Big picture",
      detail: "Focus on direction and decisions rather than day to day",
    },
  ],
};

export const availabilityStep = {
  question: "How much time can you realistically give?",
  note: "Be realistic here. Mentors would rather know your actual availability than an optimistic one.",
  cadenceLabel: "Frequency",
  timesLabel: "Preferred times",
  cadenceOptions: [
    { id: "weekly", label: "Weekly" },
    { id: "fortnightly", label: "Fortnightly" },
    { id: "monthly", label: "Monthly" },
    { id: "adhoc", label: "Ad hoc when needed" },
  ],
  timeOptions: [
    { id: "wdmorning", label: "Weekday mornings" },
    { id: "wdafternoon", label: "Weekday afternoons" },
    { id: "wdevening", label: "Weekday evenings" },
    { id: "weekend", label: "Weekends" },
  ],
  cadenceHint: "Choose how often you want to meet",
  timesHint: "Pick at least one time that works",
};

export const aboutStep = {
  question: "Anything your mentor should know?",
  optionalLabel: "Optional",
  maxLength: 500,
  placeholder:
    "What you are working on, what you are stuck on, or what a good outcome looks like for you.",
};

export const reviewStep = {
  headline: "Here is what we will match on.",
  cta: "Find my matches",
  footnote: "You can change any of this later in Settings.",
  editLabel: "Edit",
};

export const submittingStep = {
  statuses: [
    "Reading your answers",
    "Scoring verified mentors",
    "Ranking your matches",
  ],
  successHeadline: "Your matches are ready.",
  successBody:
    "We found verified mentors who overlap with your field, stage and goals.",
  successCta: "Continue to matches",
};

export const brand = {
  name: "Herbaceous",
  tagline: "Women in STEM mentorship",
};

export const stepOrder = [
  "welcome",
  "field",
  "stage",
  "goals",
  "style",
  "availability",
  "about",
  "review",
  "submitting",
];
