import { AppLink } from "@/components/layout/AppLink";
import logoDark from "../../assets/Herbaceous-Logo-Dark.svg";
import logoLight from "../../assets/Herbaceous-Logo-Light.svg";
import { navItems } from "./Header";

const legalItems = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-[color:var(--border)] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <img src={logoLight} alt="" className="h-8 w-auto dark:hidden" />
            <img
              src={logoDark}
              alt=""
              className="hidden h-8 w-auto dark:block"
            />
            <span className="font-display text-base font-semibold">
              Herbaceous
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Mentorship that converts into advocacy, so women stay, rise and lead
            in science and engineering.
          </p>
        </div>
        <nav className="flex flex-col gap-3">
          <span className="label-mono text-muted">Site</span>
          {[...navItems, { to: "/auth", label: "Login / Signup" }].map(
            (item) => (
              <AppLink
                key={item.to}
                to={item.to}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {item.label}
              </AppLink>
            ),
          )}
        </nav>
        <nav className="flex flex-col gap-3" aria-label="Legal">
          <span className="label-mono text-muted">Legal</span>
          {legalItems.map((item) => (
            <AppLink
              key={item.to}
              to={item.to}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </AppLink>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <span className="label-mono text-muted">Contact</span>
          <span className="text-sm text-muted">hello@herbaceous.org</span>
          <span className="text-sm text-muted">
            Melbourne · Remote worldwide
          </span>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted">
        © {new Date().getFullYear()} Herbaceous. Statistics are drawn from
        published sources: ABS Census 2021, WGEA statutory census FY2024-25,
        STEM Equity Monitor and a Professionals Australia survey.
      </p>
    </footer>
  );
}
