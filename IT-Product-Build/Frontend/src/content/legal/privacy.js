export const privacyMeta = {
  eyebrow: "Privacy Policy",
  title: "How Herbaceous handles your information",
  intro:
    "This policy explains what the Herbaceous website and app collect, why, who else handles it, how long we keep it and the choices you have. It describes what the platform actually does today.",
  lastUpdated: "6 October 2026",
};

export const privacySummary = {
  title: "Your data at a glance",
  items: [
    {
      label: "No real identity",
      text: "Your account never needs your real name or email address. We don't store either in our database. When you sign up we generate a sign-in email, a password and a display name for you.",
    },
    {
      label: "Two optional exceptions",
      text: "Two optional features pass an email address through EmailJS, our email provider, without us saving it: sending your new sign-in details to a personal email address, and the public contact form (your name, email address and message).",
    },
    {
      label: "What we store",
      text: "Your role and display name, your profile answers, your mentorship activity (requests, weekly check-ins, pauses, advocacy requests, tolerance records, meeting and chat links, calendar entries), help tickets, and the result of resume verification if you choose to do it.",
    },
    {
      label: "What we never store",
      text: "Resume files. A resume is held in memory, sent to Google Gemini to read the employment dates, and then discarded. We keep only the derived result. Your password is held by Amazon Cognito, not in our database.",
    },
    {
      label: "Who we share with",
      text: "Amazon Cognito (sign-in), Neon (database), our hosting providers, our AI matching and verification service, Google Gemini (resume reading, only with your consent) and EmailJS (the two email features above). We don't sell data and we don't use advertising or analytics trackers.",
    },
  ],
};

