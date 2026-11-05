import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", end: true },
  { label: "Summarize Text", path: "/summarize", end: true },
  { label: "Summarize Website", path: "/summarize/url" },
  { label: "Upload Document", path: "/summarize/file" },
  { label: "Summary History", path: "/history" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-heading">MENU</div>

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
