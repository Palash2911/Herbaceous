import { SubmitButton } from "@/components/contact/SubmitButton";
import {
  SERVER_UNREACHABLE_ERROR,
  isServerUnreachableError,
} from "@/lib/authErrors";
import { fadeUp, softSpring, stagger } from "@/lib/motion";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";

const roles = ["Mentee", "Mentor"];

export function SignupForm() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Mentee");
  const [error, setError] = useState(null);
  const [state, setState] = useState("idle");
  const [agreed, setAgreed] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!agreed) return;
    setError(null);
    setState("sending");
    try {
      const credentials = await signup(role.toUpperCase());
      setState("sent");
      navigate("/signup/credentials", { state: credentials });
    } catch (err) {
      setState("idle");
      setError(
        isServerUnreachableError(err)
          ? SERVER_UNREACHABLE_ERROR
          : err.message || "Could not create account.",
      );
    }
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      variants={stagger(0.04, 0.07)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={fadeUp} className="flex gap-2">
        {roles.map((item) => {
          const active = item === role;
          return (
            <motion.button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              whileTap={{ scale: 0.96 }}
              transition={softSpring}
              className="flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                background: active
                  ? "color-mix(in oklab, var(--accent) 14%, transparent)"
                  : "transparent",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              I am joining as a {item.toLowerCase()}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.p variants={fadeUp} className="text-sm text-muted">
        We generate a login email and password for you, there's nothing else to
        fill in.
      </motion.p>

      <motion.label
        variants={fadeUp}
        htmlFor="signup-agree"
        className="flex items-start gap-2.5 text-sm text-muted"
      >
        <input
          id="signup-agree"
          type="checkbox"
          required
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        <span>
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-4"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-4"
          >
            Privacy Policy
          </a>
        </span>
      </motion.label>

      {error ? (
        <motion.p variants={fadeUp} role="alert" className="text-sm text-coral">
          {error}
        </motion.p>
      ) : null}

      <motion.div variants={fadeUp}>
        <SubmitButton state={state} label="Create account" disabled={!agreed} />
      </motion.div>

      <motion.p variants={fadeUp} className="text-xs text-muted">
        Your account never asks for your real name or email.
      </motion.p>
    </motion.form>
  );
}