export const privacySections = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      {
        type: "p",
        text: "Herbaceous is a mentorship platform for women in science and engineering. It is a student project built by team TA06 at Monash University. It is not a registered company. In this policy, \"we\" and \"us\" means the TA06 project team.",
      },
      {
        type: "p",
        text: "Herbaceous is a student project and may not be required to comply with the Privacy Act 1988. We follow the Australian Privacy Principles voluntarily, as if they applied.",
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      { type: "h3", text: "Your account" },
      {
        type: "list",
        items: [
          "A generated sign-in email, such as mentee123456@herbaceous.internal. It is not a real mailbox.",
          "Your password. Our server generates your first password and shows it to you once. Amazon Cognito keeps it. We never store it in our database. You can change it in Settings.",
          "A display name. We generate one for you, such as \"Keen Lantern\". You can change it in Settings to 2 to 40 letters, numbers, spaces, hyphens or apostrophes. Please don't use your real name.",
          "Your role: mentee or mentor.",
        ],
      },
      { type: "h3", text: "Mentee profile" },
      {
        type: "p",
        text: "Your field, career stage, goals, preferred mentoring style, how often and when you are available, and an optional \"about\" note of up to 500 characters.",
      },
      { type: "h3", text: "Mentor profile" },
      {
        type: "p",
        text: "Your field, job title, company or institution, years of experience, specialisms, an optional bio of up to 500 characters, mentoring style, availability, whether you are accepting mentees, and whether mentees can start with you instantly (open availability).",
      },
      { type: "h3", text: "Mentorship activity" },
      {
        type: "list",
        items: [
          "Mentorship requests, including an optional message of up to 300 characters, and the mentor's optional response note.",
          "Weekly check-ins: whether each week was done or skipped, and an optional note.",
          "Pause and resume requests, with the reason, the expected number of weeks and the mentor's response.",
          "Advocacy requests: the type (referral, introduction, nomination, endorsement or other), any details you add, and the mentor's note.",
          "Tolerance records: a category and a written reason, recorded by a mentor when they have a concern about the mentorship.",
          "If a mentorship ends: the date, who ended it and the reason given.",
          "Meeting links and a chat room link that either of you add. We store the link only. Conversations on those external services are not seen or stored by us.",
          "Calendar entries: meetings, reminders and notes, with a title, an optional note and a time.",
        ],
      },
      { type: "h3", text: "Help tickets" },
      {
        type: "p",
        text: "When you use the help and safety panel, we store the category you choose (conduct, safety, technical or other), your message of up to 1,000 characters, its status, and the account that sent it.",
      },
      { type: "h3", text: "Resume verification (mentors, optional)" },
      {
        type: "p",
        text: "The derived result of the automated check and the time you gave consent. Section 6 explains this in detail. The resume file itself is never stored.",
      },
      { type: "h3", text: "Contact form" },
      {
        type: "p",
        text: "The public contact form asks for your name, email address and message. These are sent through EmailJS and are not saved in our database. The form also has an organisation field, which is not sent anywhere.",
      },
      { type: "h3", text: "Technical information" },
      {
        type: "list",
        items: [
          "Your IP address, held in our server's memory for up to an hour to limit sign-up attempts. It is not written to our database.",
          "Request logs kept by our hosting providers, Render and Vercel, as described in section 5.",
          "Error messages written to our servers' logs when something goes wrong. These are technical, but can occasionally include parts of the request that failed. Hosting providers keep server logs for up to 30 days, after which they are deleted automatically.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    blocks: [
      {
        type: "table",
        head: ["Information", "What we use it for"],
        rows: [
          ["Sign-in email and password", "Signing you in, through Amazon Cognito."],
          ["Display name and role", "Showing your match who you are, and deciding which dashboard and actions you can use."],
          ["Mentee matching answers (field, career stage, mentoring style, availability, goals)", "Calculating match scores against mentors."],
          ["Mentee \"about\" note", "Shown to your mentor once you are matched. It is not used for scoring."],
          ["Mentor profile", "Shown to mentees looking for a mentor, and used to calculate match scores."],
          ["Requests and messages", "Letting a mentor decide whether to accept, or letting a mentee start instantly with a mentor who has open availability."],
          ["Check-ins, pauses, calendar entries, meeting and chat links", "Running the mentorship week to week."],
          ["Advocacy requests and notes", "Running the advocacy track and counting fulfilled requests."],
          ["Tolerance records and end reasons", "Safety and accountability, and showing the mentee why a concern was raised."],
          ["Help tickets", "Responding to conduct, safety, technical and other concerns."],
          ["Verification result", "Deciding whether to show the verified badge on a mentor's profile."],
          ["IP address (in memory)", "Limiting sign-up to 5 attempts per hour from one address."],
          ["Contact form details", "Replying to your message."],
        ],
      },
      {
        type: "p",
        text: "We don't use your information for advertising, we don't sell it, and we don't build profiles of you beyond what is listed here.",
      },
    ],
  },
  {
    id: "who-can-see-what",
    title: "Who can see what",
    blocks: [
      { type: "h3", text: "What mentees see about mentors" },
      {
        type: "p",
        text: "Any signed-in mentee can see every mentor who has finished onboarding and is accepting mentees. They see the mentor's display name, job title, company, field, years of experience, specialisms, mentoring style, availability, bio, whether they are verified, whether they have open availability, and a match score with a short explanation.",
      },
      {
        type: "p",
        text: "Mentees also see two track record counts for each mentor: how many mentees they have mentored and how many advocacy requests they have fulfilled. These include ended mentorships. They are numbers only. No mentee names or request details are shown.",
      },
      { type: "h3", text: "What mentors see about mentees" },
      {
        type: "p",
        text: "Mentees are not listed for mentors to browse. A mentor only sees a mentee who has sent them a request. With a request, the mentor sees the mentee's display name, field, career stage and message.",
      },
      {
        type: "p",
        text: "Once matched, the mentor also sees the mentee's goals, \"about\" note, mentoring style, availability, weekly check-ins and notes, pause requests and reasons, and advocacy requests and details.",
      },
      { type: "h3", text: "Shared within a mentorship" },
      {
        type: "list",
        items: [
          "Tolerance records, including the mentor's written reason, are shown to the mentee while the mentorship is active or paused.",
          "Meeting links, the chat room link and calendar entries are visible to both of you.",
          "Mentor notes on advocacy requests and responses to pause requests are visible to the mentee.",
        ],
      },
      { type: "h3", text: "Not shown to other users" },
      {
        type: "list",
        items: [
          "Your sign-in email and password.",
          "Mentor verification details. Only the mentor sees the reasons from their own check. Mentees only see the verified badge.",
          "Help tickets.",
        ],
      },
      { type: "h3", text: "Our team" },
      {
        type: "p",
        text: "Only the team members who maintain the platform can access the database and help tickets, using individual accounts. They access personal information only to run, support and secure Herbaceous.",
      },
      { type: "h3", text: "After a mentorship ends" },
      {
        type: "p",
        text: "Once a mentor ends a mentorship, the mentee's dashboard no longer shows it, including its check-ins, advocacy history and tolerance records. The records are not deleted. See section 9.",
      },
    ],
  },
  {
    id: "processors",
    title: "Third-party processors",
    blocks: [
      {
        type: "p",
        text: "These services handle information for us. Each receives only what it needs for its job.",
      },
      {
        type: "table",
        head: ["Service", "What it receives", "Why"],
        rows: [
          [
            "Amazon Cognito (Amazon Web Services)",
            "Your generated sign-in email, the display name generated at sign-up, your password and your sign-in sessions.",
            "Sign-in. Hosted in the AWS Sydney region (ap-southeast-2).",
          ],
          [
            "Neon",
            "Every record described in section 2, in a PostgreSQL database hosted in AWS ap-southeast-2 (Sydney).",
            "Database hosting.",
          ],
          [
            "Render",
            "Hosts the Herbaceous API and AI service in the United States, so all the information our server and AI service handle passes through it. Its logs record request paths, status codes and timing.",
            "Hosting the API and AI service.",
          ],
          [
            "Vercel",
            "The website files, served from a global network. Its logs record standard request data such as your IP address and the pages you request.",
            "Serving the website.",
          ],
          [
            "Our AI service",
            "For matching: a mentee's six matching answers (not the \"about\" note) and the profiles of the mentors being scored, including display name, job title, company, bio, specialisms and availability. For verification: the resume file, in memory. Every call carries an internal key.",
            "Calculating match scores, and passing the resume to Gemini and applying the experience threshold.",
          ],
          [
            "Google Gemini API",
            "The resume file, only when a mentor chooses verification and ticks the consent box.",
            "Reading employment start and end dates. We use the paid tier of the Gemini API, under which Google does not use submitted content to train its models. Google may keep data for a limited period for abuse monitoring.",
          ],
          [
            "EmailJS",
            "For the optional credentials email: the email address you type, your generated sign-in email and your password. For the contact form: your name, email address, message and the website address.",
            "Sending email. EmailJS keeps a short history of sent messages. Contact form messages go to the Herbaceous team inbox.",
          ],
        ],
      },
      {
        type: "p",
        text: "Some of these services store or process information outside Australia: Neon and Amazon Cognito in Australia, Render, EmailJS and Vercel in the United States, and Gemini on Google's global infrastructure.",
      },
    ],
  },
  {
    id: "resume-verification",
    title: "Resume verification",
    blocks: [
      {
        type: "p",
        text: "Verification is optional. Mentors can use Herbaceous without it. It gives mentees a verified badge to look for.",
      },
      {
        type: "list",
        items: [
          "Consent: you must tick a consent box before uploading. Our server refuses the upload without it, and records the time you consented with the result.",
          "Upload: one resume as a PDF, PNG or JPEG of up to 10 MB. We check that the file really is that type. You can try 3 times an hour.",
          "In memory only: our server holds the file in memory. It is never written to disk or to our database. It goes to our AI service, which sends it to Google Gemini, and is then discarded.",
          "Dates only: Gemini is asked to return only the start and end date of each job. It is told not to return names, company names or job titles, and to ignore any instructions written inside the document.",
          "The check: overlapping jobs are counted once, and the total time is compared with a threshold of 2 years.",
          "What we keep: whether you passed, the total years calculated, the threshold, how many periods were counted and skipped, a few short reasons, the check time and your consent time. We don't keep the file, the dates, employer names or your name.",
          "If the service is unavailable, nothing is saved and you can try again later.",
        ],
      },
      { type: "h3", text: "Limitations" },
      {
        type: "p",
        text: "This is an automated check of the dates on a document you submit. It can't confirm that the document, the dates or the roles are genuine, and it doesn't check your identity or qualifications. The badge means the dates on the submitted resume added up to at least 2 years. Once given, the badge is not removed automatically.",
      },
    ],
  },
  {
    id: "public-statistics",
    title: "Public statistics",
    blocks: [
      {
        type: "p",
        text: "The statistics on our public pages come from published aggregate sources: the ABS Census 2021, the WGEA statutory census FY2024-25, STEM Equity Monitor enrolment data and a Professionals Australia survey.",
      },
      {
        type: "p",
        text: "These figures contain no personal information, and no information about Herbaceous users is used to produce them.",
      },
    ],
  },
  {
    id: "storage-and-security",
    title: "Storage and security",
    blocks: [
      {
        type: "list",
        items: [
          "Sign-in is handled by Amazon Cognito. Every request to a signed-in feature must carry a valid Cognito session, which our server checks each time.",
          "Access is limited by role. Mentees and mentors can only use their own role's features, and can only see mentorships they are part of.",
          "Your password is never stored in our database.",
          "Rate limits: 5 sign-ups per hour from one IP address, 5 help tickets per hour per account, 3 verification attempts per hour per mentor, and one contact form message every 30 seconds from a browser.",
          "Our AI service only accepts requests that carry an internal key.",
          "Meeting and chat links must use https.",
          "Encryption in transit: all connections to the website, API and AI service use HTTPS, and the database connection uses TLS.",
          "Encryption at rest: Neon encrypts stored data at rest.",
        ],
      },
      {
        type: "p",
        text: "No system is perfectly secure. If you think something is wrong, tell us through the help panel.",
      },
      { type: "h3", text: "Browser storage" },
      {
        type: "p",
        text: "We don't use cookies, analytics or advertising trackers. The website stores these items in your browser's local storage:",
      },
      {
        type: "table",
        head: ["Item", "Why"],
        rows: [
          [
            "Sign-in session (keys starting with CognitoIdentityServiceProvider)",
            "Keeps you signed in. It stays on your device, even after you close the browser, until you select Log out. Sign-in tokens last one hour and renew automatically for up to 30 days, or until you log out. Always log out on a shared computer.",
          ],
          ["herbaceous-theme", "Remembers whether you chose the light or dark theme."],
          ["herbaceous:first-login-banner-dismissed", "Remembers that you dismissed the reminder to change your password."],
        ],
      },
      {
        type: "p",
        text: "The text file you can download after sign-up is created in your browser. We never see it.",
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep information",
    blocks: [
      {
        type: "p",
        text: "We don't delete records automatically, and there is no in-app way to delete an account. To be clear about what that means:",
      },
      {
        type: "list",
        items: [
          "Your account and profile are kept until you ask us to remove them.",
          "Ended mentorships are kept, with their check-ins, pauses, advocacy requests, tolerance records, calendar entries, links and end reason.",
          "Withdrawn and declined requests are kept with their new status. Withdrawing does not delete.",
          "Tolerance records can't be edited or deleted in the app.",
          "Every verification result is kept.",
          "Help tickets are kept.",
          "Your Cognito sign-in account is kept.",
          "IP addresses used for rate limiting are held in memory and cleared within an hour, or when the server restarts.",
          "Emails sent through EmailJS are kept in its sent history for up to 30 days.",
        ],
      },
      {
        type: "p",
        text: "When the project ends, all stored personal information will be deleted within 90 days.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    blocks: [
      {
        type: "p",
        text: "Under the Australian Privacy Principles, which we follow voluntarily, you can ask to access and correct the personal information held about you. You can also use Herbaceous under a pseudonym, which is how it is designed.",
      },
      { type: "h3", text: "Access" },
      {
        type: "p",
        text: "Your dashboard and Settings show your profile and mentorship activity. To ask for a copy of everything we hold about you, send a help ticket under \"Other\".",
      },
      { type: "h3", text: "Correction" },
      {
        type: "p",
        text: "You can change your display name and most profile answers in Settings. A mentee's field and career stage, and a mentor's field, can't be changed in Settings after onboarding. Ask us through the help panel to correct them.",
      },
      { type: "h3", text: "Deletion" },
      {
        type: "p",
        text: "Send a help ticket under \"Other\". If you can't sign in, use the [contact form](/contact). We handle deletion requests manually. A deletion request removes your account, your profile and the content you wrote within 30 days. Records shared with another person, such as a mentorship, are kept with your details removed.",
      },
      { type: "h3", text: "Complaints" },
      {
        type: "p",
        text: "Contact us first through the help panel or the [contact form](/contact). We aim to respond within 30 days. If you are not satisfied with our response, you can complain to the Office of the Australian Information Commissioner (OAIC) at [oaic.gov.au](https://www.oaic.gov.au) or on 1300 363 992.",
      },
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      {
        type: "p",
        text: "Herbaceous is for adults aged 18 and over. Because we don't collect identifying details, we don't check age at sign-up. If you are under 18, please don't use Herbaceous. If we learn that an account belongs to someone under 18, we may remove it.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "When we change this policy we will update the date at the top of this page. We don't have your email address, so we can't email you about changes. We will show a notice on the website and in your dashboard when this policy changes significantly.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        type: "list",
        items: [
          "Signed in: use the help and safety panel in your dashboard.",
          "Can't sign in, or don't have an account: use the [contact form](/contact).",
          "Email: [hello@herbaceous.org](mailto:hello@herbaceous.org)",
        ],
      },
    ],
  },
];
