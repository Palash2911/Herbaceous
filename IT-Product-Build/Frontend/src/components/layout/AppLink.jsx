import { NavLink } from "react-router-dom";

export function AppLink({ to, children, className, activeClassName, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        isActive && activeClassName
          ? `${className ?? ""} ${activeClassName}`
          : (className ?? "")
      }
      onClick={onClick ?? (() => {})}
    >
      {children}
    </NavLink>
  );
}
