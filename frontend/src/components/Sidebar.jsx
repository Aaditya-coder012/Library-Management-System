import { NavLink } from "react-router-dom";
import { useAuth } from "../App.jsx";

const groups = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    )}],
  },
  {
    label: "Catalogue",
    items: [
      { to: "/books", label: "Books", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      )},
      { to: "/members", label: "Members", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      )},
    ],
  },
  {
    label: "Circulation",
    items: [
      { to: "/transactions", label: "Issue / Return", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
          <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      )},
      { to: "/fines", label: "Fines", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      )},
    ],
  },
  {
    label: "Analytics",
    items: [{ to: "/reports", label: "Reports", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    )}],
  },
];

function Avatar({ name }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-brass/20 border border-brass/30 flex items-center justify-center
                    text-[11px] font-mono font-semibold text-brass shrink-0">
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 min-h-screen flex flex-col border-r border-ink/[0.08]"
           style={{ background: "linear-gradient(180deg, #ede8da 0%, #e8e2d3 100%)" }}>

      {/* Logo */}
      <div className="px-5 py-6 border-b border-ink/[0.08]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f6f2e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-[15px] font-semibold leading-tight text-ink">Central Library</div>
            <div className="text-[9.5px] font-mono tracking-[0.18em] text-brass uppercase">MANIT Bhopal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label} className="mb-1">
            <div className="px-4 pt-3 pb-1.5 text-[9.5px] font-mono uppercase tracking-[0.2em] text-ink/35 font-medium">
              {g.label}
            </div>
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-ink text-parchment font-medium shadow-sm"
                      : "text-ink/60 hover:text-ink hover:bg-ink/[0.06]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-colors ${isActive ? "text-brass" : "text-ink/40"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-ink/[0.08]">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink truncate">{user.name}</div>
              <div className="text-[10.5px] text-ink/40 font-mono truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          id="sidebar-logout"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-mono text-ink/45
                     hover:text-rust hover:bg-rust/[0.07] transition-all duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
