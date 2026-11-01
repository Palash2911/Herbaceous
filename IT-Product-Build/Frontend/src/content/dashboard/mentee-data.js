export const weeks = [
  { week: 1, status: "done", range: "5 – 11 Jan", note: "Kick-off call. Agreed on focus areas and cadence." },
  { week: 2, status: "done", range: "12 – 18 Jan", note: "Mapped current skills against target role expectations." },
  { week: 3, status: "skipped", range: "19 – 25 Jan", note: "Travelling for work, no session logged." },
  { week: 4, status: "done", range: "26 Jan – 1 Feb", note: "Reviewed portfolio structure, cut three weak case studies." },
  { week: 5, status: "done", range: "2 – 8 Feb", note: "Practised systems design walkthrough end to end." },
  { week: 6, status: "done", range: "9 – 15 Feb", note: "Drafted a one page brag document for review cycle." },
  { week: 7, status: "skipped", range: "16 – 22 Feb", note: "Mentor unavailable, rescheduled to next week." },
  { week: 8, status: "done", range: "23 Feb – 1 Mar", note: "Mock interview, feedback on structuring trade-offs." },
  { week: 9, status: "done", range: "2 – 8 Mar", note: "Rewrote CV summary and impact bullets." },
  { week: 10, status: "current", range: "9 – 15 Mar", note: "" },
  { week: 11, status: "upcoming", range: "16 – 22 Mar", note: "" },
  { week: 12, status: "upcoming", range: "23 – 29 Mar", note: "" },
  { week: 13, status: "upcoming", range: "30 Mar – 5 Apr", note: "" },
  { week: 14, status: "upcoming", range: "6 – 12 Apr", note: "" },
  { week: 15, status: "upcoming", range: "13 – 19 Apr", note: "" },
  { week: 16, status: "upcoming", range: "20 – 26 Apr", note: "" },
];

export const weeksLogged = weeks.filter((w) => w.status === "done").length;

export const mentor = {
  name: "Priya Raghavan",
  initials: "PR",
  role: "Principal Product Engineer",
  company: "Northwind Labs",
  verified: true,
  advocacyStatus: "Open to advocacy",
  matchScore: 92,
};

export const nextMeeting = {
  title: "Portfolio review and role targeting",
  when: "Thu 12 Mar, 6:00 pm AEDT",
  link: "https://meet.google.com/xkr-jdna-pqs",
};

export const standing = {
  level: 1,
  max: 4,
  events: [{ date: "22 Feb", reason: "Session missed without notice ahead of time." }],
};

export const journeyStatus = "Active";

export const goals = [
  { id: "g1", label: "Land a senior engineering role", progress: 62 },
  { id: "g2", label: "Build a public portfolio", progress: 48 },
  { id: "g3", label: "Improve systems design fluency", progress: 71 },
  { id: "g4", label: "Grow a professional network", progress: 35 },
];

