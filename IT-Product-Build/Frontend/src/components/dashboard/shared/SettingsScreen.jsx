import { VerifiedBadge } from "@/components/dashboard/mentor/VerificationPrompt";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { LogoutModal } from "@/components/dashboard/shared/LogoutModal";
import {
  Chip,
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  Field,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { Switch } from "@/components/ui/switch";
import {
  mentorBioStep,
  mentorExperienceStep,
  mentorSpecialismsStep,
} from "@/content/mentorOnboarding";
import {
  availabilityStep,
  fieldStep,
  goalsStep,
  stageStep,
  styleStep,
} from "@/content/onboarding";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { handleApiError } from "@/lib/handleApiError";
import { pageMotion } from "@/lib/motion";
import { updateDisplayName } from "@/services/authService";
import { changePassword } from "@/services/cognitoAuth";
import {
  getMenteeProfile,
  updateMenteeProfile,
} from "@/services/menteeService";
import {
  getMentorProfile,
  updateMentorProfile,
} from "@/services/mentorService";
import { getSpecialisms } from "@/services/metaService";
import { motion } from "framer-motion";
import {
  KeyRound,
  Lock,
  LogOut,
  Moon,
  Palette,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PROFILE_API = {
  mentee: {
    get: getMenteeProfile,
    update: updateMenteeProfile,
    key: "menteeProfile",
  },
  mentor: {
    get: getMentorProfile,
    update: updateMentorProfile,
    key: "mentorProfile",
  },
};

const YEARS_PATTERN = /^\d{1,2}$/;

function passwordPolicyIssues(password) {
  const issues = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
  if (!/[0-9]/.test(password)) issues.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("a symbol");
  return issues;
}

function toForm(profile, role) {
  if (role === "mentor") {
    return {
      jobTitle: profile.jobTitle ?? "",
      company: profile.company ?? "",
      yearsExperience:
        profile.yearsExperience == null ? "" : String(profile.yearsExperience),
      mentoringStyle: profile.mentoringStyle ?? "",
      availabilityCadence: profile.availabilityCadence ?? "",
      availabilityTimes: profile.availabilityTimes ?? [],
      specialisms: profile.specialisms ?? [],
      bio: profile.bio ?? "",
      openAvailability: profile.openAvailability ?? false,
    };
  }

  return {
    mentoringStyle: profile.mentoringStyle ?? "",
    availabilityCadence: profile.availabilityCadence ?? "",
    availabilityTimes: profile.availabilityTimes ?? [],
    goals: profile.goals ?? [],
    about: profile.about ?? "",
  };
}

function patchValue(role, key, value) {
  if (role === "mentor" && typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    return key === "yearsExperience" ? Number(trimmed) : trimmed;
  }
  return value === "" ? null : value;
}

function changedFields(profile, form, role) {
  const before = toForm(profile, role);
  const patch = {};

  for (const key of Object.keys(before)) {
    const oldValue = patchValue(role, key, before[key]);
    const newValue = patchValue(role, key, form[key]);
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;
    patch[key] = newValue;
  }

  return patch;
}

function mentorFormIssue(form) {
  const { maxTextLength, minYears, maxYears } = mentorExperienceStep;
  const jobTitle = form.jobTitle.trim();
  const company = form.company.trim();
  const years = form.yearsExperience.trim();

  if (jobTitle.length === 0 || jobTitle.length > maxTextLength) {
    return "Enter your job title.";
  }
  if (company.length === 0 || company.length > maxTextLength) {
    return "Enter your company or institution.";
  }
  if (
    !YEARS_PATTERN.test(years) ||
    Number(years) < minYears ||
    Number(years) > maxYears
  ) {
    return `Enter your years of experience, ${minYears} to ${maxYears}.`;
  }
  if (
    form.specialisms.length < mentorSpecialismsStep.min ||
    form.specialisms.length > mentorSpecialismsStep.max
  ) {
    return `Choose ${mentorSpecialismsStep.min} to ${mentorSpecialismsStep.max} specialisms.`;
  }
  if (!form.mentoringStyle) return "Choose a mentoring style.";
  if (!form.availabilityCadence) return "Choose a meeting frequency.";
  if (form.availabilityTimes.length < 1) {
    return "Choose at least one available time.";
  }
  return "";
}

function optionLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id ?? "Not set";
}

function accountRoleLabel(role) {
  if (!role) return "Account";
  return `${role.charAt(0).toUpperCase()}${role.slice(1)} account`;
}

function SettingsCardHeader({ icon: Icon, eyebrow, title, description, tone }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{
          color: tone,
          background: `color-mix(in srgb, ${tone} 12%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${tone} 22%, var(--hairline))`,
        }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <DashboardLabel>{eyebrow}</DashboardLabel>
        <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SettingsDivider() {
  return <div className="my-5 border-t border-[var(--hairline)]" />;
}

export function SettingsScreen({ theme, onToggleTheme }) {
  const { role, displayName, setDisplayName } = useStore();
  const hasProfile = role === "mentee" || role === "mentor";
  const navigate = useNavigate();
  const verification = useVerificationStatus(role === "mentor");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [profileLoading, setProfileLoading] = useState(hasProfile);
  const [profileError, setProfileError] = useState("");
  const [formError, setFormError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [specialismOptions, setSpecialismOptions] = useState({
    list: null,
    loading: role === "mentor",
    error: false,
  });
  const [specialismsAttempt, setSpecialismsAttempt] = useState(0);

  const [nameForm, setNameForm] = useState(null);
  const [nameSaveState, setNameSaveState] = useState("idle");
  const [nameSaved, setNameSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordState, setPasswordState] = useState("idle");

  useEffect(() => {
    if (!hasProfile) return undefined;

    const api = PROFILE_API[role];
    let cancelled = false;
    api
      .get()
      .then((result) => {
        if (cancelled) return;
        const next = result?.[api.key];
        if (!next) throw new Error("Could not load your profile.");
        setProfile(next);
        setForm(toForm(next, role));
        setProfileError("");
      })
      .catch((error) => {
        if (!cancelled) {
          setProfileError(error.message || "Could not load your profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, hasProfile, reloadKey]);

  useEffect(() => {
    if (role !== "mentor") return undefined;

    let cancelled = false;
    getSpecialisms()
      .then((list) => {
        if (!cancelled) {
          setSpecialismOptions({ list, loading: false, error: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpecialismOptions({ list: null, loading: false, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [role, specialismsAttempt]);

  const retrySpecialisms = () => {
    setSpecialismOptions({ list: null, loading: true, error: false });
    setSpecialismsAttempt((previous) => previous + 1);
  };

  const nameValue = nameForm ?? displayName ?? "";

  const onSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === displayName) return;

    setNameSaveState("saving");
    setNameSaved(false);
    try {
      const updated = await updateDisplayName(trimmed);
      setDisplayName(updated.displayName);
      setNameForm(updated.displayName);
      setNameSaved(true);
    } catch (error) {
      handleApiError(error, "Couldn't update your name");
    } finally {
      setNameSaveState("idle");
    }
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError("");
    setProfileSaved(false);
  };

  const toggleOption = (key, id, limit, limitMessage) => {
    const current = form[key];
    if (current.includes(id)) {
      updateForm(
        key,
        current.filter((value) => value !== id),
      );
    } else if (limit && current.length >= limit) {
      setFormError(limitMessage);
    } else {
      updateForm(key, [...current, id]);
    }
  };

  const specialismList = specialismOptions.list;
  const retiredSpecialisms =
    role === "mentor" && form && specialismList
      ? form.specialisms.filter((label) => !specialismList.includes(label))
      : [];

  const onSaveProfile = async () => {
    if (!profile || !form) return;
    if (role === "mentor") {
      if (retiredSpecialisms.length > 0) return;
      const issue = mentorFormIssue(form);
      if (issue) {
        setFormError(issue);
        return;
      }
    } else {
      if (form.goals.length < 1 || form.goals.length > 3) {
        setFormError("Choose 1 to 3 goals.");
        return;
      }
      if (form.availabilityTimes.length < 1) {
        setFormError("Choose at least one available time.");
        return;
      }
    }

    const patch = changedFields(profile, form, role);
    if (Object.keys(patch).length === 0) return;

    const api = PROFILE_API[role];
    setSaveState("saving");
    setFormError("");
    setProfileSaved(false);
    try {
      await api.update(patch);
      const result = await api.get();
      const next = result?.[api.key];
      if (!next) throw new Error("Could not reload your profile.");
      setProfile(next);
      setForm(toForm(next, role));
      setProfileSaved(true);
    } catch (error) {
      setFormError(error.message || "Could not save your profile.");
    } finally {
      setSaveState("idle");
    }
  };

  const onChangePassword = async (event) => {
    event.preventDefault();
    setPasswordSuccess(false);

    const issues = passwordPolicyIssues(passwordForm.next);
    if (issues.length > 0) {
      setPasswordError(`New password needs ${issues.join(", ")}.`);
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordError(null);
    setPasswordState("saving");
    try {
      await changePassword(passwordForm.current, passwordForm.next);
      setPasswordSuccess(true);
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (error) {
      setPasswordError(error.message || "Could not change password.");
    } finally {
      setPasswordState("idle");
    }
  };

  const profileReady = Boolean(
    hasProfile && profile && form && !profileLoading && !profileError,
  );
  const profilePatch = profileReady ? changedFields(profile, form, role) : {};
  const profileDirty = Object.keys(profilePatch).length > 0;
  const passwordComplete = Boolean(
    passwordForm.current && passwordForm.next && passwordForm.confirm,
  );

  return (
    <motion.div {...pageMotion} className="space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <DashboardLabel>Settings</DashboardLabel>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
            Account and preferences
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep your profile, matching choices, security, and experience up to
            date.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Settings2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {accountRoleLabel(role)} · {theme === "dark" ? "Dark" : "Light"} mode
        </span>
      </header>

      <div className="grid items-stretch gap-5 xl:grid-cols-12">
        <DashboardGlassCard
          className={`flex h-full flex-col ${
            hasProfile ? "xl:col-span-6" : "xl:col-span-12"
          }`}
        >
          <SettingsCardHeader
            icon={UserRound}
            eyebrow="Profile"
            title="Account"
            description="Manage the name displayed across Herbaceous."
            tone="var(--accent)"
          />
          <SettingsDivider />

          <div className="flex-1 space-y-4">
            <Field label="Display name">
              <input
                type="text"
                autoComplete="name"
                className={inputClass}
                value={nameValue}
                onChange={(event) => {
                  setNameForm(event.target.value);
                  setNameSaved(false);
                }}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Account type
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your access level in Herbaceous
                </p>
              </div>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {accountRoleLabel(role)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
            {nameSaved ? (
              <p role="status" className="text-sm text-teal">
                Name updated.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This name appears in your dashboard.
              </p>
            )}
            <DashboardButton
              variant="outline"
              onClick={onSaveName}
              disabled={
                nameSaveState === "saving" ||
                !nameValue.trim() ||
                nameValue.trim() === displayName
              }
            >
              {nameSaveState === "saving" ? "Saving..." : "Save name"}
            </DashboardButton>
          </div>
        </DashboardGlassCard>

        {hasProfile && profileLoading ? (
          <DashboardGlassCard className="grid h-full place-items-center xl:col-span-6">
            <DashboardLoader label="Loading your profile..." />
          </DashboardGlassCard>
        ) : null}

        {hasProfile && profileError ? (
          <DashboardGlassCard
            role="alert"
            className="flex h-full flex-col xl:col-span-6"
          >
            <SettingsCardHeader
              icon={UserRound}
              eyebrow="Profile"
              title="About you"
              description="Your profile details could not be loaded."
              tone="var(--coral)"
            />
            <SettingsDivider />
            <div className="flex flex-1 flex-col justify-center rounded-2xl border border-coral/20 bg-coral/10 p-4">
              <p className="text-sm text-coral">{profileError}</p>
              <DashboardButton
                variant="outline"
                className="mt-4 self-start"
                onClick={() => {
                  setProfileLoading(true);
                  setProfileError("");
                  setReloadKey((previous) => previous + 1);
                }}
              >
                Try again
              </DashboardButton>
            </div>
          </DashboardGlassCard>
        ) : null}

        {profileReady ? (
          <DashboardGlassCard className="flex h-full flex-col xl:col-span-6">
            <SettingsCardHeader
              icon={UserRound}
              eyebrow="Profile"
              title="About you"
              description={
                role === "mentor"
                  ? "Your work and the introduction mentees see on your profile."
                  : "Add a short introduction to complete your profile."
              }
              tone="var(--teal)"
            />
            <SettingsDivider />

            {role === "mentor" ? (
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={mentorExperienceStep.jobTitleLabel}>
                    <input
                      type="text"
                      className={inputClass}
                      maxLength={mentorExperienceStep.maxTextLength}
                      value={form.jobTitle}
                      onChange={(event) =>
                        updateForm("jobTitle", event.target.value)
                      }
                      placeholder={mentorExperienceStep.jobTitlePlaceholder}
                    />
                  </Field>

                  <Field label={mentorExperienceStep.companyLabel}>
                    <input
                      type="text"
                      className={inputClass}
                      maxLength={mentorExperienceStep.maxTextLength}
                      value={form.company}
                      onChange={(event) =>
                        updateForm("company", event.target.value)
                      }
                      placeholder={mentorExperienceStep.companyPlaceholder}
                    />
                  </Field>
                </div>

                <Field
                  label={mentorExperienceStep.yearsLabel}
                  hint={mentorExperienceStep.yearsHint}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`${inputClass} sm:max-w-40`}
                    maxLength={2}
                    value={form.yearsExperience}
                    onChange={(event) =>
                      updateForm(
                        "yearsExperience",
                        event.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder={mentorExperienceStep.yearsPlaceholder}
                  />
                </Field>

                <Field
                  label={mentorBioStep.label}
                  hint={mentorBioStep.privacyNote}
                >
                  <textarea
                    className={`${inputClass} min-h-32 resize-y leading-6`}
                    rows={5}
                    maxLength={mentorBioStep.maxLength}
                    value={form.bio}
                    onChange={(event) => updateForm("bio", event.target.value)}
                    placeholder={mentorBioStep.placeholder}
                  />
                </Field>
              </div>
            ) : (
              <div className="flex-1">
                <Field label="About me">
                  <textarea
                    className={`${inputClass} min-h-32 resize-y leading-6`}
                    rows={5}
                    maxLength={500}
                    value={form.about}
                    onChange={(event) =>
                      updateForm("about", event.target.value)
                    }
                    placeholder="Share a little about yourself..."
                  />
                </Field>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--hairline)] pt-4 text-xs">
              <span
                className={
                  profileDirty
                    ? "font-medium text-amber"
                    : profileSaved
                      ? "font-medium text-teal"
                      : "text-muted-foreground"
                }
              >
                {profileDirty
                  ? "Unsaved profile changes"
                  : profileSaved
                    ? "Profile saved"
                    : "Saved with the profile settings below"}
              </span>
              <span className="text-muted-foreground">
                {role === "mentor"
                  ? `${form.bio.length}/${mentorBioStep.maxLength}`
                  : `${form.about.length}/500`}
              </span>
            </div>
          </DashboardGlassCard>
        ) : null}

        {profileReady && role === "mentor" ? (
          <DashboardGlassCard className="xl:col-span-12">
            <SettingsCardHeader
              icon={SlidersHorizontal}
              eyebrow="Mentorship"
              title="Mentoring preferences"
              description="Update the details mentees are matched with you on."
              tone="var(--accent)"
            />
            <SettingsDivider />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <DashboardLabel>How you mentor</DashboardLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  <Field label="Mentoring style">
                    <select
                      className={inputClass}
                      value={form.mentoringStyle}
                      onChange={(event) =>
                        updateForm("mentoringStyle", event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Choose a style
                      </option>
                      {styleStep.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Meeting frequency">
                    <select
                      className={inputClass}
                      value={form.availabilityCadence}
                      onChange={(event) =>
                        updateForm("availabilityCadence", event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Choose a frequency
                      </option>
                      {availabilityStep.cadenceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <fieldset className="mt-5">
                  <legend className="label-caps mb-2">
                    Available times · choose at least one
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {availabilityStep.timeOptions.map((option) => (
                      <Chip
                        key={option.id}
                        active={form.availabilityTimes.includes(option.id)}
                        onClick={() =>
                          toggleOption("availabilityTimes", option.id)
                        }
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <DashboardLabel>What you can help with</DashboardLabel>
                <fieldset className="mt-4">
                  <legend className="sr-only">
                    Specialisms · choose {mentorSpecialismsStep.min} to{" "}
                    {mentorSpecialismsStep.max}
                  </legend>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Select between one and five specialisms mentees can find you
                    by.
                  </p>
                  {specialismOptions.error ? (
                    <div className="rounded-2xl border border-coral/20 bg-coral/10 p-4">
                      <p className="text-sm text-coral">
                        {mentorSpecialismsStep.loadError}
                      </p>
                      <DashboardButton
                        variant="outline"
                        className="mt-4"
                        onClick={retrySpecialisms}
                      >
                        {mentorSpecialismsStep.retryLabel}
                      </DashboardButton>
                    </div>
                  ) : specialismOptions.loading || !specialismList ? (
                    <DashboardLoader label="Loading specialisms..." />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {specialismList.map((label) => (
                        <Chip
                          key={label}
                          active={form.specialisms.includes(label)}
                          onClick={() =>
                            toggleOption(
                              "specialisms",
                              label,
                              mentorSpecialismsStep.max,
                              `Choose up to ${mentorSpecialismsStep.max} specialisms.`,
                            )
                          }
                        >
                          {label}
                        </Chip>
                      ))}
                      {retiredSpecialisms.map((label) => (
                        <Chip
                          key={label}
                          active
                          className="border-coral/30 bg-coral/10 text-coral line-through decoration-coral/60"
                          onClick={() =>
                            updateForm(
                              "specialisms",
                              form.specialisms.filter(
                                (value) => value !== label,
                              ),
                            )
                          }
                        >
                          {label} · no longer available
                        </Chip>
                      ))}
                    </div>
                  )}
                  {retiredSpecialisms.length > 0 ? (
                    <p role="alert" className="mt-3 text-sm text-coral">
                      Remove specialisms marked no longer available before
                      saving.
                    </p>
                  ) : null}
                </fieldset>
              </div>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5">
              <div className="min-w-0">
                <label
                  htmlFor="settings-open-availability"
                  className="text-sm font-medium text-foreground"
                >
                  Mentees can start mentorship with me instantly
                </label>
                <p
                  id="settings-open-availability-help"
                  className="mt-1 text-sm text-muted-foreground"
                >
                  Mentees who request you can begin the mentorship straight
                  away, without waiting for your approval.
                </p>
              </div>
              <Switch
                id="settings-open-availability"
                aria-describedby="settings-open-availability-help"
                checked={form.openAvailability}
                onCheckedChange={(checked) =>
                  updateForm("openAvailability", checked)
                }
                className="mt-0.5 data-[state=checked]:bg-accent"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
              {formError ? (
                <p role="alert" className="text-sm text-coral">
                  {formError}
                </p>
              ) : profileSaved ? (
                <p role="status" className="text-sm text-teal">
                  Profile saved.
                </p>
              ) : profileDirty ? (
                <p className="text-sm text-amber">Unsaved profile changes</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your profile settings are up to date.
                </p>
              )}
              <DashboardButton
                onClick={onSaveProfile}
                disabled={
                  saveState === "saving" ||
                  !profileDirty ||
                  retiredSpecialisms.length > 0
                }
              >
                {saveState === "saving" ? "Saving..." : "Save profile"}
              </DashboardButton>
            </div>
          </DashboardGlassCard>
        ) : null}

        {profileReady && role === "mentee" ? (
          <DashboardGlassCard className="xl:col-span-12">
            <SettingsCardHeader
              icon={SlidersHorizontal}
              eyebrow="Mentorship"
              title="Matching preferences"
              description="Update the preferences used to shape your mentor matches."
              tone="var(--accent)"
            />
            <SettingsDivider />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <DashboardLabel>How you want to connect</DashboardLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  <Field label="Mentoring style">
                    <select
                      className={inputClass}
                      value={form.mentoringStyle}
                      onChange={(event) =>
                        updateForm("mentoringStyle", event.target.value)
                      }
                    >
                      <option value="">No preference</option>
                      {styleStep.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Meeting frequency">
                    <select
                      className={inputClass}
                      value={form.availabilityCadence}
                      onChange={(event) =>
                        updateForm("availabilityCadence", event.target.value)
                      }
                    >
                      <option value="">No preference</option>
                      {availabilityStep.cadenceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <fieldset className="mt-5">
                  <legend className="label-caps mb-2">
                    Preferred times · choose at least one
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {availabilityStep.timeOptions.map((option) => (
                      <Chip
                        key={option.id}
                        active={form.availabilityTimes.includes(option.id)}
                        onClick={() =>
                          toggleOption("availabilityTimes", option.id)
                        }
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <DashboardLabel>What you want to achieve</DashboardLabel>
                <fieldset className="mt-4">
                  <legend className="sr-only">Goals · choose 1 to 3</legend>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Select between one and three goals for your mentorship.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {goalsStep.options.map((option) => (
                      <Chip
                        key={option.id}
                        active={form.goals.includes(option.id)}
                        onClick={() =>
                          toggleOption(
                            "goals",
                            option.id,
                            3,
                            "Choose up to 3 goals.",
                          )
                        }
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
              {formError ? (
                <p role="alert" className="text-sm text-coral">
                  {formError}
                </p>
              ) : profileSaved ? (
                <p role="status" className="text-sm text-teal">
                  Profile saved.
                </p>
              ) : profileDirty ? (
                <p className="text-sm text-amber">Unsaved profile changes</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your profile settings are up to date.
                </p>
              )}
              <DashboardButton
                onClick={onSaveProfile}
                disabled={saveState === "saving" || !profileDirty}
              >
                {saveState === "saving" ? "Saving..." : "Save profile"}
              </DashboardButton>
            </div>
          </DashboardGlassCard>
        ) : null}

        {profileReady ? (
          <DashboardGlassCard className="flex h-full flex-col xl:col-span-4">
            <SettingsCardHeader
              icon={Lock}
              eyebrow="Onboarding"
              title="Your details"
              description="Core matching details set during onboarding."
              tone="var(--amber)"
            />
            <SettingsDivider />

            <div className="flex-1 space-y-3">
              {(role === "mentor"
                ? [
                    {
                      label: "Field of work",
                      value: optionLabel(fieldStep.options, profile.field),
                    },
                  ]
                : [
                    {
                      label: "Field of work",
                      value: optionLabel(fieldStep.options, profile.field),
                    },
                    {
                      label: "Career stage",
                      value: optionLabel(
                        stageStep.options,
                        profile.careerStage,
                      ),
                    },
                  ]
              ).map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <DashboardLabel>{detail.label}</DashboardLabel>
                      <p className="mt-1 break-words text-sm font-medium text-foreground">
                        {detail.value}
                      </p>
                    </div>
                    <Lock
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}

              {role === "mentor" && verification?.enabled ? (
                <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <DashboardLabel>Verification</DashboardLabel>
                      {verification.isVerified ? (
                        <div className="mt-1.5">
                          <VerifiedBadge
                            thresholdYears={verification.latest?.thresholdYears}
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-foreground">
                          Not verified
                        </p>
                      )}
                    </div>
                    {verification.isVerified ? null : (
                      <DashboardButton
                        variant="outline"
                        onClick={() => navigate("/mentor/verification")}
                      >
                        Verify now
                      </DashboardButton>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              These details are fixed after onboarding.
            </p>
          </DashboardGlassCard>
        ) : null}

        <DashboardGlassCard
          className={`flex h-full flex-col ${
            profileReady
              ? "xl:col-span-8"
              : hasProfile
                ? "xl:col-span-12"
                : "xl:col-span-7"
          }`}
        >
          <SettingsCardHeader
            icon={KeyRound}
            eyebrow="Security"
            title="Change password"
            description="Use a strong password that you do not use elsewhere."
            tone="var(--coral)"
          />
          <SettingsDivider />

          <form onSubmit={onChangePassword} className="flex flex-1 flex-col">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Current password">
                <input
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={passwordForm.current}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      current: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="New password">
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  value={passwordForm.next}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      next: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Confirm new password">
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  value={passwordForm.confirm}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      confirm: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Use at least 8 characters with uppercase, lowercase, number, and
              symbol. Password recovery is admin-only.
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
              {passwordError ? (
                <p role="alert" className="text-xs text-coral">
                  {passwordError}
                </p>
              ) : passwordSuccess ? (
                <p role="status" className="text-xs text-teal">
                  Password updated.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter all three fields to update your password.
                </p>
              )}
              <DashboardButton
                type="submit"
                disabled={passwordState === "saving" || !passwordComplete}
              >
                {passwordState === "saving" ? "Updating..." : "Update password"}
              </DashboardButton>
            </div>
          </form>
        </DashboardGlassCard>

        <DashboardGlassCard
          className={`h-full ${
            hasProfile ? "xl:col-span-12" : "xl:col-span-5"
          }`}
        >
          <SettingsCardHeader
            icon={Palette}
            eyebrow="Experience"
            title="Preferences"
            description="Control appearance and the current session on this device."
            tone="var(--teal)"
          />
          <SettingsDivider />

          <div
            className={hasProfile ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  {theme === "dark" ? (
                    <Moon className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <Sun className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Appearance
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Currently {theme === "dark" ? "dark" : "light"} mode
                  </p>
                </div>
              </div>
              <DashboardButton variant="outline" onClick={onToggleTheme}>
                {theme === "dark" ? (
                  <Sun size={15} aria-hidden="true" />
                ) : (
                  <Moon size={15} aria-hidden="true" />
                )}
                Switch to {theme === "dark" ? "light" : "dark"}
              </DashboardButton>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-coral/20 bg-coral/10 text-coral">
                  <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Session</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Sign out securely on this device
                  </p>
                </div>
              </div>
              <DashboardButton
                variant="danger"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut size={15} aria-hidden="true" />
                Log out
              </DashboardButton>
            </div>
          </div>
        </DashboardGlassCard>
      </div>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </motion.div>
  );
}
