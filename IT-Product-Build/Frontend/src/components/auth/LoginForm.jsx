import { FloatingField } from "@/components/contact/FloatingField";
import { SubmitButton } from "@/components/contact/SubmitButton";
import {
  CREDENTIALS_ERROR,
  SERVER_UNREACHABLE_ERROR,
  isCredentialsError,
  isServerUnreachableError,
} from "@/lib/authErrors";
import { fadeUp, stagger } from "@/lib/motion";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resolveUserDestination } from "../../services/authGate";
import { getMe } from "../../services/authService";
import { completeNewPassword, signIn } from "../../services/cognitoAuth";

export function LoginForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState("login");
  const [values, setValues] = useState({ email: "", password: "" });
  const [newPassword, setNewPassword] = useState({ password: "", confirm: "" });
  const [pendingCognitoUser, setPendingCognitoUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");

  const update = (key) => (value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors({});
  };

  const updateNewPassword = (key) => (value) => {
    setNewPassword((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const finishLogin = async () => {
    try {
      await getMe();
    } catch (meErr) {
      setState("idle");
      setErrors({
        form: isServerUnreachableError(meErr)
          ? SERVER_UNREACHABLE_ERROR
          : meErr.status === 404
            ? "No account found for these credentials. Please sign up again."
            : meErr.message || "Failed to load profile.",
      });
      return;
    }

    const dest = await resolveUserDestination();
    setState("sent");
    navigate(dest ?? "/onboarding");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.email.trim().length === 0) next.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Enter a valid email.";
    if (values.password.length === 0) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("sending");
    try {
      await signIn(values.email, values.password);
      await finishLogin();
    } catch (err) {
      setState("idle");
      if (err.code === "NewPasswordRequiredException") {
        setPendingCognitoUser(err.cognitoUser);
        setStep("new-password");
        return;
      }
      if (isCredentialsError(err)) {
        setErrors({ form: CREDENTIALS_ERROR, credentials: true });
      } else if (isServerUnreachableError(err)) {
        setErrors({ form: SERVER_UNREACHABLE_ERROR });
      } else {
        setErrors({ form: err.message || "Login failed." });
      }
    }
  };

  const onSetNewPassword = async (event) => {
    event.preventDefault();
    const next = {};
    const issues = [];
    if (newPassword.password.length < 8) issues.push("at least 8 characters");
    if (!/[a-z]/.test(newPassword.password)) issues.push("a lowercase letter");
    if (!/[A-Z]/.test(newPassword.password)) issues.push("an uppercase letter");
    if (!/[0-9]/.test(newPassword.password)) issues.push("a number");
    if (issues.length > 0) {
      next.password = `Password needs ${issues.join(", ")}.`;
    } else if (newPassword.password !== newPassword.confirm) {
      next.confirm = "Passwords do not match.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("sending");
    try {
      await completeNewPassword(pendingCognitoUser, newPassword.password);
      await finishLogin();
    } catch (err) {
      setState("idle");
      setErrors({
        confirm: isServerUnreachableError(err)
          ? SERVER_UNREACHABLE_ERROR
          : err.message || "Could not set new password.",
      });
    }
  };

  if (step === "new-password") {
    return (
      <motion.form
        onSubmit={onSetNewPassword}
        noValidate
        variants={stagger(0.04, 0.07)}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <motion.p variants={fadeUp} className="text-sm text-muted">
          First time logging in with these credentials. Set a permanent password
          to continue.
        </motion.p>
        <motion.div variants={fadeUp}>
          <FloatingField
            id="login-new-password"
            label="New password"
            type="password"
            value={newPassword.password}
            onChange={updateNewPassword("password")}
            error={errors.password}
            autoComplete="new-password"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FloatingField
            id="login-new-password-confirm"
            label="Confirm new password"
            type="password"
            value={newPassword.confirm}
            onChange={updateNewPassword("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <SubmitButton state={state} label="Set password and continue" />
        </motion.div>
      </motion.form>
    );
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      variants={stagger(0.04, 0.07)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={fadeUp}>
        <FloatingField
          id="login-email"
          label="Login email"
          type="email"
          value={values.email}
          onChange={update("email")}
          error={errors.email || errors.credentials}
          autoComplete="email"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <FloatingField
          id="login-password"
          label="Password"
          type="password"
          value={values.password}
          onChange={update("password")}
          error={errors.password || errors.credentials}
          autoComplete="current-password"
        />
      </motion.div>
      {errors.form ? (
        <motion.p variants={fadeUp} role="alert" className="text-sm text-coral">
          {errors.form}
        </motion.p>
      ) : null}
      <motion.div variants={fadeUp}>
        <SubmitButton state={state} label="Log in" />
      </motion.div>
      <motion.p variants={fadeUp} className="text-xs text-muted">
        Lost login credentials cannot be recovered automatically. Use the{" "}
        <Link to="/contact" className="underline underline-offset-4 hover:text-text">
          contact form
        </Link>{" "}
        for manual recovery.
      </motion.p>
      <motion.p variants={fadeUp} className="text-xs text-muted">
        <Link to="/privacy" className="underline underline-offset-4 hover:text-text">
          Privacy Policy
        </Link>
        <span aria-hidden="true"> · </span>
        <Link to="/terms" className="underline underline-offset-4 hover:text-text">
          Terms of Service
        </Link>
      </motion.p>
    </motion.form>
  );
}