export const mentors = [
  {
    id: "m1",
    name: "Priya Raghavan",
    initials: "PR",
    role: "Principal Product Engineer",
    company: "Northwind Labs",
    verified: true,
    score: 92,
    reasoning: "Same field, has coached three mentees into senior roles, and her free slots match your evenings.",
    specialisms: ["Systems design", "Career strategy", "Interviewing"],
    field: "Engineering",
    seniority: "Principal",
    availability: "Weekly",
    breakdown: { field: 32, goals: 28, availability: 18, style: 14 },
  },
  {
    id: "m2",
    name: "Daniel Okafor",
    initials: "DO",
    role: "Engineering Manager",
    company: "Bluecrest",
    verified: true,
    score: 86,
    reasoning: "Strong overlap on promotion planning and hiring-side insight, slightly narrower availability.",
    specialisms: ["Promotion cases", "Hiring", "Leadership"],
    field: "Engineering",
    seniority: "Manager",
    availability: "Fortnightly",
    breakdown: { field: 28, goals: 27, availability: 16, style: 15 },
  },
  {
    id: "m3",
    name: "Amelia Chen",
    initials: "AC",
    role: "Staff Design Technologist",
    company: "Fernway",
    verified: false,
    score: 78,
    reasoning: "Great fit for portfolio work and public writing, less overlap on backend systems goals.",
    specialisms: ["Portfolio", "Design systems", "Public writing"],
    field: "Design",
    seniority: "Staff",
    availability: "Weekly",
    breakdown: { field: 22, goals: 24, availability: 18, style: 14 },
  },
  {
    id: "m4",
    name: "Marco Silveira",
    initials: "MS",
    role: "Head of Data",
    company: "Latitude Health",
    verified: true,
    score: 71,
    reasoning: "Deep analytics background and a similar career switch, but a different day-to-day discipline.",
    specialisms: ["Analytics", "Career switching", "Mentoring at scale"],
    field: "Data",
    seniority: "Head of",
    availability: "Monthly",
    breakdown: { field: 18, goals: 22, availability: 12, style: 19 },
  },
  {
    id: "m5",
    name: "Sofia Marino",
    initials: "SM",
    role: "Senior Product Manager",
    company: "Halden",
    verified: false,
    score: 64,
    reasoning: "Useful for stakeholder skills and roadmap thinking, limited overlap with your technical goals.",
    specialisms: ["Stakeholders", "Roadmaps", "Communication"],
    field: "Product",
    seniority: "Senior",
    availability: "Fortnightly",
    breakdown: { field: 14, goals: 20, availability: 15, style: 15 },
  },
  {
    id: "m6",
    name: "Jonah Weiss",
    initials: "JW",
    role: "Staff Platform Engineer",
    company: "Corvid",
    verified: true,
    score: 59,
    reasoning: "Excellent on infrastructure depth, mentoring style is hands-off which differs from your preference.",
    specialisms: ["Infrastructure", "Reliability", "Open source"],
    field: "Engineering",
    seniority: "Staff",
    availability: "Monthly",
    breakdown: { field: 20, goals: 14, availability: 10, style: 15 },
  },
];

export const filterGroups = {
  Field: ["Engineering", "Design", "Data", "Product"],
  Seniority: ["Senior", "Staff", "Principal", "Manager", "Head of"],
  Availability: ["Weekly", "Fortnightly", "Monthly"],
};

export const meetingLinks = [
  {
    id: "l1",
    url: "https://meet.google.com/xkr-jdna-pqs",
    label: "Portfolio review",
    addedBy: "Priya Raghavan",
    addedAt: "8 Mar",
  },
  { id: "l2", url: "https://zoom.us/j/91827364", label: "Mock interview", addedBy: "You", addedAt: "23 Feb" },
  {
    id: "l3",
    url: "https://teams.microsoft.com/l/meetup-join/19:meeting",
    label: "Skills mapping",
    addedBy: "Priya Raghavan",
    addedAt: "12 Jan",
  },
];

export const calendarEntries = [
  { id: "c1", type: "meeting", title: "Portfolio review", when: "Thu 12 Mar, 6:00 pm", link: "https://meet.google.com/xkr-jdna-pqs" },
  { id: "c2", type: "reminder", title: "Send updated CV before session", when: "Wed 11 Mar" },
  { id: "c3", type: "log", title: "Week 9 log uploaded", when: "Sun 8 Mar" },
  { id: "c4", type: "note", title: "Ask about internal referral process", when: "Fri 6 Mar" },
];

export const advocacyTemplates = [
  { id: "referral", type: "Referral", title: "Refer me for a role", description: "Your mentor recommends you for a specific open job.", placeholder: "Which role, at which company, and when does the application close?", icon: "referral" },
  { id: "introduction", type: "Introduction", title: "Introduce me to someone", description: "Your mentor connects you with a person in their network.", placeholder: "Who would you like to meet, and why them?", icon: "introduction" },
  { id: "nomination", type: "Nomination", title: "Nominate me", description: "Your mentor puts you forward for a programme, panel or award.", placeholder: "Which programme, panel or award, and what is the deadline?", icon: "nomination" },
  { id: "endorsement", type: "Endorsement", title: "Endorse my work", description: "Your mentor writes a short endorsement of your skills or a project.", placeholder: "Which project or skill, and where will the endorsement be used?", icon: "endorsement" },
  { id: "other", type: "Other", title: "Ask for something else", description: "Describe a different kind of help in your own words.", placeholder: "What would you like your mentor to do for you?", icon: "other" },
];

export const weeksLoggedTrend = [2, 3, 3, 4, 5, 6, 6, 7, 8, 9];
export const advocacyTrend = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
