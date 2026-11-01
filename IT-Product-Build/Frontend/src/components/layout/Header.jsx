import HerbaceousDarkText from "@/assets/Herbaceous-Dark-Text.svg";
import HerbaceousLightText from "@/assets/Herbaceous-Light-Text.svg";
import { AppLink } from "@/components/layout/AppLink";
import { ButtonLink } from "@/components/ui/ActionButton";
import { ease } from "@/lib/motion";
import { resolveUserDestination } from "@/services/authGate";
import { motion } from "framer-motion";
import { Menu, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVerifiedSession } from "../../services/cognitoAuth";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export const navItems = [
  { to: "/", label: "Home" },
  { to: "/why-us", label: "Why Us" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getVerifiedSession()
      .then((session) => {
        if (!cancelled) setHasSession(Boolean(session));
      })
      .catch(() => {
        if (!cancelled) setHasSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onProfileClick = async () => {
    const dest = await resolveUserDestination();
    navigate(dest ?? "/");
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2 transition-all duration-300 sm:px-6 ${
            scrolled ? "glass-card !rounded-full" : "border border-transparent"
          }`}
        >
          <AppLink to="/" className="flex items-center gap-2">
            <img
              src={HerbaceousLightText}
              alt="Herbaceous"
              className="h-15 w-auto dark:hidden"
            />
            <img
              src={HerbaceousDarkText}
              alt="Herbaceous"
              className="hidden h-15 w-auto dark:block"
            />
          </AppLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <AppLink
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-text"
                activeClassName="!text-text bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]"
              >
                {item.label}
              </AppLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden md:inline-flex">
              {hasSession ? (
                <button
                  type="button"
                  onClick={onProfileClick}
                  aria-label="Go to your account"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-muted transition-colors hover:text-text"
                >
                  <UserCircle size={20} />
                </button>
              ) : (
                <ButtonLink to="/auth" className="!px-5 !py-2 text-sm">
                  Sign in
                </ButtonLink>
              )}
            </span>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] md:hidden"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.header>
      <MobileNav
        open={open}
        onClose={() => setOpen(false)}
        hasSession={hasSession}
        onProfileClick={onProfileClick}
      />
    </>
  );
}
